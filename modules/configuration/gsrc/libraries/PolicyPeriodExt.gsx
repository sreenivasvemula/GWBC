package libraries

uses gw.api.util.DateUtil

uses java.util.ArrayList
uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.pas.PASMessageTransport
uses gw.api.web.payment.DirectBillPaymentFactory
uses java.math.RoundingMode
uses java.util.Date
uses gw.transaction.TransactionWrapper
uses java.util.Collection

@Export
enhancement PolicyPeriodExt: entity.PolicyPeriod
{
  function getSafeEarnedPremium(): MonetaryAmount {
    return (this.Closed ? this.Premium : this.EarnedPremium)
  }

  function getPolicyEquityPercentage(): Number {
    return getPolicyEquityPercentage(this.Premium, this.PolicyEquity)
  }

  /**
   * Performant version of getPolicyEquityPercentage() which uses precomputed
   * variables for its calculation rather than recomputing them on the PolicyPeriod
   *
   * @param premium Typically from PolicyPeriod.Premium
   * @param policyEquity typically from PolicyPeriod.PolicyEquity
   * @return The PolicyPeriod's equity as a numeric percentage
   */
  function getPolicyEquityPercentage(premium: MonetaryAmount, policyEquity: MonetaryAmount): Number {
    return premium.IsZero ? null : (100 * policyEquity / premium) as Number
  }

  function getPercentPremiumEarned(): Number {
    return getPercentPremiumEarned(this.TotalValueExcludingRollups, this.EarnedExcludingRollups)
  }

  /**
   * Performant version of getPercentPremiumEarned() which uses precomputed
   * variables for its calculation rather than recomputing them on the PolicyPeriod
   *
   * @param totalValueExcludingRollups Typically from PolicyPeriod.TotalValueExcludingRollups
   * @param earnedExcludingRollups Typically from PolicyPeriod.EarnedExcludingRollups
   * @return The PolicyPeriod's PremiumEarned as a numeric percentage of total Premium
   */
  function getPercentPremiumEarned(totalValueExcludingRollups: MonetaryAmount, earnedExcludingRollups : MonetaryAmount): Number {
    return totalValueExcludingRollups.IsZero ? null : (100 * earnedExcludingRollups / totalValueExcludingRollups) as Number
  }

  function getDaysTillPaidThruDate(): Number {
    return getDaysTillPaidThruDate(this.PaidThroughDate)
  }

  /**
   * Performant version of getDaysTillPaidThruDate() which uses precomputed
   * variables for its calculation rather than recomputing them on the PolicyPeriod
   *
   * @param paidThroughDate Typically from PolicyPeriod.PaidThroughDate
   * @return Days until the PolicyPeriod is paid through
   */
  function getDaysTillPaidThruDate(paidThroughDate: Date): Number {
    if (paidThroughDate == null) {
      return null
    }
    var todayOrPolicyPerExpirDate = DateUtil.currentDate()
    if (this.PolicyPerExpirDate.before(todayOrPolicyPerExpirDate)) {
      todayOrPolicyPerExpirDate = this.PolicyPerExpirDate
    }
    return todayOrPolicyPerExpirDate.differenceInDays(paidThroughDate)
  }

  function getPaidToBilledRatio(): Number {
    var billedToday = this.TotalValueExcludingRollups - this.UnbilledAmount
    return getPaidToBilledRatio(billedToday, this.PaidAmount)
  }

  /**
   * Performant version of getPaidToBilledRatio() which uses precomputed
   * variables for its calculation rather than recomputing them on the PolicyPeriod
   *
   * @param totalBilled Typically from PolicyPeriod.TotalValueExcludingRollups - PolicyPeriod.UnbilledAmount
   * @param paidAmount Typically from PolicyPeriod.PaidAmount
   * @return The PolicyPeriod's ratio of Paid to Billed as a numeric percentage
   */
  function getPaidToBilledRatio(totalBilled: BigDecimal, paidAmount: BigDecimal): Number {
    return totalBilled == 0 ? null : (100 * paidAmount / totalBilled) as Number
  }

  function getPaidToValueRatio(): Number {
    return getPaidToValueRatio(this.TotalValueExcludingRollups, this.PaidAmount)
  }

  /**
   * Performant version of getPaidToValueRatio() which uses precomputed
   * variables for its calculation rather than recomputing them on the PolicyPeriod
   *
   * @param totalValueExcludingRollups Typically from PolicyPeriod.TotalValueExcludingRollups
   * @param paidAmount Typically from PolicyPeriod.PaidAmount
   * @return The PolicyPeriod's ratio of Paid to Value as a numeric percentage
   */
  function getPaidToValueRatio(totalValueExcludingRollups: BigDecimal, paidAmount: BigDecimal): Number {
    return totalValueExcludingRollups == 0 ? null : (100 * paidAmount / totalValueExcludingRollups) as Number
  }

  property get Cancellation(): Cancellation {
    if (this.Canceled) {
      var query = gw.api.database.Query.make(entity.Cancellation).compare("AssociatedPolicyPeriod", Equals, this).select().orderByDescending(\row -> row.ModificationDate)
      return query.FirstResult
    }
    return null
  }

  function cancelByDelinquencyProcess(process: DelinquencyProcess) {
    if (canBeCancelled()) {
      this.CancelStatus = typekey.PolicyCancelStatus.TC_PENDINGCANCELLATION
      this.addHistoryFromGosu(gw.api.util.DateUtil.currentDate(),
          typekey.HistoryEventType.TC_POLICYCANCELED,
          displaykey.Java.PolicyHistory.PolicyCanceled, null, null, false)
      addCancellationActivity(process)
      this.addEvent(PASMessageTransport.EVENT_CANCEL_NOW)
    }
  }

  private function canBeCancelled(): boolean {
    return this.ClosureStatus != typekey.PolicyClosureStatus.TC_CLOSED and
        this.CancelStatus != typekey.PolicyCancelStatus.TC_CANCELED and
        this.CancelStatus != typekey.PolicyCancelStatus.TC_PENDINGCANCELLATION
  }

  private function addCancellationActivity(process: DelinquencyProcess) {
    // create an activity for Policy Delinquency
    var actvty = new Activity(process.Bundle)
    actvty.ActivityPattern = gw.api.web.admin.ActivityPatternsUtil.getActivityPattern("general")
    actvty.Subject = displaykey.Java.PolicyActivity.Cancellation.Subject(this.DisplayName)
    actvty.Description = displaykey.Java.PolicyActivity.Cancellation.Description
    actvty.Priority = typekey.Priority.TC_NORMAL
    gw.api.assignment.AutoAssignAssignee.INSTANCE.assignToThis(actvty)
    // Assign by Assignment rules
    process.addToActivities(actvty)
  }

  function rescindOrReinstateInternal() {
    if (this.CancelStatus == typekey.PolicyCancelStatus.TC_PENDINGCANCELLATION) {
      this.CancelStatus = typekey.PolicyCancelStatus.TC_PENDINGRESCINDCANCEL
      this.addEvent(PASMessageTransport.EVENT_RESCIND_CANCELLATION)
    } else {
      // TODO: Minh VU: it may be more appropriate to create an activity for UW
      // rather than to go and reinstate the policy period
      this.CancelStatus = typekey.PolicyCancelStatus.TC_PENDINGREINSTATEMENT
    }
  }

  function sendDunningLetterInternal() {
    this.addHistoryFromGosu(gw.api.util.DateUtil.currentDate(),
        HistoryEventType.TC_DUNNINGLETTERSENT,
        displaykey.Java.PolicyHistory.DunningLetterSent, null, null, false)
  }

  function getDelinquencyReasons(): String {
    return this.ActiveDelinquencyProcesses.reduce("", \q, t -> {
      var currentReason = t.Reason.DisplayName
      if (not q.contains(currentReason)) {
        return q + ( q == "" ? "" : ", " ) + currentReason
      } else {
        return q
      }
    })
  }

  property get CancellationProcessEvent(): DelinquencyProcessEvent {
    var event: DelinquencyProcessEvent;
    for (dlnqProcess in this.DelinquencyProcesses) {
      var events = dlnqProcess.DelinquencyEvents
      var cancelEvent = events.firstWhere(
          \t -> t.EventName == DelinquencyEventName.TC_CANCELLATION)
      if (cancelEvent != null
          and (event == null or event.TargetDate.after(cancelEvent.TargetDate))){
        event = cancelEvent
      }
    }
    return event;
  }

  function getChargeTransactionWrappers(): TransactionWrapper[] {
    var transactions = new ArrayList <TransactionWrapper>()
    for (charge in this.Charges)
    {
      transactions.add(
          new TransactionWrapper(charge.ChargeInitialTxn, TransactionWrapper.TransactionType.CHARGE)
      )
    }
    // commission adjust transactions
    var txns = this.getCommissionAdjustedTransactions()
    for (txn in txns.iterator())
    {
      // don't show the reversed transaction, just show the commission amount changed
      if (not txn.isReversal()){
        transactions.add(
            new TransactionWrapper(txn, TransactionWrapper.TransactionType.CHARGE)
        )
      }
    }
    transactions.addAll(
        (this.getChargePaymentTransactions().map(\transaction -> new TransactionWrapper(transaction, TransactionWrapper.TransactionType.PAYMENTANDCREDIT))) as Collection <TransactionWrapper>
    )
    return transactions.sortBy(\c -> c.transaction.TransactionDate).toTypedArray()
  }

  function getTotalCommission(): MonetaryAmount {
    return this.PrimaryPolicyCommission.CommissionReserveBalance.add(this.PrimaryPolicyCommission.CommissionPaid)
  }

  function getChargeCommissionRate(): BigDecimal {
    if (this.TotalValue.signum() == 0){
      return 0;
    }
    return getTotalCommission().multiply(100).divide(this.TotalValue, 2, RoundingMode.DOWN)
  }

  function getPaidCommissionRate(): BigDecimal {
    if (this.PaidOrWrittenOffAmount.signum() == 0){
      return 0;
    }
    return this.PrimaryPolicyCommission.CommissionPaid.multiply(100).divide(this.PaidOrWrittenOffAmount, 2, RoundingMode.DOWN)
  }

  property set RequireFinalAudit(required: boolean) {
    if (required) {
      this.scheduleFinalAudit()
    } else {
      this.waiveFinalAudit()
    }
  }

  property get RequireFinalAudit(): boolean {
    return this.ClosureStatus == PolicyClosureStatus.TC_OPENLOCKED ? true : false
  }

  function hasPastInvoiceItems(): boolean {
    var invoices = this.InvoiceItemsSortedByEventDate
    if (invoices.length == 0) return false;
    return invoices[0].EventDate.before(DateUtil.currentDate())
  }

  function makeSingleCashPaymentUsingNewBundle(amount: MonetaryAmount) {
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var policyPeriod = bundle.add(gw.api.database.Query.make(PolicyPeriod).compare("ID", Equals, this.ID).select().AtMostOneRow)
      DirectBillPaymentFactory.payPolicyPeriod(policyPeriod.Account, policyPeriod, amount)
    })
  }
}
