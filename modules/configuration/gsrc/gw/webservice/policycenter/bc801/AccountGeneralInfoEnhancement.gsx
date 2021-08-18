package gw.webservice.policycenter.bc801

uses gw.webservice.policycenter.bc801.entity.types.complex.AccountGeneralInfo
uses gw.api.web.accounting.ChargePatternHelper
uses gw.api.webservice.exception.SOAPException

@Export
enhancement AccountGeneralInfoEnhancement : AccountGeneralInfo {

  function executeGeneralBI() : String {
    validateChargeCategory()
    return this.execute(createAccountGeneralBI())
  }

  private function createAccountGeneralBI() : AccountGeneral{
    var bi = new AccountGeneral(this.CurrencyValue)
    bi.BillingInstructionDate = this.BillingInstructionDate.toCalendar().Time
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
