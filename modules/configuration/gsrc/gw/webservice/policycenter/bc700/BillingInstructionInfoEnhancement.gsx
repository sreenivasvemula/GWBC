package gw.webservice.policycenter.bc700
uses gw.api.domain.accounting.BillingInstructionUtil
uses gw.webservice.policycenter.bc700.entity.types.complex.BillingInstructionInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.ChargeInfo
uses gw.webservice.policycenter.bc700.entity.anonymous.elements.BillingInstructionInfo_ChargeInfos

@Export
enhancement BillingInstructionInfoEnhancement : BillingInstructionInfo {
  
  function execute(bi : PlcyBillingInstruction) : String {
    initializeBillingInstruction(bi)
    return BillingInstructionUtil.executeAndCommit(bi).PublicID
  }

  function initializeBillingInstruction(bi : PlcyBillingInstruction) {
    if (bi typeis ExistingPlcyPeriodBI) {
      initializeExistingPlcyPeriodBI(bi)
    }
    bi.Description = this.Description
    createCharges(bi)
    setWrittenDateAndTermConfirmed(bi)
    bi.DepositRequirement = this.DepositRequirement == null ? null : this.DepositRequirement.ofCurrency(bi.Currency)
  }

  private function initializeExistingPlcyPeriodBI(bi : ExistingPlcyPeriodBI) {
    if (bi.AssociatedPolicyPeriod == null) {
      // subclass may already set this field
      bi.AssociatedPolicyPeriod = this.findPolicyPeriod()
    }

    // modification for BC is actually effective date in PC
    bi.ModificationDate = this.EffectiveDate.toCalendar().Time

    if (bi typeis PolicyChange) {
      addModifiers(bi)
    } else {
      addModifiers(bi)
    }
  }

  function addModifiers(bi : ExistingPlcyPeriodBI) {
    matchNumberOfRemainingInstallmentsIfAppropriate(bi)
  }

  function addModifiers(bi : PolicyChange) {
     var isEndorsementEffectiveSameAsPolicyPeriodEffective =
       bi.ModificationDate.isSameDayIgnoringTime(bi.AssociatedPolicyPeriod.PolicyPerEffDate)
     if (isEndorsementEffectiveSameAsPolicyPeriodEffective) {
       avoidPolicyChangeDownPaymentSuppression(bi)
     } else {
       matchNumberOfRemainingInstallmentsIfAppropriate(bi)
     }
   }

  private function avoidPolicyChangeDownPaymentSuppression(bi : PolicyChange) {
    var paymentPlan = bi.AssociatedPolicyPeriod.PaymentPlan
    var isSuppressDownPaymentForPolicyChange = paymentPlan.getOverridesFor(TC_PolicyChange).DownPaymentPercent == 0
    if (isSuppressDownPaymentForPolicyChange) {
      var paymentPlanOverride = new DownPaymentOverride()
      paymentPlanOverride.DownPaymentPercent = paymentPlan.DownPaymentPercent
      bi.addToPaymentPlanModifiers(paymentPlanOverride)
    }
  }
  
  private function setWrittenDateAndTermConfirmed(bi : BillingInstruction) {
    var termConfirmed = this.TermConfirmed == null ? true : this.TermConfirmed
    if (bi typeis PlcyBillingInstruction) {
      bi.PolicyPeriod.TermConfirmed = termConfirmed
    }
    var writtenDate = this.WrittenDate
    if (writtenDate != null) {
      for (charge in bi.ChargeInitializers) {
        charge.WrittenDate = writtenDate.toCalendar().Time
      }
    }
  }
  
  function createCharges(billingInstruction : BillingInstruction){
    for (info in this.ChargeInfos) {
      info.$TypeInstance.toCharge(billingInstruction)
    }
  }
  
  function addChargeInfo(chargeInfo : ChargeInfo){
    var elem = new BillingInstructionInfo_ChargeInfos()
    elem.$TypeInstance = chargeInfo
    this.ChargeInfos.add(elem)
  }
  
  private function matchNumberOfRemainingInstallmentsIfAppropriate(bi : ExistingPlcyPeriodBI) {
    if (!(bi typeis PolicyChange) and !(bi typeis Reinstatement)) return;

    var referenceCharge = bi.PolicyPeriod.Charges.sortBy(\ charge -> charge.ChargeDate)
        .firstWhere(\ charge -> charge.getChargePattern().getCategory() == ChargeCategory.TC_PREMIUM and
           charge.BillingInstruction typeis NewPlcyPeriodBI)
    if (referenceCharge == null) return;
    var matchPlannedInstallments = new MatchPlannedInstallments()
    matchPlannedInstallments.ReferenceCharge = referenceCharge
    bi.addToPaymentPlanModifiers(matchPlannedInstallments);
  }
}
