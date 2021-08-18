package gw.paymentplanmodifier
uses gw.api.domain.invoice.PaymentPlanModifierMethodsImpl

@Export
class ChargeSlicingModifierMethodsImpl extends PaymentPlanModifierMethodsImpl {

  private var _chargeSlicingOverrides : ChargeSlicingOverrides;

  construct (chargeSlicingModifier: ChargeSlicingModifier) {
    super(chargeSlicingModifier);
    _chargeSlicingOverrides = chargeSlicingModifier.ChargeSlicingOverrides
  }

  override public function modify(paymentPlan : PaymentPlan) {
    paymentPlan.applyOverrides(_chargeSlicingOverrides)
    // Customization: If you have extension fields on PaymentPlan that you can override by billing instruction type,
    // then apply the overrides for those fields here. e.g.
    // if (_chargeSlicingOverrides.CustomField != null) {
    //      paymentPlan.CustomField = _chargeSlicingOverrides.CustomField
    // }
  }
}