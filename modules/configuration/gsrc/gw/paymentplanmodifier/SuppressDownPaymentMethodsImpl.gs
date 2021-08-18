package gw.paymentplanmodifier
uses gw.api.domain.invoice.PaymentPlanModifierMethodsImpl

@Export
class SuppressDownPaymentMethodsImpl extends PaymentPlanModifierMethodsImpl {

  construct (suppressDownPayment : SuppressDownPayment) {
    super(suppressDownPayment);
  }

  override public function modify(paymentPlan : PaymentPlan) {
    paymentPlan.DownPaymentPercent = 0
  }
}
