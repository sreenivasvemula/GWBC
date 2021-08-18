package SampleData

uses gw.api.util.DateUtil
uses gw.api.databuilder.CommissionPlanBuilder
uses gw.pl.currency.MonetaryAmount
uses gw.api.domain.accounting.ChargePatternKey

@Export
class CommissionPlan {
  function create(
                  currency : Currency,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  goldTier : Boolean,
                  silverTier : Boolean,
                  bronzeTier : Boolean,
                  primary : Number,
                  secondary : Number,
                  referrer : Number,
                  payableCriteria : PayableCriteria) : CommissionPlan {
    return create( currency, name, description, effectiveDate, expirationDate, goldTier, silverTier, bronzeTier, primary, secondary, referrer, payableCriteria, true, null, null)
  }

  function create(
                  currency : Currency,
                  name : String,
                  description : String,
                  effectiveDate : DateTime,
                  expirationDate : DateTime,
                  goldTier : Boolean,
                  silverTier : Boolean,
                  bronzeTier : Boolean,
                  primary : Number,
                  secondary : Number,
                  referrer : Number,
                  payableCriteria : PayableCriteria,
                  premiumCommissionable : Boolean,
                  bonusPercentage : Number,
                  threshold : MonetaryAmount): CommissionPlan {
    var existing = gw.api.database.Query.make(CommissionPlan).compare("Name", Equals, name).select()
    if (existing.Empty) {
      var comissionPlanBuilder = new CommissionPlanBuilder()
              .withCurrency(currency)
              .withName( name )
              .withDescription( description )
              .withEffectiveDate( DateUtil.currentDate() )
              .allowOnAllTiers()
              .withSuspendForDelinquency( true )
              .withPayableCriteria( payableCriteria )
              .withPrimaryRate( primary )
              .withSecondaryRate( secondary )
              .withReferrerRate( referrer )
      if (premiumCommissionable) {
        comissionPlanBuilder.withPremiumCommissionableItem()
      }
      if (bonusPercentage != null and threshold != null) {
        comissionPlanBuilder.withPremiumIncentive(bonusPercentage, threshold)
      }

      return comissionPlanBuilder.createAndCommit()
    } else {
      return existing.AtMostOneRow
    }
  }
}
