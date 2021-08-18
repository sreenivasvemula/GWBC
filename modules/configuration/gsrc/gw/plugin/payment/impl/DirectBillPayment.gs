package gw.plugin.payment.impl

uses com.google.common.collect.Lists
uses gw.api.path.Paths
uses gw.api.restriction.RestrictionBuilder
uses gw.api.web.invoice.InvoiceItems
uses gw.api.web.payment.AllocationPool
uses gw.api.web.payment.AllocationStrategy
uses gw.api.web.payment.DBPaymentDistItemGroup
uses gw.api.web.payment.InvoiceItemAllocation
uses gw.api.web.payment.ProRataRedistributionStrategy
uses gw.api.web.payment.ProRataReversedPaymentAmountRedistributionStrategy
uses gw.payment.PaymentAllocationStrategy
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.payment.IDirectBillPayment

uses java.lang.Iterable
uses java.util.ArrayList
uses java.util.Date
uses java.util.HashSet
uses java.util.Map
uses java.util.Set

@Export
class DirectBillPayment implements IDirectBillPayment {

  construct() {}

  override function allocatePayment(payment : DirectBillPayment, amount : MonetaryAmount)  {
    var amountToDistribute = AllocationPool.withGross(amount)
    paymentAllocationStrategy(payment).allocate(payment.DistItemsList, amountToDistribute)
  }

  override function allocateCollateral(payment : DirectBillPayment, amount : MonetaryAmount) {
    var amountToDistribute = AllocationPool.withGross(amount)
    paymentAllocationStrategy(payment).allocate(payment.DistItemsList, amountToDistribute)
  }

  override function allocateWithOverrides(payment : DirectBillPayment, amount : MonetaryAmount,
                                          overrideItemsAndAmounts : Map<InvoiceItem, MonetaryAmount>) {
    var eligibleItems = payment.DistItemsList
    var overrideInvoiceItems = overrideItemsAndAmounts.keySet()
    var notOverriddenItems = eligibleItems.where(\ b -> !overrideInvoiceItems.contains(b.InvoiceItem))
    var amountAllocatedByOverride = overrideItemsAndAmounts.Values.sum(amount.Currency, \ b -> b)

    var leftoverAmount = amount.subtract(amountAllocatedByOverride)
    var amountToDistribute = AllocationPool.withGross(leftoverAmount.IsNegative ? 0bd.ofCurrency(amount.Currency) : leftoverAmount)
    paymentAllocationStrategy(payment).allocate(notOverriddenItems, amountToDistribute)
  }

  override function allocateWithOverrides(payment : DirectBillPayment, amount : MonetaryAmount,
                                          groupsToDistribute : List<DBPaymentDistItemGroup>) {
    var itemsNotOverridden = new ArrayList<BaseDistItem>()
    var leftoverAmount = amount
    var amountToDistribute = AllocationPool.withGross(0bd.ofCurrency(payment.Currency));

    for (var group in groupsToDistribute) {
      if (group.OverrideAmount == null) {
        itemsNotOverridden.addAll(group.DistItems)
      } else {
        amountToDistribute.setGrossAmount(group.OverrideAmount)
        paymentAllocationStrategy(payment).allocate(group.DistItems, amountToDistribute)
        leftoverAmount -= group.OverrideAmount
      }
    }

    if (!itemsNotOverridden.Empty){
      amountToDistribute.setGrossAmount(leftoverAmount.IsNegative ? 0bd.ofCurrency(amount.Currency) : leftoverAmount)
      paymentAllocationStrategy(payment).allocate(itemsNotOverridden, amountToDistribute)
    }
  }

  override function allocatePolicyPeriod(payment : DirectBillPayment, amount : MonetaryAmount,
                                         otherEligiblePayerInvoiceItems : Set<InvoiceItem>) {
    var amountToDistribute = AllocationPool.withGross(amount)
    paymentAllocationStrategy(payment).allocate(payment.DistItemsList, amountToDistribute)
  }

  override function allocateForRedistribution(payment : DirectBillPayment, amount : MonetaryAmount) {
    var amountToDistribute = AllocationPool.withGross(amount)
    new ProRataRedistributionStrategy().allocate(payment.DistItemsList, amountToDistribute)
  }

  override function allocateCredits(payment : DirectBillPayment) {
    var distItems = payment.DistItemsList
    var negativeDistItems = distItems.where(\distItem -> distItem.InvoiceItem.Amount.IsNegative)
    if (negativeDistItems.Empty) {
      return
    }

    var amountToAllocate = negativeDistItems
        .sum(payment.Currency, \ elt -> elt.GrossAmountOwed - elt.GrossAmountToApply)
        .negate()
    if (amountToAllocate.IsZero) {
      return
    }

    var creditScheme : ReturnPremiumHandlingScheme
    var policyPeriod = negativeDistItems.first().PolicyPeriod
    if (policyPeriod != null) {
      var negativeInvoiceItems = Lists.newArrayList(negativeDistItems*.InvoiceItem)
      creditScheme = policyPeriod.ReturnPremiumPlan.getReturnPremiumHandlingSchemeFor(negativeInvoiceItems)
    }

    if (creditScheme == null) {
      // Account or Collateral negative items.
      paymentAllocationStrategy(payment).allocate(distItems, AllocationPool.withGross(amountToAllocate))
    } else {
      creditScheme.allocate(distItems, AllocationPool.withGross(amountToAllocate))
    }

    // Pay all negative items in full.
    negativeDistItems.each(\ item -> {item.GrossAmountToApply = item.GrossAmountOwed})
  }

  override function allocateFromUnapplied(payment: DirectBillPayment, amount: MonetaryAmount) {
    paymentAllocationStrategy(payment).allocate(payment.DistItemsList, AllocationPool.withGross(amount))
  }

  private function isContextBilled(moneyRcvd : DirectBillMoneyRcvd) : boolean {
    return moneyRcvd.DBPmntDistributionContext == DBPmntDistributionContext.TC_INVOICEBILLED
  }

  private function isContextDue(moneyRcvd : DirectBillMoneyRcvd) : boolean {
    return moneyRcvd.DBPmntDistributionContext == DBPmntDistributionContext.TC_INVOICEDUE
  }

  override function allocateWriteoffs(writeoff : ChargeGrossWriteoff) : List<InvoiceItemAllocation> {
    return gw.api.web.invoice.InvoiceItems.proRataAllocation(writeoff.EligibleInvoiceItems, writeoff.Amount)
  }

  override function allocateForRedistribution(payment : DirectBillPayment, amountToChargeMap: Map <Charge, AllocationPool>) {
    var distributionStrategy = new ProRataReversedPaymentAmountRedistributionStrategy()
    var charges = amountToChargeMap.keySet()
    for (var charge in charges) {
      var amountToDistribute = amountToChargeMap.get(charge)
      var invoiceItems = new HashSet<InvoiceItem>(InvoiceItems.withoutOffsetsOrCommissionRemainder(charge.InvoiceItems)
          // the below is to get only items matching the allocation amount in gross unless zero as the strategy depends on this
          .where( \ invoiceItem -> distributionStrategy.canRedistributeDirectBillPaymentToInvoiceItem(invoiceItem, null, amountToDistribute)))
      distributionStrategy.allocate(payment.getDistItemsFor(invoiceItems), amountToDistribute)
    }
  }

  override function addPositiveItemsDistributionCriteria(negativeInvoiceItems : Iterable<InvoiceItem>) : RestrictionBuilder<InvoiceItem> {
    final var representativeItem = negativeInvoiceItems.first()
    final var returnPremiumCharge = representativeItem.Charge
    var restrictions = RestrictionBuilder.make(InvoiceItem)

    final var chargeTargetQualification = returnPremiumCharge.PolicyPeriod.ReturnPremiumPlan.ChargeQualification
    final var returnPremiumHandling = returnPremiumCharge.PolicyPeriod.ReturnPremiumPlan.getReturnPremiumHandlingSchemeFor(negativeInvoiceItems)

    final var itemEffectiveDate = lookupPositiveItemEffectiveDateCriteriaValue(returnPremiumHandling, returnPremiumCharge)
    if (itemEffectiveDate != null) {
      restrictions.compare(Paths.make(InvoiceItem#EventDate), GreaterThanOrEquals, itemEffectiveDate)
    }

    if (chargeTargetQualification == TC_ACCOUNT) {
      return restrictions
    }
    if (chargeTargetQualification == TC_POLICY) {
      restrictions.compare(Paths.make(
          InvoiceItem#PolicyPeriod, PolicyPeriod#Policy),
          Equals, representativeItem.PolicyPeriod.Policy)
    } else {
      restrictions.compare(Paths.make(
          InvoiceItem#PolicyPeriod),
          Equals, representativeItem.PolicyPeriod)
      if (chargeTargetQualification == TC_CHARGEPATTERN) {
        restrictions.compare(Paths.make(
            InvoiceItem#Charge, Charge#ChargePattern),
            Equals, returnPremiumCharge.ChargePattern)
      } else if (chargeTargetQualification == TC_CHARGECATEGORY) {
        restrictions.compare(Paths.make(
            InvoiceItem#Charge, Charge#ChargePattern, ChargePattern#Category),
            Equals, returnPremiumCharge.ChargePattern.Category)
      } else if (chargeTargetQualification == TC_CHARGEGROUP) {
        restrictions.compare(Paths.make(
            InvoiceItem#Charge, Charge#ChargeGroup),
            Equals, returnPremiumCharge.ChargeGroup)
      }
    }

    return restrictions
  }

  /**
   * @param the return premium charge from which to determine the positive item effective date
   * @return the positive item effective date criteria value, or null to indicate no date restriction
   */
  private function lookupPositiveItemEffectiveDateCriteriaValue(returnPremiumHandling: ReturnPremiumHandlingScheme, charge : Charge) : Date {
    if (returnPremiumHandling.StartDateOption == TC_CHARGEEFFECTIVEDATE) {
      // Don't filter positive items by date if charge effective date is same as policy effective date
      return charge.EffectiveDate.isSameDayIgnoringTime(charge.PolicyPeriod.EffectiveDate) ? null : charge.EffectiveDate
    }
    return null
  }

  override function addInvoiceItemsDistributionCriteria(moneyRcvd: DirectBillMoneyRcvd): RestrictionBuilder<InvoiceItem> {
    var unappliedFundRestrictionBuilder = makeUnappliedFundRestrictionBuilder(moneyRcvd)

    return addCommonRestrictions(moneyRcvd, unappliedFundRestrictionBuilder)
        .union(addCommonRestrictionsWithoutDistributionLimits(moneyRcvd,
            makePremiumReportBIRestrictionBuilder())
            .union(makeCollateralItemsRestrictionBuilder())
            .union(makeCollateralRequirementItemsRestrictionBuilder()))
  }

  override function addInvoiceItemsDistributionCriteriaForUnappliedFunds(zeroDollarDMR : ZeroDollarDMR): RestrictionBuilder<InvoiceItem> {
    return addCommonRestrictions(zeroDollarDMR,
        makeUnappliedFundRestrictionBuilder(zeroDollarDMR))
        .union(addCommonRestrictionsWithoutDistributionLimits(zeroDollarDMR,
            makePremiumReportBIRestrictionBuilder())
            .union(makeCollateralItemsRestrictionBuilder())
            .union(makeCollateralRequirementItemsRestrictionBuilder()))
  }

  override function addInvoiceItemsDistributionCriteriaForAccountCredits(
      account : Account, negativeInvoiceItems: Iterable<InvoiceItem>)
      : RestrictionBuilder<InvoiceItem> {
    return addCommonRestrictionsWithoutDistributionLimits(null, account.PaymentAllocationPlan,
        makeAccountCreditsDistributionRestrictionBuilder()
            .union(makePastDueRestrictionBuilder())
            .union(makePremiumReportBIRestrictionBuilder())
            .union(makeCollateralItemsRestrictionBuilder())
            .union(makeCollateralRequirementItemsRestrictionBuilder()))
  }

  private function makeUnappliedFundRestrictionBuilder(moneyRcvd : DirectBillMoneyRcvd) : RestrictionBuilder<InvoiceItem> {
    var restrictions = makeDistributionRestriction()
    addNotHeldRestriction(restrictions)

    return restrictions
        .union(makePastDueRestrictionBuilder())
  }

  // Account credits ignore distribution limit filters.
  private function
      makeAccountCreditsDistributionRestrictionBuilder() : RestrictionBuilder<InvoiceItem> {
    var restrictions = makeDistributionRestriction()
    addNotHeldRestriction(restrictions)
    return restrictions
  }

  private function addNotHeldRestriction(restrictions : RestrictionBuilder<InvoiceItem>) {
    restrictions.compareSet(Paths.make(InvoiceItem#Charge, Charge#HoldStatus), CompareIn, {null, TC_NONE})
  }

  private function makePastDueRestrictionBuilder() : RestrictionBuilder<InvoiceItem> {
    var restrictions = makeDistributionRestriction()
    restrictions.compare(Paths.make(InvoiceItem#Invoice, entity.Invoice#Status), Equals, TC_DUE)
    return restrictions
  }

  private function makeCollateralItemsRestrictionBuilder() : RestrictionBuilder<InvoiceItem> {
    var restrictions = makeDistributionRestriction()
    restrictions.compare(Paths.make(
        InvoiceItem#Charge, Charge#TAccountContainer, ChargeTAcctContainer#Subtype),
        Equals, TC_COLLTACCTCONTAINER)
    addNotHeldRestriction(restrictions)
    return restrictions
  }

  private function makeCollateralRequirementItemsRestrictionBuilder() : RestrictionBuilder<InvoiceItem> {
    var restrictions = makeDistributionRestriction()
    restrictions.compare(Paths.make(
        InvoiceItem#Charge, Charge#TAccountContainer, ChargeTAcctContainer#Subtype),
        Equals, TC_COLLREQTACCTCONTAINER)
    addNotHeldRestriction(restrictions)
    return restrictions
  }

  private function makePremiumReportBIRestrictionBuilder() : RestrictionBuilder<InvoiceItem> {
    var restrictions = makeDistributionRestriction()
    restrictions.compare(Paths.make(
        InvoiceItem#Charge, Charge#BillingInstruction, PremiumReportBI#PaymentReceived),
        Equals, true)
    return restrictions
  }

  private function addCommonRestrictions(
      moneyRcvd : DirectBillMoneyRcvd, restriction : RestrictionBuilder<InvoiceItem>)
      : RestrictionBuilder<InvoiceItem> {
    addCommonRestrictions(moneyRcvd, moneyRcvd.Account.PaymentAllocationPlan, restriction)
    restriction.compare(Paths.make(InvoiceItem#Invoice, AccountInvoice#InvoiceStream, InvoiceStream#UnappliedFund),
        Equals, moneyRcvd.UnappliedFund)
    return restriction
  }

  private function addCommonRestrictionsWithoutDistributionLimits(
      moneyRcvd : DirectBillMoneyRcvd,
      restriction : RestrictionBuilder<InvoiceItem>) : RestrictionBuilder<InvoiceItem> {
    addCommonRestrictionsWithoutDistributionLimits(moneyRcvd, moneyRcvd.Account.PaymentAllocationPlan, restriction)
    restriction.compare(Paths.make(InvoiceItem#Invoice, AccountInvoice#InvoiceStream, InvoiceStream#UnappliedFund),
        Equals, moneyRcvd.UnappliedFund)
    return restriction
  }

  private function addCommonRestrictions(moneyRcvd : DirectBillMoneyRcvd,
                                         account: Account, restriction : RestrictionBuilder<InvoiceItem>) : RestrictionBuilder<InvoiceItem> {
    // Restricting to invoice items for the account is done by the caller.
    return addCommonRestrictions(moneyRcvd, account.PaymentAllocationPlan, restriction)
  }

  private function makeDistributionRestriction() : RestrictionBuilder<InvoiceItem> {
    return RestrictionBuilder.make(InvoiceItem)
  }

  private function addCommonRestrictions(final moneyRcvd : DirectBillMoneyRcvd,
                                         final paymentAllocationPlan : PaymentAllocationPlan,
                                         final restrictions : RestrictionBuilder<InvoiceItem>)
      : RestrictionBuilder<InvoiceItem> {
    paymentAllocationPlan.applyDistributionCriteriaFilters(restrictions, moneyRcvd)
    return restrictions
  }

  private function addCommonRestrictionsWithoutDistributionLimits(final moneyRcvd : DirectBillMoneyRcvd,
                                                                  final paymentAllocationPlan : PaymentAllocationPlan,
                                                                  final restrictions : RestrictionBuilder<InvoiceItem>)
      : RestrictionBuilder<InvoiceItem> {
    paymentAllocationPlan.applyDistributionCriteriaFiltersWithoutDistributionLimits(restrictions, moneyRcvd)
    return restrictions
  }

  private function
  paymentAllocationStrategy(directBillPayment : DirectBillPayment) : AllocationStrategy {
    return new PaymentAllocationStrategy(
        directBillPayment.Account.PaymentAllocationPlan, directBillPayment.DirectBillMoneyRcvd)
  }
}