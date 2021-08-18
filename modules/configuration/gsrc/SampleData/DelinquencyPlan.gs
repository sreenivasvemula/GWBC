package SampleData

uses gw.api.databuilder.DelinquencyPlanBuilder
uses gw.api.databuilder.DelinquencyPlanReasonBuilder
uses gw.pl.currency.MonetaryAmount

uses java.lang.Integer
uses java.util.Date
uses java.util.Map

@Export
class DelinquencyPlan {
  function create(currency : Currency,
                  publicID : String,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  cancellationTarget : CancellationTarget,
                  workFlow : typekey.Workflow,
                  segments : ApplicableSegments,
                  enterDelinquency : MonetaryAmount,
                  cancellation : MonetaryAmount,
                  exitDelinquency : MonetaryAmount,
                  lateFee : MonetaryAmount,
                  reinstatementFee : MonetaryAmount): DelinquencyPlan {
    return create(currency, publicID, name, description, effectiveDate, expirationDate, cancellationTarget,
                  workFlow, segments, enterDelinquency, cancellation, exitDelinquency, 
                  lateFee, reinstatementFee, 0)   
  }
  
  function create(currency : Currency,
                  publicID : String,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  cancellationTarget : CancellationTarget,
                  workFlow : typekey.Workflow,
                  segments : ApplicableSegments,
                  enterDelinquency : MonetaryAmount,
                  cancellation : MonetaryAmount,
                  exitDelinquency : MonetaryAmount,
                  lateFee : MonetaryAmount,
                  reinstatementFee : MonetaryAmount,
                  gracePeriodDays: Integer ) : DelinquencyPlan {                  
    return create(currency, publicID, name, description, effectiveDate, expirationDate, cancellationTarget,
                  workFlow, segments, enterDelinquency, cancellation, exitDelinquency, 
                  lateFee, reinstatementFee, gracePeriodDays, false)                   
  }
  
  function create(currency : Currency,
                  publicID : String,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  cancellationTarget : CancellationTarget,
                  reasons : Map<DelinquencyReason, typekey.Workflow>,
                  segments : ApplicableSegments,
                  enterDelinquency : MonetaryAmount,
                  cancellation : MonetaryAmount,
                  exitDelinquency : MonetaryAmount,
                  lateFee : MonetaryAmount,
                  reinstatementFee : MonetaryAmount,
                  gracePeriodDays: Integer) : DelinquencyPlan {
    return create(currency, publicID, name, description, effectiveDate, expirationDate, cancellationTarget,
                  null, segments, enterDelinquency, cancellation, exitDelinquency, 
                  lateFee, reinstatementFee, gracePeriodDays, false, reasons)
  }
  
  function create(currency : Currency,
                  publicID : String, name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  cancellationTarget : CancellationTarget,
                  workFlow : typekey.Workflow,
                  segments : ApplicableSegments,
                  enterDelinquency : MonetaryAmount,
                  cancellation : MonetaryAmount,
                  exitDelinquency : MonetaryAmount,
                  lateFee : MonetaryAmount,
                  reinstatementFee : MonetaryAmount,
                  gracePeriodDays: Integer,
                  holdInvoicingOnDlnqPolicies : Boolean) : DelinquencyPlan { 
      return create(currency, publicID, name, description, effectiveDate, expirationDate, cancellationTarget,
                  workFlow, segments, enterDelinquency, cancellation, exitDelinquency, 
                  lateFee, reinstatementFee, gracePeriodDays, holdInvoicingOnDlnqPolicies , null)
  }
    
    function create(currency : Currency,
                    publicID : String, name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  cancellationTarget : CancellationTarget,
                  workFlow : typekey.Workflow,
                  segments : ApplicableSegments,
                  enterDelinquency : MonetaryAmount,
                  cancellation : MonetaryAmount,
                  exitDelinquency : MonetaryAmount,
                  lateFee : MonetaryAmount,
                  reinstatementFee : MonetaryAmount,
                  gracePeriodDays: Integer,
                  holdInvoicingOnDlnqPolicies : Boolean,
                  reasons : Map<DelinquencyReason, typekey.Workflow>) : DelinquencyPlan { 
    
    var existing = gw.api.database.Query.make(DelinquencyPlan).compare("Name", Equals, name).select()
    if (existing.Empty) {
      var delinquencyPlanBuilder = new DelinquencyPlanBuilder()
        .withCurrency(currency)
        .withPublicId(publicID)
        .withName(name)
        .withDescription(description)
        .withCancellationTarget(cancellationTarget)
        .withApplicableSegments(segments)
        .withEffectiveDate(effectiveDate)
        .withExpirationDate(expirationDate)
        .withAccountEnterDelinquencyThreshold(enterDelinquency)
        .withPolicyEnterDelinquencyThreshold(enterDelinquency)
        .withCancellationThreshold(cancellation)
        .withExitDelinquencyThreshold(exitDelinquency)
        .withLateFeeAmount(lateFee)
        .withReinstatementFeeAmount(reinstatementFee)
        .withGracePeriodDays(gracePeriodDays)

      if (holdInvoicingOnDlnqPolicies) {
        delinquencyPlanBuilder.holdInvoicingOnDelinquentPolicies()
      } else {
        delinquencyPlanBuilder.doNotHoldInvoicingOnDelinquentPolicies()
      }

      if (reasons != null) {
        var reasonBuilders = reasons.keySet().map( \ reason ->
            new DelinquencyPlanReasonBuilder()
                .forReason(reason).withWorkflow( reasons.get(reason) )
                .withDefaultEvents() )
        delinquencyPlanBuilder.withPlanReason( reasonBuilders as DelinquencyPlanReasonBuilder[] )
      } else if (workFlow == typekey.Workflow.TC_STDDELINQUENCY) {
        delinquencyPlanBuilder.withPlanReason( new DelinquencyPlanReasonBuilder[] {
            new DelinquencyPlanReasonBuilder()
                .forReason(DelinquencyReason.TC_PASTDUE)
                .withWorkflow( workFlow )
                .withStandardEvents() } )
      } else if (workFlow == typekey.Workflow.TC_SIMPLEDELINQUENCY) {
        delinquencyPlanBuilder.withPlanReason( new DelinquencyPlanReasonBuilder[] {
            new DelinquencyPlanReasonBuilder()
                .forReason(DelinquencyReason.TC_PASTDUE)
                .withWorkflow( workFlow )
                .withSimpleEvents() } )
      } else {
        throw "No delinquency plan events defined for " + workFlow
      }
      
      //return delinquencyPlanBuilder.validateCreateAndCommit()      
      return delinquencyPlanBuilder.createAndCommit()      
    }
    else {
      return existing.AtMostOneRow
    }                    
  }
}