package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.policycenter.bc801.entity.types.complex.PCPolicyPeriodInfo

@Export
enhancement PCPolicyPeriodInfoEnhancement : PCPolicyPeriodInfo {

  /**
   *  Returns the PolicyPeriod that matches the PCPolicyPeriodInfo. A BadIdentifierException is thrown if one is not found.
   *
   *  Does a one-time update of PolicyPeriod.Policy for PolicyPeriods that have been upgraded from a version before 8.0.0.
   *  Call this method when you are planning to execute a Billing Instruction or other operation that will commit the bundle.
   *  Otherwise call findPolicyPeriod.
   *
   *  It should try to find a match using the PCPolicyPublicID first (assuming PCPolicyPublicID is not null).
   *  If a match is not found, then BC should try to find a match using the policy number.
   *
   *  If PCPolicyPublicID is not provided in the API calls,
   *  then BC should use the policy number to find a matching policy and process the API call (same behavior as in 7.0.0).
   *
   *  If a PolicyPeriod has been upgraded from a version before 8.0.0, its Policy might have null PCPublicID field. If a matching
   *  PolicyPeriod is found by the PolicyNumber, BC should update Policy.PCPublicID field with PCPolicyPeriodInfo.PCPolicyPublicID
   *
   *  @return the PolicyPeriod
   */
  function findPolicyPeriodForUpdate() : PolicyPeriod {
    var bundle = gw.transaction.Transaction.Current
    var period = findPolicyPeriod()
    period = bundle.add(period)
    updatePCPublicID(period)
    return period
  }

  /**
   *  Returns the PolicyPeriod that matches the PCPolicyPeriodInfo. A BadIdentifierException is thrown if one is not found.
   *
   *  It should try to find a match using the PCPolicyPublicID first (assuming PCPolicyPublicID is not null).
   *  If a match is not found, then BC should try to find a match using the policy number.
   *
   *  If PCPolicyPublicID is not provided in the API calls,
   *  then BC should use the policy number to find a matching policy and process the API call (same behavior as in 7.0.0).
   *
   *  @return the PolicyPeriod
   */
  function findPolicyPeriod() : PolicyPeriod {
    var period = findByPolicyPublicIDOrPolicyNumber(this.PCPolicyPublicID, this.TermNumber, this.PolicyNumber)

    if (period == null) {
      var message = (this.PCPolicyPublicID != null)
          ? displaykey.Webservice.Error.CannotFindMatchingPolicyPeriodByPCPolicyPublicID(this.PCPolicyPublicID, this.PolicyNumber, this.TermNumber)
          : displaykey.Webservice.Error.CannotFindMatchingPolicyPeriod(this.PolicyNumber, this.TermNumber)

      throw new BadIdentifierException(message)
    }
    return period
  }

  /**
   *  If a PolicyPeriod has been upgraded from a version before 8.0.0, its Policy might have a null PCPublicID field. If a matching
   *  PolicyPeriod is found by the PolicyNumber, BC should update Policy.PCPublicID field with PCPolicyPeriodInfo.PCPolicyPublicID
   *
   *  If there are no PolicyPeriods which have been upgraded from a version before 8.0.0, this method is not necessary.
   */
  private function updatePCPublicID(period : PolicyPeriod) {
    var fieldIsNull = period.Policy.PCPublicID == null
    var newFieldValueExists = this.PCPolicyPublicID != null
    if (fieldIsNull and newFieldValueExists) {
      var policy = period.Bundle.add(period.Policy)
      policy.PCPublicID = this.PCPolicyPublicID
    }
  }

  /**
   * Find using either the PublicID of the Policy of PolicyCenter and the term number
   * or the PolicyNumber and the term number.
   *
   * @param pcPolicyPublicID PolicyCenter's public ID of the Policy
   * @param termNumber the term number
   * @param policyNumber the policy number
   * @return the only policy period
   */
  function findByPolicyPublicIDOrPolicyNumber(pcPolicyPublicID : String, termNumber : int, policyNumber : String) : PolicyPeriod {
    var period : PolicyPeriod
    if (this.PCPolicyPublicID != null) {
      period = findByPolicyPublicIDAndTerm(pcPolicyPublicID, termNumber)
      if (period != null) {
        return period
      }
    }
    return findByPolicyNumberAndTerm(policyNumber, termNumber)
  }

  /**
   * Find policy period by PolicyCenter's public ID of the Policy and the term number
   * @param publicIDInPC PolicyCenter's public ID of the Policy
   * @param termNumber the term number
   * @return the only policy period
   */
  function findByPolicyPublicIDAndTerm(publicIDinPC : String, termNumber : int) : PolicyPeriod {
    var policyPeriodQuery = Query.make(PolicyPeriod)
    policyPeriodQuery.compare(PolicyPeriod#TermNumber, Equals, termNumber)
    var policyTable = policyPeriodQuery.join(PolicyPeriod#Policy)
    policyTable.compare(Policy#PCPublicID, Equals, publicIDinPC)
    return policyPeriodQuery.select().FirstResult
  }

  /**
   * Find policy period by PolicyCenter's public ID of the Policy and the term number
   * @param policyNumber the policy number
   * @param termNumber the term number
   * @return the only policy period
   */
  function findByPolicyNumberAndTerm(policyNumber : String, termNumber : int) : PolicyPeriod {
    var policyPeriodQuery = Query.make(PolicyPeriod)
    policyPeriodQuery.compare(PolicyPeriod#PolicyNumber, Equals, policyNumber)
    policyPeriodQuery.compare(PolicyPeriod#TermNumber, Equals, termNumber)
    return policyPeriodQuery.select().FirstResult
  }
}
