package SampleData
uses gw.api.databuilder.BillingPlanBuilder
uses java.lang.Integer
uses gw.pl.currency.MonetaryAmount


@Export
class BillingPlan {
  function create(
                  currency : Currency,
                  name : String,
                  description : String,
                  paymentDueInterval : Integer
                  ) : BillingPlan {
    var date = java.util.Date.CurrentDate
    return create( currency, name, description, paymentDueInterval,
          date, null, new MonetaryAmount(1000, currency), 2, new MonetaryAmount(0, currency), new MonetaryAmount(0, currency))
  }
  
  function create(
                  currency : Currency,
                  name : String,
                  description : String,
                  paymentDueInterval : Integer,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  reviewDisbursementsOver : MonetaryAmount,
                  delayDisbursementProcessingDays : Integer,
                  disbursementOver : MonetaryAmount,
                  invoiceFee : MonetaryAmount) : BillingPlan {
    return create(currency, name, description, paymentDueInterval, effectiveDate, expirationDate, reviewDisbursementsOver,
              delayDisbursementProcessingDays, disbursementOver, invoiceFee, new MonetaryAmount(0, currency), false, LowBalanceMethod.TC_CARRYFORWARD, AggregationType.TC_CHARGES)
  }
  
  
  function create(currency : Currency,
                  name : String,
                  description : String,
                  paymentDueInterval : Integer,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  reviewDisbursementsOver : MonetaryAmount,
                  delayDisbursementProcessingDays : Integer,
                  disbursementOver : MonetaryAmount,
                  invoiceFee : MonetaryAmount,
                  paymentReversalFee     : MonetaryAmount,
                  suppressLowBalInvoices : Boolean,
                  lowBalanceMethod : LowBalanceMethod,
                  aggregation: AggregationType) : BillingPlan {
    return create(
            currency, name, description, paymentDueInterval, effectiveDate, expirationDate,
            reviewDisbursementsOver, delayDisbursementProcessingDays, disbursementOver, invoiceFee, paymentReversalFee,
            suppressLowBalInvoices, null, lowBalanceMethod, aggregation)
  }
  
  function create(currency : Currency,
                  name : String,
                  description : String,
                  paymentDueInterval : Integer,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  reviewDisbursementsOver : MonetaryAmount,
                  delayDisbursementProcessingDays : Integer,
                  disbursementOver : MonetaryAmount,
                  invoiceFee : MonetaryAmount,
                  paymentReversalFee     : MonetaryAmount,
                  suppressLowBalInvoices : Boolean,
                  lowBalanceThreshold : MonetaryAmount,
                  lowBalanceMethod : LowBalanceMethod,
                  aggregation: AggregationType) : BillingPlan {
                  
     return create(
                currency, name, description, paymentDueInterval, effectiveDate, expirationDate,
                reviewDisbursementsOver, delayDisbursementProcessingDays, disbursementOver, invoiceFee, paymentReversalFee,
                suppressLowBalInvoices, lowBalanceThreshold, lowBalanceMethod, aggregation,0,0,0)
  }
  
  function create(    currency : Currency,
                      name : String,
                      description : String,
                      paymentDueInterval : Integer,
                      effectiveDate : DateTime,
                      expirationDate : DateTime,
                      reviewDisbursementsOver : MonetaryAmount,
                      delayDisbursementProcessingDays : Integer,
                      disbursementOver : MonetaryAmount,
                      invoiceFee : MonetaryAmount,
                      paymentReversalFee     : MonetaryAmount,
                      suppressLowBalInvoices : Boolean,
                      lowBalanceThreshold : MonetaryAmount,
                      lowBalanceMethod : LowBalanceMethod,
                      aggregation: AggregationType,
                      requestInterval  : Integer,
                      draftInterval  : Integer,
                      changeDeadlineInterval  : Integer
                      ) : BillingPlan {
        var existing = gw.api.database.Query.make(BillingPlan).compare("Name", Equals, name).select()
        if (existing.Empty) {
          
          var billingPlan = new BillingPlanBuilder()
          billingPlan.withName( name )
            .withCurrency(currency)
            .withDescription( description )           
            .withDelayDisbursementProcessingDays( delayDisbursementProcessingDays )
            .withEffectiveDate( effectiveDate )
            .withPaymentDueInterval( paymentDueInterval )
            .withNonResponsivePaymentDueInterval( paymentDueInterval )
            .withReviewDisbursementOver( reviewDisbursementsOver )
            .withDisbursementOver( disbursementOver )
            .withInvoiceFee(invoiceFee )
            .withPaymentReversalFee( paymentReversalFee )
            .withRequestInterval( requestInterval )
            .withDraftInterval( draftInterval )
            .withChangeDeadlineInterval( changeDeadlineInterval )            
            .withExpirationDate(expirationDate)
            .withSuppressLowBalInvoices(suppressLowBalInvoices)
            .withLowBalanceMethod(lowBalanceMethod)
            .withAggregation(aggregation) 
            
          if (lowBalanceThreshold != null) {
            billingPlan.withLowBalanceThreshold(lowBalanceThreshold)
          }

          return billingPlan.createAndCommit()
        } else {
          return existing.AtMostOneRow
        }
  }
}
