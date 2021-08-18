package gw.payment

uses com.google.common.base.Preconditions
uses com.google.common.collect.Multimap
uses com.google.common.collect.Ordering
uses com.google.common.collect.TreeMultimap
uses gw.api.web.payment.AllocationPool
uses gw.api.web.payment.ReturnPremiumAllocationStrategy
uses gw.bc.payment.InvoiceItemAllocationOrdering

/**
 * Defines a return premium allocation strategy that distributes credits to {@link
 *      InvoiceItem}s proportionally among all targeted.
 */
@Export
class ProportionalReturnPremiumAllocationStrategy implements ReturnPremiumAllocationStrategy {
  override property get TypeKey() : ReturnPremiumAllocateMethod {
    return TC_PROPORTIONAL
  }

  /**
   * Determine if a positive item is eligible to be pad from the specified negative item.
   *
   * @return true if the positive item is eligible to be paid from the negative item, false else.
   */
  protected function
  isPositiveItemEligibleToBePaidFrom(negativeItem : InvoiceItem) : block(item : BaseDistItem) : boolean {
    return \ item -> item.InvoiceItem.EventDate.afterOrEqual(negativeItem.EventDate)
  }

  override function allocate(distItems : List <BaseDistItem>, amountToAllocate : AllocationPool) {
    if (distItems.Empty) {
      return
    }
    var targetDist = distItems[0].BaseDist
    Preconditions.checkArgument(distItems.where(\elt -> elt.BaseDist != targetDist).size() == 0,
        "All dist items must belong to the same base dist.")

    var positiveDistItems = distItems.where(\distItem -> distItem.InvoiceItem.Amount.IsPositive)
    if (positiveDistItems.Empty) {
      return
    }

    var negativeDistItems = distItems.where(\distItem -> distItem.InvoiceItem.Amount.IsNegative)
    if (negativeDistItems.Empty) {
      return
    }

    // Partition negative items and order the partitions using NegativeItemComparator
    var negativeItemsPartition = TreeMultimap.create(
        InvoiceItemAllocationOrdering.Util
            .getInvoiceItemOrderingsFromTypes({TC_EVENTDATE }),
        Ordering.natural()) as Multimap<InvoiceItem, BaseDistItem>
    negativeDistItems.each(\elt -> negativeItemsPartition.put(elt.InvoiceItem, elt))

    var currency = distItems[0].Currency
    for (negativeItem in negativeItemsPartition.keySet()) {
      // Filter the positive items to get those eligible to be paid by this negative item
      var eligiblePositiveItems = positiveDistItems.where(isPositiveItemEligibleToBePaidFrom(negativeItem))
      if (eligiblePositiveItems.Empty) {
        continue
      }
      var negativeItemCollection = negativeItemsPartition.get(negativeItem)
      var amountAvailable = negativeItemCollection.sum(currency, \elt -> elt.GrossAmountOwed - elt.GrossAmountToApply).negate()
      new FirstToLastAllocationStrategy().allocate(eligiblePositiveItems, AllocationPool.withGross(amountAvailable))
    }
    return
  }
}