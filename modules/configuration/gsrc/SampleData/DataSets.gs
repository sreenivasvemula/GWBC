package SampleData

uses gw.api.database.Query
uses java.util.HashMap
uses gw.api.domain.accounting.ChargePatternKey
uses gw.api.util.SampleDataGenerator
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.AgencyBillPlanBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.CommissionPlanBuilder
uses gw.api.databuilder.CondCmsnSubPlanBuilder
uses gw.api.databuilder.CollectionAgencyBuilder
uses gw.api.databuilder.AccountDisbursementBuilder
uses gw.api.databuilder.IncomingProducerPaymentBuilder
uses gw.api.databuilder.ManualCmsnPaymentBuilder
uses gw.api.databuilder.NoteBuilder
uses gw.api.databuilder.OutgoingDisbPmntBuilder
uses gw.api.databuilder.PaymentAllocationPlanBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.ProducerPaymentBuilder
uses gw.api.databuilder.PolicyChangeBillingInstructionBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.PolicyCommissionBuilder
uses gw.api.databuilder.TroubleTicketBuilder
uses gw.api.databuilder.SubrogationBuilder
uses gw.api.databuilder.SuspensePaymentBuilder

uses gw.api.databuilder.CollateralRequirementBuilder
uses java.util.Date
uses gw.api.databuilder.BusinessWeekBuilder
uses gw.api.databuilder.AgencyMoneyReceivedBuilder
uses gw.api.databuilder.AgencyCyclePaymentBuilder
uses gw.api.databuilder.AgencyPaymentItemBuilder
uses java.lang.Math
uses gw.pl.currency.MonetaryAmount
uses gw.api.databuilder.BCDataBuilder

@Export
class DataSets {

  // =================================================================================================================
  // Instance variable initialized by the constructor and set by the UI
  // =================================================================================================================

  private var _dataSetGenerationMethod : String

  // =================================================================================================================
  // Constructor - only a single no-arg constructor allowed
  // =================================================================================================================

  construct() {
    _dataSetGenerationMethod = getDataSetGenerationMethods()[0]
  }

  // =================================================================================================================
  // Methods used to support data generation from the UI
  // =================================================================================================================

  function getDataSetGenerationMethod() : String {
    return _dataSetGenerationMethod
  }

  function setDataSetGenerationMethod(dataSetGenerationMethod : String) {
     _dataSetGenerationMethod = dataSetGenerationMethod
  }

  function createSampleData() {
    SampleDataGenerator.generateSampleData(this, _dataSetGenerationMethod)
  }

  // =================================================================================================================
  // Method used to display available data set methods to the UI.  Add any new data set methods to the returned array
  // =================================================================================================================

  final function getDataSetGenerationMethods() : String[] {
  //note: to run the import sample data run command with a specific data set, put that dataset first in the list
    return new String[] { "createBillingCenterQASampleData", "createBillingCenterSampleData", "createBillingCenterUpgradeData"}
  }

  // =================================================================================================================
  // Data set methods - add custom data sets here, always passing the dataGenerator as the first parameter
  // =================================================================================================================

  function createBillingCenterSampleData(dataGenerator : DataGenerator) {
    var addressGen = new SampleData.Address()
    var securityZoneGen = new SampleData.SecurityZone()
    var groupGen = new SampleData.Group()
    var userGen = new SampleData.User()
    var chargePatternGen = new SampleData.ChargePattern()
    var billingPlanGen = new SampleData.BillingPlan()
    var paymentPlanGen = new SampleData.PaymentPlan()
    var commissionPlanGen = new SampleData.CommissionPlan()
    var producerGen = new SampleData.Producer()
    var producerCodeGen = new SampleData.ProducerCode()
    var accountGen = new SampleData.Account()

    var currency = BCDataBuilder.getDefaultBuilderCurrency()

    var date = java.util.Date.Now

    var businessDayStart = new Date(2008, 9, 22, 0, 0, 0)
    var startBusiness = new Date(2008, 9, 22, 8, 0, 0)
    var endBusiness = new Date(2008, 9, 22, 17, 0, 0)

    new BusinessWeekBuilder()
      .withAppliesToAllZones( true )
      .withDemarcation( businessDayStart )
      .withWeekEnd( Weekdays.TC_FRIDAY )
      .withSaturdayNotAsBusinessDay()
      .withSundayNotAsBusinessDay()
      .withFridayAsBusinessDay( startBusiness, endBusiness)
      .withThursdayAsBusinessDay( startBusiness, endBusiness)
      .withWednesdayAsBusinessDay( startBusiness, endBusiness)
      .withTuesdayAsBusinessDay( startBusiness, endBusiness)
      .withMondayAsBusinessDay( startBusiness, endBusiness)
      .createAndCommit()


    //Make many-many addresses, since Contact.PrimaryAddressID must now be unique - 2/28/08 Efurtado
    var address1 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address2 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address3 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address4 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address5 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address6 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address7 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address8 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address9 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address10 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address11 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address12 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address13 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var address14 = addressGen.create( "business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")

    var secondAddress = addressGen.create("business", "10 Main Street", "San Mateo", "CA", "94403", "US")
    var securityZone = securityZoneGen.getDefaultSecurityZone()
    var organization = Query.make(Organization).select().FirstResult

    var roleQuery = Query.make(entity.Role).compare("PublicID", Equals, "superuser").select()
    var role = roleQuery.AtMostOneRow
    roleQuery = Query.make(entity.Role).compare("PublicID", Equals, "underwriter").select()
    var roleUW = roleQuery.AtMostOneRow

    var authorityLimitProfileQuery = Query.make(entity.AuthorityLimitProfile).compare("PublicID", Equals, "default_data:1").select()
    var superuserAuthority = authorityLimitProfileQuery.AtMostOneRow
    authorityLimitProfileQuery = Query.make(entity.AuthorityLimitProfile).compare("PublicID", Equals, "default_data:2").select()
    var generalAuthority = authorityLimitProfileQuery.AtMostOneRow

    // demo_sample:1 is the supervisor for the above groups (created in groupGen)
    var supervisor = userGen.create( null, role, superuserAuthority, address11, "svisor", "Super", "Visor")

    var group1 = groupGen.create( "Group 1", organization, supervisor, securityZone)
    var group2 = groupGen.create( "Group 2", organization, supervisor, securityZone)
    var group3 = groupGen.create("External Group", organization, supervisor, securityZone)

    userGen.create(group1, role, superuserAuthority, address1, "bbaker", "Bruce", "Baker")
    userGen.create( group1, role, superuserAuthority, address2, "aapplegate", "Aaron", "Applegate")
    userGen.create( group1, role, generalAuthority, address3, "ssmith", "Sally", "Smith")
    userGen.create( group1, role, generalAuthority, address4, "mmaples", "Marla", "Maples")
    userGen.create(group1, role, generalAuthority, address5, "elee", "Edward", "Lee")
    userGen.create( group1, role, superuserAuthority, address6, "admin", "System", "Admin")
    userGen.create( group2, roleUW, generalAuthority, address7, "cclark", "Chris", "Clark")
    userGen.create( group2, roleUW, generalAuthority, address8, "ccraft", "Christine", "Craft")
    userGen.create( group2, roleUW, generalAuthority, address9, "dhenson", "Dan", "Henson")
    userGen.create( group1, roleUW, generalAuthority, address10, "uw", "Under", "Writer")

    userGen.createExternalUser( group3, role, generalAuthority, address12, "esu", "External", "Superuser")
    userGen.createExternalUser( group3, roleUW, generalAuthority, address13, "euw", "External", "Underwriter")

    // create plans
    createReturnPremiumPlan(date)
    createPaymentAllocationPlans()
    var billingPlan = billingPlanGen.create(currency, "Standard Mail", "Direct bill, postal invoicing", 21)

    paymentPlanGen.create(currency, null, false,"A Monthly 10% Down, 9 Max installments", "Monthly 10% Down, 9 Max installments", date, null, 10, 9, "monthly",  "policyeffectivedate", -25, "policyeffectivedateplusoneperiod", 0, "policyeffectivedate", -25, 30)
    paymentPlanGen.create(currency, "pctest:2", false, "B Monthly 10% Down, Max 11 installments", "Monthly 10% Down, 11 Max installments", date, null, 10, 11, "monthly",  "policyeffectivedate", -25, "policyeffectivedateplusoneperiod", 0,  "policyeffectivedate", -25, 30)
    paymentPlanGen.create(currency, null, false, "C Monthly 25% Down, 11 Max installments", "Monthly 25% Down, 11 Max installments" , date, null, 25, 11, "monthly",  "policyeffectivedate", -25, "policyeffectivedateplusoneperiod", 0,  "policyeffectivedate", -25, 30)
    paymentPlanGen.create(currency, null, false, "D Quarterly 30% Down, 3 Max installments", "Quarterly 30% Down, 3 Max installments", date, null, 30, 3, "quarterly",  "policyeffectivedate", -25, "policyeffectivedateplusoneperiod", 0, "policyeffectivedate", -25, 60)
    paymentPlanGen.create(currency, null, false, "E Semi-Annual 60% Down, 1 Max installments", "Semi-Annual 60% Down, 1 Max installments", date, null, 60, 1, "everysixmonths",  "policyeffectivedate", -25,  "policyeffectivedateplusoneperiod", 0, "policyeffectivedate", -25, 152)
    paymentPlanGen.create(currency, null, false, "F Annual 100% Down, 0 Max installments", "Annual 100% Down, 0 Max installments", date, null, 100, 0, "everyyear",  "policyeffectivedate", -25,  "policyeffectivedateplusoneperiod", 0, "policyeffectivedate", -25, 334)
    paymentPlanGen.create(currency, "ReportingPlanId", true, "Premium Reporting", "Premium Reporting", date, null, 0, 1, "monthly",  "policyeffectivedate", -0, "policyeffectivedate", 0, "policyeffectivedate", -25, 30)

    paymentPlanGen.create(currency, null, false, "Monthly 10", "10% down, 11 installments", date, null, 10, 11, "monthly")
    paymentPlanGen.create(currency, null, false, "Quarterly 33", "33% down, 3 installments ", date, null, 33, 3, "quarterly")
    paymentPlanGen.create(currency, null, true, "Monthly Reporting", "20% down, no installments ", date, null, 20, 1, "monthly")
    paymentPlanGen.create(currency, null, false, "Monthly 10 Always Transfer Excess", "Monthly 10 Always Transfer Excess", date, null, 20, 11, "monthly",  "chargedate", 0, "policyeffectivedateplusoneperiod", 0)
    paymentPlanGen.create(currency, null, false, "Monthly 10 Policy Effective Date", "Monthly 10 Policy Effective Date", date, null, 10, 11, "monthly",  "policyeffectivedate", 0, "policyeffectivedateplusoneperiod", 0)
    paymentPlanGen.create(currency, null, false, "Twice A Month", "10% down, 24 installments", date, null, 10, 24, "twicepermonth")
    paymentPlanGen.create(currency, null, false, "Weekly", "10% down, 24 installments", date, null, 10, 24, "everyweek")
    paymentPlanGen.create(currency, null, false, "Every Other Week", "10% down, 24 installments", date, null, 10, 24, "everyotherweek")

    var delinquencyPlan = createBasicDelinquencyPlans(date)

    var commissionPlan = commissionPlanGen.create( currency, "Standard Commission Plan", "Basic Commission Plan", date, null, true, true, true, 10, 5, 2, "binding")
    // create a sample external charge pattern
    chargePatternGen.createImmediateCharge( "ExternalFee", "ExternalFee", "Account", "onetime")

    var standardPlanName = "Standard Agency Bill Plan"
    var existingStandard = Query.make(AgencyBillPlan).compare("Name", Equals, standardPlanName).select()
    if (existingStandard.Empty) {
      var publicId = standardPlanName.substring(0, Math.min( 20, standardPlanName.length )).trim()
      new AgencyBillPlanBuilder()
        .withPublicId( publicId )
            .withCycleCloseDayOfMonth(15)
            .withPaymentTermsInDays(45)
            .withName(standardPlanName)
            .createAndCommit()
    }
    var existingLegacy = Query.make(entity.AgencyBillPlan).compare("Name", Equals, "Legacy Agency Bill Plan").select()
    if (existingLegacy.Empty) {
      new AgencyBillPlanBuilder().withCycleCloseDayOfMonth(15)
            .withPaymentTermsInDays(45)
            .withName("Legacy Agency Bill Plan")
            .withWorkflowType( "LegacyAgencyBill" )
            .asSendFirstDunningAfterDays( 60 )
            .asSendSecondDunningAfterDays( 75 )
            .createAndCommit()
    }

    var existingNoShowonPrevnonPastDueWith45DaysTerm = Query.make(entity.AgencyBillPlan).compare("Name", Equals, "QA1AGENCYBILLPLAN01").select()
        if (existingNoShowonPrevnonPastDueWith45DaysTerm.Empty) {
          new AgencyBillPlanBuilder().withCycleCloseDayOfMonth(15)
                .withPaymentTermsInDays(45)
                .withName("QA1AGENCYBILLPLAN01")
                .withSnapshotNonPastDueItems( false )
                .createAndCommit()
        }

      var existingNoShowonPrevnonPastDueWith25DaysTerm = Query.make(entity.AgencyBillPlan).compare("Name", Equals, "QA1AGENCYBILLPLAN02").select()
        if (existingNoShowonPrevnonPastDueWith25DaysTerm.Empty) {
          new AgencyBillPlanBuilder().withCycleCloseDayOfMonth(15)
                .withPaymentTermsInDays(25)
                .withName("QA1AGENCYBILLPLAN02")
                .withSnapshotNonPastDueItems( false )
                .createAndCommit()
        }

      var existingShowonPrevnonPastDueWith25DaysTerm = Query.make(entity.AgencyBillPlan).compare("Name", Equals, "QA1AGENCYBILLPLAN03").select()
        if (existingShowonPrevnonPastDueWith25DaysTerm.Empty) {
          new AgencyBillPlanBuilder().withCycleCloseDayOfMonth(15)
                .withPaymentTermsInDays(25)
                .withName("QA1AGENCYBILLPLAN03")
                .createAndCommit()
  }

    // create producer and account
    var producer = producerGen.create(currency, null, "Standard Producer", address14, "gold", "quarterly", true, date)
    producerCodeGen.create(currency, producer, "Standard Code", commissionPlan)
    accountGen.create( currency, "Standard Account", "Standard Account", billingPlan, delinquencyPlan, secondAddress, "mediumbusiness")

    // Create a list bill account
    new AccountBuilder().asListBillWithDefaults().createAndCommit()

  }

  function createBillingCenterQASampleData(dataGenerator : DataGenerator) {
    var date = java.util.Date.Now
    var fourteendaysLater = gw.api.util.DateUtil.addDays( date, 14)
    var addressGen = new SampleData.Address()
    var billingPlanGen = new SampleData.BillingPlan()
    var paymentPlanGen = new SampleData.PaymentPlan()
    var commissionPlanGen = new SampleData.CommissionPlan()
    var producerGen = new SampleData.Producer()
    var producerCodeGen = new SampleData.ProducerCode()

    var currency = BCDataBuilder.getDefaultBuilderCurrency()

    // base sample data
    createBillingCenterSampleData(dataGenerator)
    // qa-specific billing plans
    billingPlanGen.create( currency, "QA1BILLINGPLAN01", "billing plan no expiration", 25, date, null,
        new MonetaryAmount(100, currency), 10, new MonetaryAmount(0, currency), new MonetaryAmount(0, currency))
    billingPlanGen.create( currency, "QA1BILLINGPLAN03", "Account Level Billing Plan No Expiration", 25, date, null,
        new MonetaryAmount(100, currency), 10, new MonetaryAmount(52, currency), new MonetaryAmount(0, currency))
    billingPlanGen.create( currency, "QA1BILLINGPLAN04", "Account/Policy Level Billing Plan No Expiration", 25, date, null,
        new MonetaryAmount(100, currency), 10, new MonetaryAmount(52, currency), new MonetaryAmount(10, currency))
    billingPlanGen.create( currency, "QA1BILLINGPLAN08", "Account/Policy: Suppress invoices below 100, all parameters for fees and disbursements set",
        25, date, null, new MonetaryAmount(1000, currency), 5, new MonetaryAmount(200, currency),
        new MonetaryAmount(0, currency), new MonetaryAmount(25, currency), true, new MonetaryAmount(100, currency),
        "carryforward","charges")
    billingPlanGen.create( currency, "QA1BILLINGPLAN09",
        "Account/Policy Level: Suppress invoices below 100, all parameters for fees and disbursements set", 25, date,
        null, new MonetaryAmount(1000, currency), 5, new MonetaryAmount(200, currency),
        new MonetaryAmount(5, currency), new MonetaryAmount(25, currency), true, new MonetaryAmount(100, currency),
        "carryforward","charges")
    billingPlanGen.create( currency, "QA1BILLINGPLAN10", "Account/Policy Level: invoice fee $15", 25, date, null,
        new MonetaryAmount(1000, currency), 5, new MonetaryAmount(200, currency), new MonetaryAmount(15, currency),
        new MonetaryAmount(25, currency), true, new MonetaryAmount(100, currency), "carryforward","charges" )
    // qa-specific payment plans
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN01", "Monthly Payment Plan", date, null, 25, 11, "monthly",  "chargedate", 0, "policyeffectivedateplusoneperiod", 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN02", "Monthly Payment Plan", date, null, 25, 11, "monthly", "chargedate", 0, "policyeffectivedateplusoneperiod", 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN03", "Quarterly Payment Plan: xfer Excess Above Amount Under Contract with Immediate Invoicing", date, null, 25, 4, "quarterly",  "chargedate", 0, "chargedate", 0, "chargedate", 0, 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN04", "Quarterly Payment Plan: xfer Excess Above Amount Under Contract with Next Invoicing", date, null, 25, 4, "quarterly",  "chargedate", 0, "policyeffectivedateplusoneperiod", 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN05", "Monthly Payment Plan: xfer Excess Only on Closure 25 double-prorata", date, null, 25, 12, "monthly",  "policyeffectivedate", 0, "policyeffectivedateplusoneperiod", 0, "policyeffectivedateplusoneperiod", 0, 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN06", "Monthly Payment Plan: xfer Excess Only on Closure 25 triple-prorata", date, null, 25, 12, "monthly",  "chargedate", 0, "chargedate", 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN10", "Monthly Payment Plan: xfer Excess Only aboveBilledAndUnpaid 25 one-payment", date, null, 25, 12, "monthly",  "policyeffectivedate", 0, "policyeffectivedateplusoneperiod", 0)
    paymentPlanGen.create(currency, null, false, "QA1PAYMENTPLAN11", "Yearly Payment Plan", date,  null, 100, 0, "monthly")

    // qa-specific commission plans
    var commissionPlan01 = commissionPlanGen.create( currency, "QA1COMMISSIONPLAN01", "Basic Commission Plan", date, null, true, true, true, 10, 5, 2, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN02", "Basic Commission Plan", date, null, true, true, true, 15, 5, 2, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN03", "Basic Commission Plan", date, null, true, true, true, 15, 5, 2, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN05", "Basic Commission Plan", date, null, true, true, true, 15,
        5, 2, "binding", true, 2, new MonetaryAmount(10000, currency))
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN06", "Basic Commission Plan", date, null, true, true, true, 15, 5, 2, "effectivedate", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN08", "Basic Commission Plan", date, null, true, true, true, 10, 5, 2, "paymentreceived", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN09", "Basic Commission Plan", date, null, true, true, true, 15, 5, 2, "firstpaymentreceived", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN10", "Basic Commission Plan", date, null, true, true, true, 15, 5, 2, "billing", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN11", "Basic Commission Plan", date, null, true, true, true, 12, 4, 1, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN12", "Basic Commission Plan", date, null, true, true, true, 10, 6, 3, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN13", "Basic Commission Plan", date, null, true, true, true, 8, 3, 1, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN14", "Basic Commission Plan", date, null, true, true, true, 10, 6, 1, "binding", true, null, null)
    commissionPlanGen.create( currency, "QA1COMMISSIONPLAN15", "Basic Commission Plan", date, null, true, true, true, 14, 4, 2, "binding", true, null, null)

    createQADelinquencyPlans(date)

    // qa-specific producers
    var address = addressGen.create("business", "143 Lake Avenue", "Pasadena", "CA", "91253", "US")
    var producer = producerGen.create(currency, null, "QA1PRODUCER01", address, "gold", "monthly", true, fourteendaysLater)
    producerCodeGen.create(currency, producer, "QA1PRODUCERCODE01", commissionPlan01)
  }

  function createBillingCenterPerfSampleData(dataGenerator : DataGenerator) {
  }

  function createBillingCenterUpgradeSampleData(dataGenerator : DataGenerator) {
    print("Loading Data")
    createBillingCenterQASampleData(dataGenerator)
    var currency = BCDataBuilder.getDefaultBuilderCurrency()
      var account = new AccountBuilder().withCurrency(currency).withDistributionUpToAmountUnderContract().createAndCommit()
    var commissionPlanBuilder = new CommissionPlanBuilder().withCurrency(currency)
    var commissionPlan = commissionPlanBuilder.withSubPlan(
        new CondCmsnSubPlanBuilder()
            .withCurrency(currency)
            .withDefaultCommissionPlan()
            .notAllowingAllEvaluations()
            .excludingPoorEvaluation()
            .notAllowingAllLOBCodes()
            .excludingPersonalAutoLOBCode()
            .notAllowingAllSegments()
            .excludingSubprimeSegment()
            .allowingAllJurisdictions()
            .notAllowingAllUWCompanies()
            .excludingHighRiskCompany()
            .withName("Default Condissional Subplan")
            .withOnBindingPayableCriteria())
        .createAndCommit()

      var producer = new ProducerBuilder()
          .withCurrency(currency)
          .withProducerCodeHavingCommissionPlan("Upgrade Producer Code", commissionPlan)
          .createAndCommit()
      var policyPeriod = new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onDefaultAccount()
        .withPremiumWithDepositAndInstallments(new MonetaryAmount(1000bd, currency))
        .withDefaultContact()
        .createAndCommit()
      var charge = new ChargeBuilder()
        .withCurrency(currency)
        .onPolicyPeriod(policyPeriod)
        .withAmount(127bd.ofCurrency(currency))
        .onGeneralBillingInstruction( policyPeriod )
        .asTaxes()
        .createAndCommit()
      var disbursement = new AccountDisbursementBuilder().withDefaultAccount().createAndCommit()
      new NoteBuilder().onAccount(account).createAndCommit()
      new TroubleTicketBuilder().withInvoiceSendingHold().withDefaultActivity().onAccountAndPolicyOf(policyPeriod).createAndCommit()
      new SuspensePaymentBuilder().createAndCommit()
      charge = new ChargeBuilder().withCurrency(currency).onAccount(account).asAccountLateFee()
          .onAccountGeneralBillingInstruction( account ).createAndCommit()
      new SubrogationBuilder().withCurrency(currency).withAccount(account).doSubrogation().createAndCommit()
      new OutgoingDisbPmntBuilder().withDisbursement(disbursement).createAndCommit()
      var policyCommission = new PolicyCommissionBuilder()
            .withCurrency(currency)
            .withPolicyPeriod(policyPeriod)
            .withProducerCodeAndDefaultCommissionSubPlan(producer.ProducerCodes[0])
            .isDefaultForPolicyPeriod()
            .createAndCommit()
      new ChargeBuilder()
          .withCurrency(currency)
          .onPolicyPeriod(policyPeriod)
          .onGeneralBillingInstruction( policyPeriod )
          .asTaxes()
          .createAndExecuteBillingInstruction()
      new ManualCmsnPaymentBuilder().withCurrency(currency).withAmount(100bd.ofCurrency(currency)).withPolicyCommission(policyCommission).createAndCommit()
      new ProducerPaymentBuilder()
        .withCurrency(currency)
        .onProducer(producer)
        .withDefaultOutgoingPayment()
        .createAndCommit()

      var account1 = new AccountBuilder()
        .withCurrency(currency)
        .withDefaultBillingPlan()
        .withDefaultDelinquencyPlan()
        .createAndCommit()
      new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account1)
        .withPremiumAndTaxes(100bd.ofCurrency(currency), 0bd.ofCurrency(currency))
        .runDelinquency()
        .create()
      for (invoice in account1.Invoices) {
        invoice.PaymentDueDate = Date.CurrentDate
      }
      charge = new ChargeBuilder()
          .withCurrency(currency)
          .withAmount( 543bd.ofCurrency(currency) )
          .onPolicyPeriod( policyPeriod )
          .asPolicyReinstatementFee()
          .onBillingInstruction(new PolicyChangeBillingInstructionBuilder().withCurrency(currency).onPolicyPeriod(policyPeriod).create())
          .createAndCommit()

      var reversedCharge = new ChargeBuilder()
          .onPolicyPeriod(policyPeriod)
          .onGeneralBillingInstruction( policyPeriod ).withAmount(75bd.ofCurrency(policyPeriod.Currency))
          .asTaxes()
          .createAndExecuteBillingInstruction()
      reversedCharge.reverse();

      new CollectionAgencyBuilder().onAccount(account).createAndCommit()
      new IncomingProducerPaymentBuilder().withProducer(producer).createAndCommit()

      var writeoffAccount = new AccountBuilder().withCurrency(currency).withDistributionUpToAmountUnderContract().createAndCommit()
      charge = new ChargeBuilder()
        .withCurrency(currency)
        .onAccountWithAccountGeneralBI(writeoffAccount)
        .withAmount(125bd.ofCurrency(writeoffAccount.Currency))
        .asChargePattern(ChargePatternKey.SUBROGATION)
        .createAndCommit()
      writeoffAccount.doWriteoff( 25bd.ofCurrency(currency), WriteoffReason.TC_MINORADJUSTMENT)

      var acct = new AccountBuilder().withCurrency(currency).withDistributionUpToAmountUnderContract().createAndCommit()
      charge = new ChargeBuilder()
        .withCurrency(currency)
        .onAccountWithAccountGeneralBI(acct)
        .withAmount(125bd.ofCurrency(acct.Currency))
        .asChargePattern(ChargePatternKey.SUBROGATION)
        .createAndCommit()
      acct.doWriteoff( 25bd.ofCurrency(acct.Currency), WriteoffReason.TC_MINORADJUSTMENT )

      var account2 = new AccountBuilder().withCurrency(currency).withDistributionUpToAmountUnderContract().createAndCommit()
      new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount(account2)
        .withPremiumWithDepositAndInstallments(1000bd.ofCurrency(currency))
        .withDefaultContact()
        .createAndCommit()
      account2.makeSingleCashPaymentUsingNewBundle(100bd.ofCurrency(currency))
      new CollateralRequirementBuilder().withCurrency(currency).onAccount( new AccountBuilder().create() ).asCashWithInitialCharge().createAndCommit()

   var agblCommissionPlan = new CommissionPlanBuilder()
      .withCurrency(currency)
      .withPremiumCommissionableItem()
      .withPrimaryRate( 10 )
      .createAndCommit()
    //Create a producer to be used as the primary producer for the Agency Bill policy
    var agblProducer = new ProducerBuilder()
                  .withCurrency(currency)
                  .withProducerCodeHavingCommissionPlan( "ProducerCode", agblCommissionPlan )
                  .withDefaultAgencyBillPlan()
                  .createAndCommit()
    var agblAccount = new AccountBuilder()
                   .withCurrency(currency)
                   .asMediumBusiness()
                   .withDefaultBillingPlan()
                   .withDefaultDelinquencyPlan()
                   .createAndCommit()
    new PolicyPeriodBuilder()
        .withCurrency(currency)
        .onAccount( agblAccount )
        .withPrimaryProducerCode( agblProducer.ProducerCodes[0] )
        .asAgencyBill()
        .withDefaultPaymentPlan()
        .withPremiumAndTaxes( 1000bd.ofCurrency(currency), 100bd.ofCurrency(currency) )
        .createAndCommit()
    var agencyBillCycle1 = agblProducer.getAgencyBillCyclesSortedByStatementDate().get( 0 )
    var statementInvoice1 = agencyBillCycle1.StatementInvoice
      var amountToPay = statementInvoice1.NetAmount
      var agencyBillCycle = statementInvoice1.AgencyBillCycle
      var agencyMoneyReceived = new AgencyMoneyReceivedBuilder()
            .withCurrency(currency)
            .onProducer(agencyBillCycle.getProducer())
            .withAmount(amountToPay)
            .create()
      var agencyCyclePayment =  new AgencyCyclePaymentBuilder()
            .withCurrency(currency)
            .withAgencyBillMoneyReceived(agencyMoneyReceived)
            .create()
      var invoiceItems = statementInvoice1.InvoiceItems

      for (var invoiceItem in  invoiceItems) {
        var grossAmountToApply = invoiceItem.GrossUnsettledAmount.subtract(10bd.ofCurrency(currency))
        var commissionAmountToApply = invoiceItem.PrimaryCommissionAmount.IsZero
          ? invoiceItem.PrimaryCommissionAmount
          : invoiceItem.PrimaryCommissionAmount.add(1bd.ofCurrency(currency))
        new AgencyPaymentItemBuilder()
            .withCurrency(currency)
            .onAgencyPayment(agencyCyclePayment)
            .onInvoiceItem(invoiceItem).fullyPaid(invoiceItem)
            .grossAmount(grossAmountToApply)
            .commissionAmount(commissionAmountToApply)
            .create()
      }
      agencyCyclePayment.execute()
      agencyCyclePayment.Bundle.commit()

  }

  /**
   * Generate the basic set of Delinquency Plans.
   * @param date the date on which to start the plans
   * @return the 'standard' delinquency plan.
   */
  private function createBasicDelinquencyPlans(date : java.util.Date) : DelinquencyPlan {
    var delinquencyPlanGen = new SampleData.DelinquencyPlan()
    var stdDlnqReasons = new HashMap<DelinquencyReason, typekey.Workflow>() {
      DelinquencyReason.TC_PASTDUE         -> typekey.Workflow.TC_STDDELINQUENCY,
      DelinquencyReason.TC_FAILURETOREPORT -> typekey.Workflow.TC_SIMPLEFAILURETOREPORT,
      DelinquencyReason.TC_NOTTAKEN -> typekey.Workflow.TC_CANCELIMMEDIATELY }
    var legacyDlnqReasons = new HashMap<DelinquencyReason, typekey.Workflow>() {
      DelinquencyReason.TC_PASTDUE  -> typekey.Workflow.TC_LEGACYDELINQUENCY,
      DelinquencyReason.TC_OTHER    -> typekey.Workflow.TC_LEGACYDELINQUENCYOTHER }

    var currency = BCDataBuilder.getDefaultBuilderCurrency()

    var stdPlan = delinquencyPlanGen.create(currency,
        /* publicID */           null,
        /* name */               "Standard Delinquency Plan",
        /* description */        "Enter Delinquency at 10",
        /* effectiveDate */      date,
        /* expirationDate */     null,
        /* cancellationTarget */ CancellationTarget.TC_DELINQUENTPOLICYONLY,
        /* reasons */            stdDlnqReasons,
        /* segments */           ApplicableSegments.TC_ALL,
        /* enterDelinquency */   new MonetaryAmount(10, currency),
        /* cancellation */       new MonetaryAmount(11, currency),
        /* exitDelinquency */    new MonetaryAmount(5, currency),
        /* lateFee */            new MonetaryAmount(100, currency),
        /* reinstatementFee */   new MonetaryAmount(100, currency),
        /* gracePeriodDays */    0)
    delinquencyPlanGen.create(currency,
        /* publicID */           null,
        /* name */               "Legacy Delinquency Plan",
        /* description */        "Delinquency Plan for delinquencies imported from legacy system",
        /* effectiveDate */      date,
        /* expirationDate */     null,
        /* cancellationTarget */ CancellationTarget.TC_DELINQUENTPOLICYONLY,
        /* workFlow */           legacyDlnqReasons,
        /* segments */           ApplicableSegments.TC_ALL,
        /* enterDelinquency */   new MonetaryAmount(10bd, currency),
        /* cancellation */       new MonetaryAmount(11bd, currency),
        /* exitDelinquency */    new MonetaryAmount(5bd, currency),
        /* lateFee */            new MonetaryAmount(100bd, currency),
        /* reinstatementFee */   new MonetaryAmount(100bd, currency),
        /* gracePeriodDays */    0)

    /* build Equity-Based Delinquency Plan as a near-clone of Standard Delinquency */
    var equityPlanName = "Equity-Based Delinquency Plan"
    var existing = Query.make(DelinquencyPlan).compare("Name", Equals, equityPlanName).select()
    if (existing.Empty) {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        var equityPlan = delinquencyPlanGen.create(currency,
        /* publicID */           null,
        /* name */               equityPlanName,
        /* description */        "Standard Delinquency Plan using equity dating for Cancellation",
        /* effectiveDate */      date,
        /* expirationDate */     null,
        /* cancellationTarget */ CancellationTarget.TC_DELINQUENTPOLICYONLY,
        /* reasons */            stdDlnqReasons,
        /* segments */           ApplicableSegments.TC_ALL,
        /* enterDelinquency */   new MonetaryAmount( 10bd, currency),
        /* cancellation */       new MonetaryAmount(11bd, currency),
        /* exitDelinquency */    new MonetaryAmount(5bd, currency),
        /* lateFee */            new MonetaryAmount(100bd, currency),
        /* reinstatementFee */   new MonetaryAmount(100bd, currency),
        /* gracePeriodDays */    0)

        var offsetDelta : java.lang.Integer
        for ( event in equityPlan.getOrderedEvents( typekey.DelinquencyReason.TC_PASTDUE ) ) {
          if ( typekey.DelinquencyEventName.TC_CANCELLATION == event.EventName ) {
            offsetDelta = -30 // 14 - event.OffsetDays
            event.TriggerBasis = typekey.DelinquencyTriggerBasis.TC_PAIDTHROUGHDATE
            event.OffsetDays = -14
          } else if ( ( null != offsetDelta ) and ( typekey.DelinquencyTriggerBasis.TC_INCEPTION == event.TriggerBasis ) ) {
            event.OffsetDays = event.OffsetDays + offsetDelta
            event.TriggerBasis = typekey.DelinquencyTriggerBasis.TC_PAIDTHROUGHDATE
          }
        }
      })
    }
    return stdPlan
  }

  /**
   * Generate Delinquency Plans for testing facets of Delinquency handling.
   * @param date the date on which to start the plans
   */
  private function createQADelinquencyPlans(date : java.util.Date) {
    var delinquencyPlanGen = new SampleData.DelinquencyPlan()
    var dlnqReasons = new HashMap<DelinquencyReason, typekey.Workflow>() {
      DelinquencyReason.TC_PASTDUE         -> typekey.Workflow.TC_STDDELINQUENCY,
      DelinquencyReason.TC_FAILURETOREPORT -> typekey.Workflow.TC_SIMPLEFAILURETOREPORT }

    var currency = BCDataBuilder.getDefaultBuilderCurrency()

    // qa-specific delinquency plans
    delinquencyPlanGen.create(currency, null, "QA1DELINQUENCYPLAN01", "Standard Delinquency Plan", date, null,
        CancellationTarget.TC_DELINQUENTPOLICYONLY, typekey.Workflow.TC_STDDELINQUENCY, ApplicableSegments.TC_ALL,
        new MonetaryAmount(10, currency), new MonetaryAmount(20, currency), new MonetaryAmount(5, currency),
        new MonetaryAmount(100, currency), new MonetaryAmount(50, currency))
    delinquencyPlanGen.create(currency, null, "QA1DELINQUENCYPLAN02", "Standard Delinquency Plan", date, null,
        CancellationTarget.TC_DELINQUENTPOLICYONLY, typekey.Workflow.TC_STDDELINQUENCY, ApplicableSegments.TC_ALL,
        new MonetaryAmount(10, currency), new MonetaryAmount(20, currency), new MonetaryAmount(5, currency),
        new MonetaryAmount(100, currency), new MonetaryAmount(50, currency))
    delinquencyPlanGen.create(currency,
        /* publicID */           null,
        /* name */               "QA1DELINQUENCYPLAN03",
        /* description */        "Standard Delinquency Plan with different GracePeriodDays, cancellation threshold, and reinstatement fee",
        /* effectiveDate */      date,
        /* expirationDate */     null,
        /* cancellationTarget */ CancellationTarget.TC_DELINQUENTPOLICYONLY,
        /* reasons */            dlnqReasons,
        /* segments */           ApplicableSegments.TC_ALL,
        /* enterDelinquency */   new MonetaryAmount(10, currency),
        /* cancellation */       new MonetaryAmount(20, currency),
        /* exitDelinquency */    new MonetaryAmount(5, currency),
        /* lateFee */            new MonetaryAmount(100, currency),
        /* reinstatementFee */   new MonetaryAmount(50, currency),
        /* gracePeriodDays */    3)
    delinquencyPlanGen.create(currency, null, "QA1DELINQUENCYPLAN04",
        "AllPoliciesInAccount Standard Delinquency Plan with GracePeriodDays set",
        date, null, CancellationTarget.TC_ALLPOLICIESINACCOUNT, typekey.Workflow.TC_STDDELINQUENCY,
        ApplicableSegments.TC_ALL,
        new MonetaryAmount(10, currency), new MonetaryAmount(20, currency), new MonetaryAmount(5, currency),
        new MonetaryAmount(100, currency), new MonetaryAmount(50, currency), 3)
    delinquencyPlanGen.create(currency, null, "QA1DELINQUENCYPLAN05", "AllPoliciesInAccount Standard Delinquency Plan", date, null,
        CancellationTarget.TC_ALLPOLICIESINACCOUNT, typekey.Workflow.TC_STDDELINQUENCY, ApplicableSegments.TC_ALL,
        new MonetaryAmount(10, currency), new MonetaryAmount(20, currency), new MonetaryAmount(5, currency),
        new MonetaryAmount(100, currency), new MonetaryAmount(50, currency))
    delinquencyPlanGen.create(currency, null, "QA1DELINQUENCYPLAN06", "Test w/ HoldInvoicingOnDlnqPolicies", date, null,
        CancellationTarget.TC_ALLPOLICIESINACCOUNT, typekey.Workflow.TC_STDDELINQUENCY, ApplicableSegments.TC_ALL,
        new MonetaryAmount(10, currency), new MonetaryAmount(20, currency), new MonetaryAmount(5, currency),
        new MonetaryAmount(100, currency), new MonetaryAmount(50, currency), 3, true)
    delinquencyPlanGen.create(currency, null, "QA1DELINQUENCYPLAN07", "No Late Fee Delinquency Plan", date, null,
        CancellationTarget.TC_DELINQUENTPOLICYONLY, typekey.Workflow.TC_STDDELINQUENCY, ApplicableSegments.TC_ALL,
        new MonetaryAmount(10, currency), new MonetaryAmount(20, currency), new MonetaryAmount(5, currency),
        new MonetaryAmount(0, currency), new MonetaryAmount(50, currency))
  }

  private function createReturnPremiumPlan(date: java.util.Date) {
    var returnPremiumPlanGenerator = new SampleData.ReturnPremiumPlan()

    returnPremiumPlanGenerator.create("ret_premium_plan:1", "Default Return Premium Plan",
        "The return premium plan for the system.", date)
  }

  private function createPaymentAllocationPlans() {
    var spreadExcessEvenPlanName = "Spread Excess Even"
    var existingPlan = gw.api.database.Query.make(PaymentAllocationPlan).compare("Name", Equals, spreadExcessEvenPlanName).select()
    if (!existingPlan.Empty) {
      return
    }
    new PaymentAllocationPlanBuilder()
        .withName(spreadExcessEvenPlanName)
        .withDistributionCriterionFilters({DistributionFilterType.TC_POSITIVE})
        .withInvoiceItemOrderings({ InvoiceItemOrderingType.TC_RECAPTUREFIRST, InvoiceItemOrderingType.TC_INVOICE,
               InvoiceItemOrderingType.TC_POLICYPERIOD, InvoiceItemOrderingType.TC_SPREADEXCESSEVEN})
        .createAndCommit()
  }
}
