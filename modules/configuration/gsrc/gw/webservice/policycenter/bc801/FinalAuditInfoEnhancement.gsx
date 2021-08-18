package gw.webservice.policycenter.bc801

uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.policycenter.bc801.entity.types.complex.FinalAuditInfo

@Export
enhancement FinalAuditInfoEnhancement : FinalAuditInfo {
  
  function execute() : String {
    var policyPeriod = this.findByPolicyPublicIDOrPolicyNumber(this.PCPolicyPublicID, this.TermNumber, this.PolicyNumber)

    if (policyPeriod == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindMatchingPolicyPeriod(this.PolicyNumber, this.TermNumber))
    }

    var bi = new Audit(policyPeriod.Currency)
    bi.FinalAudit = true
    bi.TotalPremium = false
    return this.execute(bi)
  }
}
