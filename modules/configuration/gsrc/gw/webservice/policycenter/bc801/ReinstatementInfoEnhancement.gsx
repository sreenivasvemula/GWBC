package gw.webservice.policycenter.bc801
uses gw.webservice.policycenter.bc801.entity.types.complex.ReinstatementInfo
uses gw.api.database.Query

@Export
enhancement ReinstatementInfoEnhancement : ReinstatementInfo {
  
  function execute() : String {
    var policyPeriod =  Query.make(entity.PolicyPeriod).compare("PolicyNumber", Equals, this.PolicyNumber).compare("TermNumber", Equals, this.TermNumber).select().getAtMostOneRow()
    var bi = new Reinstatement(policyPeriod.Currency)
    return this.execute(bi)
  }
}
