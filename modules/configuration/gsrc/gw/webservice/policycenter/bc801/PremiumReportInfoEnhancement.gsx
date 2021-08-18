package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.webservice.policycenter.bc801.entity.types.complex.PremiumReportInfo
uses gw.api.webservice.exception.BadIdentifierException

@Export
enhancement PremiumReportInfoEnhancement : PremiumReportInfo {
  
  function execute() : String{
    var policyPeriod =  Query.make(entity.PolicyPeriod).compare("PolicyNumber", Equals, this.PolicyNumber).compare("TermNumber", Equals, this.TermNumber).select().getAtMostOneRow()
    if (policyPeriod == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindMatchingPolicyPeriod(this.PolicyNumber, this.TermNumber))
    }
    var bi = new PremiumReportBI(policyPeriod.Currency)
    bi.PeriodStartDate = this.AuditPeriodStartDate.toCalendar().Time
    bi.PeriodEndDate = this.AuditPeriodEndDate.toCalendar().Time
    bi.PaymentReceived = this.PaymentReceived
    return this.execute(bi)
  }
}
