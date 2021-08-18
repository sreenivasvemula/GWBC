package gw.webservice.policycenter.bc801

uses gw.api.web.policy.NewPolicyUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.policycenter.bc801.entity.types.complex.RewriteInfo

@Export
enhancement RewriteInfoEnhancement : RewriteInfo {

  function executeRewriteBI() : String {
    final var priorPolicyPeriod = this.findPriorPolicyPeriod()
    if (priorPolicyPeriod == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindMatchingPolicyPeriod(this.PriorPolicyNumber == null ? this.PolicyNumber : this.PriorPolicyNumber, this.PriorTermNumber == null ? this.TermNumber - 1 : this.PriorTermNumber))
    }
    final var bi = (priorPolicyPeriod.Currency != this.CurrencyValue)
        ? NewPolicyUtil.createCurrencyChangeRewrite(this.findOwnerAccount(), priorPolicyPeriod)
        : NewPolicyUtil.createRewrite(priorPolicyPeriod)
    this.initPolicyPeriodBIInternal(bi) // must occur before populate when prior period exists...
    this.populateIssuanceInfo(false, bi.NewPolicyPeriod)
    return this.execute(bi)
  }
}
