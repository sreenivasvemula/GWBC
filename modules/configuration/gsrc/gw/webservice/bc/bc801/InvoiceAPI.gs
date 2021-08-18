package gw.webservice.bc.bc801

uses java.lang.IllegalStateException

/**
 * @deprecated (Since 8.0.1) Use gw.webservice.policycenter.bc801.BillingAPI instead.
 */
@RpcWebService
@Export
@java.lang.Deprecated
class InvoiceAPI {

  construct() {  }

  /**
   * Generates a preview of the installment schedule that'd be created for the given new policy.  The new policy is
   * encapsulated in an Issuance billing instruction, so that there is enough context to properly simulate the invoice
   * generation.
   * @deprecated (Since 8.0.1) Use gw.webservice.policycenter.bc801.BillingAPI#previewInstallmentPlanInvoices instead.
   */
  @java.lang.Deprecated
  function previewInstallmentSchedule(newPolicyPeriod : PolicyPeriod,
                                      charges : Charge[],
                                      accountBillingPlan : BillingPlan,
                                      invoiceDayOfMonth : Number) : InvoiceItemPreview[] {
    var account = new Account(newPolicyPeriod.Currency)
    account.BillingPlan = accountBillingPlan
    account.InvoiceDayOfMonth = invoiceDayOfMonth as java.lang.Integer
    var issuance = new Issuance(account.Currency)
    issuance.IssuanceAccount = account
    issuance.initializeIssuancePolicyPeriod(newPolicyPeriod)
    issuance.PolicyPaymentPlan = newPolicyPeriod.PaymentPlan
    for (charge in charges) {
      if (charge.getChargePattern().isRecapture()) {
        throw new IllegalStateException(displaykey.Java.Error.BillingInstruction.BadChargePattern);
      }
      issuance.buildCharge(charge.Amount, charge.ChargePattern)
    }
    issuance.execute()
    for (var invoice in account.InvoicesSortedByDate) {
      invoice.addFees()
    }

    var generatedInvoiceItems = issuance.NewPolicyPeriod.InvoiceItems
      .map(\ generatedInvoiceItem ->
        new InvoiceItemPreview(generatedInvoiceItem.InvoiceBilledDate,
            generatedInvoiceItem.InvoiceDueDate,
            generatedInvoiceItem.Charge.DisplayName,
            generatedInvoiceItem.Amount,
            generatedInvoiceItem.Type)
    )

    generatedInvoiceItems.sortBy(\ i -> (i.InvoiceDate.Time as String) + i.Type)
    return generatedInvoiceItems
  }
}
