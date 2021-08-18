package SampleData

uses gw.api.databuilder.PaymentPlanBuilder

uses java.lang.Double
uses java.util.Date

@Export
class PaymentPlan {
  function create(
                  currency : Currency,
                  publicId : String,
                  isReporting : boolean,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  deposit : Number,
                  numPayments : Number,
                  periodicity : Periodicity) : PaymentPlan {
    return create( currency, publicId, isReporting, name, description, effectiveDate, expirationDate, deposit, numPayments, periodicity,
      PaymentScheduledAfter.TC_CHARGEDATE, 0,
      PaymentScheduledAfter.TC_POLICYEFFECTIVEDATEPLUSONEPERIOD, 0)
  }

  function create(
                  currency : Currency,
                  publicId : String,
                  isReporting : boolean,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  deposit : Number,
                  numPayments : Number,
                  periodicity : Periodicity,
                  downPaymentAfter : PaymentScheduledAfter, daysFromReferenceDateToDownPayment : Number,
                  firstInstallmentAfter : PaymentScheduledAfter,
                  daysFromReferenceDateToFirstInstallment : Number) : PaymentPlan {
    return create( currency, publicId, isReporting, name, description, effectiveDate, expirationDate, deposit, numPayments, periodicity,
      downPaymentAfter, daysFromReferenceDateToDownPayment,
      firstInstallmentAfter, daysFromReferenceDateToFirstInstallment,
      PaymentScheduledAfter.TC_POLICYEFFECTIVEDATEPLUSONEPERIOD, 0, 0)
  }

  function create( currency : Currency, publicId : String, isReporting : boolean, name : String, description : String,
      effectiveDate : DateTime, expirationDate : DateTime, deposit : Number, numPayments : Number,
      periodicity : Periodicity, 
      downPaymentAfter : PaymentScheduledAfter, daysFromReferenceDateToDownPayment : Number,
      firstInstallmentAfter : PaymentScheduledAfter, daysFromReferenceDateToFirstInstallment : Number,
      oneTimeChargeAfter : PaymentScheduledAfter, daysFromReferenceDateToOneTimeCharge : Number,
      daysBeforePolicyExpirationForInvoicingBlackout : Number) : PaymentPlan {
    var paymentPlansWithGivenName = gw.api.database.Query.make(PaymentPlan).compare("Name", Equals, name).select()
    if (!paymentPlansWithGivenName.Empty) {
      return paymentPlansWithGivenName.AtMostOneRow
    }

    var paymentPlan = new PaymentPlanBuilder()
      .withCurrency(currency)
      .withReportingFlag( isReporting )
      .withName(name)
      .withDescription( description )
      .withEffectiveDate( effectiveDate )
      .withExpirationDate( expirationDate )
      .withDownPaymentPercent(deposit)
      .withMaximumNumberOfInstallments(numPayments as int)
      .withPeriodicity(periodicity)
      .withDownPaymentAfter(downPaymentAfter)
      .withDaysFromReferenceDateToDownPayment(daysFromReferenceDateToDownPayment as int)
      .withFirstInstallmentAfter( firstInstallmentAfter )
      .withDaysFromReferenceDateToFirstInstallment(daysFromReferenceDateToFirstInstallment as int)
      .withOneTimeChargeAfter( oneTimeChargeAfter )
      .withDaysFromReferenceDateToOneTimeCharge(daysFromReferenceDateToOneTimeCharge as int)
      .withDaysBeforePolicyExpirationForInvoicingBlackout(daysBeforePolicyExpirationForInvoicingBlackout as int)
      .create()
    if (publicId != null) {
      paymentPlan.PublicID = publicId
    }
    paymentPlan.Bundle.commit()
    return paymentPlan
  }

}