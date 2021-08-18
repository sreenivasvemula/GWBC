package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.AgencyBillPlanBuilder
uses gw.transaction.Transaction

@Export
class AgencyBillPlanEntity extends BaseCommand {
  private static var localVersion = "a"

  construct() {
  }

  /**
  * Creates all agency bill plan that are created from this class.<br>
  */
  public static function createAll() : String {
    return "Payment Plan " + 
      getAgencyBillPlanWith25DayLead().Name + 
      getAgencyBillPlanWith45DayLead().Name + 
      " Created"
  }

  /**
  * Finds AgencyBillPlan01 in database.<br> 
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getAgencyBillPlanWith25DayLead() : AgencyBillPlan
  {
    var planName = Version.addVersion("25 Days Lead", localVersion)
    var planPublicID = planName
    var agencyBillPlan = GeneralUtil.findAgencyBillPlanByPublicId(planPublicID)

    if (agencyBillPlan == null){
      Transaction.runWithNewBundle( \ bundle -> 
        {
          agencyBillPlan = new AgencyBillPlanBuilder()
          .withName(planName)
          .asPublicId( planPublicID )
          .withCycleCloseDayOfMonthLogic("lastbusinessday")
          .withWorkflowType( "StdAgencyBill" )
          .withPaymentTermsInDays( 25)
          .asSupressStmtWithLowNetThreshold( 4.99bd.ofDefaultCurrency())
          .create(bundle)
        }
      )
    }
    return agencyBillPlan
  }


  /**
  * Finds AgencyBillPlan02 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getAgencyBillPlanWith45DayLead() : AgencyBillPlan
  {
    var planName = Version.addVersion("45 Days Lead", localVersion)
    var planPublicID = planName
    var agencyBillPlan = GeneralUtil.findAgencyBillPlanByPublicId(planPublicID)
    print ("agencyBillPlan = " + agencyBillPlan )

    if (agencyBillPlan == null){
      Transaction.runWithNewBundle( \ bundle -> 
        {
          agencyBillPlan = new AgencyBillPlanBuilder()
          .withName(planName)
          .asPublicId( planPublicID )
          .withCycleCloseDayOfMonthLogic("lastbusinessday")
          .withWorkflowType( "StdAgencyBill" )
          .withPaymentTermsInDays( 45)
          .asSupressStmtWithLowNetThreshold( 4.99bd.ofDefaultCurrency())
          .create(bundle)
        }
      )
    }
    print ("agencyBillPlan again = " + agencyBillPlan )

    return agencyBillPlan
  }
}


