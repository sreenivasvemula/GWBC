package gw.webservice.policycenter.bc801

uses gw.api.domain.accounting.ChargeUtil
uses gw.api.domain.charge.ChargeInitializer
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.SOAPServerException
uses gw.pl.currency.MonetaryAmount
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.ChargeInfo_ChargeCommissionRateOverrideInfos
uses gw.webservice.policycenter.bc801.entity.types.complex.ChargeCommissionRateOverrideInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ChargeInfo

@Export
enhancement ChargeInfoEnhancement : ChargeInfo {
  function toCharge(billingInstruction: BillingInstruction) {
    var initializer = billingInstruction.buildCharge(new MonetaryAmount(this.Amount), ChargeUtil.getChargePatternByCode(this.ChargePatternCode))
    if (this.RecaptureUnappliedFundID != null && !this.RecaptureUnappliedFundID.Empty) {
      var recaptureUnappliedFund = gw.api.database.Query.make(UnappliedFund)
          .compare("PublicID", Equals, this.RecaptureUnappliedFundID)
          .select().getAtMostOneRow()
      if (recaptureUnappliedFund == null) {
        throw new BadIdentifierException(this.RecaptureUnappliedFundID)
      }
      initializer.RecaptureUnappliedFund = recaptureUnappliedFund
    }
    if (this.WrittenDate != null) {
      initializer.WrittenDate = this.WrittenDate.toCalendar().Time
    }
    initializer.ChargeGroup = this.ChargeGroup

    // rate overrides are valid only for policy period charges
    if (billingInstruction typeis PlcyBillingInstruction) {
      addOverrides(initializer)
    }
  }

  /**
   * Populate all fields based on the given charge. {@link ChargeInfo#RecaptureUnappliedFundID} is not populated.
   * @param charge The charge to copy from
   */
  function copyChargeInfo(charge : Charge) {
    this.Amount = charge.Amount.toString()
    this.ChargePatternCode = charge.ChargePattern.ChargeCode
    this.ChargeGroup = charge.ChargeGroup
    this.WrittenDate = charge.WrittenDate.XmlDateTime
  }

  private function addOverrides(chargeInitializer : ChargeInitializer) {
    for(entry in this.ChargeCommissionRateOverrideInfos.partition( \ info -> info.Role).entrySet()) {
      // check that there are no duplicate overrides for the same role
      if (entry.Value.size() > 1) {
        throw new SOAPServerException(displaykey.Webservice.Error.DuplicateRolesInCommissionRateOverrides(entry.Key))
      }
      // check that the role is valid
      var role = entry.Key
      if (PolicyRole.get(role) == null) {
        throw new SOAPServerException(displaykey.Webservice.Error.InvalidRoleInCommissionRateOverride(role))
      }
    }
    for (overrideInfo in this.ChargeCommissionRateOverrideInfos) {
      chargeInitializer.overrideCommissionRate(PolicyRole.get(overrideInfo.Role), overrideInfo.Rate)
    }
  }

  function addChargeCommissionRateOverrideInfo(chargeCommissionRateOverrideInfo : ChargeCommissionRateOverrideInfo){
    var elem = new ChargeInfo_ChargeCommissionRateOverrideInfos()
    elem.$TypeInstance = chargeCommissionRateOverrideInfo
    this.ChargeCommissionRateOverrideInfos.add(elem)
  }
}
