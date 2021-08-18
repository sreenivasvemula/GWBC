package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.PremiumReportInfo
uses gw.api.util.CurrencyUtil

@Export
enhancement PremiumReportInfoEnhancement : PremiumReportInfo {
  
  function execute() : String{
    var bi = new PremiumReportBI(CurrencyUtil.getDefaultCurrency())
    bi.PeriodStartDate = this.AuditPeriodStartDate.toCalendar().Time
    bi.PeriodEndDate = this.AuditPeriodEndDate.toCalendar().Time
    bi.PaymentReceived = this.PaymentReceived
    return this.execute(bi)
  }
}
