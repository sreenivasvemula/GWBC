package gw.webservice.policycenter.bc700

uses gw.api.domain.accounting.ChargeUtil
uses gw.webservice.policycenter.bc700.entity.types.complex.ChargeInfo

@Export
enhancement ChargeInfoEnhancement: ChargeInfo {
  function toCharge(billingInstruction: BillingInstruction) {
    var chargePattern = ChargeUtil.getChargePatternByCode(this.ChargePatternCode)
    var initializer = billingInstruction.buildCharge(this.Amount.ofCurrency(billingInstruction.Currency), chargePattern)
    if (chargePattern.Recapture) {
      initializer.RecaptureUnappliedFund = initializer.ChargeAccount.DefaultUnappliedFund
    }
    initializer.ChargeGroup = this.ChargeGroup
  }
}