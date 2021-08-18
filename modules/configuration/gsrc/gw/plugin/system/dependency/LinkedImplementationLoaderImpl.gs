package gw.plugin.system.dependency

uses gw.api.web.payment.ReturnPremiumAllocationStrategy
uses gw.bc.invoice.AuditReturnPremiumHandlingCondition
uses gw.bc.invoice.CancellationReturnPremiumHandlingCondition
uses gw.bc.invoice.IssuanceReturnPremiumHandlingCondition
uses gw.bc.invoice.NewRenewalReturnPremiumHandlingCondition
uses gw.bc.invoice.OtherReturnPremiumHandlingCondition
uses gw.bc.invoice.PolicyChangeReturnPremiumHandlingCondition
uses gw.bc.invoice.PremiumReportBIReturnPremiumHandlingCondition
uses gw.bc.invoice.ReinstatementReturnPremiumHandlingCondition
uses gw.bc.invoice.RenewalReturnPremiumHandlingCondition
uses gw.bc.invoice.ReturnPremiumSchemeIdentificationPredicate
uses gw.bc.invoice.RewriteReturnPremiumHandlingCondition
uses gw.bc.payment.DistributionFilterCriterion
uses gw.bc.payment.InvoiceItemAllocationOrdering
uses gw.bc.system.util.LinkedImplementationLoader
uses gw.payment.BilledDateOrdering
uses gw.payment.BilledOrDueDistributionFilterCriterion
uses gw.payment.BilledStatusOrdering
uses gw.payment.ChargePatternOrdering
uses gw.payment.EventDateOrdering
uses gw.payment.FirstToLastReturnPremiumAllocationStrategy
uses gw.payment.InvoiceDistributionFilterCriterion
uses gw.payment.InvoiceOrdering
uses gw.payment.LastToFirstReturnPremiumAllocationStrategy
uses gw.payment.NextPlannedInvoiceDistributionFilterCriterion
uses gw.payment.PastDueDistributionFilterCriterion
uses gw.payment.PolicyPeriodDistributionFilterCriterion
uses gw.payment.PolicyPeriodOrdering
uses gw.payment.PositiveDistributionFilterCriterion
uses gw.payment.ProportionalReturnPremiumAllocationStrategy
uses gw.payment.ReverseBilledDateOrdering
uses gw.payment.ReverseEventDateOrdering
uses gw.payment.RecaptureFirstOrdering
uses gw.payment.SpreadExcessEvenOrdering

uses java.util.Collection

@Export
class LinkedImplementationLoaderImpl implements LinkedImplementationLoader {
  override function returnPremiumAllocationStrategies() : Collection<ReturnPremiumAllocationStrategy> {
    return {
        new FirstToLastReturnPremiumAllocationStrategy(),
        new LastToFirstReturnPremiumAllocationStrategy(),
        new ProportionalReturnPremiumAllocationStrategy()
    }
  }

  override function returnPremiumSchemeIdentificationPredicates() : Collection<ReturnPremiumSchemeIdentificationPredicate> {
    return {
        new AuditReturnPremiumHandlingCondition(),
        new CancellationReturnPremiumHandlingCondition(),
        new IssuanceReturnPremiumHandlingCondition(),
        new NewRenewalReturnPremiumHandlingCondition(),
        new OtherReturnPremiumHandlingCondition(),
        new PolicyChangeReturnPremiumHandlingCondition(),
        new PremiumReportBIReturnPremiumHandlingCondition(),
        new ReinstatementReturnPremiumHandlingCondition(),
        new RenewalReturnPremiumHandlingCondition(),
        new RewriteReturnPremiumHandlingCondition()
    }
  }

  override function returnDistributionFilterCriteria() : Collection<DistributionFilterCriterion> {
    return {
        new PositiveDistributionFilterCriterion(),
        new InvoiceDistributionFilterCriterion(),
        new PolicyPeriodDistributionFilterCriterion(),
        new BilledOrDueDistributionFilterCriterion(),
        new NextPlannedInvoiceDistributionFilterCriterion(),
        new PastDueDistributionFilterCriterion()
    }
  }

  override function returnPaymentAllocationOrderings() : Collection<InvoiceItemAllocationOrdering> {
    return {
        new BilledDateOrdering(),
        new ReverseBilledDateOrdering(),
        new ChargePatternOrdering(),
        new EventDateOrdering(),
        new ReverseEventDateOrdering(),
        new PolicyPeriodOrdering(),
        new InvoiceOrdering(),
        new BilledStatusOrdering(),
        new SpreadExcessEvenOrdering(),
        new RecaptureFirstOrdering()
    }
  }
}
