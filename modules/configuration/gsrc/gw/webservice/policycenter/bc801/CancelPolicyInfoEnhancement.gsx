package gw.webservice.policycenter.bc801
uses gw.webservice.policycenter.bc801.entity.types.complex.CancelPolicyInfo

@Export
enhancement CancelPolicyInfoEnhancement : CancelPolicyInfo {
  
  function execute() : String {
    var cancellation = new Cancellation(this.findPolicyPeriod().Currency)
    cancellation.CancellationType = this.CancellationType
    cancellation.CancellationReason = this.CancellationReason
    // cancellation.EffectiveDate this is auto set to the posted date
    if (this.HasScheduledFinalAudit) {
      cancellation.SpecialHandling = typekey.SpecialHandling.TC_HOLDFORAUDITALL
    }
    return this.execute(cancellation)
  }
}
