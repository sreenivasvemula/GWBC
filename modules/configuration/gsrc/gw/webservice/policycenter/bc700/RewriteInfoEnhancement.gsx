package gw.webservice.policycenter.bc700

uses gw.api.web.policy.NewPolicyUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.policycenter.bc700.entity.types.complex.RewriteInfo

@Export
enhancement RewriteInfoEnhancement : RewriteInfo {
  
  function executeRewriteBI() : String {
    final var priorPolicyPeriod = this.findPriorPolicyPeriod()
    if (priorPolicyPeriod == null) {
      throw new BadIdentifierException("Could not find prior Policy Period to rewrite: ${this.PriorPolicyNumber == null ? this.PolicyNumber : this.PriorPolicyNumber}-${this.PriorTermNumber == null ? this.TermNumber - 1 : this.PriorTermNumber}")
    }
    final var bi = NewPolicyUtil.createRewrite(priorPolicyPeriod)
    this.initPolicyPeriodBIInternal(bi) // must precede populate when prior period exists...
    this.populateIssuanceInfo(false, bi.NewPolicyPeriod)
    return this.execute(bi)
  }
}
