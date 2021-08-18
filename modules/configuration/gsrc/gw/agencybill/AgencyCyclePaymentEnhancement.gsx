package gw.agencybill

@Export
enhancement AgencyCyclePaymentEnhancement : AgencyCyclePayment {
  
  function isCreditDistribution() : boolean {
    return this.AgencyMoneyReceived.PaymentInstrument.PaymentMethod == TC_PRODUCERUNAPPLIED
  }
}
