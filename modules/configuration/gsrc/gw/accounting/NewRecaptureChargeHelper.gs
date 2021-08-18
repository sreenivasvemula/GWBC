package gw.accounting

uses com.google.common.base.Preconditions
uses gw.api.domain.accounting.ChargePatternKey
uses gw.api.domain.charge.ChargeInitializer
uses gw.pl.currency.MonetaryAmount

uses java.util.Date

/**
 * Defines a utility class to help the recapture screens by properly setting up
 * the {@link BillingInstruction} and {@link ChargeInitializer} to create
 * {@link Charge}s with the appropriate {@link ChargePatternKey#RECAPTURE
 * RecaptureCharge} or {@link ChargePatternKey#POLICYRECAPTURE
 * Policy RecaptureCharge} pattern.
 *
 * Used by {@link AccountNewRecaptureWizard} and {@link RecaptureDetailsScreen}.
 */
@Export
class NewRecaptureChargeHelper {
  private var _billingInstruction : BillingInstruction as readonly BillingInstruction

  construct(account: Account) {
    createNewInitializer(0bd.ofCurrency(account.Currency), account.DefaultUnappliedFund)
  }

  property get RecaptureUnappliedFund() : UnappliedFund {
    return RecaptureChargeInitializer.RecaptureUnappliedFund
  }

 property set RecaptureUnappliedFund(unappliedFund : UnappliedFund) {
    Preconditions.checkNotNull(unappliedFund)
    createNewInitializer(RecaptureChargeInitializer.Amount, unappliedFund)
  }

  public property get RecaptureChargeInitializer() : ChargeInitializer {
    return _billingInstruction.ChargeInitializers.single()
  }

  private function createNewInitializer(amount : MonetaryAmount, unappliedFund : UnappliedFund) {
    if (_billingInstruction != null) {
      _billingInstruction.remove()
    }
    var initializer : ChargeInitializer
    if (shouldUseAccountAsTAccountOwner(unappliedFund)) {
      var bi = new AccountGeneral(unappliedFund.Currency)
      bi.BillingInstructionDate = Date.Now
      bi.Account = unappliedFund.Account
      _billingInstruction = bi
      initializer = _billingInstruction.buildCharge(amount, ChargePatternKey.RECAPTURE.get())
    } else {
      var bi = new General(unappliedFund.Currency)
      bi.ModificationDate = Date.Now
      bi.AssociatedPolicyPeriod = unappliedFund.Policy.LatestPolicyPeriod
      _billingInstruction = bi
      initializer = _billingInstruction.buildCharge(amount, ChargePatternKey.POLICYRECAPTURE.get())
    }
    initializer.RecaptureUnappliedFund = unappliedFund
  }

  private function shouldUseAccountAsTAccountOwner(unappliedFund : UnappliedFund) : boolean {
    return unappliedFund.Policy.LatestPolicyPeriod == null
  }

  override function toString() : String {
    return "" + _billingInstruction
  }
}