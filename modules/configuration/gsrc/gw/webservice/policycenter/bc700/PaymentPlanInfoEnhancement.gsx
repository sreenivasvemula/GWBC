package gw.webservice.policycenter.bc700

uses gw.payment.PaymentInstrumentFilters
uses gw.webservice.policycenter.bc700.entity.types.complex.PaymentPlanInfo

@Export
enhancement PaymentPlanInfoEnhancement : PaymentPlanInfo {
  function copyPaymentPlanInfo(plan : PaymentPlan){
    this.copyPlanInfo(plan)
    this.Reporting = plan.Reporting
    this.AllowedPaymentMethods = PaymentInstrumentFilters
        .accountDetailsPaymentInstrumentFilter.map(\ paymentMethod -> paymentMethod.Code)
    this.InvoiceFrequency = plan.Periodicity.Code
  }
}
