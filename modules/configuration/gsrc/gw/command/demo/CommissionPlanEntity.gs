package gw.command.demo
uses gw.api.databuilder.CommissionPlanBuilder
uses gw.transaction.Transaction
uses com.guidewire.pl.quickjump.BaseCommand

@Export class CommissionPlanEntity extends BaseCommand
{
  construct()
  {
  }

  private static var localVersion = "a"

  /**
  * Creates all commission plans that are created from this class.<br>
  */
  public static function createAll() : String {
    return "Payment Plan " + 
      getCommissionPlan01().Name + 
      " Created"
  }

  /**
  * Finds CommissionPlan01 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getCommissionPlan01() : CommissionPlan
  {
    var planName = Version.addVersion("Demo Commsn Plan", localVersion)
    var planPublicID = planName
    var commissionPlan = GeneralUtil.findCommissionPlanByName(planName)

    if (commissionPlan == null) 
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          commissionPlan = new CommissionPlanBuilder()
            .withName( planName )
            // .asPublicId( planPublicID )
            .withDescription(planName)
            .withTier( typekey.ProducerTier.TC_GOLD,  true)
            .withTier( typekey.ProducerTier.TC_SILVER,  true)
            .withTier( typekey.ProducerTier.TC_BRONZE,  true)
            .withPrimaryRate( 15 )
            .withSecondaryRate( 0)
            .withReferrerRate( 0)
            .withPayableCriteria( "billing" )
            .withSuspendForDelinquency( true )
            .withPremiumCommissionableItem()
            .create(bundle)
        }
      )
    }
    return commissionPlan
  }
}



