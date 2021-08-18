package gw.command

uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.DefaultMethod
uses gw.api.database.Query
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.AgencyBillCreditDistributionFixtureBuilder
uses gw.api.databuilder.AgencyBillMoneyReceivedFixtureBuilder
uses gw.api.databuilder.AgencyBillPaymentFixtureBuilder
uses gw.api.databuilder.AgencyBillPlanBuilder
uses gw.api.databuilder.AgencyBillPromiseFixtureBuilder
uses gw.api.databuilder.AgencyPaymentDirector
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.BillingPlanBuilder
uses gw.api.databuilder.CommissionPlanBuilder
uses gw.api.databuilder.DelinquencyPlanBuilder
uses gw.api.databuilder.FundsTransferBuilder
uses gw.api.databuilder.PaymentPlanBuilder
uses gw.api.databuilder.PolicyChangeBillingInstructionBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.ProducerPayableTransferBuilder
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.api.domain.invoice.ChargeInstallmentChanger
uses gw.api.util.CurrencyUtil
uses gw.api.util.SampleDataGenerator
uses gw.api.web.payment.DirectBillPaymentFactory
uses gw.pl.currency.MonetaryAmount

uses java.lang.Double
uses java.math.BigDecimal
uses java.text.DateFormat
uses java.util.Date

@DefaultMethod("withDefault")
@Export
class Producer extends BCBaseCommand {
  var _producerId : String
  var _accountId : String
  var _policyId : String
  var _producerName : String
  var _monthlypaymentplan = "Monthly 10"

  @Argument("amount", "100")
  function payToUnapplied() : String{
    var producer = getCurrentProducer()
    var amount = getArgumentAsMonetaryAmount("amount", producer.Currency)
    AgencyPaymentDirector.payToUnapplied( producer, amount )
    return "Paid to producer " + producer.Name + " with amount of " + amount
  }

  function loadSampleDataIfNotLoaded() {
    var sampleCommissionPlanQuery = Query.make(entity.CommissionPlan).compare("Name", Equals, "QA1COMMISSIONPLAN01").select()
    if ( sampleCommissionPlanQuery.getCount() == 0 ) {
      SampleDataGenerator.generateDefaultSampleData()
    }
  }

  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function withDefault(){
    loadSampleDataIfNotLoaded()
    var producer = createProducer(getArgument("currency"))
    pcf.ProducerDetail.go(producer)
  }

  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function withPayOnPayDefault(){
    var currency = getArgument("currency")
    loadSampleDataIfNotLoaded()
    var commissionPlan = new CommissionPlanBuilder().withCurrency(currency).withName("CommissionPlan" + randomNumber).withPrimaryRate(10).allowOnAllTiers().withPremiumCommissionableItem().withOnPaymentReceivedPayableCriteria().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withCurrency(currency).withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).withDefaultAgencyBillPlan().createAndCommit()
    pcf.ProducerDetail.go(producer)
  }

  function with2Policies() : Producer {
    loadSampleDataIfNotLoaded()
    var producer = createProducer()
    var account = createAccount()
    createPolicyPeriod(account, producer, "1")
    var account2 = createAccount()
    createPolicyPeriod(account2, producer, "2")
    pcf.ProducerDetail.go(producer)
    return producer
  }

  function with10Policies() : Producer {
    loadSampleDataIfNotLoaded()
    var producer = createProducer()
    var account = createAccount()
    var count : int = 10
      for (i in 0..|count ) {
      new PolicyPeriodBuilder().onAccount(account).withPrimaryProducerCode(producer.ProducerCodes[0]).asAgencyBill().withPolicyNumber(randomNumber + ":" + i).withPaymentPlan(_monthlypaymentplan).withMultiplePremiumCharges(
          toMonetaryAmounts(account.Currency, new BigDecimal[]{1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000})).createAndCommit()
      }
    pcf.ProducerDetail.go(producer)
    return producer
  }

  function withPolicyOf2Charges()  {
    loadSampleDataIfNotLoaded()
    var producer = createProducer()
    var account = createAccount()
    new PolicyPeriodBuilder().onAccount(account).withPrimaryProducerCode(producer.ProducerCodes[0]).asAgencyBill().withPolicyNumber(randomNumber + ":1").withPaymentPlan(_monthlypaymentplan).withMultiplePremiumCharges(toMonetaryAmounts(account.Currency, new BigDecimal[]{1000, 2000})).createAndCommit()
    pcf.ProducerDetail.go(producer)
  }

  @Argument("commissionRate", "10")
  @Argument("currency", CurrencyUtil.getDefaultCurrency())
  function withAgencyBill() : Producer {
    loadSampleDataIfNotLoaded()
    var currency = getArgument("currency")
    var commissionPlan = new CommissionPlanBuilder().withCurrency(currency).withName("CommissionPlan" + randomNumber).withPrimaryRate(10).allowOnAllTiers().withPremiumCommissionableItem().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withCurrency(currency).withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).withAgencyBillPlan(new AgencyBillPlanBuilder().withCurrency(currency)).createAndCommit()
    var producerCode = producer.ProducerCodes[0]
    var account = new AccountBuilder().withCurrency(currency).asMediumBusiness().withBillingPlan(new BillingPlanBuilder().withCurrency(currency).create()).withDelinquencyPlan(new DelinquencyPlanBuilder().withCurrency(currency).create()).createAndCommit()
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, _monthlypaymentplan).select().single()
    if (paymentPlan.Currency != producer.Currency) {
      paymentPlan = new PaymentPlanBuilder().withCurrency(currency).withPeriodicity(TC_MONTHLY).withDownPaymentPercent(10).create()
    }
    new PolicyPeriodBuilder().withCurrency(account.Currency).onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPaymentPlan(paymentPlan).withPremiumWithDepositAndInstallments(1000).createAndCommit()
    // Bill the first Agency Bill statement
    addMonths( 2 )
    runBatchProcess( BatchProcessType.TC_STATEMENTBILLED )
    pcf.ProducerAgencyBillCycles.go(producer)
    return producer
  }

   function withPayOnPayCommissionAgencyBill() : Producer {
    loadSampleDataIfNotLoaded()
    var agencyBillPolicyNumber = "AGBL-" + randomNumber
    var commissionPlan = new CommissionPlanBuilder().withPrimaryRate(10).allowOnAllTiers().withPremiumCommissionableItem().withOnPaymentReceivedPayableCriteria().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).withDefaultAgencyBillPlan().create()
    var producerCode = producer.ProducerCodes[0]
    var account = new AccountBuilder().asMediumBusiness().withDefaultBillingPlan().withDefaultDelinquencyPlan().create()
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber(agencyBillPolicyNumber).withPaymentPlan(_monthlypaymentplan).withPremiumWithDepositAndInstallments(1000).createAndCommit()
    // Bill the first Agency Bill statement
    pcf.ProducerAgencyBillCycles.go(producer)
    return producer
  }

 function withPayOnPayAgencyBillPremiumPlusTaxes() : Producer {
    loadSampleDataIfNotLoaded()
    var agencyBillPolicyNumber = "AGBL-" + randomNumber
    var commissionPlan = new CommissionPlanBuilder().withName("CommissionPlan" + randomNumber).withPrimaryRate(10).allowOnAllTiers().withPremiumCommissionableItem().withOnPaymentReceivedPayableCriteria().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).withDefaultAgencyBillPlan().create()
    var producerCode = producer.ProducerCodes[0]
    var account = new AccountBuilder().asMediumBusiness().withDefaultBillingPlan().withDefaultDelinquencyPlan().create()
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber(agencyBillPolicyNumber).withPaymentPlan(_monthlypaymentplan).withPremiumAndTaxes(1000, 200).createAndCommit()
    // Bill the first Agency Bill statement
    pcf.ProducerAgencyBillCycles.go(producer)
    return producer
  }

  function with3000Policies4500Charges() {
    loadSampleDataIfNotLoaded()
    var producer = new ProducerBuilder().withName("Mega-Producer " + UniqueKeyGenerator.get().nextKey()).withDefaultProducerCodeAndCommissionPlan().withDefaultAgencyBillPlan().createAndCommit()
    var producerCode = producer.ProducerCodes[0]
    print("Populating Producer " + producer.Name + " with 1,500 accounts, 2 policies per account, 3 charges per policy...")
    var count : int = 15
    var beforeCommitTime : long = 0
    var startTime = java.lang.System.currentTimeMillis()
    for ( var i in 0..|count ) {
      print("Creating 100 accounts for bundle " + (i+1) + " of " + count)
      gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
        producerCode = bundle.loadBean(producerCode.ID) as ProducerCode
        for (var j in 0..|100) {
          var account = new AccountBuilder().asMediumBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create(bundle)
          new PolicyPeriodBuilder().onAccount(account).withProductCommercialProperty().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i * (j + 1) + 10) + "-" + UniqueKeyGenerator.get().nextKey()).withPaymentPlan("QA1PAYMENTPLAN01").withMultiplePremiumCharges(
              new MonetaryAmount[] { 321885.73bd.ofCurrency(account.Currency), 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
          new PolicyPeriodBuilder().onAccount(account).withProductBusinessAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i * (j + 1) + 10) + "-" + UniqueKeyGenerator.get().nextKey()).withPaymentPlan("QA1PAYMENTPLAN02").withMultiplePremiumCharges(new MonetaryAmount[]{ 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
        }
        beforeCommitTime = java.lang.System.currentTimeMillis()
        var formattedDate = DateFormat.getDateTimeInstance().format(Date.CurrentDate);
        print("Committing bundle " + (i + 1) + " at " + formattedDate)
      })
      var elapsed = java.lang.System.currentTimeMillis() - beforeCommitTime
      print("Commit complete after " + elapsed + "ms (" + elapsed/60000.0 + " min)" )
    }
    var totalTime = java.lang.System.currentTimeMillis() - startTime
    print("Total time: " + totalTime + "ms (" + totalTime / 60000.0 + " min)" )
    pcf.ProducerDetail.go(producer)
  }
  
  function withMultipleProducerCodes(){
    var producer = new ProducerBuilder().withDefaultAgencyBillPlan().withMultipleProducerCodes({"A", "B"}).createAndCommit()
    var account = createAccount()
    createPolicyPeriod( account, producer, "" )
    pcf.ProducerAgencyBillCycles.go(producer)
  }

  function withQuarterlyAgencyBill() : Producer {
    loadSampleDataIfNotLoaded()
    var agencyBillPolicyNumber = "AGBL-" + randomNumber
    var commissionPlan = new CommissionPlanBuilder().withName("CommissionPlan" + randomNumber).withPrimaryRate(10).allowOnAllTiers().withPremiumCommissionableItem().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).withDefaultAgencyBillPlan().create()
    var producerCode = producer.ProducerCodes[0]
    var account = new AccountBuilder().asMediumBusiness().withDefaultBillingPlan().withDefaultDelinquencyPlan().create()
    var quarterlyPaymentPlan = new PaymentPlanBuilder().quarterly().create()
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber(agencyBillPolicyNumber).withPaymentPlan(quarterlyPaymentPlan).withPremiumWithDepositAndInstallments(1000).createAndCommit()
    pcf.ProducerAgencyBillCycles.go(producer)
    return producer
  }

  function with10Cycles() : Producer {
    loadSampleDataIfNotLoaded()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withName("Many-Cycles-Producer " + UniqueKeyGenerator.get().nextID()).withDefaultProducerCodeAndCommissionPlan().withDefaultAgencyBillPlan().createAndCommit()
    var producerCode = producer.ProducerCodes[0]
    print("Populating Producer " + producer.Name)
    var count : int = 10
    var effectiveDate = Date.CurrentDate
    var expirationDate = effectiveDate.addYears(1)
    var endTime : long = 0
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      for ( var i in 0..|count ) {
          var startTime = java.lang.System.currentTimeMillis()
        var account = new AccountBuilder().asMediumBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create(bundle)
        new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i + 10) + "-" + randomNumber).withPaymentPlan("Monthly 10 Policy Effective Date").withMultiplePremiumCharges(new MonetaryAmount[]{ 321885.73bd.ofCurrency(account.Currency), 5128.67bd.ofCurrency(account.Currency) }).withEffectiveDate(effectiveDate).withExpirationDate(expirationDate).create(bundle)
          effectiveDate = expirationDate
          expirationDate = effectiveDate.addYears(1)
          endTime = java.lang.System.currentTimeMillis()
          var elapsedTime = endTime - startTime
          print("  Done creating Account and Policy #" + (i+1) + " of " + count + " [" + elapsedTime + " ms]" )
      }
    })
    pcf.ProducerDetail.go(producer)
    return producer
  }

  function withAccountRepIsCurrentUser() {
    loadSampleDataIfNotLoaded()
    var producer = withAgencyBill()
    producer.AccountRep = User.util.CurrentUser
    producer.Bundle.commit()
  }

  function withRoundingProblems() : Producer {
    loadSampleDataIfNotLoaded()
    var commissionPlan = new CommissionPlanBuilder().withPrimaryRate(13.23).allowOnAllTiers().withPremiumCommissionableItem().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).withDefaultAgencyBillPlan().create()
    var producerCode = producer.ProducerCodes[0]
    // Create an account
    var account = new AccountBuilder().asMediumBusiness().withDefaultBillingPlan().withDefaultDelinquencyPlan().create()
    // Add a $21,000 Agency Bill policy
    new PolicyPeriodBuilder().onAccount(account).asAgencyBill().withPrimaryProducerCode(producerCode).withPaymentPlan(_monthlypaymentplan).withPremiumWithDepositAndInstallments(1234.23).createAndCommit()
    pcf.ProducerAgencyBillCycles.go(producer)
    return producer
  }

  function with5PoliciesIn2Accounts() : Producer {
    loadSampleDataIfNotLoaded()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withProducerCodeHavingCommissionPlan("PC-" + randomNumber, "QA1COMMISSIONPLAN01").withDefaultAgencyBillPlan().create()
    var producerCode = producer.ProducerCodes[0]
    // Create an account
    var account = new AccountBuilder().asMediumBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create()
    // Add a $321,885.85 Agency Bill policy
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("AgencyBillPolicy-01-" + randomNumber).withPaymentPlan("QA1PAYMENTPLAN01").withPremiumWithDepositAndInstallments(321885.85).create()
    // Add a $154,777.77 Agency Bill Policy
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("AgencyBillPolicy-02-" + randomNumber).withPaymentPlan("QA1PAYMENTPLAN02").withPremiumWithDepositAndInstallments(154777.77).createAndCommit()
    account = new AccountBuilder().asLargeBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create()
    // Add a $25,000.00 Agency Bill Policy
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("AgencyBillPolicy-03-" + randomNumber).withPaymentPlan("QA1PAYMENTPLAN01").withPremiumAndTaxes(25000, 5000).createAndCommit()
    // Add a $25,000.00 Agency Bill Policy
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("AgencyBillPolicy-04-" + randomNumber).withPaymentPlan("QA1PAYMENTPLAN01").withPremiumWithDepositAndInstallments(25000.00).createAndCommit()
    // Add a $25,000.00 Agency Bill Policy
    new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("AgencyBillPolicy-05-" + randomNumber).withPaymentPlan("QA1PAYMENTPLAN01").withPremiumWithDepositAndInstallments(25000.00).createAndCommit()
    pcf.ProducerAgencyBillCycles.go( producer )
    print( "Created policies for " + producer.DisplayName )
    return producer
  }

  @Argument("Number of Loops", "10")
  function asMegaProducer() {
    loadSampleDataIfNotLoaded()
    var dateFormatter = new java.text.SimpleDateFormat("MM/dd/yyyy-HH:mm")
    var producer = new ProducerBuilder()
                        .withName("Mega-Producer " + dateFormatter.format(Date.CurrentDate))
                        .withDefaultProducerCodeAndCommissionPlan()
                        .withDefaultAgencyBillPlan()
                        .createAndCommit()
    var producerCode = producer.ProducerCodes[0]
    var count =  getArgument("Number of Loops") as int
    var beforeCommitTime : long = 0
    var numberOfAccounts = 400
    var startTime = java.lang.System.currentTimeMillis()
    print("Populating " + producer.Name + " with " + count * numberOfAccounts + " accounts...")
    for ( var i in 0..|count ) {
      print("Creating " + numberOfAccounts + " accounts for bundle " + (i+1) + " of " + count)
      gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
        producerCode = bundle.add(producerCode)
        for (var j in 0..|numberOfAccounts) {
          var account = new AccountBuilder().asMediumBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create(bundle)
          new PolicyPeriodBuilder().onAccount(account).withProductCommercialProperty().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i * (j + 1) + 10) + "-" + UniqueKeyGenerator.get().nextKey()).withPaymentPlan("QA1PAYMENTPLAN01").withMultiplePremiumCharges(new MonetaryAmount[]{ 321885.73bd.ofCurrency(account.Currency), 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
          new PolicyPeriodBuilder().onAccount(account).withProductBusinessAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i * (j + 1) + 10) + "-" + UniqueKeyGenerator.get().nextKey()).withPaymentPlan("QA1PAYMENTPLAN02").withMultiplePremiumCharges(new MonetaryAmount[]{ 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
        }
        beforeCommitTime = java.lang.System.currentTimeMillis()
        var formattedDate = DateFormat.getDateTimeInstance().format(Date.CurrentDate);
        print("Committing bundle " + (i + 1) + " at " + formattedDate)
      })
      var elapsed = java.lang.System.currentTimeMillis() - beforeCommitTime
      print("Commit complete after " + elapsed + "ms (" + elapsed/60000.0 + " min)" )
    }
    var totalTime = java.lang.System.currentTimeMillis() - startTime
    print("Total time: " + totalTime + "ms (" + totalTime / 60000.0 + " min)" )
    pcf.ProducerDetail.go(producer)
  }

  @Argument("Number of Loops", "10")
  function asMegaProducerDBPolicy() {
    loadSampleDataIfNotLoaded()
    var dateFormatter = new java.text.SimpleDateFormat("MM/dd/yyyy-HH:mm")
    var producer = new ProducerBuilder()
        .withName("Mega-Producer " + dateFormatter.format(Date.CurrentDate))
        .withDefaultProducerCodeAndCommissionPlan()
        .withDefaultAgencyBillPlan()
        .createAndCommit()
    var producerCode = producer.ProducerCodes[0]
    var count =  getArgument("Number of Loops") as int;
    var beforeCommitTime : long = 0;
    var numberOfAccounts = 400;
    var elapsedTime : long
    var startTime = java.lang.System.currentTimeMillis()
    print("Populating " + producer.Name + " with " + count * numberOfAccounts + " accounts...")
    for ( var i in 0..|count ) {
      print("Creating " + numberOfAccounts + " accounts for bundle " + (i+1) + " of " + count)
      gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
        for (var j in 0..|numberOfAccounts) {
          var account = new AccountBuilder().asMediumBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create(bundle)
          new PolicyPeriodBuilder().onAccount(account).withProductCommercialProperty().asDirectBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i * (j + 1) + 10) + "-" + UniqueKeyGenerator.get().nextKey()).withPaymentPlan("QA1PAYMENTPLAN01").withMultiplePremiumCharges({ 321885.73bd.ofCurrency(account.Currency), 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
          new PolicyPeriodBuilder().onAccount(account).withProductBusinessAuto().asDirectBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i * (j + 1) + 10) + "-" + UniqueKeyGenerator.get().nextKey()).withPaymentPlan("QA1PAYMENTPLAN02").withMultiplePremiumCharges({ 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
        }
        beforeCommitTime = java.lang.System.currentTimeMillis()
        var formattedDate = DateFormat.getDateTimeInstance().format(Date.CurrentDate);
        print("Committing bundle " + (i + 1) + " at " + formattedDate)
      })
      var elapsed = java.lang.System.currentTimeMillis() - beforeCommitTime
      print("Commit complete after " + elapsed + "ms (" + elapsed/60000.0 + " min)" )
    }
    var totalTime = java.lang.System.currentTimeMillis() - startTime
    print("Total time: " + totalTime + "ms (" + totalTime / 60000.0 + " min)" )
    pcf.ProducerDetail.go(producer)
  }

  function gotoAgencyPaymentWizard() {
    var p = with5PoliciesIn2Accounts()
    // Bill the first Agency Bill statement
    addDays( 30 )
    runBatchProcess( "StatementBilled" )
    pcf.ProducerDetail.go(p)
    pcf.AgencyDistributionWizard.go( p, gw.agencybill.AgencyDistributionWizardHelper.DistributionTypeEnum.PAYMENT )
  }
  
  function withAllPolicyTransactions(){
    var producer = createProducer()
    var account = createAccount()
    var policyPeriod = createPolicyPeriod(account, producer, "1")
    var currency = producer.Currency
    // bill the first statement, will generate charge bill transaction
    addMonths( 1 )
    runBatchProcess( BatchProcessType.TC_STATEMENTBILLED )
    var bundle = producer.getBundle()
    // make payment with exception
    var agencyBillCycles = producer.AgencyBillCycles.sortBy( \ a -> a.StatementInvoice.EventDate )
    var statementInvoice = agencyBillCycles[0].StatementInvoice
    var agencyPayment =
      AgencyPaymentDirector.createAgencyPaymentWithOneException(statementInvoice, 100bd.ofCurrency(currency), 0bd.ofCurrency(currency))
    bundle.commit()
    agencyPayment.execute()
    bundle.commit()
    addDays( 1 )
    // write off gross exception
    var invoiceItem = statementInvoice.InvoiceItems.first()
    invoiceItem.writeOffGrossAndPrimaryUnsettledAmounts(WriteoffReason.TC_MINORADJUSTMENT, AgencyWriteoffType.TC_BOTH, null)
    bundle.commit()
    addDays( 1 )
    // override commission from 10 to 20
    var charge = policyPeriod.Charges.get( 0 )
    charge.overrideCommissionRate( PolicyRole.TC_PRIMARY, 20 )
    bundle.commit()
    addDays( 1 )
    // write off commission exception
    agencyBillCycles = producer.AgencyBillCycles.sortBy( \ a -> a.StatementInvoice.EventDate )
    invoiceItem = agencyBillCycles[0].StatementInvoice.InvoiceItems.sortBy(\s -> s.EventDate).first()
    invoiceItem.writeOffGrossAndPrimaryUnsettledAmounts(WriteoffReason.TC_MINORADJUSTMENT, AgencyWriteoffType.TC_BOTH, null)
    bundle.commit()
    pcf.ProducerAgencyBillCycles.go( producer )
  }
  
  function withMultipleCommissionAdjustments() {
    var producer = createProducer()
    var account = createAccount()
    var policyPeriod = createPolicyPeriod(account, producer, "1")
    var bundle = producer.getBundle()
    // override commission from 10 to 20
    var charge = policyPeriod.Charges.get( 0 )
    charge.overrideCommissionRate( PolicyRole.TC_PRIMARY, 20 )
    bundle.commit()
    addDays( 1 )
    // override commission from to 15
    charge = policyPeriod.Charges.get( 0 )
    charge.overrideCommissionRate( PolicyRole.TC_PRIMARY, 15 )
    bundle.commit()
    addDays( 1 )
    // override commission from to 40
    charge = policyPeriod.Charges.get( 0 )
    charge.overrideCommissionRate( PolicyRole.TC_PRIMARY, 40 )
    bundle.commit()
    addDays( 1 )
    pcf.ProducerAgencyBillCycles.go( producer )
  }
  
  private function createProducer() : Producer {
    return createProducer(CurrencyUtil.getDefaultCurrency().Code);
  }
  
  private function createProducer(currency : String) : Producer {
    var commissionPlan = new CommissionPlanBuilder().withCurrency(currency).withPremiumCommissionableItem().withPrimaryRate(10).allowOnAllTiers().createAndCommit()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withCurrency(currency).withProducerCodeHavingCommissionPlan("ProducerCode", commissionPlan).withAgencyBillPlan(new AgencyBillPlanBuilder().withCurrency(currency)).createAndCommit()
    return producer
  }

  /**
   * protected so the Run command doesn't see it
   */
  protected function generateNames() {
    randomNumber = UniqueKeyGenerator.get().nextID()
    _producerId = "producer-" + randomNumber
    _accountId = "account-" + randomNumber
    _policyId = "policy-" + randomNumber
    _producerName = "AgencyBillProducer-" + randomNumber
  }

  /**
   * protected so the Run command doesn't see it
   */
  protected function createAccount() : Account {
    generateNames()
    var account = new AccountBuilder().asMediumBusiness().withDefaultBillingPlan().withDefaultDelinquencyPlan().createAndCommit()
    return account
  }

  /**
   * protected so the Run command doesn't see it
   */
  protected function createPolicyPeriod(account : Account, producer : Producer, subId : String) : PolicyPeriod {
    var policy = new PolicyPeriodBuilder().withCurrency(account.Currency).withPolicyNumber(_policyId + subId).onAccount(account).asAgencyBill().withPrimaryProducerCode(producer.ProducerCodes[0]).withPaymentPlan(_monthlypaymentplan).withPremiumWithDepositAndInstallments(1000bd.ofCurrency(account.Currency)).createAndCommit()
    return policy
  }
  
    /**
   * protected so the Run command doesn't see it
   */
  protected function createDBPolicyPeriod(account : Account, producer : Producer, subId : String) : PolicyPeriod {
    var policy = new PolicyPeriodBuilder().withCurrency(account.Currency).withPolicyNumber(_policyId + subId).onAccount(account).asDirectBill().withPrimaryProducerCode(producer.ProducerCodes[0]).withPaymentPlan(_monthlypaymentplan).withPremiumWithDepositAndInstallments(1000bd.ofCurrency(account.Currency)).createAndCommit()
    return policy
  }
  
  function with1500Policies() {
    loadSampleDataIfNotLoaded()
    // Create a producer to be used as the primary producer for the Agency Bill policy
    var producer = new ProducerBuilder().withName("Mega-Producer " + UniqueKeyGenerator.get().nextID()).withDefaultProducerCodeAndCommissionPlan().withDefaultAgencyBillPlan().createAndCommit()
    var producerCode = producer.ProducerCodes[0]
    print("Populating Producer " + producer.Name)
    var count : int = 1500
    var endTime : long = 0
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      for ( var i in 0..|count ) {
          var startTime = java.lang.System.currentTimeMillis()
        var account = new AccountBuilder().asMediumBusiness().withBillingPlan("QA1BILLINGPLAN01").withDelinquencyPlan("QA1DELINQUENCYPLAN01").create(bundle)
        new PolicyPeriodBuilder().onAccount(account).withProductPersonalAuto().asAgencyBill().withPrimaryProducerCode(producerCode).withPolicyNumber("pp" + (i + 10) + "-" + randomNumber).withPaymentPlan("QA1PAYMENTPLAN01").withMultiplePremiumCharges(
            new MonetaryAmount[]{ 321885.73bd.ofCurrency(account.Currency), 5128.67bd.ofCurrency(account.Currency) }).create(bundle)
          endTime = java.lang.System.currentTimeMillis()
          var elapsedTime = endTime - startTime
          print("  Done creating Account and Policy #" + (i+1) + " of " + count + " [" + elapsedTime + " ms]" )
      }
    })  
    pcf.ProducerDetail.go(producer)
  }

  @Argument("Policies", "20")
  function withLotsOfDirectBillPolicies(){
    loadSampleDataIfNotLoaded()
    var numberOfPoliciesToCreate = (getArgument( "Policies" ) as int)
    var commissionPlan = new CommissionPlanBuilder().withName("CommissionPlan" + randomNumber).withPrimaryRate(10).allowOnAllTiers().withPremiumCommissionableItem().withOnPaymentReceivedPayableCriteria().createAndCommit()
    var producer = new ProducerBuilder().withProducerCodeHavingCommissionPlan("PC-" + randomNumber, commissionPlan).createAndCommit()
    for( i in 0..numberOfPoliciesToCreate){
      var account = createAccount()
      createDBPolicyPeriod(account, producer, i as String)
    }
    pcf.ProducerDetail.go(producer)
  }
   
  @Argument("Amount", "200")
  function addCredit() : String{
    var producer = getCurrentProducer()
    var policyPeriod = producer.ProducerCodes[0].AllPolicyPeriods.AtMostOneRow
    var amount = getArgumentAsMonetaryAmount( "Amount", producer.Currency ).negate()
    new PolicyChangeBillingInstructionBuilder().withCurrency(producer.Currency).onPolicyPeriod(policyPeriod).withChargeAmount(amount).execute().createAndCommit()
    return "Created policy change of " + amount
}

  // This run command debits the CommissionsPayable tAccount of the current producer and debits the CommissionsPayable tAccount of
  // the producer passed in as a parameter

  @Argument("Amount", "100")
  @Argument("ProducerWhosePayableTAccountWeWillCredit", Query.make(Producer).select(), \ x -> (x as Producer).Name)
  function transferCommissionsPayableToProducer() : String{
    var debitPayableProducer = getCurrentProducer()
    var amount = getArgumentAsMonetaryAmount( "Amount", debitPayableProducer.Currency )
    var creditPayableProducerName = getArgumentAsString( "ProducerWhosePayableTAccountWeWillCredit")
    var producerQueryResults = Query.make(Producer).compare("Name", Equals, creditPayableProducerName).select()
    var creditPayableProducer = producerQueryResults.FirstResult
    var producerPayableTransfer = new ProducerPayableTransferBuilder().withCurrency(debitPayableProducer.Currency).withAmount(amount).debitsPayableOf(debitPayableProducer).creditsPayableOf(creditPayableProducer).createAndCommit()
    producerPayableTransfer.execute()
    producerPayableTransfer.Bundle.commit()
    return "Debited " + amount + " from CommissionsPayable of " + debitPayableProducer + " and Credited " + amount +
      " to CommissionsPayable of " + creditPayableProducer
  }
  
  @Argument("Amount", "700")
  function addPolicyPeriodWithPremium() : String{
    var producer = getCurrentProducer()
    var amount = getArgumentAsMonetaryAmount( "Amount", producer.Currency )
    var producerCode = producer.ProducerCodes[0]
    var account = new AccountBuilder().withCurrency(producer.Currency).withDelinquencyPlan(new DelinquencyPlanBuilder().withCurrency(producer.Currency).create()).withBillingPlan(new BillingPlanBuilder().withCurrency(producer.Currency).create()).createAndCommit()
    var paymentPlan = Query.make(PaymentPlan).compare("Name", Equals, _monthlypaymentplan).select().single()
    if (paymentPlan.Currency != producer.Currency) {
      paymentPlan = new PaymentPlanBuilder().withCurrency(producer.Currency).withPeriodicity(TC_MONTHLY).withDownPaymentPercent(10).create()
    }
    new PolicyPeriodBuilder().withCurrency(producer.Currency).onAccount(account).asAgencyBill().withPrimaryProducerCode(producerCode).withPaymentPlan(paymentPlan).withPremiumWithDepositAndInstallments(amount).createAndCommit()
    return "Created new policy period with premium: " + amount
  }

   @Argument("FixedDueDayOfMonth", "15")
   @Argument("paymentPlan", Query.make(PaymentPlan).select(), \ x -> (x as PaymentPlan).Name)
   @Argument("billingPlan", Query.make(BillingPlan).select(), \ x -> (x as BillingPlan).Name)
   @Argument("PolicyAmount", "1000")  
   function with1FixedDueDateABPolicy(){
    var paymentPlan = Query.make(entity.PaymentPlan).compare("Name", Equals, getArgumentAsString("paymentPlan")).select().FirstResult
    if(paymentPlan == null){
      paymentPlan =  Query.make(entity.PaymentPlan).compare("Name", Equals, "Monthly 10").select().getFirstResult()
    }  
    var billingPlan = Query.make(entity.BillingPlan).compare("Name", Equals, getArgumentAsString("billingPlan")).select().FirstResult
    if (billingPlan == null){
      billingPlan =  Query.make(entity.BillingPlan).compare("Name", Equals, "QA1BILLINGPLAN01").select().getFirstResult()
    }  
    var accountBuilder = new AccountBuilder().asDueDateBilling().withInvoiceDayOfMonth(getArgumentAsInt("FixedDueDayOfMonth")).withBillingPlan(billingPlan).withDelinquencyPlan("QA1DELINQUENCYPLAN07")
    var account = accountBuilder.create() 
    var producer = new ProducerBuilder().withDefaultAgencyBillPlan().withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), "QA1COMMISSIONPLAN08").create()
    new PolicyPeriodBuilder().onAccount(account).asAgencyBill().doNotHoldInvoicingWhenDelinquent().withPrimaryProducerCode(producer.ProducerCodes[0]).withPaymentPlan(paymentPlan).withPremiumWithDepositAndInstallments(getArgumentAsMonetaryAmount("PolicyAmount", account.Currency)).createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }

  function makeExecutedPayment() {
    var producer = getCurrentProducer()
    var unpaidInvoice = getFirstUnsettledInvoice(producer)
    var paymentCount = getNumberOfMoneyReceiveds(producer)
    if (unpaidInvoice != null) {
      var payment = new AgencyBillPaymentFixtureBuilder().withCurrency(producer.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Payment " + (paymentCount + 1)).createFixture().getAgencyBillPayment()
      payment.Bundle.commit()
    }
  }

  function makeSavedPayment() {
    var producer = getCurrentProducer()
    var unpaidInvoice = getFirstUnsettledInvoice(producer)
    var paymentCount = getNumberOfMoneyReceiveds(producer)
    if (unpaidInvoice != null) {
      var payment = new AgencyBillPaymentFixtureBuilder().withCurrency(producer.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Payment " + (paymentCount + 1)).createUnexecutedFixture().getAgencyBillPayment()
      payment.Bundle.commit()
    }
  }

  function makeUndistributedMoney() {
    var producer = getCurrentProducer()
    var paymentCount = getNumberOfMoneyReceiveds(producer)
    var money = new AgencyBillMoneyReceivedFixtureBuilder().withProducer(producer).withAmount(200bd.ofCurrency(producer.Currency)).withName("RunCommand Payment " + (paymentCount + 1)).createFixture().getMoney()
    money.Bundle.commit()
  }
  
  function makeExecutedPromise() {
    var producer = getCurrentProducer()
    var unpaidInvoice = getFirstUnsettledInvoice(producer)
    var promiseCount = getNumberOfPromisedMoneys(producer)
    if (unpaidInvoice != null) {
      var promise = new AgencyBillPromiseFixtureBuilder().withCurrency(producer.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Promise " + (promiseCount + 1)).createFixture().AgencyBillPromise
      promise.Bundle.commit()
    }
  }
  
  function makeSavedPromise() {
    var producer = getCurrentProducer()
    var unpaidInvoice = getFirstUnsettledInvoice(producer)
    var promiseCount = getNumberOfPromisedMoneys(producer)
    if (unpaidInvoice != null) {
      var promise = new AgencyBillPromiseFixtureBuilder().withCurrency(producer.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Promise " + (promiseCount + 1)).createUnexecutedFixture().AgencyBillPromise
      promise.Bundle.commit()
    }
  }

  function makeExecutedCreditDistribution() {
    var producer = getCurrentProducer()
    var unpaidInvoice = getFirstUnsettledPlannedInvoice(producer)
    var creditCount = getNumberOfCreditDistributions(producer)
    if (unpaidInvoice != null) {
      var itemToPay = unpaidInvoice.InvoiceItems[0]
      var changer = new ChargeInstallmentChanger(itemToPay.Charge)
      changer.addEntry(-itemToPay.Amount, InvoiceItemType.TC_INSTALLMENT, itemToPay.EventDate)
      var otherItemEntry = changer.getEntryFor(itemToPay.Charge.InvoiceItems[8])
      otherItemEntry.Amount = otherItemEntry.Amount + itemToPay.Amount
      changer.execute()
      var creditDist = new AgencyBillCreditDistributionFixtureBuilder().withCurrency(producer.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Credit Distribution " + (creditCount + 1)).createFixture().AgencyBillCreditDistribution
      creditDist.Bundle.commit()
    }
  }
  
  function makeSavedCreditDistribution() {
    var producer = getCurrentProducer()
    var unpaidInvoice = getFirstUnsettledPlannedInvoice(producer)
    var creditCount = getNumberOfCreditDistributions(producer)
    if (unpaidInvoice != null) {
      var itemToPay = unpaidInvoice.InvoiceItems[0]
      var changer = new ChargeInstallmentChanger(itemToPay.Charge)
      changer.addEntry(-itemToPay.Amount, InvoiceItemType.TC_INSTALLMENT, itemToPay.EventDate)
      var otherItemEntry = changer.getEntryFor(itemToPay.Charge.InvoiceItems[8])
      otherItemEntry.Amount = otherItemEntry.Amount + itemToPay.Amount
      changer.execute()
      var creditDist = new AgencyBillCreditDistributionFixtureBuilder().withCurrency(producer.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Credit Distribution " + (creditCount + 1)).createUnexecutedFixture().AgencyBillCreditDistribution
      creditDist.Bundle.commit()
    }
  }
  
  function makeSavedCreditDistributionFromXfer() {
    var producer = getCurrentProducer()
    var currency = producer.Currency
    var account = new AccountBuilder().withCurrency(producer.Currency).withDelinquencyPlan(new DelinquencyPlanBuilder().withCurrency(currency).create()).withBillingPlan(new BillingPlanBuilder().withCurrency(currency).create()).create()
    DirectBillPaymentFactory.pay(account, 1000bd.ofCurrency(currency))
    account.Bundle.commit() 
    new FundsTransferBuilder().withCurrency(account.Currency).fromAccount(account).toProducer(producer).withAmount(200bd.ofCurrency(currency)).createTransfer().createAndCommit()
    var unpaidInvoice = getFirstUnsettledInvoice(producer)
    var creditCount = getNumberOfCreditDistributions(producer)
    if (unpaidInvoice != null) {
      var creditDist = new AgencyBillCreditDistributionFixtureBuilder().withCurrency(unpaidInvoice.Currency).withFullDistributionFor(unpaidInvoice).withName("RunCommand Credit Distribution " + (creditCount + 1)).createUnexecutedFixture().AgencyBillCreditDistribution
      creditDist.Bundle.commit()
    }
  }

  private function toMonetaryAmounts( currency : Currency, amounts : BigDecimal[]) : MonetaryAmount[] {
    return amounts.map(\amount -> amount.ofCurrency(currency))
  }
  
  private function getFirstUnsettledPlannedInvoice(producer : Producer) : Invoice {
    for (invoice in producer.InvoicesSortedByEventDate) {
      if (invoice.AmountDue.IsNotZero && invoice.Planned) {
        return invoice
      }
    }
    return null
  }
  
  private function getFirstUnsettledInvoice(producer : Producer) : Invoice {
    for (invoice in producer.InvoicesSortedByEventDate) {
      if (invoice.AmountDue.IsNotZero) {
        return invoice
      }
    }
    return null
  }
  
  private function getNumberOfMoneyReceiveds(producer : Producer) : Number {
    return Query.make(entity.AgencyBillMoneyRcvd).compare("Producer", Equals, producer).select().Count
  }
  
  private function getNumberOfPromisedMoneys(producer : Producer) : Number {
    return Query.make(entity.PromisedMoney).compare("PromisingProducer", Equals, producer).select().Count
  }

  private function getNumberOfCreditDistributions(producer : Producer) : Number {
    return Query.make(entity.ZeroDollarAMR).compare("Producer", Equals, producer).select().Count
  }
}
