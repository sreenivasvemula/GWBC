package gw.command.demo

uses gw.api.databuilder.BillingPlanBuilder
uses gw.transaction.Transaction
uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.util.CurrencyUtil

@Export
class BillingPlanEntity extends BaseCommand {

  construct() {
  }

  private static var localVersion = "a"

  /**
  * Creates all billing plan that are created from this class.<br>
  */
  public static function createAll() : String {
    var billingPlan = getBillingPlan01()
    return "Payment Plan " + billingPlan.Name + " Created"
  }


  /**
  * Finds BillingPlan01 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getBillingPlan01() : BillingPlan
  {
    var planName = Version.addVersion("Demo Bill-Plan", localVersion)
    var planPublicID = planName
    var billingPlan = GeneralUtil.findBillingPlanByPublicId(planPublicID)

    if (billingPlan == null) {
      Transaction.runWithNewBundle( \ bundle -> {
          billingPlan = getBillingPlanBuilderWithCommonValuesSet()
              .withName(planName)
              .asPublicId( planPublicID )
              .withDescription(planName)
              .create(bundle)
      })
    }
    return billingPlan
  }

  /**
  * Creates a billingplanbuilder with most common attributes set appropriately.<br>
  */
  private static function getBillingPlanBuilderWithCommonValuesSet() : BillingPlanBuilder {
  var currency = CurrencyUtil.getDefaultCurrency()
   return new BillingPlanBuilder()
        .withPaymentDueInterval( 15 )
        .withNonResponsivePaymentDueInterval( 15 )
        .withInvoiceFee( 0bd.ofCurrency(currency))
        .doNotSkipInstallmentFees()
        .withPaymentReversalFee( 29.95bd.ofCurrency(currency))
        .withAggregation( typekey.AggregationType.TC_CHARGES )
        .withSuppressLowBalInvoices( true )
        .withLowBalanceThreshold( 4.99bd.ofCurrency(currency))
        .withLowBalanceMethod( typekey.LowBalanceMethod.TC_CARRYFORWARD )
        .withReviewDisbursementOver( 9.99bd.ofCurrency(currency))
        .withDelayDisbursementProcessingDays( 7 )
        .withDisbursementOver( 4.99bd.ofCurrency(currency))
        .withDraftInterval( 3 )
        .withDraftDayLogic( typekey.DayOfMonthLogic.TC_EXACT )
        .withChangeDeadlineInterval( 3 )
        .withRequestInterval( 1 )
  }
}
