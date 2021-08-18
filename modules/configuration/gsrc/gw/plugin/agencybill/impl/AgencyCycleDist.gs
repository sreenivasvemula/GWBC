package gw.plugin.agencybill.impl;

uses gw.plugin.agencybill.IAgencyCycleDist
uses gw.api.web.payment.AllocationPool
uses gw.api.web.invoice.InvoiceItems
uses gw.api.web.payment.ProRataRedistributionStrategy
uses java.util.HashSet
uses java.util.Map
uses gw.pl.currency.MonetaryAmount
uses gw.api.web.payment.ProRataDistributionStrategy
uses gw.api.web.payment.DistributionStrategy
uses gw.api.web.payment.ProRataReversedPaymentAmountRedistributionStrategy

@Export
class AgencyCycleDist implements IAgencyCycleDist {

  construct() {
  }

  override function prefillAgencyCycleDist(dist : AgencyCycleDist, prefill : AgencyCycleDistPrefill) : AgencyCycleDist {
    switch (prefill) {
     
     case AgencyCycleDistPrefill.TC_UNPAID:
       for (var distItem in dist.DistItems) {
         distItem.fillUnpaidAmounts();  
       }
       break;  
             
     case AgencyCycleDistPrefill.TC_ZERO:
       for (var distItem in dist.DistItems) {
         distItem.clear();
       }
       break;
              
    }
    
    return dist;
  }

  override function prefillAgencyDistItem(distItem : BaseDistItem, prefill : AgencyCycleDistPrefill) : BaseDistItem {
    switch (prefill) {
     case AgencyCycleDistPrefill.TC_UNPAID:
       distItem.fillUnpaidAmounts();
       break;
     case AgencyCycleDistPrefill.TC_ZERO:
       distItem.clear();
       break;
    }
    return distItem;
  }


  override function allocateForRedistribution(payment : AgencyCyclePayment, amounts : Map<ProducerCode, Map<Charge,AllocationPool>>) {
    var distributionStrategy =  new ProRataReversedPaymentAmountRedistributionStrategy ()
    for (var producerCode in amounts.keySet()) {
      var perProducerCode = amounts.get(producerCode)
      for (var charge in perProducerCode.keySet()) {
        var amountToDistribute = perProducerCode.get(charge)
        var invoiceItems = new HashSet<InvoiceItem> (InvoiceItems.withoutOffsetsOrCommissionRemainder(charge.InvoiceItems)
                                   // the below is to get only items matching the allocation amount in both gross and commission unless zero as the strategy depends on this
                                   .where( \ invoiceItem -> distributionStrategy.canRedistributeAgencyBillPaymentToInvoiceItem(invoiceItem, producerCode, amountToDistribute)))
        var eligibleDistItems = payment.getDistItemsFor(invoiceItems).where( \ elt -> (elt as AgencyPaymentItem).ProducerCode == producerCode)
        distributionStrategy.allocate(eligibleDistItems, amountToDistribute)
      }
    }
  }

  override function distributeNetAmount(distItems : List<BaseDistItem>, netAmountToDistribute : MonetaryAmount) : List<BaseDistItem> {
    //Note that the current implementation of ProRataDistributionStrategy will always fully allocate Negative items.
    var distributionStrategy = new ProRataDistributionStrategy()
    var currency = netAmountToDistribute.Currency

    var grossOwed = distItems.sum(currency, \ item -> item.GrossAmountOwed)
    var commissionOwed = distItems.sum(currency, \ item -> item.CommissionAmountOwed)
    
    var allocationPool = calculateGrossAndCommissionToDistribute(netAmountToDistribute, grossOwed, commissionOwed)
    
    distributionStrategy.allocate(distItems, allocationPool)
    
    
    return distItems
  }
  
  private function calculateGrossAndCommissionToDistribute(netAvailableToDistribute : MonetaryAmount, grossOwed : MonetaryAmount, commissionOwed : MonetaryAmount) : AllocationPool {
    var grossToDistribute : MonetaryAmount
    var commissionToDistribute : MonetaryAmount
    
    var netOwed = grossOwed - commissionOwed
    
    //If we have more money available than need to pay, just pay in full
    if (isMoreAvailableThanOwed(netAvailableToDistribute, netOwed)) {
      grossToDistribute = grossOwed
      commissionToDistribute = commissionOwed
    
    //If we don't have enough money to cover the needed amount, then we will pay a percentage of the gross based on the ratio of netAvailable : netOwed.
    } else {
       var percentToPay = netAvailableToDistribute.percentageOf(netOwed)
       grossToDistribute = percentToPay.of(grossOwed).toMonetaryAmount(netAvailableToDistribute.Currency)
       commissionToDistribute = grossToDistribute - netAvailableToDistribute
    }

    var allocationPool = AllocationPool.withGross(grossToDistribute)
    allocationPool.setCommissionAmount(commissionToDistribute)
    
    return allocationPool
  }
  
  private function isMoreAvailableThanOwed(netAvailable : MonetaryAmount, netOwed : MonetaryAmount) : boolean {
    
    if (netOwed.IsPositive || netOwed.IsZero) {
      return netAvailable >= netOwed
    } else {
      return netAvailable <= netOwed
    }
  }

}
