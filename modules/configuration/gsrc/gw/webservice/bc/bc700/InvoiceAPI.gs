package gw.webservice.bc.bc700

uses gw.invoice.InvoiceItemPreview
uses java.lang.IllegalStateException

//@RpcWebService
@Export
class InvoiceAPI {

  construct() {
  }

  /**
   * Generates a preview of the installment schedule that'd be created for the given new policy.  The new policy is
   * encapsulated in an Issuance billing instruction, so that there is enough context to properly simulate the invoice
   * generation.
   */
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
