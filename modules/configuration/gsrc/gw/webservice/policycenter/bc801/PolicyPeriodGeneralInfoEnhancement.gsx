package gw.webservice.policycenter.bc801

uses gw.webservice.policycenter.bc801.entity.types.complex.PolicyPeriodGeneralInfo
uses gw.api.webservice.exception.SOAPException
uses gw.transaction.ChargePatternHelper

@Export
enhancement PolicyPeriodGeneralInfoEnhancement: PolicyPeriodGeneralInfo {

  function executeGeneralBI() : String {
    validateChargeCategory()
    return this.execute(createGeneralBI())
  }

  private function createGeneralBI() : General {
    var associatedPolicyPeriod = this.findPolicyPeriodForUpdate()
    var bi = new General(associatedPolicyPeriod.Currency)
    bi.AssociatedPolicyPeriod = associatedPolicyPeriod
    return bi
  }

  private function validateChargeCategory() {
    for (info in this.ChargeInfos) {
      var chargeCategory = ChargePatternHelper.getChargePattern(info.$TypeInstance.ChargePatternCode).Category
      if (chargeCategory != ChargeCategory.TC_FEE and chargeCategory != ChargeCategory.TC_GENERAL) {
        throw new SOAPException(displaykey.Webservice.Error.GeneralChargeCanBeOnlyOfCategoryFeeOrGeneral)
      }
    }
  }

}
