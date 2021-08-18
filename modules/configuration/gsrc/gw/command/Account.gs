package gw.command

uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.CommissionPlanBuilder
uses gw.api.databuilder.CollateralRequirementBuilder
uses gw.api.databuilder.AccountContactBuilder
uses gw.api.databuilder.PaymentPlanBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.AccountInvoiceBuilder
uses gw.api.databuilder.InvoiceItemBuilder
uses gw.api.database.Query
uses gw.api.web.payment.DirectBillPaymentFactory
uses gw.api.util.SampleDataGenerator
uses gw.api.databuilder.InvoiceStreamBuilder
uses gw.api.databuilder.UniqueKeyGenerator
uses com.guidewire.pl.quickjump.DefaultMethod
uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.Arguments
uses gw.api.databuilder.AccountDisbursementBuilder
uses gw.api.databuilder.PersonBuilder
uses gw.api.databuilder.IssuanceBuilder
uses gw.api.databuilder.DelinquencyPlanBuilder
uses gw.api.databuilder.BillingPlanBuilder
uses gw.api.util.CurrencyUtil
uses gw.api.databuilder.DelinquencyPlanReasonBuilder

@Export 
@DefaultMethod("create")
class Account extends BCBaseCommand {

  construct() {
    super()
  }
  
  @Argument("accountNumber", {"deviantART", "NorthWind", "ClosetMonkey"})
  @Argument("invoiceDayOfMonth", "15")
  @Argument("billingLevel", {"AccountLevelBilling", "PolicyLevelBilling"})
  @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function create() : Account{

    var currency = getArgument("currency")

    var accountBuilder = new AccountBuilder()
      .withCurrency(currency)
      .withInvoiceDayOfMonth(getArgumentAsInt( "invoiceDayOfMonth" ))
    
    if (getArgument( "accountNumber" ) != null) {
      accountBuilder.withNumber(getArgument( "accountNumber" ) + "-" + randomNumber)
          .withCurrency(currency)
    }

    if (getArgument( "billingLevel" ) == "PolicyLevelBilling") {
      accountBuilder.asPolicyDefaultUnappliedLevelBilling()
          .withCurrency(currency)
    }
    setPaymentAllocationPlan(accountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var account = accountBuilder.createAndCommit()
    pcf.AccountDetailSummary.go(account)
    return account
  }

  @Argument("amount", "1200")
  function withExecutedDisbursement() {
    var account = new AccountBuilder()
            .withName(BCDataBuilder.createRandomWordPair())
            .createAndCommit()
    var disbursement = new AccountDisbursementBuilder()
            .onAccountWithAddress(account)
            .withDueDate(DateTime.Today.addDays(-7))
            .withAmount(getArgumentAsMonetaryAmount("amount", account.Currency))
            .withStatus(DisbursementStatus.TC_APPROVED)
            .withReason(Reason.TC_AUTOMATIC)
            .createAndCommit()
    disbursement.makeDisbursement()
    disbursement.getBundle().commit()
    pcf.AccountDetailSummary.go(account)
  }

  function asListBillDefault() {
    var number = randomNumber
    var person = new PersonBuilder()
            .withFirstName("Person ")
            .withLastName(number)
            .withDefaultAddress()
            .create()
    
    var accountContact = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .create()
    var account = new AccountBuilder()
        .addContact(accountContact)
        .asListBillWithDefaults()
        .withDefaultBillingPlan()
        .withDefaultDelinquencyPlan()
        .createAndCommit() 
    pcf.AccountDetailSummary.go(account)
  }

  @Argument("amount", "1200")
  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  @Argument("policyNumber", "")
  @Arguments("create")
  function with1PolicyWithNoProducer(){
    var account = create()
    getArgument( "paymentPlan" )
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null || paymentPlan.Currency != account.Currency){
      paymentPlan = new PaymentPlanBuilder()
                      .withCurrency(account.Currency)
                      .withDownPaymentPercent(10)
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .create()          
    }
    var policyNumber = getArgument("policyNumber")
    if (policyNumber.length == 0) {
      policyNumber = "PolicyNumber_" + UniqueKeyGenerator.get().nextKey()
    }
    new PolicyPeriodBuilder()
        .withCurrency(account.Currency)
        .onAccount(account)
        .asDirectBill()
        .withPolicyNumber(policyNumber)
        .withPaymentPlan( paymentPlan )
        .withPremiumWithDepositAndInstallments(getArgumentAsBigDecimal( "amount" ))
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function withDefault(){
    var currency = getArgument("currency")
    var number = randomNumber
    var person = new PersonBuilder()
            .withFirstName("Person ")
            .withLastName(number)
            .withDefaultAddress()
            .create()
    
    var accountContact = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .create()
    var account = new AccountBuilder() 
            .withCurrency(currency)
            .addContact(accountContact)
            .withBillingPlan(new BillingPlanBuilder().withCurrency(currency).create())
            .withDelinquencyPlan(new DelinquencyPlanBuilder().withCurrency(currency).asPastDueWithDefaultEvents().create())
            .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
   function withTypeCollectionAgency(){
    var number = randomNumber
    var person = new PersonBuilder()
            .withFirstName("Person ")
            .withLastName(number)
            .withDefaultAddress()
            .create()    
    var accountContact = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .create()
    var account = new AccountBuilder() 
            .addContact(accountContact)
            .withAccountType("collectionagency")
             .withDelinquencyPlan("QA1DELINQUENCYPLAN07")
            .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  @Argument("invoiceDayOfMonth", "15")
  @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function with1PolicyWithPrimaryProducer()  {
    loadSampleDataIfNotLoaded()

    var currency = getArgument("currency")

    var accountBuilder = new AccountBuilder()
            .withCurrency(currency)
            .withDelinquencyPlan(getQADelinquencyPlan07EquivalentInOtherCurrency(currency))
            .withInvoiceDayOfMonth(getArgumentAsInt("invoiceDayOfMonth"))
    setPaymentAllocationPlan(accountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var account = accountBuilder.create()
    var commissionPlan = new CommissionPlanBuilder()
        .withCurrency(currency)
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withPrimaryRate(10)
        .create()
    var producer = new ProducerBuilder()
      .withCurrency(currency)
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
    
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null || paymentPlan.Currency != currency){
      paymentPlan = new PaymentPlanBuilder()
                      .withCurrency(currency)
                      .withDownPaymentPercent(10)
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .create()    
    }  
   new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account)
        .withPaymentPlan(paymentPlan)
        .doNotHoldInvoicingWhenDelinquent()
        .asDirectBill()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  @Argument("invoiceDayOfMonth", "15")
  @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
  function withPolicyWithOverridingPayerAccount() {
    loadSampleDataIfNotLoaded()
    
    var account = new AccountBuilder()
            .withDelinquencyPlan("QA1DELINQUENCYPLAN07")
            .withInvoiceDayOfMonth(getArgumentAsInt("invoiceDayOfMonth"))
            .create()
    var payerAccountBuilder = new AccountBuilder()
        .withDelinquencyPlan("QA1DELINQUENCYPLAN07")
        .withInvoiceDayOfMonth(getArgumentAsInt("invoiceDayOfMonth"))
    setPaymentAllocationPlan(payerAccountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var payerAccount = payerAccountBuilder.create()
    var commissionPlan = new CommissionPlanBuilder()
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withPrimaryRate(10)
        .withOnPaymentReceivedPayableCriteria()
        .create()
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
    
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan = new PaymentPlanBuilder()
                      .withDownPaymentPercent(10)
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .create()    
    }  
   new PolicyPeriodBuilder()
        .onAccount(account)
        .withPaymentPlan(paymentPlan)
        .doNotHoldInvoicingWhenDelinquent()
        .asDirectBill()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1234)
        .withOverridingPayerAccount(payerAccount)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  @Argument("invoiceDayOfMonth", "15")
  @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function with1PolicyWithPrimaryProducerPayOnPay()  {
    loadSampleDataIfNotLoaded()

    var currency = getArgument("currency")

    var accountBuilder = new AccountBuilder()
            .withCurrency(currency)
            .withDelinquencyPlan(getQADelinquencyPlan07EquivalentInOtherCurrency(currency))
            .withInvoiceDayOfMonth(getArgumentAsInt("invoiceDayOfMonth"))
    setPaymentAllocationPlan(accountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var account = accountBuilder.create()

    var commissionPlan = new CommissionPlanBuilder()
        .withCurrency(currency)
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withPrimaryRate(10)
        .withOnPaymentReceivedPayableCriteria()
        .create()
    var producer = new ProducerBuilder()
      .withCurrency(currency)
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
    
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null || paymentPlan.Currency != currency){
      paymentPlan = new PaymentPlanBuilder()
                      .withCurrency(currency)
                      .withDownPaymentPercent(10)
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .create()    
    }  
   new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account)
        .withPaymentPlan(paymentPlan)
        .doNotHoldInvoicingWhenDelinquent()
        .asDirectBill()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  @Argument("invoiceDayOfMonth", "15")
  @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function with1PolicyWithPrimaryAndSecondaryProducer()  {
    loadSampleDataIfNotLoaded()

    var currency = getArgument("currency")

    var accountBuilder = new AccountBuilder()
            .withCurrency(currency)
            .withDelinquencyPlan(getQADelinquencyPlan07EquivalentInOtherCurrency(currency))
            .withInvoiceDayOfMonth(getArgumentAsInt("invoiceDayOfMonth"))
    setPaymentAllocationPlan(accountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var account = accountBuilder.create()
    var commissionPlan = new CommissionPlanBuilder()
        .withCurrency(currency)
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withPrimaryRate(10)
        .withSecondaryRate(5)
        .create()
    var primaryProducer = new ProducerBuilder()
      .withCurrency(currency)
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
    var secondaryProducer = new ProducerBuilder()
      .withCurrency(currency)
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
    
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null || paymentPlan.Currency != currency){
      paymentPlan = new PaymentPlanBuilder()
                      .withCurrency(currency)
                      .withDownPaymentPercent(10)
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .create()    
    }  
   new PolicyPeriodBuilder()
         .withCurrency(currency)
         .onAccount(account)
        .withPaymentPlan(paymentPlan)
        .doNotHoldInvoicingWhenDelinquent()
        .asDirectBill()
        .withPrimaryProducerCode(primaryProducer.ProducerCodes[0])
        .withProducerCodeByRole(PolicyRole.TC_SECONDARY, secondaryProducer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1100)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  function loadSampleDataIfNotLoaded() {
    var sampleCommissionPlanQuery = Query.make(CommissionPlan).compare("Name", Equals, "QA1COMMISSIONPLAN01").select()
    if ( sampleCommissionPlanQuery.Empty ) {
      print("Producer.gs initialization: Loading Sample Data...")
      SampleDataGenerator.generateDefaultSampleData()
    }
  }

  function withPremiumReportEnabledPolicyWithTaxesChargeOnly()  {
    var account = new AccountBuilder()
                    .create()
                    
    var commissionPlan = new CommissionPlanBuilder()
      .allowOnAllTiers()
      .withPremiumCommissionableItem()
      .withPrimaryRate(10)
      .create()
                           
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
   
    var charges = new ChargeBuilder()
      .withAmount(50bd.ofCurrency(account.Currency))
      .asTaxes()
      
    new PolicyPeriodBuilder()
        .onAccount(account)
        .withPaymentPlan("Premium Reporting")
        .issuedWithCharge(charges)
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
   @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
   @Argument("currency", CurrencyUtil.getDefaultCurrency())
   function withPayOnPayCommissionPolicy()  {

    var currency = getArgument("currency")

    var account = new AccountBuilder()
            .withCurrency(currency)
            .withName(BCDataBuilder.createRandomWordPair())
            .withDelinquencyPlan(getQADelinquencyPlan07EquivalentInOtherCurrency(currency))
            .create()
    var commissionPlan = new CommissionPlanBuilder()
        .withCurrency(currency)
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withOnPaymentReceivedPayableCriteria()
        .withPrimaryRate(10)
        .create()
        
    var producer = new ProducerBuilder()
      .withCurrency(currency)
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PC-" + BCDataBuilder.createRandomWordPair(), commissionPlan)
      .create()
   
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult

    if (paymentPlan == null || paymentPlan.Currency != currency) {
      paymentPlan = new PaymentPlanBuilder()
                      .withCurrency(currency)
                      .withDownPaymentPercent(10)  
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity("monthly")
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .create()
    } 
          
    new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account)
        .asDirectBill()
        .withPaymentPlan(paymentPlan)
        .doNotHoldInvoicingWhenDelinquent()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  function withPayOnPayThreeProducersPolicy() {
    var account = new AccountBuilder()
      .withDefaultDelinquencyPlan()
      .create()
    var commissionPlan = new CommissionPlanBuilder()
      .allowOnAllTiers()
      .withPremiumCommissionableItem()
      .withOnPaymentReceivedPayableCriteria()
      .withPrimaryRate(10)
      .withSecondaryRate(5)
      .withReferrerRate(2)
      .create()

    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PCode" + randomNumber, commissionPlan)
      .create()

    var producer2 = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PCode2" + randomNumber, commissionPlan)
      .create()

    var producer3 = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PCode3" + randomNumber, commissionPlan)
      .create()

    var paymentPlan = new PaymentPlanBuilder()
      .withDownPaymentPercent(10)
      .withMaximumNumberOfInstallments(11)
      .withPeriodicity( "monthly")
      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
      .create()   

    new PolicyPeriodBuilder()
      .onAccount(account)
      .asDirectBill()
      .withPaymentPlan(paymentPlan)
      .withPrimaryProducerCode(producer.ProducerCodes[0])
      .withProducerCodeByRole(PolicyRole.TC_SECONDARY, producer2.ProducerCodes[0])
      .withProducerCodeByRole(PolicyRole.TC_REFERRER, producer3.ProducerCodes[0])
      .withPremiumWithDepositAndInstallments(1000)
      .createAndCommit()
    pcf.AccountDetailSummary.go(account)
}
  
  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  function withPayOnBillCommissionPolicy()  {
    var account = new AccountBuilder()
            .withDefaultDelinquencyPlan()
            .create()
    var commissionPlan = new CommissionPlanBuilder()
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withOnBillingPayableCriteria()
        .withPrimaryRate(10)
        .create()
        
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PCode" + randomNumber, commissionPlan)
      .create()
   var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan = new PaymentPlanBuilder()
                      .withDownPaymentPercent(10)
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .create()
    }        
   new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .withPaymentPlan(paymentPlan)
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  function withPayOnPaySecondaryCommissionPolicy() {
    var account = new AccountBuilder()
            .withDefaultDelinquencyPlan()
            .create()
    var commissionPlan = new CommissionPlanBuilder()
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withOnPaymentReceivedPayableCriteria()
        .withPrimaryRate(10)
        .withSecondaryRate(5)
        .create()
        
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PCode" + randomNumber, commissionPlan)
      .create()
      
   var producer2 = new ProducerBuilder()
     .withDefaultAgencyBillPlan()
     .withProducerCodeHavingCommissionPlan("PCode2" + randomNumber, commissionPlan)
     .create()
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan = new PaymentPlanBuilder()
                      .withDownPaymentPercent(10)
                      .withMaximumNumberOfInstallments(11)
                      .withPeriodicity( "monthly")
                      .withDaysBeforePolicyExpirationForInvoicingBlackout(0)
                      .withFirstInstallmentAfterPolicyEffectiveDatePlusOnePeriod()
                      .create()
    }     
        
   new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .withPaymentPlan(paymentPlan)
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withProducerCodeByRole(PolicyRole.TC_SECONDARY, producer2.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  function withInvoiceDayIs() {
    var invoiceDay = Arguments[0].asInt()
    var account = new AccountBuilder()
            .withInvoiceDayOfMonth(invoiceDay)
            .withDefaultDelinquencyPlan()
            .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
  function withPayOnPayCommissionPolicyPartiallyPaid()  {
    var account = new AccountBuilder()
            .withDefaultDelinquencyPlan()
            .withDistributionUpToAmountUnderContract()
            .create()
    var commissionPlan = new CommissionPlanBuilder()
        .allowOnAllTiers()
        .withPremiumCommissionableItem()
        .withOnPaymentReceivedPayableCriteria()
        .withPrimaryRate(10)
        .create()
        
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan("PCode" + randomNumber, commissionPlan)
      .create()
   
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan = new PaymentPlanBuilder()
        .create()
    }  
   new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .withPaymentPlan(paymentPlan)
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
        
    var payment = DirectBillPaymentFactory.pay(account, 10bd.ofCurrency(account.Currency))
    payment.Bundle.commit()
    
    pcf.AccountDetailSummary.go(account)
  }
  
  function withFixedDueDayIs() {
    var account = new AccountBuilder()
            .asDueDateBilling()
            .withInvoiceDayOfMonth(Arguments[0].asInt())
             .withDefaultDelinquencyPlan()
            .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  function withFullPayDiscountPolicy() {
    var account = new AccountBuilder()
            .withDistributionUpToAmountUnderContract()
            .create()
            
    new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .withPolicyNumber("Policy-" + randomNumber)
        .withPaymentPlan("QA1PAYMENTPLAN01")
        .withPremiumWithDepositAndInstallments(1000)
        .eligibleForFullPayDiscount()
        .withFullPayDiscountDate(gw.api.util.DateUtil.addDays(gw.api.util.DateUtil.currentDate(), 7))
        .withDiscountedPaymentThreshold(900bd.ofCurrency(account.Currency))
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  function withFullPayDiscountPolicyAndPayment() {
    var account = new AccountBuilder()
            .withDistributionUpToAmountUnderContract()
            .create()
    new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .withPolicyNumber("Policy-" + randomNumber)
        .withPaymentPlan("QA1PAYMENTPLAN01")
        .withPremiumWithDepositAndInstallments(1000)
        .eligibleForFullPayDiscount()
        .withFullPayDiscountDate(gw.api.util.DateUtil.addDays(gw.api.util.DateUtil.currentDate(), 7))
        .withDiscountedPaymentThreshold(900bd.ofCurrency(account.Currency))
        .createAndCommit()
    account.makeSingleCashPaymentUsingNewBundle(1000bd.ofCurrency(account.Currency))
    pcf.AccountDetailSummary.go(account)
  }
  
  function addPolicy() {
    var account = getCurrentAccount()
    new PolicyPeriodBuilder()
      .withCurrency(account.Currency)
      .onAccount(account)
      .withPaymentPlan(new PaymentPlanBuilder().withCurrency(account.Currency))
      .withPremiumWithDepositAndInstallments(1000)
      .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
  
  function makeOneInvoiceBilled() : String {    
    addMonths(1)
     runBatchProcess(BatchProcessType.TC_INVOICE)
    return "Clock increased by 1 month and 'Invoice' batch process run"
  }
  
  function makeOneBilledInvoiceDue() : String {
    addMonths(1)
    runBatchProcess(BatchProcessType.TC_INVOICEDUE)
    return "Clock increased by 2 month and 'InvoiceDue' batch process run"
  }

  function makeOnePlannedInvoiceDue() : String {
    addMonths(2)
    runBatchProcess(BatchProcessType.TC_INVOICE)
    runBatchProcess(BatchProcessType.TC_INVOICEDUE)
    return "Clock increased by 2 month and 'InvoiceDue' batch process run"
  }
  
  function withCashCollateralRequirement(){
    var account = new AccountBuilder()
            .withDistributionUpToAmountUnderContract()
            .createAndCommit()
    new CollateralRequirementBuilder()
            .onAccount(account)
            .withRequired(100bd.ofCurrency(account.Currency))
            .asCashWithInitialCharge()
            .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  function withPayerInvoiceItemGoToPayer(){
    
    var ownerAccount = new AccountBuilder()    
            .create()
    var payerAccount = new AccountBuilder()
            .create()
    var charge  = new ChargeBuilder()
            .onAccountGeneralBillingInstruction(ownerAccount)
            .withAmount(100bd.ofCurrency(ownerAccount.Currency))
            .asAccountLateFee()
            .createAndCommit()
    var invoiceItem = charge.getInvoiceItems()[0]
    invoiceItem.remove()
    var payerInvoiceStream = InvoiceStreamBuilder.forAccount(payerAccount).create()
    new InvoiceItemBuilder()
            .onInvoice(new AccountInvoiceBuilder().onInvoiceStream(payerInvoiceStream))
            .onCharge(charge)
            .withAmount(100bd.ofCurrency(payerAccount.Currency))
            .createAndCommit()          
    pcf.AccountDetailSummary.go(payerAccount)
  }
  

  function withPayerInvoiceItemGoToOwner(){
    
    var ownerAccount = new AccountBuilder()    
            .create()
    var payerAccount = new AccountBuilder()
            .create()
    var charge  = new ChargeBuilder()
            .onAccountGeneralBillingInstruction(ownerAccount)
            .withAmount(100bd.ofCurrency(ownerAccount.Currency))
            .asAccountLateFee()
            .createAndCommit()
    var invoiceItem = charge.getInvoiceItems()[0]
    invoiceItem.remove()
    var payerInvoiceStream = InvoiceStreamBuilder.forAccount(payerAccount).create()
    new InvoiceItemBuilder()
            .onInvoice(new AccountInvoiceBuilder().onInvoiceStream(payerInvoiceStream))
            .onCharge(charge)
            .withAmount(100bd.ofCurrency(payerAccount.Currency))
            .createAndCommit()          
    pcf.AccountDetailSummary.go(ownerAccount)
  }
   
  function getLastUpdated(){
    var query = Query.make(Account)
    var results = query
                    .select()
                    .orderByDescending(\ row -> row.UpdateTime)
    var account = results.FirstResult
    pcf.AccountDetailSummary.go(account)
  }

  @Argument("payment", "0")
  function issueDirectBillPayment(){
    var account = getCurrentAccount()
    DirectBillPaymentFactory.pay(account, getArgumentAsMonetaryAmount("payment", account.Currency))
    account.getBundle().commit()
  }

  function allotFunds(){
    var account = getCurrentAccount()
    account.allotAllFunds()   
    account.Bundle.commit() 
  }
  
  @Argument("amount", "0")
  function makeDisbursement(){
    var account = getCurrentAccount()
    var disbursement = new AccountDisbursementBuilder()
            .withCurrency(account.Currency)
            .onAccountWithAddress(account)
            .withAmount(getArgumentAsMonetaryAmount("amount", account.Currency))
            .withStatus(DisbursementStatus.TC_APPROVED)
            .withReason(Reason.TC_AUTOMATIC)
            .createAndCommit()
    disbursement.makeDisbursement()
    disbursement.getBundle().commit()
  }

  @Argument("currency", null)
  function createChildAccountWith1Policy(){
    var currency = getArgument("currency")
    var parentAccount = getCurrentAccount()
    if (currency == null) {
      currency = parentAccount.Currency.Code
    }
    var account = new AccountBuilder()
            .withParentAccount(parentAccount)
            .withCurrency(currency)
            .withDistributionUpToAmountUnderContract()
            .withBillingPlan(new BillingPlanBuilder().withCurrency(currency).create())
            .withDelinquencyPlan(new DelinquencyPlanBuilder().withCurrency(currency).asPastDueWithDefaultEvents().create())
            .create()
            
    var paymentPlan = new PaymentPlanBuilder().withCurrency(currency)
    new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account)
        .asDirectBill()   
        .withPaymentPlan(paymentPlan)     
        .withPremiumWithDepositAndInstallments(1000)        
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }


   @Argument("FixedDueDayOfMonth", "15")
   @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
   @Argument("billingPlan", Query.make(BillingPlan).select(), \ x -> (x as BillingPlan).Name)
   @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
   function withFixedDueDate(){
    var paymentPlan = Query.make(entity.PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan =  Query.make(entity.PaymentPlan).compare("Name", Equals, "Monthly 10").select().FirstResult
    }  
    
    var billingPlan = Query.make(entity.BillingPlan).compare("Name", Equals, getArgumentAsString("billingPlan")).select().FirstResult
    if(billingPlan == null){
      billingPlan =  Query.make(entity.BillingPlan).compare("Name", Equals, "QA1BILLINGPLAN01").select().FirstResult
    }  
     
    var accountBuilder = new AccountBuilder()
          .asDueDateBilling()
          .withInvoiceDayOfMonth(getArgumentAsInt("FixedDueDayOfMonth"))
          .withBillingPlan(billingPlan)
          .withDelinquencyPlan("QA1DELINQUENCYPLAN07")
          .withPaymentMethod("cash")
    setPaymentAllocationPlan(accountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var account = accountBuilder.create() 
     
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), "QA1COMMISSIONPLAN08")
      .create()
       
    new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .doNotHoldInvoicingWhenDelinquent()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPaymentPlan( paymentPlan )
        .withPremiumAndTaxes(1000, 200)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

//create account with policy.  If not plan is selected, the "Monthly 10" payment plan, standard billing plan and standard deliquency plan will be selected
   @Argument("FixedDueDayOfMonth", "15")
   @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
   @Argument("billingPlan", Query.make(BillingPlan).select(), \ x -> (x as BillingPlan).Name)
   @Argument("delinquencyPlan", Query.make(DelinquencyPlan).select(), \ x -> (x as DelinquencyPlan).Name)
   @Argument("paymentAllocationPlan", Query.make(PaymentAllocationPlan).select(), \ x -> (x as PaymentAllocationPlan).Name)
   function withStandardPlans(){
    var paymentPlan = Query.make(entity.PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan =  Query.make(entity.PaymentPlan).compare("Name", Equals, "Monthly 10").select().FirstResult
    }  
    
    var billingPlan = Query.make(entity.BillingPlan).compare("Name", Equals, getArgumentAsString("billingPlan")).select().FirstResult
    if(billingPlan == null){
      billingPlan =  Query.make(entity.BillingPlan).compare("Name", Equals, "Standard Mail").select().FirstResult
    }  
    
    var delinquencyPlan = Query.make(entity.DelinquencyPlan).compare("Name", Equals, getArgumentAsString("delinquencyPlan")).select().FirstResult
    if(delinquencyPlan == null){
      delinquencyPlan =  Query.make(entity.DelinquencyPlan).compare("Name", Equals, "Standard Delinquency Plan").select().FirstResult
    }    
     
    var accountBuilder = new AccountBuilder()
          .asDueDateBilling()
          .withInvoiceDayOfMonth(getArgumentAsInt("FixedDueDayOfMonth"))
          .withBillingPlan(billingPlan)
          .withDelinquencyPlan(delinquencyPlan)
          .withPaymentMethod("cash")
    setPaymentAllocationPlan(accountBuilder, getArgumentAsString("paymentAllocationPlan"))
    var account = accountBuilder.create() 
     
    var producer = new ProducerBuilder()
      .withDefaultAgencyBillPlan()
      .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), "QA1COMMISSIONPLAN08")
      .create()
       
    new PolicyPeriodBuilder()
        .onAccount(account)
        .asDirectBill()
        .doNotHoldInvoicingWhenDelinquent()
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPaymentPlan( paymentPlan )
        .withPremiumAndTaxes(1000, 200)
        .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  function withListBillPolicy(){
    var listBillAccount = new AccountBuilder()                  
      .asListBillWithDefaults()
      .createAndCommit()
    var paymentPlan = listBillAccount.PaymentPlans[0];
    var invoiceStream = listBillAccount.InvoiceStreams[0]
    
    var ownerAccount = new AccountBuilder()                        
      .createAndCommit()
      
    var policyNumber = "PolicyNumber_" + UniqueKeyGenerator.get().nextKey()
    
    new PolicyPeriodBuilder()
        .onAccount(ownerAccount)
        .withOverridingPayerAccount(listBillAccount)
        .withOverridingInvoiceStream(invoiceStream)
        .asListBill()
        .withPolicyNumber(policyNumber)
        .withPaymentPlan( paymentPlan )
        .withPremiumWithDepositAndInstallments(1000)
        .createAndCommit()
    pcf.AccountDetailSummary.go(ownerAccount)
  }

  function withPolicyWithSomeItemsBilled() {
    var policyPeriod = new IssuanceBuilder().createAndCommit()
    
    for (var i in 0..2) {
      var item = policyPeriod.InvoiceItemsSortedByEventDate[i]
      item.Invoice.makeBilledWithClockAdvanceToEventDate()
      item.Bundle.commit()
    }
    
  }

  // same as withDefault, but with designated unapplied billing level & one policy (w/ charge) hooked to a designated unapplied
  function withDesignatedUnapplieds() {
    var currency = CurrencyUtil.getDefaultCurrency()
    var number = randomNumber
    var person = new PersonBuilder()
        .withFirstName("Person")
        .withLastName(number)
        .withDefaultAddress()
        .create()

    var accountContact = new AccountContactBuilder()
        .asPrimaryPayer()
        .withContact(person)
        .create()
    var account = new AccountBuilder()
        .withCurrency(currency)
        .addContact(accountContact)
        .withBillingPlan(new BillingPlanBuilder().withCurrency(currency).create())
        .withDelinquencyPlan(new DelinquencyPlanBuilder().withCurrency(currency).asPastDueWithDefaultEvents().create())
        .asPolicyDesignatedUnappliedLevelBilling()
        .createAndCommit()

    new PolicyPeriodBuilder()
            .withCurrency(account.Currency)
            .onAccount(account)
            .withPaymentPlan(new PaymentPlanBuilder().withCurrency(account.Currency))
            .withPremiumWithDepositAndInstallments(1000)
            .createAndCommit()

    pcf.AccountDetailSummary.go(account)
  }

  // creates a designated unapplied on the current account, as if for custom billing
  function addDesignatedUnappliedFunds() {
    var account = getCurrentAccount()
    account.createDesignatedUnappliedFund(BCDataBuilder.createRandomWordPair())
    account.Bundle.commit()
    pcf.AccountDetailSummary.go(account)
  }

  private function getQADelinquencyPlan07EquivalentInOtherCurrency(currency: Currency) : DelinquencyPlan {
    var delinquencyPlan = Query.make(DelinquencyPlan).compare("Name", Equals, "QA1DELINQUENCYPLAN07").select().FirstResult
    if(delinquencyPlan == null || delinquencyPlan.Currency != currency){
      return new DelinquencyPlanBuilder()
        .withCurrency(currency)
        .withCancellationTarget(CancellationTarget.TC_DELINQUENTPOLICYONLY)
        .withPlanReason({ new DelinquencyPlanReasonBuilder()
              .forReason(DelinquencyReason.TC_PASTDUE)
              .withWorkflow(typekey.Workflow.TC_STDDELINQUENCY)
              .withStandardEvents() })
        .withApplicableSegments(ApplicableSegments.TC_ALL)
        .withAccountEnterDelinquencyThreshold(10bd.ofCurrency(currency))
        .withCancellationThreshold(20bd.ofCurrency(currency))
        .withExitDelinquencyThreshold(5bd.ofCurrency(currency))
        .withLateFeeAmount(0bd.ofCurrency(currency))
        .withReinstatementFeeAmount(50bd.ofCurrency(currency))
        .createAndCommit()
    }

    return delinquencyPlan
  }

  private function setPaymentAllocationPlan(accountBuilder : AccountBuilder, paymentAllocationPlanName : String) {
    var paymentAllocationPlan =
        Query.make(PaymentAllocationPlan).compare("Name", Equals, paymentAllocationPlanName).select().FirstResult
    if (paymentAllocationPlan != null) {
      accountBuilder.withPaymentAllocationPlan(paymentAllocationPlan)
    }
  }
}
