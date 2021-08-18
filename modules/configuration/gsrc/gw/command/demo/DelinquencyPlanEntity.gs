package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.DelinquencyPlanBuilder
uses gw.api.util.CurrencyUtil
uses gw.transaction.Transaction

@Export
class DelinquencyPlanEntity extends BaseCommand {
  construct() {
  }

  private static var localVersion = "a"

  /**
  * Creates all delinquency plans that are created from this class.<br>
  */
  public static function createAll() : String {
    return "Delinquency Plan " + 
      getInsuredAcccountDelinquencyPlan().Name + 
      getCorporateDelinquencyPlan().Name +
      getListBillPayerDelinquencyPlan().Name +
      getListBillPolicyLevelDelinquencyPlan().Name +
      " Created"
  }

  /**
  * Finds _InsuredAcccountDelinquencyPlan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getInsuredAcccountDelinquencyPlan() : DelinquencyPlan {

    var planName = Version.addVersion("_InsuredAcccountDelinquencyPlan", localVersion)
    var planPublicID = "DelPlan0001"
    var delinquencyPlan = GeneralUtil.findDelinquencyPlanByPublicId(planPublicID)

    print ("delinquencyPlan =" + delinquencyPlan)

    if (delinquencyPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->  {
          var currency = CurrencyUtil.getDefaultCurrency()
          delinquencyPlan = new DelinquencyPlanBuilder()
            .withName(planName)
            .asPublicId(planPublicID)
            .withCancellationTarget( typekey.CancellationTarget.TC_DELINQUENTPOLICYONLY)
            .withGracePeriodDays( 7 )
            .withAllApplicableSegments()
            .withAccountEnterDelinquencyThreshold( 19.99bd.ofCurrency(currency) )
            .withExitDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withCancellationThreshold( 10bd.ofCurrency(currency) )
            .withPolicyEnterDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withReinstatementFeeAmount( 5bd.ofCurrency(currency) )
            .withLateFeeAmount( 5bd.ofCurrency(currency) )

//            .doNotHoldInvoicingOnDelinquentPolicies()
            .holdInvoicingOnDelinquentPolicies()
            .asFailureToReportWithDefaultEvents()
            .asPastDueWithDefaultEvents()
            .create(bundle)
        }
      )
    }
    return delinquencyPlan
  }

   /**
  * Finds _CorporateDelinquencyPlan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getCorporateDelinquencyPlan() : DelinquencyPlan {

    var planName = Version.addVersion("_CorporateDelinquencyPlan", localVersion)
    var planPublicID = "DelPlan0002"
    var delinquencyPlan = GeneralUtil.findDelinquencyPlanByPublicId(planPublicID)

    print ("delinquencyPlan =" + delinquencyPlan)

    if (delinquencyPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->  {
          var currency = CurrencyUtil.getDefaultCurrency()
          delinquencyPlan = new DelinquencyPlanBuilder()
            .withName(planName)
            .asPublicId(planPublicID)
            .withCancellationTarget( typekey.CancellationTarget.TC_DELINQUENTPOLICYONLY)
            .withGracePeriodDays( 7 )
            .withAllApplicableSegments()
            .withAccountEnterDelinquencyThreshold( 19.99bd.ofCurrency(currency) )
            .withExitDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withCancellationThreshold( 10bd.ofCurrency(currency) )
            .withPolicyEnterDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withReinstatementFeeAmount( 5bd.ofCurrency(currency) )
            .withLateFeeAmount( 5bd.ofCurrency(currency) )

//            .doNotHoldInvoicingOnDelinquentPolicies()
            .holdInvoicingOnDelinquentPolicies()
            .asFailureToReportWithDefaultEvents()
            .asPastDueWithDefaultEvents()
            .create(bundle)
        }
      )
    }
    return delinquencyPlan
  }

  /**
  * Finds _ListBillPolicyLevelDelinquencyPlan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getListBillPolicyLevelDelinquencyPlan() : DelinquencyPlan {

    var planName = Version.addVersion("_ListBillPolicyLevelDelinquencyPlan", localVersion)
    var planPublicID = "DelPlan0003"
    var delinquencyPlan = GeneralUtil.findDelinquencyPlanByPublicId(planPublicID)

    print ("delinquencyPlan =" + delinquencyPlan)

    if (delinquencyPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->  {
          var currency = CurrencyUtil.getDefaultCurrency()
          delinquencyPlan = new DelinquencyPlanBuilder()
            .withName(planName)
            .asPublicId(planPublicID)
            .withCancellationTarget( typekey.CancellationTarget.TC_DELINQUENTPOLICYONLY)
            .withGracePeriodDays( 7 )
            .withAllApplicableSegments()
            .withAccountEnterDelinquencyThreshold( 19.99bd.ofCurrency(currency) )
            .withExitDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withCancellationThreshold( 10bd.ofCurrency(currency) )
            .withPolicyEnterDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withReinstatementFeeAmount( 5bd.ofCurrency(currency) )
            .withLateFeeAmount( 5bd.ofCurrency(currency) )

//            .doNotHoldInvoicingOnDelinquentPolicies()
            .holdInvoicingOnDelinquentPolicies()
            .asFailureToReportWithDefaultEvents()
            .asPastDueWithDefaultEvents()
            .create(bundle)
        }
      )
    }
    return delinquencyPlan
  }

  /**
  * Finds _ListBillPayerDelinquencyPlan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getListBillPayerDelinquencyPlan() : DelinquencyPlan {

    var planName = Version.addVersion("_ListBillPayerDelinquencyPlan", localVersion)
    var planPublicID = "DelPlan0004"
    var delinquencyPlan = GeneralUtil.findDelinquencyPlanByPublicId(planPublicID)

    print ("delinquencyPlan =" + delinquencyPlan)

    if (delinquencyPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->  {
          var currency = CurrencyUtil.getDefaultCurrency()
          delinquencyPlan = new DelinquencyPlanBuilder()
            .withName(planName)
            .asPublicId(planPublicID)
            .withCancellationTarget( typekey.CancellationTarget.TC_DELINQUENTPOLICYONLY)
            .withGracePeriodDays( 7 )
            .withAllApplicableSegments()
            .withAccountEnterDelinquencyThreshold( 19.99bd.ofCurrency(currency) )
            .withExitDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withCancellationThreshold( 10bd.ofCurrency(currency) )
            .withPolicyEnterDelinquencyThreshold( 10bd.ofCurrency(currency) )
            .withReinstatementFeeAmount( 5bd.ofCurrency(currency) )
            .withLateFeeAmount( 5bd.ofCurrency(currency) )

//            .doNotHoldInvoicingOnDelinquentPolicies()
            .holdInvoicingOnDelinquentPolicies()
            .asFailureToReportWithDefaultEvents()
            .asPastDueWithDefaultEvents()
            .create(bundle)
        }
      )
    }
    return delinquencyPlan
  }

}
