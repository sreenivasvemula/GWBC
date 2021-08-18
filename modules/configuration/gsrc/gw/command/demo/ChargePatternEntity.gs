package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.ImmediateChargePatternBuilder
uses gw.transaction.Transaction

@Export
class ChargePatternEntity extends BaseCommand {
  construct() {
  }

  /**
  * Finds ChargePattern01 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getChargePattern01() : ChargePattern {
    var chargeCode = "NewBusinessFee"
    var cp = GeneralUtil.findChargePatternByChargeCode(chargeCode)
    if (cp == null) {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          cp = new ImmediateChargePatternBuilder()
          .withCategory("fee")
          .withChargeCode(chargeCode)
          .withPriority("medium")
          .withChargeName("New Business Fee")
          .withInvoiceTreatment("singledeposit")
          .forPolicyPeriod()
          .create(bundle)
        }
      )
    }
    return cp
  }
}