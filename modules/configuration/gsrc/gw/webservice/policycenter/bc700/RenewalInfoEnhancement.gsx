package gw.webservice.policycenter.bc700

uses gw.api.system.BCLoggerCategory
uses gw.api.database.Query
uses gw.api.web.policy.NewPolicyUtil
uses gw.webservice.policycenter.bc700.entity.types.complex.RenewalInfo

@Export
enhancement RenewalInfoEnhancement : RenewalInfo {
  
  function findPriorPolicyPeriod() : PolicyPeriod {
    var q = Query.make(PolicyPeriod)
    q.compare("PolicyNumber", Equals, PolicyNumberToFind)
    q.compare("TermNumber", Equals, TermNumberToFind)
    return gw.transaction.Transaction.Current.add(q.select().AtMostOneRow) // ensure writable...
  }

  property get PolicyNumberToFind() : String {
    return this.PriorPolicyNumber == null ? this.PolicyNumber : this.PriorPolicyNumber
  }

  property get TermNumberToFind() : int {
    // For the case when the prior policy period does not exist in PC but exist in BC.
    // As the result, PC cannot tell BC about the prior period but BC has to guess base on
    // the current policy period.
    return this.PriorTermNumber == null ? this.TermNumber - 1 : this.PriorTermNumber
  }

  function executeRenewalBI() : String {
    var bi : NewPlcyPeriodBI
    final var priorPeriod = findPriorPolicyPeriod()
    if (priorPeriod == null) { // new renewal
      BCLoggerCategory.BILLING_API.info("Could not find prior policy period ${PolicyNumberToFind}-${TermNumberToFind}. Creating New Renewal.")
      bi = createNewPolicyBIInternal()
      this.initPolicyPeriodBIInternal(bi) // can occur after populate when no prior period...
    } else {
      BCLoggerCategory.BILLING_API.info("Renewing policy period ${PolicyNumberToFind}-${TermNumberToFind}.")
      bi = makeRenewalBIInternal(priorPeriod)
    }
    return this.execute(bi)
  }

  private function createNewPolicyBIInternal() : NewPlcyPeriodBI {
    // populateIssuanceInfo invoked by createPolicyPeriod...
    return NewPolicyUtil.createNewRenewal(
        this.findExistingAccount(), this.createPolicyPeriod(false), this.TermNumber)
  }

  private function makeRenewalBIInternal(final priorPeriod : PolicyPeriod) : NewPlcyPeriodBI {
    final var renewalBI = NewPolicyUtil.createRenewal(priorPeriod)
    this.initPolicyPeriodBIInternal(renewalBI) // must precede populate when prior period exists...
    this.populateIssuanceInfo(false, renewalBI.NewPolicyPeriod)
    return renewalBI
  }
}
