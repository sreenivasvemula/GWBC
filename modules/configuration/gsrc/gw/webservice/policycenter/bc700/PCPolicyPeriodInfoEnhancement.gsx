package gw.webservice.policycenter.bc700
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.policycenter.bc700.entity.types.complex.PCPolicyPeriodInfo

@Export
enhancement PCPolicyPeriodInfoEnhancement : PCPolicyPeriodInfo {
  function findPolicyPeriod() : PolicyPeriod {
    var period = PolicyPeriod.finder.findByPolicyNumberAndTerm(this.PolicyNumber, this.TermNumber)
    if (period == null) {
      throw new BadIdentifierException("Could not find policy period ${this.PolicyNumber}-${this.TermNumber}")
    }
    return period
  }  
}
