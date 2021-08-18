package gw.paymentplanmodifier
uses gw.api.domain.invoice.PaymentPlanModifierMethodsImpl

@Export
class MaximumNumberOfInstallmentsOverrideMethodsImpl extends PaymentPlanModifierMethodsImpl {

  private var _maximumNumberOfInstallmentsOverride : MaximumNumberOfInstallmentsOverride;

  construct (maximumNumberOfInstallmentsOverride : MaximumNumberOfInstallmentsOverride) {
    super(maximumNumberOfInstallmentsOverride);
    _maximumNumberOfInstallmentsOverride = maximumNumberOfInstallmentsOverride
  }

  override public function modify(paymentPlan : PaymentPlan) {
    paymentPlan.MaximumNumberOfInstallments = _maximumNumberOfInstallmentsOverride.MaximumNumberOfInstallments
  }
}
