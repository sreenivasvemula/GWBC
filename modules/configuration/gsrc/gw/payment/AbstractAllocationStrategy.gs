package gw.payment

uses com.google.common.base.Preconditions
uses com.google.common.collect.Multimap
uses com.google.common.collect.Ordering
uses com.google.common.collect.TreeMultimap
uses gw.api.system.BCConfigParameters
uses gw.api.util.MoneyUtil
uses gw.api.util.Ratio
uses gw.api.web.payment.AllocationPool
uses gw.api.web.payment.AllocationStrategy
uses gw.pl.currency.MonetaryAmount

uses java.util.Collection

/**
 * Defines an abstract {@link AllocationStrategy Allocation Strategy} that
 * directly allocates credits or payments to {@link InvoiceItem}s in the
 * partitioning specified by the subclass {@link #PositiveInvoiceItemOrdering}
 * property.
 */
@Export
abstract class AbstractAllocationStrategy implements AllocationStrategy {
  /**
   * Ordering for partitioning positive invoice items.
   */
  abstract property get PositiveInvoiceItemOrdering() : Ordering<InvoiceItem>

  override function allocate(distItems: List<BaseDistItem>, amountToAllocate : AllocationPool) {
    if (distItems.Empty) {
      return
    }

    var targetDist = distItems[0].BaseDist
    Preconditions.checkArgument(distItems.where(\elt -> elt.BaseDist != targetDist).size() == 0,
        "All dist items must belong to the same base dist.")

    Preconditions.checkNotNull(amountToAllocate, "Amount to allocate cannot be null.")
    Preconditions.checkArgument(!amountToAllocate.GrossAmount.IsNegative, "Amount to allocate cannot be negative.")

    // Partition positive items still owed and order the partitions using PositiveDistItemComparator
    var positiveItems = distItems.where(\ elt -> (elt.GrossAmountOwed - elt.GrossAmountToApply).IsPositive)
    if (positiveItems.Empty) {
      return
    }
    var positiveItemsPartition = TreeMultimap.create(PositiveInvoiceItemOrdering, Ordering.natural()) as Multimap<InvoiceItem, BaseDistItem>
    positiveItems.each(\ elt -> positiveItemsPartition.put(elt.InvoiceItem, elt))

    var amountAvailable = amountToAllocate.GrossAmount
    var currency = amountAvailable.Currency
    for (positiveItemsKey in positiveItemsPartition.keySet()) {
      var positiveItemCollection = positiveItemsPartition.get(positiveItemsKey)
      var totalOfPositiveItemsUnpaidAmount = positiveItemCollection.sum(currency, \item -> amountItemNeeds(item))

      if (amountAvailable < totalOfPositiveItemsUnpaidAmount) {
        payAllItemsProRata(amountAvailable, positiveItemCollection, totalOfPositiveItemsUnpaidAmount)
        break
      } else {
        payAllItemsInFull(positiveItemCollection)
        amountAvailable = amountAvailable - totalOfPositiveItemsUnpaidAmount
      }
    }
  }

  private function payAllItemsInFull(baseDistItemCollection : Collection<BaseDistItem>) {
    baseDistItemCollection.each( \ item -> {item.GrossAmountToApply = item.GrossAmountOwed})
  }

  private function amountItemNeeds(item : BaseDistItem) : MonetaryAmount {
    return item.GrossAmountOwed - item.GrossAmountToApply
  }

  private function setGrossAmountToApplyForItem(item : BaseDistItem, amountToApply : MonetaryAmount) {
    item.GrossAmountToApply = amountToApply
  }

  private function itemNeedsFunds(baseDistItem : BaseDistItem) : boolean {
    var _amountItemNeeds = amountItemNeeds(baseDistItem)
    if (_amountItemNeeds.IsZero) {
      return false
    }
    if (baseDistItem.InvoiceItem.Amount.IsPositive) {
      return _amountItemNeeds.IsPositive
    } else {
      return _amountItemNeeds.IsNegative
    }
  }

  private function payAllItemsZero(baseDistItemCollection : Collection<BaseDistItem>) {
    baseDistItemCollection.each(\ baseDistItem ->
        setGrossAmountToApplyForItem(baseDistItem, 0bd.ofCurrency(baseDistItem.Currency)))
  }

  private function payAllItemsProRata(amountToPay : MonetaryAmount, distItems : Collection<BaseDistItem>,
                                      totalOfItemsUnpaidAmount : MonetaryAmount) {
    var proRataRatio = Ratio.valueOf(amountToPay, totalOfItemsUnpaidAmount)
    var amountDistributed = distributeProRata(distItems, proRataRatio, amountToPay.Currency)
    var remainder = amountToPay - amountDistributed
    distributeRemainder(distItems, remainder)
  }

  private function distributeRemainder(distItems : Collection<BaseDistItem>, remainder : MonetaryAmount) {
    var distItemsArray = distItems.toArray(new BaseDistItem[distItems.size()])
    var distribution = distItemsArray*.GrossAmountToApply
    MoneyUtil.distributeRemainderWithoutTargets(
        remainder, distribution, BCConfigParameters.ProRataCalculationRemainderTreatment)
    updateDistribution(distItemsArray, distribution)
  }

  private function updateDistribution(distItems : BaseDistItem[], distribution : MonetaryAmount[]) {
    distItems.eachWithIndex(\distItem, index -> {
      distItem.GrossAmountToApply = distribution[index]
    })
  }

  private function createDistributionArray(distItems : BaseDistItem[]) : MonetaryAmount[] {
    final var distribution = new MonetaryAmount[distItems.length]
    distItems.eachWithIndex(\ distItem, index -> {
        distribution[index] = distItem.GrossAmountToApply
      })
    return distribution
  }

  private function distributeProRata(items : Collection<BaseDistItem>, proRataRatio : Ratio, currency : Currency) : MonetaryAmount {
    var amountDistributed = 0bd.ofCurrency(currency)
    for (item in items) {
      var itemRatio = proRataRatio.multiply(amountItemNeeds(item).Amount)
      var amountToApply = itemRatio.toMonetaryAmount(currency, DOWN)
      item.GrossAmountToApply = amountToApply + item.GrossAmountToApply
      amountDistributed = amountDistributed + amountToApply
    }
    return amountDistributed
  }
}