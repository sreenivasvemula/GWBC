package SampleData
uses gw.api.databuilder.ImmediateChargePatternBuilder

@Export
class ChargePattern {
  function createImmediateCharge(
                                 chargeCode : String,
                                 chargeName : String,
                                 tAccountOwner : String,
                                 invoiceTreatment : InvoiceTreatment) : ChargePattern {
    var existing = gw.api.database.Query.make(ChargePattern).compare("ChargeCode", Equals, chargeCode).select()
    if (existing.Empty) {
      var chargePattern = new ImmediateChargePatternBuilder()
              .withChargeCode( chargeCode )
              .withChargeName( chargeName )
              .withTAccountOwnerPattern( tAccountOwner )
              .withInvoiceTreatment( invoiceTreatment )
              .withPriority( "medium" )
              .createAndCommit()
      return chargePattern
    } else {
      return existing.AtMostOneRow
    }
  }
}