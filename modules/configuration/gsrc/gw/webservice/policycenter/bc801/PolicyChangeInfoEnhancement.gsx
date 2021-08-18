package gw.webservice.policycenter.bc801
uses gw.webservice.policycenter.bc801.entity.types.complex.PolicyChangeInfo

@Export
enhancement PolicyChangeInfoEnhancement : PolicyChangeInfo {

  function executePolicyChangeBI() : String {
    return this.execute(createBillingInstruction())
  }

  private function createBillingInstruction(forPreview : boolean =  false) : PolicyChange {
    var policyPeriod = forPreview
        ? this.findPolicyPeriod()
        : this.findPolicyPeriodForUpdate()
    var bi = new PolicyChange(policyPeriod.Currency)
    policyPeriod = bi.Bundle.add( policyPeriod )
    populateChangeInfo( policyPeriod )
    if (this.HasScheduledFinalAudit and policyPeriod.Canceled) {
      bi.SpecialHandling = typekey.SpecialHandling.TC_HOLDFORAUDITALL
    }
    return bi;
  }

  function populateChangeInfo(period : PolicyPeriod) : PolicyPeriod {
    period.RiskJurisdiction = this.JurisdictionCode
    period.PolicyPerEffDate = this.PeriodStart == null ? period.PolicyPerEffDate : this.PeriodStart.toCalendar().Time
    period.PolicyPerExpirDate = this.PeriodEnd == null ? period.PolicyPerExpirDate : this.PeriodEnd.toCalendar().Time
    initializeContact(period)
    return period
  }

  private function initializeContact(period : PolicyPeriod) {
    if (this.PrimaryNamedInsuredContact == null) return;

    var alreadyHasSpecifiedContact = period.Contacts
      .hasMatch(\ policyPeriodContact -> policyPeriodContact.Contact.AddressBookUID == this.PrimaryNamedInsuredContact.AddressBookUID )

    if (!alreadyHasSpecifiedContact){
      period.Contacts.firstWhere(\ c -> c.Roles*.Role.contains(TC_PRIMARYINSURED))?.remove()  // period.PrimaryInsured denorm is not synced yet
      var primaryInsured = this.PrimaryNamedInsuredContact.$TypeInstance.toPolicyPeriodContact(period)
      period.addToContacts(primaryInsured)
    }
  }

  function toPolicyChangeForPreview() : PolicyChange {
    var bi = createBillingInstruction(true)
    this.initializeBillingInstruction(bi)
    return bi
  }
}
