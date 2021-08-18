package libraries
uses pcf.AccountPayments
uses pcf.TransactionDetailPopup
uses pcf.UseOfFundsPopup
uses pcf.PaymentItemGroupPopup

@Export
enhancement FundsSourceTrackerEnhancement : entity.FundsSourceTracker {

  function openTrackableDetails() {
    var trackable = this.Trackable
    if (trackable typeis DirectBillMoneyRcvd) {
      AccountPayments.push(trackable.Account, trackable.MostRecentMoney as DirectBillMoneyRcvd)
    } else if (trackable typeis Transaction) {
      TransactionDetailPopup.push(trackable)
    } else if (trackable typeis FundsUseTracker) {
      UseOfFundsPopup.push(trackable)
    } else if (trackable typeis PaymentItemGroup) {
      PaymentItemGroupPopup.push(trackable)
    }
  }
  
}
