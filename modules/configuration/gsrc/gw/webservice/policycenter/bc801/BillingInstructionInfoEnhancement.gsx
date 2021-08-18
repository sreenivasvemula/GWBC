package gw.webservice.policycenter.bc801

uses gw.api.domain.accounting.BillingInstructionUtil
uses gw.pl.currency.MonetaryAmount
uses gw.webservice.bc.bc801.InvoiceItemPreview
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.BillingInstructionInfo_ChargeInfos
uses gw.webservice.policycenter.bc801.entity.types.complex.BillingInstructionInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ChargeInfo

@Export
enhancement BillingInstructionInfoEnhancement : BillingInstructionInfo {

  function execute(bi : PlcyBillingInstruction) : String {
    initializeBillingInstruction(bi)
    return BillingInstructionUtil.executeAndCommit(bi).PublicID
  }

  function initializeBillingInstruction(bi : PlcyBillingInstruction) {
    if (bi typeis ExistingPlcyPeriodBI) {
      initializeExistingPolicyPeriodBI(bi)
    }
    bi.Description = this.Description
    createCharges(bi)
    flagTermConfirmed(bi)
    bi.DepositRequirement = this.DepositRequirement == null ? null : new MonetaryAmount(this.DepositRequirement)
  }

  private function initializeExistingPolicyPeriodBI(bi : ExistingPlcyPeriodBI) {
    if (bi.AssociatedPolicyPeriod == null) {
      // subclass may already set this field
      bi.AssociatedPolicyPeriod = this.findPolicyPeriodForUpdate()
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

  private function flagTermConfirmed(bi: BillingInstruction) {
    var termConfirmed = this.TermConfirmed == null ? true : this.TermConfirmed
    if (bi typeis PlcyBillingInstruction) {
      bi.PolicyPeriod.TermConfirmed = termConfirmed
    }
  }

  function createCharges(billingInstruction : BillingInstruction) {
    for (info in this.ChargeInfos) {
      info.$TypeInstance.toCharge(billingInstruction)
    }
  }

  function addChargeInfo(chargeInfo : ChargeInfo) {
    var elem = new BillingInstructionInfo_ChargeInfos()
    elem.$TypeInstance = chargeInfo
    this.ChargeInfos.add(elem)
  }

  private function matchNumberOfRemainingInstallmentsIfAppropriate(bi : ExistingPlcyPeriodBI) {
    if (!(bi typeis PolicyChange) and !(bi typeis Reinstatement)) return;

    var referenceCharge = bi.PolicyPeriod.Charges.sortBy(\ charge -> charge.ChargeDate)
        .firstWhere(\ charge -> charge.ChargePattern.Category == TC_PREMIUM and
           charge.BillingInstruction typeis NewPlcyPeriodBI)
    if (referenceCharge == null) return;
    var matchPlannedInstallments = new MatchPlannedInstallments()
    matchPlannedInstallments.ReferenceCharge = referenceCharge
    bi.addToPaymentPlanModifiers(matchPlannedInstallments);
  }

  function createInvoicesSummary(bi : PlcyBillingInstruction) : InvoiceItemPreview[] {
    final var itemAmountsByPartitionMap = bi.PolicyPeriod.InvoiceItems
        .partition(\ item -> item.InvoiceDueDate)
        .mapValues(\ partitionItems -> partitionItems.sum(bi.Currency, \ item -> item.Amount))

    return itemAmountsByPartitionMap.Keys.map(\ invoiceDueDate ->
        new InvoiceItemPreview(null, invoiceDueDate, null,
            itemAmountsByPartitionMap[invoiceDueDate], TC_INSTALLMENT)
    ).toTypedArray()
  }
}
