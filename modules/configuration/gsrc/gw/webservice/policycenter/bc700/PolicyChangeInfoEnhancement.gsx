package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.PolicyChangeInfo

@Export
enhancement PolicyChangeInfoEnhancement : PolicyChangeInfo {
  
  function executePolicyChangeBI() : String {
    return this.execute(createBillingInstruction())
  }

  private function createBillingInstruction() : PolicyChange {
    var policyPeriod = this.findPolicyPeriod()
    var bi = new PolicyChange(policyPeriod.Currency)
    policyPeriod = bi.Bundle.add( policyPeriod )
    populateChangeInfo( policyPeriod )
    if (this.HasScheduledFinalAudit and policyPeriod.Canceled) {
      bi.SpecialHandling = typekey.SpecialHandling.TC_HOLDFORAUDITALL
    }
    return bi;
  }
  
  function populateChangeInfo(period : PolicyPeriod) : PolicyPeriod {
    period.RiskJurisdiction = this.StateCode
    period.PolicyPerEffDate = this.PeriodStart == null ? period.PolicyPerEffDate : this.PeriodStart.toCalendar().Time
    period.PolicyPerExpirDate = this.PeriodEnd == null ? period.PolicyPerExpirDate : this.PeriodEnd.toCalendar().Time
    initializeContact(period)
    return period
  }

  private function initializeContact(period : PolicyPeriod) {
    if (this.PrimaryNamedInsuredContact == null) return;

    var alreadyHasSpecifiedContact = period.Contacts
      .hasMatch(\ policyPeriodContact -> policyPeriodContact.Contact.ExternalID == this.PrimaryNamedInsuredContact.PublicID )

    if (!alreadyHasSpecifiedContact) {
      period.Contacts.firstWhere(\ c -> c.Roles*.Role.contains(TC_PRIMARYINSURED))?.remove()  // period.PrimaryInsured denorm is not synced yet
      var primaryInsured = this.PrimaryNamedInsuredContact.$TypeInstance.toPolicyPeriodContact(period)
      period.addToContacts(primaryInsured)
    }
  }

  function toPolicyChangeForPreview() : PolicyChange {
    var bi = createBillingInstruction()
    this.initializeBillingInstruction(bi)
    return bi
  }
}
