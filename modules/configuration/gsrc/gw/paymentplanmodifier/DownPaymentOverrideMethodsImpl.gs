package gw.paymentplanmodifier
uses gw.api.domain.invoice.PaymentPlanModifierMethodsImpl

@Export
class DownPaymentOverrideMethodsImpl extends PaymentPlanModifierMethodsImpl {

  private var _downPaymentOverride : DownPaymentOverride;

  construct (downPaymentOverride : DownPaymentOverride) {
    super(downPaymentOverride);
    _downPaymentOverride = downPaymentOverride
  }

  override public function modify(paymentPlan : PaymentPlan) {
    paymentPlan.DownPaymentPercent = _downPaymentOverride.DownPaymentPercent
  }
}

