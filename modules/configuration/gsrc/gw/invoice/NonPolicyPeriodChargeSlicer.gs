package gw.invoice

uses gw.api.domain.invoice.ChargeSlicer
uses gw.pl.currency.MonetaryAmount
uses gw.api.domain.invoice.ChargeInstallmentChanger
uses gw.api.domain.charge.ChargeInitializer

/**
 * A NonPolicyPeriodChargeSlicer slices non-policy period charges into invoice items.  Non-policy period charges
 * include account-level charges, collateral charges, and collateral requirement charges.
 */
@Export
public class NonPolicyPeriodChargeSlicer implements ChargeSlicer {

  /**
   * Creates invoice items entries from a charge. Assumes that charge is new.
   * @param chargeInitializer
   */
  override function createEntries(chargeInitializer : ChargeInitializer) {
    if (!chargeInitializer.Amount.IsZero) {
      chargeInitializer.addEntry(chargeInitializer.Amount, InvoiceItemType.TC_ONETIME, chargeInitializer.ChargeDate)
    }
  }

  override function recreateInvoiceItems(changer : ChargeInstallmentChanger, totalAmountForInvoiceItems : MonetaryAmount) {
    // this method will never get called for a non-policyperiod charge, because it only gets called during payment plan change
  }

}
