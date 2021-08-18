package libraries

uses gw.api.financials.MonetaryAmounts

@Export
enhancement StatementInvoiceExt : StatementInvoice {
  /**
   * Return display text that appears for a statement invoice in the statement invoice dropdown selector on AgencyPromisePopup.pcf
   */
  function getSummary() : String {
    return getStatementInvoiceSummaryText()
  }

  /**
   * Return display text that appears for a statement invoice in the statement invoice dropdown selector on AgencyPaymentSelectProducerPopup.pcf
   */
  function getSummaryForPaymentWizard() : String {

    var summaryText = getStatementInvoiceSummaryText()

    var promise = this.getAgencyBillCycle().getActivePromise();
    if (promise != null) {
      summaryText = summaryText + " " + getPromisedAmountText(promise)
    }

    return summaryText;
  }


  private function getStatementInvoiceSummaryText() : String {
    return displaykey.Java.AgencyPayment.SelectProducer.StatementOption.ExistingStatement(
      this.EventDate.AsUIStyle
      , this.InvoiceNumber
      , MonetaryAmounts.render(this.AmountDue)
      , MonetaryAmounts.render(this.NetAmount.subtract(this.NetAmountPaidIncludingPayable).subtract(this.NetAmountWrittenOff)))
  }

  private function getPromisedAmountText(promise : AgencyCyclePromise) : String {
      return displaykey.Java.AgencyPayment.SelectProducer.StatementOption.Promised(promise.Amount.render())
  }

  /**
   * Returns true if this Statement is fully paid, i.e., all invoice items on this invoice are "Fully Consumed".
   * <br/>
   * <br/>
   * <b>Warning:</b> this may not be performant.
   */
  function isFullyPaid() : boolean {
    return !(this.InvoiceItems.hasMatch(\ invoiceItem ->!invoiceItem.FullyConsumed))
  }

  /**
   * Returns true if there has been an executed non-zero payment item against any invoice item on this statement.
   * <br/>
   * <br/>
   * <b>Warning:</b> this may not be performant.
   */
  function hasPaymentReceived() : boolean {
    for (var invoiceItem in this.InvoiceItems) {
      if (invoiceItem.ActivePaymentItems.hasMatch(\ item ->
              !item.GrossAmountToApply.IsZero || !item.CommissionAmountToApply.IsZero)) {
        return true
      }
    }
    return false
  }

  /**
   * @return whether or not this statement should be considered open.
   */
  public property get Open() : boolean {
    return !this.ExactlyPaidIncludingSnapshots && 
        (this.Status == InvoiceStatus.TC_BILLED || this.Status == InvoiceStatus.TC_DUE)
  }

  /**
   * Get display text that will appear in the UI for the status of the statement
   * (eg: Planned, Open, Closed, Past Due)
   *
   * @return display text for the status of an agency bill statement invoice
   */
  property get DisplayStatus() : String {
    var statementStatus = this.Status

    if ( statementStatus == InvoiceStatus.TC_PLANNED ) {
      return displaykey.Java.AgencyBillStatement.Status.Planned
    }

    if ( this.ExactlyPaidIncludingSnapshots ) {
      return displaykey.Java.AgencyBillStatement.Status.Closed
    } else {
      if ( statementStatus == InvoiceStatus.TC_BILLED ) {
        return displaykey.Java.AgencyBillStatement.Status.Open
      }
      if ( statementStatus == InvoiceStatus.TC_DUE ) {
        return displaykey.Java.AgencyBillStatement.Status.PastDue
      }
      return displaykey.Java.AgencyBillStatement.Status.NotApplicable
    }
  }

  function isSufficientlySettledIncludingPromises() : boolean {
    var statement = this.AgencyCycleProcess.StatementInvoice
    // A promise is considered to be 'Not Late' if at least 80% of the amount due is 'promised' by the due date
    return (statement.NetAmountSettledIncludingPromises >= statement.NetAmount.multiply(0.8))
  }

  function isSufficientlySettled() : boolean {
    var statement = this.AgencyCycleProcess.StatementInvoice
    // A payment is considered to be 'Not Late' if at least 80% of the amount is received by the due date
    return (statement.NetAmountSettled >= statement.NetAmount.multiply(0.8))
  }
}
