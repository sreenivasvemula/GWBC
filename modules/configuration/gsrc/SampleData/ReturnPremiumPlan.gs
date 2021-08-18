package SampleData

uses gw.api.database.Query
uses gw.api.databuilder.ReturnPremiumPlanBuilder

/**
 * Defines a {@link ReturnPremiumPlan} generator for generating sample data.
 */
@Export
class ReturnPremiumPlan {

  function create(
      publicId : String,
      name : String,
      description : String,
      effectiveDate : DateTime) : ReturnPremiumPlan {
    var matchingReturnPremiumPlansWithName = Query.make(ReturnPremiumPlan).compare("Name", Equals, name).select()
    if (!matchingReturnPremiumPlansWithName.Empty) {
      return matchingReturnPremiumPlansWithName.AtMostOneRow
    }

    var returnPremiumPlan = new ReturnPremiumPlanBuilder ()
        .withName(name)
        .withDescription( description )
        .withEffectiveDate( effectiveDate )
        .create()
    if (publicId != null) {
      returnPremiumPlan.PublicID = publicId
    }
    returnPremiumPlan.Bundle.commit()
    return returnPremiumPlan
  }
}