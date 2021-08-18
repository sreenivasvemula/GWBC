package gw.paymentplanmodifier
uses gw.api.domain.invoice.PaymentPlanModifierMethodsImpl

@Export
class MatchPlannedInstallmentsMethodsImpl extends PaymentPlanModifierMethodsImpl {

  private var _matchPlannedInstallments : MatchPlannedInstallments;

  construct (matchPlannedInstallments : MatchPlannedInstallments) {
    super(matchPlannedInstallments);
    _matchPlannedInstallments = matchPlannedInstallments
  }

  /**
   * Modifies the PaymentPlan so that it will create new installments that match the planned installments for the ReferenceCharge.
   */
  override public function modify(paymentPlan : PaymentPlan) {
    var billingInstructionUsingThisModifier = _matchPlannedInstallments.policyBillingInstruction as ExistingPlcyPeriodBI

    var plannedInstallments = _matchPlannedInstallments.ReferenceCharge.AllInvoiceItems.where(\ item ->
          item.Invoice.Planned
          and (item.EventDate == billingInstructionUsingThisModifier.ModificationDate or item.EventDate.after(billingInstructionUsingThisModifier.ModificationDate))
          and item.Installment)
    if (!plannedInstallments.IsEmpty) {
      paymentPlan.DownPaymentPercent = 0
      paymentPlan.MaximumNumberOfInstallments = plannedInstallments.Count;
      paymentPlan.FirstInstallmentAfter = PaymentScheduledAfter.TC_POLICYEFFECTIVEDATE
      var daysFromPolicyPeriodEffectiveDateToFirstInstallment = _matchPlannedInstallments.ReferenceCharge.PolicyPeriod.EffectiveDate
          .differenceInDays(plannedInstallments[0].EventDate)
      // note: daysFromPolicyPeriodEffectiveDateToFirstInstallment could be negative, which means the first installment date would be _before_ the effective date
      paymentPlan.DaysFromReferenceDateToFirstInstallment = daysFromPolicyPeriodEffectiveDateToFirstInstallment
    }
  }

}
