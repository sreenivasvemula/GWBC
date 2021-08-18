package gw.invoice

uses gw.api.domain.charge.ChargeInitializer
uses gw.api.domain.invoice.ChargeInstallmentChanger
uses gw.api.domain.invoice.ChargeSlicer
uses gw.pl.currency.MonetaryAmount

uses java.util.Date

/**
 * A SpecialHandlingChargeSlicer slices charges that have a billing instruction with special handling into
 * invoice items.
 */
@Export
public class SpecialHandlingChargeSlicer implements ChargeSlicer {

  static var invoiceTreatmentToInvoiceItemType = {
      InvoiceTreatment.TC_DEPOSITANDINSTALLMENTS -> InvoiceItemType.TC_DEPOSIT,
      InvoiceTreatment.TC_ONETIME -> InvoiceItemType.TC_ONETIME,
      InvoiceTreatment.TC_SINGLEINSTALLMENT -> InvoiceItemType.TC_INSTALLMENT,
      InvoiceTreatment.TC_SINGLEDEPOSIT -> InvoiceItemType.TC_DEPOSIT
  }

  /**
   * Creates invoice items entries from a charge. Assumes that charge is new.
   * @param chargeInitializer
   */
  override function createEntries(chargeInitializer : ChargeInitializer) {
    var entry = chargeInitializer.addEntry(chargeInitializer.Amount,  invoiceTreatmentToInvoiceItemType.get(chargeInitializer.ChargePattern.InvoiceTreatment),  Date.CurrentDate)
    if (shouldBillToday(chargeInitializer)) {
      entry.billToday()
    }
  }

  private function shouldBillToday(chargeInitializer : ChargeInitializer) : boolean {
    return chargeInitializer.BillingInstruction.SpecialHandling == SpecialHandling.TC_BILLIMMEDIATELY and !chargeInitializer.AgencyBill
  }

  override function recreateInvoiceItems(changer : ChargeInstallmentChanger, totalAmountForInvoiceItems : MonetaryAmount) {
    for (var entry in changer.Entries) {
      entry.revert()
    }
  }

}
