package gw.webservice.policycenter.bc801

uses gw.payment.PaymentInstrumentFilters

uses gw.webservice.policycenter.bc801.entity.types.complex.PaymentPlanInfo

@Export
enhancement PaymentPlanInfoEnhancement : PaymentPlanInfo {
  function copyPaymentPlanInfo(plan : PaymentPlan){
    this.copyPlanCurrencyInfo(plan)
    this.Reporting = plan.Reporting
    this.AllowedPaymentMethods = PaymentInstrumentFilters
        .accountDetailsPaymentInstrumentFilter.map(\ paymentMethod -> paymentMethod.Code)
    this.InvoiceFrequency = plan.Periodicity.Code
  }
}
