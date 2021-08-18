package libraries
uses pcf.TransactionDetailPopup
uses pcf.AccountDetailDisbursements
uses pcf.SourceOfFundsPopup
uses pcf.PaymentItemGroupPopup

@Export
enhancement FundsUseTrackerEnhancement : entity.FundsUseTracker {

  function openTrackableDetails() {
    var trackable = this.Trackable
    if (trackable typeis AccountDisbursement) {
      AccountDetailDisbursements.push(trackable.Account, trackable)
    } else if (trackable typeis Transaction) {
      TransactionDetailPopup.push(trackable)
    } else if (trackable typeis FundsSourceTracker) {
      SourceOfFundsPopup.push(trackable)
    } else if (trackable typeis PaymentItemGroup) {
      PaymentItemGroupPopup.push(trackable)
    }
  }
}
