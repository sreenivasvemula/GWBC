package gw.command.demo

uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.PaymentPlanBuilder
uses gw.transaction.Transaction

@Export
class PaymentPlanEntity extends BaseCommand {
  private var localVersion = "e"

  construct() {
    super()
  }

  /**
  * Creates all payment plans that are created from this class.<br>
  */
  public function createAll() : String {
    
    return "Payment Plan " +
    getMonthlyPlan().Name +
    getQuarterlyPlan().Name +
    getSemiAnnualPlan().Name +
    getFullPayPlan().Name +
      " Created"
  }

    
  @Argument("Name", {"Monthly", "Quarterly", "Semi-Annual", "Annual"})
  @Argument("Frequency", {"Monthly", "Quarterly", "Semi-Annual", "Annual"})
  public function getPaymentPlan() : PaymentPlan
  {
    var planName = getArgumentAsString("Name")
    if ((planName == null) || (planName == "") )
      planName = BCDataBuilder.createRandomWordPair()
    planName = Version.addVersion(planName, localVersion)
    
    var frequency = getArgumentAsString("Frequency")
    if ((frequency == null)|| (frequency == ""))
      frequency = "Monthly"

    var planPublicID = planName

    print ("\nPlanName = " + planName + "; Frequency = " + frequency + "\n")
    
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {

      Transaction.runWithNewBundle( \ bundle ->
        {
          var paymentPlanBuilder = getStartingPaymentPlanBuilder(planName, planPublicID)
          if (frequency == "Quarterly")
            paymentPlanBuilder.quarterly()
            .withDaysBeforePolicyExpirationForInvoicingBlackout(62)
            .withDownPaymentPercent(25)
            .withMaximumNumberOfInstallments(3)

          else if (frequency == "Semi-Annual")
            paymentPlanBuilder.everySixMonths()
            .withDaysBeforePolicyExpirationForInvoicingBlackout(182-28)
            .withDownPaymentPercent(50)
            .withMaximumNumberOfInstallments(1)

          else if (frequency == "Annual")
            paymentPlanBuilder.yearly()
            .withDaysBeforePolicyExpirationForInvoicingBlackout(365-28)
            .withDownPaymentPercent(100)
            .withMaximumNumberOfInstallments(0)

          else  // Assume Monthly
            paymentPlanBuilder.monthly()
            .withDaysBeforePolicyExpirationForInvoicingBlackout(31)
            .withDownPaymentPercent(10)
            .withMaximumNumberOfInstallments(9)

          paymentPlan = paymentPlanBuilder
          .create(bundle)
        }
      )
    }

    clear()

    return paymentPlan
  }

  /**
  * Finds monthly plan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public function getMonthlyPlan() : PaymentPlan
  {
    var planName = Version.addVersion("_10-9 Monthly", localVersion)
    var planPublicID = planName
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->
        {
          paymentPlan = getStartingPaymentPlanBuilder(planName, planPublicID)
          .monthly()
          .withDaysBeforePolicyExpirationForInvoicingBlackout(31)
          .withDownPaymentPercent(10)
          .withMaximumNumberOfInstallments(9)
          .create(bundle)
        }
      )
    }
    return paymentPlan
  }


  /**
  * Finds quarterly plan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public function getQuarterlyPlan() : PaymentPlan
  {
    var planName = Version.addVersion("_25-3 Quarterly", localVersion)
    var planPublicID = planName
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->
        {
          paymentPlan = getStartingPaymentPlanBuilder(planName, planPublicID)
          .quarterly()
          .withDaysBeforePolicyExpirationForInvoicingBlackout(62)
          .withDownPaymentPercent(25)
          .withMaximumNumberOfInstallments(3)
          .create(bundle)
        }
      )
    }
    return paymentPlan
  }

  /**
  * Finds quarterly plan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public function get3PayPlan() : PaymentPlan
  {
    var planName = Version.addVersion("_3 Pay", localVersion)
    var planPublicID = planName
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->
        {
          paymentPlan = getStartingPaymentPlanBuilder(planName, planPublicID)
          .quarterly()  // proxy for every four months.
          .withDaysBeforePolicyExpirationForInvoicingBlackout(125)
          .withDownPaymentPercent(33.33)
          .withMaximumNumberOfInstallments(2)
          .create(bundle)
        }
      )
    }
    return paymentPlan
  }

  /**
  * Finds semi-annual plan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public function getSemiAnnualPlan() : PaymentPlan
  {
    var planName = Version.addVersion("_50-2 SemiAnnual", localVersion)
    var planPublicID = planName
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->
        {
          paymentPlan = getStartingPaymentPlanBuilder(planName, planPublicID)
          .everySixMonths()
          .withDaysBeforePolicyExpirationForInvoicingBlackout(182-28)
          .withDownPaymentPercent(50)
          .withMaximumNumberOfInstallments(1)
          .create(bundle)
        }
      )
    }
    return paymentPlan
  }


  /**
  * Finds annual plan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public function getFullPayPlan() : PaymentPlan
  {
    var planName = Version.addVersion("_Annual", localVersion)
    var planPublicID = planName
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->
        {
          paymentPlan = getStartingPaymentPlanBuilder(planName, planPublicID)
          .yearly()
          .withDaysBeforePolicyExpirationForInvoicingBlackout(365-28)
          .withDownPaymentPercent(100)
          .withMaximumNumberOfInstallments(0)
          .create(bundle)
        }
      )
    }
    return paymentPlan
  }

  /**
  * Finds monthly reporting plan in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public function getMonthlyReportingPlan() : PaymentPlan
  {
    var planName = Version.addVersion("_Monthly Reporting", localVersion)
    var planPublicID = planName
    var paymentPlan = GeneralUtil.findPaymentPlanByPublicId(planPublicID)

    if (paymentPlan == null) {
      Transaction.runWithNewBundle( \ bundle ->
        {
          paymentPlan = getStartingPaymentPlanBuilder(planName, planPublicID)
          .asReporting()
          .yearly()
          .withDaysBeforePolicyExpirationForInvoicingBlackout(337)
          .withDownPaymentPercent(100)
          .withMaximumNumberOfInstallments(0)
          .create(bundle)
        }
      )
    }
    return paymentPlan
  }

  /**
  * Returns a PaymentPlanBuilder with commonly-used default values. <br>
  */
  private function getStartingPaymentPlanBuilder(planName :String, planPublicID :String) : PaymentPlanBuilder {
    return new PaymentPlanBuilder()
          .withName(planName)
          .asPublicId(planPublicID)
          .withDescription(planName)
          .withReportingFlag( false )
          .withInstallmentFee(0bd.ofDefaultCurrency())
          .withSkipFeeForDownPaymentFlag( true )
          .withDownPaymentAfterPolicyPeriodEffectiveDate()
          .withDaysFromReferenceDateToDownPayment(0)
          .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
          .withDaysFromReferenceDateToFirstInstallment(0)
          .withOneTimeChargeAfterChargeDate()
          .withDaysFromReferenceDateToOneTimeCharge(0)          
  }

  /**
  * Clears the Arguments List. <br>
  * TODO: Push to Base
  */
  private function clear(){
    Arguments.each(\ a -> {a.Value = ""})
  }

}
