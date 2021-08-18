package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.AuditBuilder
uses gw.api.databuilder.CancellationBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.PolicyChangeBillingInstructionBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.PremiumReportBIBuilder
uses gw.api.databuilder.PremiumReportDirector
uses gw.api.databuilder.PremiumReportDueDateBuilder
uses gw.api.databuilder.ReinstatementBillingInstructionBuilder
uses gw.api.databuilder.RenewalBillingInstructionBuilder
uses gw.api.util.DateUtil
uses gw.transaction.Transaction

@Export
class PolicyPeriodEntity extends BaseCommand {
  private static var localVersion = "a"

  construct() {
    super()
  }

  /**
  * <p>Looks for PolicyPeriod01 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: AGBL simple cycle.
  */
  public static function getPolicyPeriod01() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL0001", localVersion)
    var policyPeriod = GeneralUtil.findPolicyPeriod( policyNumber )

    if (policyPeriod == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getEmployerAccount();
      var producer = DemoProducer.getProducer01()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod = new PolicyPeriodBuilder()
            .withPolicyNumber(policyNumber)
            .onAccount(account)
            .withPaymentPlan(paymentPlan.Name)
            .asAgencyBill()
            .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
            .withProductPersonalAuto()
            .withEffectiveDate( DateUtil.currentDate())
            .withPremiumAndTaxes(1000, 50)  // Does the charge use the same bundle ??
            .create(bundle)
        }
      )
    }
    return policyPeriod
  }

  /**
  * Looks for PolicyPeriod02 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: AGBL cycle with Exception.
  */
  public static function getPolicyPeriod02() : PolicyPeriod 
  {
    var policyNumber = Version.addVersion("POL0002", localVersion)
    var policyPeriod = GeneralUtil.findPolicyPeriod( policyNumber )

    if (policyPeriod == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyReportingPlan()
      var account = AccountEntity.getEmployerAccount()
      var producer = DemoProducer.getProducer01()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod = new PolicyPeriodBuilder()
            .withPolicyNumber(policyNumber)
            .onAccount(account)
            .withPaymentPlan(paymentPlan.Name)
            .asAgencyBill()
            .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
            .withProductPersonalAuto()
            .withEffectiveDate( DateUtil.currentDate())
            .withExpirationDate( DateUtil.currentDate().addYears(1))
            .withPremiumAndTaxes(2000, 90)
            .create(bundle)
        }
      )
    }
    return policyPeriod
  }

  /**
  * Looks for PolicyPeriod03 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: Direct-Bill EFT Draft.
  */
 public static function getPolicyPeriod03() : PolicyPeriod
  {
    var policyNumber =  Version.addVersion("POL0003", localVersion)
    var policyPeriod = GeneralUtil.findPolicyPeriod( policyNumber )

    if (policyPeriod == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getEmployerAccount()
      var producer = DemoProducer.getProducer03()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan(paymentPlan.Name)
          .asDirectBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(1000, 50)
          .create(bundle)
        }
      )
    }
    return policyPeriod
  }

  /**
  * Looks for PolicyPeriod04 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: Miscellaneous Direct-Bill Functionalities.
  */
 public static function getPolicyPeriod04() : PolicyPeriod
  {
    var policyNumber =  Version.addVersion("POL0004", localVersion)
    var policyPeriod = GeneralUtil.findPolicyPeriod( policyNumber )

    if (policyPeriod == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getEmployerAccount()
      var producer = DemoProducer.getProducer04()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan(paymentPlan.Name)
          .asDirectBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(1500, 90)
          .create(bundle)
        }
      )
    }
    return policyPeriod
  }

  /**
  * Looks for PolicyPeriod1001 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: My Agency Items.
  */
  public static function getPolicyPeriod1001() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL1001", localVersion)
    var renewalNumber = 0
    var policy = GeneralUtil.findPolicyPeriodByPolicyNumberandRenewalNumber(policyNumber, renewalNumber)

    if (policy == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getAccount06()
      var producer = DemoProducer.getProducer101()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policy = new PolicyPeriodBuilder()
            .withPolicyNumber(policyNumber)
            .onAccount(account)
            .withPaymentPlan( paymentPlan.Name )
            .asAgencyBill()
            .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
            .withProductPersonalAuto()
            .withEffectiveDate( DateUtil.currentDate())
            .withPremiumAndTaxes(1000, 50)
            .create(bundle)
        }
      )
    }
    return policy
  }

  /**
  * Looks for PolicyPeriod1002 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: My Agency Items.
  */
  public static function getPolicyPeriod1002() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL1002", localVersion)
    var renewalNumber = 0
    var policy = GeneralUtil.findPolicyPeriodByPolicyNumberandRenewalNumber(policyNumber, renewalNumber)

    if (policy == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getAccount06();
      var producer = DemoProducer.getProducer102()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policy = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan( paymentPlan.Name )
          .asAgencyBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(2000, 100)
          .create(bundle)
        }
      )
    }
    return policy
  }

  /**
  * Looks for PolicyPeriod1003 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: My Agency Items.
  */
 public static function getPolicyPeriod1003() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL1003", localVersion)
    var renewalNumber = 0
    var policy = GeneralUtil.findPolicyPeriodByPolicyNumberandRenewalNumber(policyNumber, renewalNumber)

    if (policy == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getAccount06();
      var producer = DemoProducer.getProducer103()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policy = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan( paymentPlan.Name )
          .asAgencyBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(2000, 100)
          .create(bundle)
        }
      )
    }
    return policy
  }

  /**
  * Looks for PolicyPeriod1004 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: My Agency Items.
  */
 public static function getPolicyPeriod1004() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL1004", localVersion)
    var renewalNumber = 0
    var policy = GeneralUtil.findPolicyPeriodByPolicyNumberandRenewalNumber(policyNumber, renewalNumber)

    if (policy == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getAccount06();
      var producer = DemoProducer.getProducer104()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policy = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan( paymentPlan.Name )
          .asAgencyBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(6000, 300)
          .create(bundle)
        }
      )
    }
    return policy
  }


  /**
  * Looks for PolicyPeriod1005 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: My Agency Items.
  */
 public static function getPolicyPeriod1005() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL1005", localVersion)
    var renewalNumber = 0
    var policy = GeneralUtil.findPolicyPeriodByPolicyNumberandRenewalNumber(policyNumber, renewalNumber)

    if (policy == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getAccount06();
      var producer = DemoProducer.getProducer105()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policy = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan( paymentPlan.Name )
          .asAgencyBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(12000, 900)
          .create(bundle)
        }
      )
    }
    return policy
  }

  /**
  * Looks for PolicyPeriod1006 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: My Agency Items.
  */
 public static function getPolicyPeriod1006() : PolicyPeriod
  {
    var policyNumber = Version.addVersion("POL1006", localVersion)
    var renewalNumber = 0
    var policy = GeneralUtil.findPolicyPeriodByPolicyNumberandRenewalNumber(policyNumber, renewalNumber)

    if (policy == null){
      // Do not inline these variables. You will have bundle issues.
      var paymentPlan = new PaymentPlanEntity().getMonthlyPlan()
      var account = AccountEntity.getAccount06();
      var producer = DemoProducer.getProducer106()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policy = new PolicyPeriodBuilder()
          .withPolicyNumber(policyNumber)
          .onAccount(account)
          .withPaymentPlan( paymentPlan.Name )
          .asAgencyBill()
          .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
          .withProductPersonalAuto()
          .withEffectiveDate( DateUtil.currentDate())
          .withPremiumAndTaxes(20000, 1100)
          .create(bundle)
        }
      )
    }
    return policy
  }

  /*  Endorsements, Cancellations etc */

  /**
  * Endorses Policy02 (part of Agency Bill demo)  with one premium and tax charge.<br>
  * You do not have to create Policy02. This code will create it if required.<br>
  * This does not check if there is already an endorsement on Policy01. So call it appropriately.<br>
  *
  * <p>To Demo: AGBL Cycle with Exception.
  */
  public static function endorsePolicyPeriod02() : PolicyPeriod 
  {
    var policyPeriod = getPolicyPeriod02()
    var endorsementEffectiveFromDate = policyPeriod.PolicyPerEffDate.addDays(90) // endorsementEffectiveFromDate = DateUtil.currentDate().addDays(-15)

    Transaction.runWithNewBundle( \ bundle ->
      {
        new PolicyChangeBillingInstructionBuilder()
          .onPolicyPeriod(policyPeriod)
          .withPolicyChangeDate(endorsementEffectiveFromDate)
          .withChargeBuilder(new ChargeBuilder().asPremium().withAmount(1900bd.ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
          .withChargeBuilder(new ChargeBuilder().asTaxes().withAmount(400bd.ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
          .execute()
          .create(bundle)
      }
    )
    return policyPeriod
  }

  /**
  * Checks if Policy04 is cancelled.<br>
  * If not, this cancels Policy04 with one premium and tax charge.<br>
  *
  * To Demo: Miscellaneous Direct Bill Stuff
  */
  public static function cancelPolicyPeriod04() : PolicyPeriod 
  {
    var policyPeriod = getPolicyPeriod04()
    if (policyPeriod.CancelStatus != "canceled" ) {
      var endorsementEffectiveFromDate = policyPeriod.PolicyPerEffDate.addDays(30)
      Transaction.runWithNewBundle( \ bundle -> 
        {
          new CancellationBuilder()
            .onPolicyPeriod(policyPeriod)
            .withCancellationDate( endorsementEffectiveFromDate)
            .withChargeBuilder(new ChargeBuilder().asPremium().withAmount((-2000bd).ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
            .withChargeBuilder(new ChargeBuilder().asTaxes().withAmount((-40bd).ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
            .execute()
            .create(bundle)
        }
      )
    }
    return policyPeriod
  }

  /**
  * First calls cancelPolicyPeriod04 (to make sure the policy is cancelled), and<br>
  * Reinstates it with one premium and tax charge.<br>
  *
  * To Demo: Miscellaneous Direct Bill Stuff
  */
  public static function reinstatePolicyPeriod04() : PolicyPeriod 
  {
    var policyPeriod = cancelPolicyPeriod04()
    var date = policyPeriod.PolicyPerEffDate.addDays(30) // endorsementEffectiveFromDate = DateUtil.currentDate().addDays(15)
    Transaction.runWithNewBundle( \ bundle -> 
      {
        new ReinstatementBillingInstructionBuilder()
          .onPolicyPeriod(policyPeriod)
          .withReinstatementDate( date )
          .withChargeBuilder(new ChargeBuilder().asPremium().withAmount(1500bd.ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
          .withChargeBuilder(new ChargeBuilder().asTaxes().withAmount(75bd.ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
          .create(bundle)
          .execute()
       }
    )
    return policyPeriod
  }

  /**
  * Renews Policy04 
  *
  * To Demo: Miscellaneous Direct Bill Stuff
  */
  public static function renewPolicyPeriod04() : PolicyPeriod
  {
    var policyPeriod = getPolicyPeriod04()
    var nextPolicyPeriod = policyPeriod.NextPolicyPeriod

    if (nextPolicyPeriod == null) {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          new RenewalBillingInstructionBuilder()
            .withChargeBuilder(new ChargeBuilder().asTaxes().withAmount((-40bd).ofCurrency(policyPeriod.Currency)).onPolicyPeriod(policyPeriod))
            .withPriorPolicyPeriod( policyPeriod )
            .create(bundle)
            .execute()
        }
      )
      nextPolicyPeriod = policyPeriod.NextPolicyPeriod
    }
    return nextPolicyPeriod
  }

  /* Premium Reporting */

  /**
  * Looks for PremiumReportingPolicy01 (Agency Bill) in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: Premium Reporting in Agency Bill.
  */
  public static function getPremiumReportingPolicy01() : PolicyPeriod {

    var policyNumber = Version.addVersion("PR-POL0001", localVersion)
    var policyPeriod = GeneralUtil.findPolicyPeriod( policyNumber )

    if (policyPeriod == null) {
      // Do not inline these variables. You will have bundle issues.
      var account = AccountEntity.getEmployerAccount();
      var paymentPlan = new PaymentPlanEntity().getMonthlyReportingPlan()
      var prodCode = DemoProducer.getProducer02().ActiveProducerCodes.first();

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod = PremiumReportDirector.createPremiumReportingPolicyAgencyBill(
            1000bd.ofCurrency(account.Currency), account, paymentPlan, prodCode, policyNumber, bundle)
        }
      )
    }
    return policyPeriod 
  }

  /**
  * Looks for PremiumReportingPolicy02 (Direct Bill) in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  *
  * <p>To Demo: Premium Reporting in Direct Bill.
  */
  public static function getPremiumReportingPolicy02() : PolicyPeriod {

    var policyNumber = Version.addVersion("PR-POL0002", localVersion)
    var policyPeriod = GeneralUtil.findPolicyPeriod( policyNumber )

    if (policyPeriod == null) {
      // Do not inline these variables. You will have bundle issues.
      var account = AccountEntity.getEmployerAccount();
      var paymentPlan = new PaymentPlanEntity().getMonthlyReportingPlan()
      var prodCode = DemoProducer.getProducer01().ActiveProducerCodes.first();

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod  = PremiumReportDirector.createPremiumReportingPolicyDirectBill(
            2000bd.ofCurrency(account.Currency), account, paymentPlan, prodCode, policyNumber, bundle)
        }
      )
    }
    return policyPeriod
  }

  /** 
  * Creates Report Due BI for PremiumReportingPolicy02
  *
  * <p>To Demo: Premium Reporting in Direct Bill.
  */
  public static function createPremiumReportDueDate() : PolicyPeriod {
    var policyPeriod = getPremiumReportingPolicy02()
    var dd   :int = 1
    var mm   :int = DateUtil.currentDate().MonthOfYear
    var yyyy :int = DateUtil.currentDate().YearOfDate
    var reportPeriodStartDate = DateUtil.createDateInstance( mm, dd, yyyy)
    var reportPeriodEndDate = reportPeriodStartDate.addMonths(1)
    var reportDueDate = reportPeriodEndDate.addDays( 5 )

    Transaction.runWithNewBundle( \ bundle -> 
      {
        new PremiumReportDueDateBuilder()
          .withPeriodStartDate(reportPeriodStartDate )
          .withPeriodEndDate(reportPeriodEndDate)
          .withDueDate(reportDueDate)
          .withPremiumReportDDPolicyPeriod(policyPeriod)
          .create(bundle)
          .execute()
      }
    )
    return policyPeriod
  }

  /** 
  * Creates Report Charges for PremiumReportingPolicy02
  * This sends the charge for the past month. 
  * So it is implicitly assumed that after running the PRDueBI, you would have advanced the clock and come to the next month.
  *
  * <p>To Demo: Premium Reporting in Direct Bill.
  */
  public static function createPremiumReportingCharge() : PolicyPeriod {

    var policyPeriod = getPremiumReportingPolicy02()
    var dd   :int = 1
    var mm   :int = DateUtil.currentDate().MonthOfYear-1
    var yyyy :int = DateUtil.currentDate().YearOfDate
    var reportPeriodStartDate = DateUtil.createDateInstance( mm, dd, yyyy)
    var reportPeriodEndDate = reportPeriodStartDate.addMonths(1)
    var reportDueDate = reportPeriodEndDate.addDays(5)

    Transaction.runWithNewBundle( \ bundle -> 
      {
        new PremiumReportBIBuilder()
          .withPolicyPeriod(policyPeriod)
          .withChargeBuilder(new ChargeBuilder().onPolicyPeriod(policyPeriod ).withAmount(1001bd.ofCurrency(policyPeriod.Currency)).asPremium())
          .withChargeBuilder(new ChargeBuilder().onPolicyPeriod(policyPeriod ).withAmount(101bd.ofCurrency(policyPeriod.Currency)).asTaxes())
          .withPeriodStartDate(reportPeriodStartDate)
          .withPeriodEndDate(reportPeriodEndDate)
          .withPaymentDueDate(reportDueDate)
//          .paymentWasReceived()
          .create(bundle)
          .execute()
      }
    )
    return policyPeriod
  }

  /** 
  * Creates Final Audit with Charges for PremiumReportingPolicy02
  *
  * <p>To Demo: Premium Reporting in Direct Bill.
  */
  public static function createPremiumReportingFinalAudit() : PolicyPeriod {
    var policyPeriod = getPremiumReportingPolicy02()
    Transaction.runWithNewBundle( \ bundle -> 
      {
        new AuditBuilder()
          .finalAudit()
          .withAuditPolicyPeriod(policyPeriod)
          .withChargeBuilder(new ChargeBuilder().onPolicyPeriod(policyPeriod ).withAmount(1521bd.ofCurrency(policyPeriod.Currency)).asPremium())
          .withAuditDate(DateUtil.currentDate())
          .create(bundle)
          .execute()
      }
    )
    return policyPeriod
  }
}


