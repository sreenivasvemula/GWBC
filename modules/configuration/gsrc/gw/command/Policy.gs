package gw.command

uses gw.api.databuilder.PolicyChangeBillingInstructionBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.CommissionPlanBuilder
uses gw.api.databuilder.CancellationBuilder
uses java.util.Date
uses gw.api.databuilder.ReinstatementBillingInstructionBuilder
uses gw.api.databuilder.DirectBillPaymentFixtureBuilder
uses gw.api.database.Query
uses gw.api.databuilder.RenewalBillingInstructionBuilder
uses gw.api.databuilder.RewriteBillingInstructionBuilder
uses gw.api.databuilder.GeneralBillingInstructionBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.PremiumReportBIBuilder
uses gw.api.util.DateUtil
uses gw.api.databuilder.AuditBuilder
uses gw.api.databuilder.SuppressDownPaymentBuilder
uses java.lang.StringBuilder
uses com.guidewire.pl.quickjump.Argument
uses gw.api.web.invoice.InvoicingOverrider
uses gw.api.util.CurrencyUtil

@Export
class Policy extends BCBaseCommand {
  
  construct() {
    super()
  }
  
  function printInfo() : String{
    var period = getCurrentPolicyPeriod()
    return new StringBuilder()
      .append("OverridingPayerAccount: ").append(period.OverridingPayerAccount)
      .append("\nInvoice Stream: ").append(period.OverridingInvoiceStream)
      .toString()
  }

  @Argument("OverridingPayerAccount", Query.make(Account).select(), \ a -> (a as Account).AccountNumber)
  @Argument("InvoiceStreamCode", Query.make(InvoiceStream).select(), \ i -> (i as InvoiceStream).PublicID)
  function edit() : String{
    var policyPeriod = getCurrentPolicyPeriod()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      var overridingPayerAccount =
        Query.make(Account).compare("AccountNumber", Equals, getArgumentAsString("OverridingPayerAccount")).select().AtMostOneRow
      var overridingInvoiceStream =
        Query.make(InvoiceStream).compare("PublicID", Equals, getArgumentAsString("InvoiceStreamCode")).select().AtMostOneRow
      policyPeriod.updateWith(new InvoicingOverrider()
        .withOverridingPayerAccount(overridingPayerAccount)
        .withOverridingInvoiceStream(overridingInvoiceStream))           
    })
    return printInfo()
  }
  
  function asExpired(){
    var policyPeriod = new PolicyPeriodBuilder()
            .onDefaultAccount()
            .withExpirationDate(Date.Yesterday)
            .createAndCommit()
    pcf.PolicyDetailSummary.go(policyPeriod)
  }
  
  function withNegativeChange() {
    var account = new AccountBuilder().create()
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withDefaultProducerCodeAndCommissionPlan()
      .create()
    var policyPeriod = new PolicyPeriodBuilder()
      .onAccount(account)  
      .asAgencyBill()
      .withPrimaryProducerCode(producer.ProducerCodes[0])
      .withPremiumWithDepositAndInstallments(1000)
      .createAndCommit()
    new PolicyChangeBillingInstructionBuilder()
      .onPolicyPeriod(policyPeriod)
      .withChargeAmount(-(300bd).ofCurrency(account.Currency))
      .execute()
      .createAndCommit()
    pcf.PolicyDetailSummary.go(policyPeriod)
  }
  
   function sendPremiumReportBIToPolicy() {
     var policyPeriod = getCurrentPolicyPeriod()
     gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
     var charge = new ChargeBuilder()
                  .withAmount(500bd.ofCurrency(policyPeriod.Currency))
                  .asPremium()
     new PremiumReportBIBuilder()
            .withModificationDate(DateUtil.currentDate())
            .withPeriodEndDate(DateUtil.currentDate())
            .withPeriodStartDate(DateUtil.currentDate())
            .withChargeBuilder(charge)
            .withPolicyPeriod(policyPeriod)
            .execute()
            .create(bundle)
    })
  }

  function sendPremiumReportBIToPolicyWithPaymentReceived(){
     var policyPeriod = getCurrentPolicyPeriod()
     gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
     var charge = new ChargeBuilder()
                  .withAmount(500bd.ofCurrency(policyPeriod.Currency))
                  .asPremium()
                  
     new PremiumReportBIBuilder()
            .withModificationDate(DateUtil.currentDate())
            .withPeriodEndDate(DateUtil.currentDate())
            .withPeriodStartDate(DateUtil.currentDate())
            .withChargeBuilder(charge)
            .withPolicyPeriod(policyPeriod)
            .paymentWasReceived()
            .execute()
            .create(bundle)
    })
  }
     
  function sendFinalAuditBIToPolicy(){
    var policyPeriod = getCurrentPolicyPeriod()
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
   
     var chargeBuilder = new ChargeBuilder()
      .onPolicyPeriod(policyPeriod)
      .withAmount(2100bd.ofCurrency(policyPeriod.Currency))
      .asPremium()
    
      var chargeBuilder2 = new ChargeBuilder()
      .onPolicyPeriod(policyPeriod)
      .withAmount(68bd.ofCurrency(policyPeriod.Currency))
      .asTaxes()
      
    var finalAuditBI = new AuditBuilder()
      .finalAudit()
      .totalPremium()
      .withAuditPolicyPeriod(policyPeriod)
      .withAuditDate(DateUtil.addMonths(DateUtil.currentDate(), 1))
      .withChargeBuilder(chargeBuilder)
      .withChargeBuilder(chargeBuilder2)
      .create(bundle)
      
    finalAuditBI.execute()
   })
  }
  
  @Argument("Premium", "-1000")
  function cancelThis(){
    var policyPeriod = getCurrentPolicyPeriod()
    var premiumAmt = getArgumentAsMonetaryAmount("Premium", policyPeriod.Currency)
     gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
     var charge = new ChargeBuilder()
                  .withAmount(premiumAmt)
                  .asPremium()
                  .onPolicyPeriod(policyPeriod)
   
      new CancellationBuilder()
      .onPolicyPeriod(policyPeriod)
      .withCancellationDate(currentDate())
      .withChargeBuilder(charge)
      .withReason("By Run command")
      .execute()
      .create(bundle)
    })
  }
  
  @Argument("Premium", "1000")
  function reinstateThis(){
    var policyPeriod = getCurrentPolicyPeriod()
    var premiumAmt = getArgumentAsMonetaryAmount("Premium", policyPeriod.Currency)
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
       var charge = new ChargeBuilder()
                  .withAmount(premiumAmt)
                  .asPremium()
                  .onPolicyPeriod(policyPeriod)
      
                  
      new ReinstatementBillingInstructionBuilder()
      .onPolicyPeriod(policyPeriod)
      .withReinstatementDate( currentDate() )
      .withChargeBuilder(charge)
      .execute()
      .create(bundle)
    })
  }
  
  function cancelThisWithUnbilledHold(){
    var policyPeriod = getCurrentPolicyPeriod()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      new CancellationBuilder()
      .onPolicyPeriod(policyPeriod)
      .withCancellationDate(currentDate())
      .withReason("By Run command")
      .withSpecialHandling("holdforauditall")
      .execute()
      .create(bundle)
    })
  }
  
  function flatCancelThis(){
    var policyPeriod = getCurrentPolicyPeriod()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
     var charge = new ChargeBuilder()
                  .withAmount((-1000bd).ofCurrency(policyPeriod.Currency))
                  .asPremium()
                  .onPolicyPeriod(policyPeriod)
      new CancellationBuilder()
      .onPolicyPeriod(policyPeriod)
      .withCancellationDate(currentDate())
      .withChargeBuilder(charge)
      .withReason("By Run command")
      .withType(CancellationType.TC_FLAT)
      .execute()
      .create(bundle)
    })
  }
  
  function addChargeWithNoDownPayment(){
    var policyPeriod = getCurrentPolicyPeriod()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var suppressDownPayment = new SuppressDownPaymentBuilder()
            .create(bundle)
      new PolicyChangeBillingInstructionBuilder()
            .onPolicyPeriod(policyPeriod)
            .withChargeAmount(950bd.ofCurrency(policyPeriod.Account.Currency))
            .withPaymentPlanModifier(suppressDownPayment)
            .execute()
            .create(bundle)             
    })
  }
  
  function renewThis(){
    var policyPeriod = getCurrentPolicyPeriod()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      new RenewalBillingInstructionBuilder()
      .withPriorPolicyPeriod(policyPeriod)
      .execute()
      .create(bundle)
    })
  }
  
  function rewriteThis(){
    var policyPeriod = getCurrentPolicyPeriod()
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      new RewriteBillingInstructionBuilder()
      .withPriorPolicyPeriod(policyPeriod)
      .execute()
      .create(bundle)
    })
  }

  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function withTwoProducers() {

    var currency = getArgument("currency")

    var account = new AccountBuilder().withCurrency(currency).create()
    var commissionPlan = new CommissionPlanBuilder()
        .withCurrency(currency)
        .withPremiumCommissionableItem()
        .withPrimaryRate(20bd.ofCurrency(currency))
        .withSecondaryRate(10bd.ofCurrency(currency))
        .create()
    var producer = new ProducerBuilder()
        .withCurrency(currency)
        .withDefaultAgencyBillPlan()
        .withProducerCodeHavingCommissionPlan("Code" + randomNumber, commissionPlan)
        .create()
    var policyPeriod = new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account)
        .asAgencyBill()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withProducerCodeByRole(PolicyRole.TC_SECONDARY, producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.PolicyDetailSummary.go(policyPeriod)
  }

   function makeDirectBillDistToPayFirstInvoiceItemInFull(){
    var policyPeriod = getCurrentPolicyPeriod()
    var invoiceItems = policyPeriod.getInvoiceItemsSortedByEventDate()

    new DirectBillPaymentFixtureBuilder()
      .withFullPaymentForInvoiceItem(invoiceItems[0])
      .createFixture()

    pcf.PolicyDetailSummary.go(policyPeriod)
  
  }
   @Argument("invoiceItemIndex", "0")
   @Argument("payment", "10")
   function makeDirectBillDistToPayInvoiceItem(){
    var policyPeriod = getCurrentPolicyPeriod()
    var invoiceItems = policyPeriod.getInvoiceItemsSortedByEventDate()

    new DirectBillPaymentFixtureBuilder()
      .withPartialPaymentForInvoiceItem(invoiceItems[getArgumentAsInt( "invoiceItemIndex" )],
            getArgumentAsMonetaryAmount("payment", policyPeriod.Currency))
      .createFixture()

    pcf.PolicyDetailSummary.go(policyPeriod)
  }
  function makeDirectBillDistToPartiallyPayFirstInvoiceItem(){
    var policyPeriod = getCurrentPolicyPeriod()
    var invoiceItems = policyPeriod.getInvoiceItemsSortedByEventDate()
    new DirectBillPaymentFixtureBuilder()
      .withPartialPaymentForInvoiceItem(invoiceItems[0], 50bd.ofCurrency(policyPeriod.Account.Currency))
      .createFixture()

    pcf.PolicyDetailSummary.go(policyPeriod)
   }

  function getLastUpdated(){
    var query = Query.make(PolicyPeriod)
    var results = query
                    .select()
                    .orderByDescending(\ row -> row.UpdateTime)
    pcf.PolicyDetailSummary.go(results.FirstResult)
  }

   @Argument("depositRequirement", "100")
  function issueDepositRequirementOnBI(){
    var policyPeriod = getCurrentPolicyPeriod()
    var billingInstruction = new GeneralBillingInstructionBuilder()
            .onPolicyPeriod(policyPeriod)
            .withDepositRequirement(getArgumentAsMonetaryAmount("depositRequirement", policyPeriod.Currency))
            .create()
    billingInstruction.execute()
    billingInstruction.getBundle().commit()
    pcf.AccountCollateral.go(policyPeriod.Account)
  }
}
