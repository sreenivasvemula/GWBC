package gw.command.demo

uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.Arguments
uses gw.api.database.Query
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.AccountContactBuilder
uses gw.api.databuilder.AddressBuilder
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.CancellationBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.CompanyBuilder
uses gw.api.databuilder.GeneralBillingInstructionBuilder
uses gw.api.databuilder.PersonBuilder
uses gw.api.databuilder.PolicyChangeBillingInstructionBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.ProducerContactBuilder
uses gw.api.databuilder.ReinstatementBillingInstructionBuilder
uses gw.api.databuilder.RenewalBillingInstructionBuilder
uses gw.api.util.DateUtil
uses gw.api.web.payment.DirectBillPaymentFactory
uses gw.command.BCBaseCommand
uses gw.transaction.Transaction

uses java.util.Date

@Export
class Tools extends BCBaseCommand {
  construct() {
    super()
  }

  /**********************************************
    THE FOLLOWING METHODS DO NOT NEED ANY CONTEXT
    THEY CAN BE RUN FROM ANY PAGE IN THE APPL. 
  ***********************************************/

  /**
  * Adds a new direct bill policy with specified premium and returns it.<br>
  * Takes one param - Premium Charge Amount.<br>
  */
  @Arguments("getNewAccount")
  @Arguments("getNewProducer")
  @Arguments("addNewPolicy_DB")
  public function getNewPolicy_DB() : PolicyPeriod {
    var account = getNewAccount()
    var producer = getNewProducer()
    var policyPeriod = addNewPolicy_DB(account, producer)
    pcf.PolicyDetailSummary.go(policyPeriod);
    return policyPeriod
  }


  /**
  * Adds a new agency bill policy with specified premium and returns it.
  * Takes one param - Premium Charge Amount.<br>
  * Creates a new producer.
  */
  @Arguments("getNewAccount")
  @Arguments("getNewProducer")
  @Arguments("addNewPolicy_AB")
  public function getNewPolicy_AB() : PolicyPeriod {
    var account = getNewAccount()
    var producer = getNewProducer()
    var policyPeriod = addNewPolicy_AB(account, producer)
    pcf.PolicyDetailSummary.go(policyPeriod);
    return policyPeriod
  }


  /**
  * Adds a new account and returns it.<br>
  */
  @Argument("Account Name", "")
  @Argument("Account Contact First Name", "")
  @Argument("Account Contact Last Name", "")
  @Argument("Billing Plan",  Query.make(BillingPlan).select().toCollection())
  @Argument("Delinquency Plan Name", Query.make(DelinquencyPlan).select().toCollection())
  public function getNewAccount() : Account {

    var account : Account

    var name = getArgumentAsString("Account Name")
    if ((name == null) || (name == ""))
      name = BCDataBuilder.createRandomWordPair()
    else if (GeneralUtil.doesAccountWithNameExist(name))
      name = BCDataBuilder.createRandomWordPair()

    var accountContactFirstName = getArgumentAsString("Account Contact First Name")
    if ((accountContactFirstName == null) || (accountContactFirstName == ""))
      accountContactFirstName = name.split( "-" )[0]

    var accountContactLastName  = getArgumentAsString("Account Contact Last Name")
    if ((accountContactLastName == null) || (accountContactLastName == ""))
      accountContactLastName = name.split( "-" )[name.split( "-" ).length-1]
 
    var billingPlanName  = getArgumentAsString("Billing Plan")
    var billingPlan :BillingPlan
    if ((billingPlanName != null) || (billingPlanName != ""))
      billingPlan = GeneralUtil.findBillingPlanByName(billingPlanName)
    if (billingPlan == null) 
      billingPlan = BillingPlanEntity.getBillingPlan01()

    var delinquencyPlanName  = getArgumentAsString("Delinquency Plan Name")
    var delinquencyPlan :DelinquencyPlan
    if ((delinquencyPlanName  != null) || (delinquencyPlanName  != ""))
      delinquencyPlan = GeneralUtil.findDelinquencyPlanByPublicId(delinquencyPlanName)
    if (delinquencyPlan == null) 
      delinquencyPlan = DelinquencyPlanEntity.getInsuredAcccountDelinquencyPlan()

    Transaction.runWithNewBundle( \ bundle -> 
      {
        var accountContactAddress  = new AddressBuilder()
          .withAddressLine1( "1 Pearl Road" )
          .withCity( "Cleveland")
          .withState("OH")
          .withPostalCode("44130")
          .withCountry( "US" )
          .create(bundle)
    
        var person = new PersonBuilder()
          .withFirstName( accountContactFirstName )
          .withLastName( accountContactLastName )
          .withAddress( accountContactAddress)
          .withWorkPhone( "440-234-2185" )
          .create()        
        var accountContactBuilder = new AccountContactBuilder()
          .asPrimaryPayer()
          .withContact(person)
          .withRole( "insured" )

        account = new AccountBuilder()
          .withName( name )
          .withBillingPlan(billingPlan)
          .withDelinquencyPlan(delinquencyPlan)
          .withDistributionUpToAmountUnderContract()

//          .withInvoiceDayOfMonth(3)
          .withInvoiceDayOfWeek("Friday")
          .withTwicePerMonthInvoiceDaysOfMonth(1, 15)
          .asDueDateBilling()
          .withInvoiceDayOfMonth( 31 )
          .withEveryOtherWeekInvoiceAnchorDate(DateUtil.currentDate())
          .asMailInvoiceDeliveryMethod()
          .withPaymentMethod("ach")
          .addSoleContact( accountContactBuilder )
          .withOrganizationType("")
          .withFEIN("719-98-0921")
          .create(bundle)
      }
    )

    pcf.AccountDetailSummary.go(account);
    return account
  }

  /**
  * Adds a new producer and returns it.<br>
  */
  @Argument("Producer Name", "")
  @Argument("Commission Plan",  Query.make(CommissionPlan).select().toCollection())
  @Argument("Agency Bill Plan",  Query.make(AgencyBillPlan).select().toCollection())
  public function getNewProducer() : Producer {

    var producerName  = getArgument("Producer Name")
    if ((producerName  == null) || (producerName  == ""))
      producerName = BCDataBuilder.createRandomWordPair()
    else if (GeneralUtil.doesProducerWithNameExist(producerName))
      producerName = BCDataBuilder.createRandomWordPair()

    var commissionPlanName  = getArgumentAsString("Commission Plan")
    var commissionPlan : CommissionPlan
    if ((commissionPlanName != null) || (commissionPlanName != ""))
      commissionPlan = GeneralUtil.findCommissionPlanByName(commissionPlanName)
    if (commissionPlan == null)
      commissionPlan = CommissionPlanEntity.getCommissionPlan01()

    var agencyBillPlanName = getArgumentAsString("Agency Bill Plan")
    var agencyBillPlan : AgencyBillPlan
    if ((agencyBillPlanName != null) || (agencyBillPlanName != ""))
      agencyBillPlan = GeneralUtil.findAgencyBillPlanByName(agencyBillPlanName)
    if (agencyBillPlan == null)
      agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith45DayLead()

    var currentmmss = DateUtil.currentDate().format( "mmss" )

    var billingRep = UserEntity.getUserSuperUser()
    var producer: Producer

    Transaction.runWithNewBundle( \ bundle -> 
      {
        var producerContactAddress = new AddressBuilder()
          .withAddressLine1( currentmmss +" Main Street" )
          .withCity( "Poughkeepsie")
          .withState("NY")
          .withPostalCode( "12603")
          .withCountry( "US" )
          .create(bundle)

        var company = new CompanyBuilder()
          .withAddress( producerContactAddress)
          .withName( "Mary Smith" )
          .create()        
        var producerContact = new ProducerContactBuilder()
          .asPrimary()
          .withContact(company)
          .create(bundle)

        producer = new ProducerBuilder()
          .withName(producerName)
          .withTier("gold")
          .withAccountRep(billingRep)
          .withNegativeAmountsNotUnapplied()
          .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
          .withAgencyBillPlan(agencyBillPlan)
          .withProducerCodeHavingCommissionPlan("0001" , commissionPlan)
          .withRecurringProducerPayment("monthly", 15)
          .withContact(producerContact)
        .create(bundle)
      }
    )
    pcf.ProducerDetail.go(producer)
    return producer
  }


  /**
  * This method is here to just support @Arguments annotation.
  * Call scans only for methods that take no param.
  */
  @Argument("Premium", "1000")
  @Argument("Tax", "0")
  @Argument("Effective Date", (DateUtil.currentDate() as java.lang.String))
  @Argument("Payment Plan", Query.make(PaymentPlan).select().toCollection())
  private function addNewPolicy_DB() {
   // Empty impl. to make the arguments annotation work. See the full impl below.  
  }

  
  /**
  * Adds a direct policy to the specified account with the specified premium amount<br>
  * params
  *   <ol>
  *    <li>account : account to create the policy on
  *    <li>producer: producer to use for the policy
  * </ol>
  * NOTE: This is not exposed ot the QJBox (private)... it is called from a few places in this class.<br>
  */
  private function addNewPolicy_DB(account : Account, producer : Producer) : PolicyPeriod {
    var policyPeriod: PolicyPeriod
    if (account != null && producer != null) {

      var paymentPlanName  = getArgumentAsString("Payment Plan")
      var paymentPlan : PaymentPlan
      if ((paymentPlanName != null) || (paymentPlanName != ""))
        paymentPlan = GeneralUtil.findPaymentPlanByName(paymentPlanName)
      if (paymentPlan == null)
        paymentPlan = new PaymentPlanEntity().getMonthlyPlan()

      var premium = getArgumentAsMonetaryAmount("Premium", account.Currency)
      if (premium.IsZero)
        premium = 1000bd.ofCurrency(producer.Currency)

      var tax = getArgumentAsMonetaryAmount("Tax", account.Currency)

      var effDateString = getArgumentAsString("Effective Date")
      var effDate : Date
      if (effDateString == null || effDateString == "") {
        effDate = DateUtil.currentDate()
      } else {
        effDate = effDateString as Date
      }

      Transaction.runWithNewBundle( \ bundle -> 
        {
          var policyPeriodBuilder = new PolicyPeriodBuilder()
            .onAccount(account)
            .withPaymentPlan(paymentPlan.Name)
            .asDirectBill()
            .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
            .withEffectiveDate( effDate)
            .withExpirationDate( effDate.addYears( 1 ))
            .withDelinquencyPlan(DelinquencyPlanEntity.getListBillPolicyLevelDelinquencyPlan())

         if (tax.IsZero)
           policyPeriodBuilder.withPremiumWithDepositAndInstallments( premium )
          else
            policyPeriodBuilder.withPremiumAndTaxes(premium, tax)
           
           policyPeriod = policyPeriodBuilder.create(bundle)
        }
      )
    }
    return policyPeriod
  }


  /**
  * This method is here to just support @Call annotation.
  * Call scans only for methods that take no param.
  */
  @Argument("Premium", "1000")
  @Argument("Effective Date", (DateUtil.currentDate() as java.lang.String))
  @Argument("Payment Plan", "")
  private function addNewPolicy_AB(){   
    // Empty impl. See the full imple below.  
  }

  /**
  * Adds an agency bill policy to the specified account with the specified premium amount<br>
  * params
  *   <ol>
  *    <li>account : account to create the policy on
  *    <li>producer: producer to use for the policy
  *    <li>premium: premium amount - big decimal
  * </ol>
  * NOTE: This is not exposed to the QJBox (private)... itis called from a few places in this class.<br>
  */
  private function addNewPolicy_AB(account : Account, producer : Producer) : PolicyPeriod {
    var policyPeriod: PolicyPeriod
    if (account != null && producer != null) {

      var paymentPlanName  = getArgumentAsString("Payment Plan")
      var paymentPlan : PaymentPlan
      if ((paymentPlanName != null) || (paymentPlanName != ""))
        paymentPlan = GeneralUtil.findPaymentPlanByName(paymentPlanName)
      if (paymentPlan == null)
        paymentPlan = new PaymentPlanEntity().getMonthlyPlan()

      var premium = getArgumentAsMonetaryAmount("Premium", producer.Currency)
      if (premium.IsZero)
        premium = 1000bd.ofCurrency(producer.Currency)

      var effDate = getArgumentAsString("Effective Date") as Date
      if ((effDate != null) || (effDate as String != ""))
        effDate = DateUtil.currentDate()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          policyPeriod = new PolicyPeriodBuilder()
            .onAccount(account)
            .withPaymentPlan(paymentPlan.Name)
            .asAgencyBill()
            .withPrimaryProducerCode(GeneralUtil.findFirstProducerCode(producer.Name))
            .withEffectiveDate( effDate)
            .withExpirationDate( effDate.addYears( 1 ))
            .withPremiumWithDepositAndInstallments( premium )
            .create(bundle)
        }
      )
    }
    return policyPeriod
  }

  /**********************************************
    THE FOLLOWING METHODS NEEDS ACCOUNT CONTEXT 
  ***********************************************/

  /**
  * Adds a direct bill policy to the currently open account with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * If the currently displayed pcf does not have a reference to an account, then it does nothing<br>
  */
  @Arguments("getNewProducer")
  @Arguments("addNewPolicy_DB")
  public function accountAddNewPolicy_DB() : PolicyPeriod {
    var account = getCurrentAccount()
    var policyPeriod : PolicyPeriod
    var producer = getNewProducer()
    policyPeriod = addNewPolicy_DB(account, producer)
    pcf.PolicyDetailSummary.go(policyPeriod);
    return policyPeriod
  }



  /**
  * Adds an agency bill policy to the currently open account with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * If the currently displayed pcf does not have a reference to an account, then it does nothing<br>
  */
  @Argument("Producer Name", "Cost U Nothing")
  @Arguments("addNewPolicy_AB")
  @Arguments("getNewProducer")
  public function accountAddNewPolicy_AB() : PolicyPeriod {
    var policyPeriod : PolicyPeriod
    var account = getCurrentAccount()
    var producer = getNewProducer()
    policyPeriod = addNewPolicy_AB (account, producer)
    pcf.PolicyDetailSummary.go(policyPeriod);
    return policyPeriod
  }


  /**
  *  This bills the first planned statement of the account that is currently open.<br>
  * If the currently displayed pcf does not have a reference to an account, then it does nothing<br>
  */
  public function accountMakeNextInvoiceBilled() : String {
    //if (account == null)
    var account = getCurrentAccount() 
    var invoices = account.InvoicesSortedByDate
    var nextPlannedInvoice = invoices.firstWhere(\ i -> i.Status == "planned")
    print("nextPlannedInvoice = " + nextPlannedInvoice)
    if (nextPlannedInvoice != null) {
      var d = nextPlannedInvoice.Date
      if (DateUtil.daysSince(d) < 0)    //  If dayssince(d) is negative, then the day is in the future.
        new GeneralUtil().setClockToDate(d)  //   In other words, move clock forward if necessary (and not backward).
        runBatchProcess( BatchProcessType.TC_INVOICE)  // Run the batch process
      pcf.AccountDetailInvoices.go(account);
      return "Invoice Billed"
    }
    pcf.AccountDetailInvoices.go(account)
    return "No Planned Invoice Found"
  }

  /**
  * Posts a payment to the currently open account.<br>
  * Takes one param - Payment Amount in Dollars.<br>
  * <p>To Demo: Direct Bill Account Payment.<br>
  */
  @Argument("Payment", "1000")
  public function accountMakePayment(): DirectBillPayment
  {
    var account = getCurrentAccount()
    var paymentAmount = getArgumentAsMonetaryAmount("Payment", account.Currency)
    var moneyReceived = DirectBillPaymentFactory.pay(account, paymentAmount)
    account.getBundle().commit()
    pcf.AccountPayments.go(account)
    return moneyReceived.getDirectBillPayment()
  }

  /**********************************************
    THE FOLLOWING METHODS NEEDS POLICY CONTEXT 
  ***********************************************/

  /**
  * Endorses the current policyperiod with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * <p>To Demo: Direct Bill Endorsements.<br>
  * If the currently displayed pcf does not have a reference to a policyperiod, then it does nothing<br>
  */
  @Argument("Premium", "1000")
  @Argument("Tax", "50")
  @Argument("Description", "Removed Landrover")
  public function ppEndorse() : PolicyPeriod {
    var policyPeriod = getCurrentPolicyPeriod()
    var endorsementEffectiveFromDate = DateUtil.currentDate()// .addDays( 60 )
    var premium = getArgumentAsMonetaryAmount("Premium", policyPeriod.Currency)
    var tax = getArgumentAsMonetaryAmount("Tax", policyPeriod.Currency)
    var description = getArgument("Description")
    Transaction.runWithNewBundle( \ bundle -> 
      {
        var pcbib = new PolicyChangeBillingInstructionBuilder()
          .onPolicyPeriod(policyPeriod)
          .withPolicyChangeDate(endorsementEffectiveFromDate)

        if (premium.IsNotZero)
          pcbib.withChargeBuilder(new ChargeBuilder().asPremium().withAmount(premium).onPolicyPeriod(policyPeriod))

        if (tax.IsNotZero)
          pcbib.withChargeBuilder(new ChargeBuilder().asTaxes().withAmount(tax).onPolicyPeriod(policyPeriod))

          pcbib.withDescription(description)
          .execute()
          .create(bundle)
      }
    )
    return policyPeriod
  }


  /**
  * Cancels the current policyperiod (if it is not already cancelled) with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * <p>To Demo: AGBL and Direct Bill Cancellation.<br>
  * If the currently displayed pcf does not have a reference to a policyperiod, then it does nothing<br>
  */
  @Argument("Premium", "-1000")
  public function ppCancel() : PolicyPeriod {
    var policyPeriod = getCurrentPolicyPeriod()
    if (policyPeriod.CancelStatus != "canceled" ) {
      var cancellationEffectiveFromDate = DateUtil.currentDate()
      var premium = getArgumentAsMonetaryAmount("Premium", policyPeriod.Currency)
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var cancellation = new CancellationBuilder()
            .onPolicyPeriod(policyPeriod)
            .withCancellationDate( cancellationEffectiveFromDate)
            .withChargeBuilder(new ChargeBuilder().asPremium().withAmount(premium).onPolicyPeriod(policyPeriod))
            .execute()
            .create(bundle)

          for (var c in cancellation.Charges) {
            c.createBilledTransactions()
          }
        }
      )
    }
    return policyPeriod
  }

  /**
  * <p>Re-instates the current policyperiod (if it is cancelled) with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * <p>To Demo: AGBL and Direct Bill Re-instatement.<br>
  * If the currently displayed pcf does not have a reference to a policyperiod, then it does nothing<br>
  */
  @Argument("Premium", "1000")
  public function ppReinstate() : PolicyPeriod {
    var policyPeriod = getCurrentPolicyPeriod()
    if (policyPeriod.CancelStatus == "canceled" ) {
      var reinstatementEffectiveFromDate = DateUtil.currentDate()
      var premium = getArgumentAsMonetaryAmount("Premium", policyPeriod.Currency)
      Transaction.runWithNewBundle( \ bundle -> 
        {
          new ReinstatementBillingInstructionBuilder()
            .onPolicyPeriod(policyPeriod)
            .withReinstatementDate( reinstatementEffectiveFromDate )
            .withChargeBuilder(new ChargeBuilder().asPremium().withAmount(premium).onPolicyPeriod(policyPeriod))
            .create(bundle)
            .execute()
         }
      )
    }
    else
      displayMessageAndExit("The current PolicyPeriod is not cancelled.")

    return policyPeriod
  }

  /**
  * <p>Renews the current policyperiod (if it does not have a next term) and adds a premium charge to the renewed term.<br>
  * Takes one param - Premium Charge Amount.<br>
  * <p>To Demo: AGBL and Direct Bill Re-instatement.
  * If the currently displayed pcf does not have a reference to a policyperiod, then it does nothing<br>
  */
  @Argument("Premium", "1500")
  public function ppRenew() : PolicyPeriod {
    var policyPeriod = getCurrentPolicyPeriod()
    var nextPolicyPeriod = policyPeriod.NextPolicyPeriod
    if (nextPolicyPeriod == null) {
      var premium = getArgumentAsMonetaryAmount("Premium", policyPeriod.Currency)
      Transaction.runWithNewBundle( \ bundle -> 
        {
          new RenewalBillingInstructionBuilder()
            .withChargeBuilder(new ChargeBuilder().asPremium().withAmount(premium).onPolicyPeriod(policyPeriod))
            .withPriorPolicyPeriod( policyPeriod )
            .create(bundle)
            .execute()
        }
      )
      nextPolicyPeriod = policyPeriod.NextPolicyPeriod
    }
    else
      displayMessageAndExit("This policyPeriod is already renewed")

    return nextPolicyPeriod
  }


  /**
  * <p>Set up Monthly Payment Terms<br>
  */
  @Argument("Number of Items", "3")
  public function ppCreatePaymentTerms() : PolicyPeriod {
    var policyPeriod = getCurrentPolicyPeriod()
    var unpaidBalance = policyPeriod.OutstandingAmount + policyPeriod.UnbilledAmount
    
    var numberOfItems = getArgumentAsInt("Number of Items")
    if (numberOfItems == 0)
      numberOfItems = DateUtil.differenceInDays(DateUtil.currentDate(), policyPeriod.ExpirationDate)/30
    
    var itemAmount = (unpaidBalance/numberOfItems)
    var lastItemAmount = (unpaidBalance - itemAmount*(numberOfItems-1))
    
    var counter = 0;

    Transaction.runWithNewBundle( \ bundle -> 
      {
        var generalBIBuilder = new GeneralBillingInstructionBuilder()
          .withChargeBuilder(new ChargeBuilder().asPremium().withAmount(-unpaidBalance).onPolicyPeriod(policyPeriod))

          while(counter<= numberOfItems -2) {
            generalBIBuilder.withChargeBuilder(new ChargeBuilder().asPremium().withAmount(itemAmount).onPolicyPeriod(policyPeriod))
            counter++
          }
          generalBIBuilder.withChargeBuilder(new ChargeBuilder().asPremium().withAmount(lastItemAmount).onPolicyPeriod(policyPeriod))

          generalBIBuilder.withMaximumNumberOfInstallments(1)
          .withDownPaymentPercent(0)
          .onPolicyPeriod(policyPeriod)
          .create(bundle)
          .execute()
      }
    )
       
    return policyPeriod
  }

  public function ppAssignPolicyChargesToParent() : String {
    var policyPeriod = getCurrentPolicyPeriod()
    var charges = policyPeriod.Charges
    var parentAccount = policyPeriod.Account.ParentAccount
//    print (parentAccount)

    if (parentAccount != null && charges.HasElements) {
      for (c in charges) {
        print(c)
        var items = c.AllInvoiceItems
        parentAccount.becomePayerOfInvoiceItems(false, null, No, items)
        c.Bundle.add(policyPeriod)
        c.Bundle.commit()
      }
    }

    return "Assigned"
  }

  /**********************************************
    THE FOLLOWING METHODS NEEDS PRODUCER CONTEXT 
  ***********************************************/

  /**
  * Adds a direct bill policy to the currently open producer with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * If the currently displayed pcf does not have a reference to a producer, then it does nothing<br>
  */
  @Arguments("getNewAccount")
  @Arguments("addNewPolicy_DB")
  public function producerAddNewPolicy_DB() : PolicyPeriod {
    var producer = getCurrentProducer()
    var account = getNewAccount()
    var policyPeriod = addNewPolicy_DB(account, producer)
    pcf.ProducerAgencyBillCycles.go(producer);
    return policyPeriod    
  }


  /**
  * Adds an agency bill policy to the currently open producer with a premium charge.<br>
  * Takes one param - Premium Charge Amount.<br>
  * If the currently displayed pcf does not have a reference to a producer, then it does nothing<br>
  */
  @Arguments("getNewAccount")
  @Arguments("addNewPolicy_AB")
  public function producerAddNewPolicy_AB() : PolicyPeriod {
    var producer = getCurrentProducer()
    var account = getNewAccount()
    var policyPeriod = addNewPolicy_AB (account, producer)
    pcf.ProducerAgencyBillCycles.go(producer);
    return policyPeriod
  }

}
