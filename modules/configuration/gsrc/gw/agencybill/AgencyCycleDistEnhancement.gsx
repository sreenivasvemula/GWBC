package gw.agencybill

uses gw.pl.currency.MonetaryAmount

@Export
enhancement AgencyCycleDistEnhancement : AgencyCycleDist {
  
  property get RemainingAmount() : MonetaryAmount {
    return this.BaseMoneyReceived.TotalAmount - this.NetDistributedAmountForSavedOrExecuted - this.NetSuspenseAmountForSavedOrExecuted
  }
}
