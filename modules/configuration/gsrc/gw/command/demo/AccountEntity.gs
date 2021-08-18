package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.AccountContactBuilder
uses gw.api.databuilder.AddressBuilder
uses gw.api.databuilder.PersonBuilder
uses gw.transaction.Transaction

@Export
class AccountEntity extends BaseCommand {
  private static var localVersion = "a"

  construct() {
    super()
  }

  public static function createAll() : String {
    getEmployerAccount()
    getEmployee01()
    getEmployee02()
    getEmployee03()
    return "Accounts Created"
  }

  /**
  * Finds Account01 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getEmployerAccount() : Account {

    var accountName  = Version.addVersion("Generous Employer", localVersion)
    var accountNumber = Version.addVersion("9991", localVersion)
    var account = GeneralUtil.findAccountByName(accountName)

    if (account == null) {
      var delinquencyPlan = DelinquencyPlanEntity.getListBillPayerDelinquencyPlan()
      var billingPlan = BillingPlanEntity.getBillingPlan01()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          var accountContactAddress  = new AddressBuilder()
            .withAddressLine1( "121 Topanga Canyon Road" )
            .withCity( "Malibu")
            .withState("CA")
            .withPostalCode("90134")
            .withCountry( "US" )
            .create(bundle)
      
          var person = new PersonBuilder()
            .withFirstName( "Jim" )
            .withLastName( "Mason")
            .withAddress( accountContactAddress)
            .withWorkPhone( "310-341-2185" )
            .create()
          
          var accountContactBuilder = new AccountContactBuilder()
            .withContact(person)
            .asPrimaryPayer()
            .withRole( "insured" )

          account = new AccountBuilder()
            .withName( accountName)
            .withNumber( accountNumber)
            .withBillingPlan(billingPlan)
            .withDelinquencyPlan(delinquencyPlan)
            .withInvoiceDayOfMonth(15)
            .asMailInvoiceDeliveryMethod()
            .withPaymentMethod("ach")
            .addSoleContact( accountContactBuilder )
            .withOrganizationType("")
            .withFEIN("430-91-9021")
            .create(bundle)
        }
      )
    }
//    pcf.AccountDetailSummary.go(account);
    return account
  }

  /**
  * Finds Employee01 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getEmployee01() : Account {

    var accountName  = Version.addVersion("Employee Larry", localVersion)
    var accountNumber = Version.addVersion("0001", localVersion)
    var account = GeneralUtil.findAccountByName(accountName)

    if (account == null) {
      var delinquencyPlan = DelinquencyPlanEntity.getInsuredAcccountDelinquencyPlan()
      var billingPlan = BillingPlanEntity.getBillingPlan01()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          var accountContactAddress  = new AddressBuilder()
            .withAddressLine1( "461 Ocean Blvd" )
            .withCity( "Miami Beach")
            .withState("FL")
            .withPostalCode("33139")
            .withCountry( "US" )
            .create(bundle)

          var person = new PersonBuilder()
            .withFirstName( "Sally" )
            .withLastName( "Fields")
            .withAddress( accountContactAddress)
            .withWorkPhone( "213-142-8567" )
            .create()
          
          var accountContactBuilder = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .withRole( "insured" )

          account = new AccountBuilder()
            .withName( accountName)
            .withNumber( accountNumber)
            .withParentAccount(getEmployerAccount())
            .withBillingPlan(billingPlan)
            .withDelinquencyPlan(delinquencyPlan)
            .withInvoiceDayOfMonth(3)
            .asMailInvoiceDeliveryMethod()
            .withPaymentMethod( "ach" )
            .addSoleContact( accountContactBuilder )
            .withOrganizationType("")
            .withFEIN("120-43-0980")
            .create(bundle)
        }
      )
    }
//    pcf.AccountDetailSummary.go(account);
    return account
  }

  /**
  * Finds Employee 02 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
  public static function getEmployee02() : Account {

    var accountName  = Version.addVersion("Employee Curly", localVersion)
    var accountNumber = Version.addVersion("0002", localVersion)
    var account = GeneralUtil.findAccountByName(accountName)

    if (account == null) {
      var billingPlan = BillingPlanEntity.getBillingPlan01()
      var delinquencyPlan = DelinquencyPlanEntity.getInsuredAcccountDelinquencyPlan()
      
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var accountContactAddress  = new AddressBuilder()
            .withAddressLine1( "2 Lincoln Blvd" )
            .withCity( "San Francisco")
            .withState("CA")
            .withPostalCode("94118")
            .withCountry( "US" )
            .create(bundle)

          var person = new PersonBuilder()
            .withFirstName( "Charlie" )
            .withLastName( "Brown")
            .withAddress( accountContactAddress)
            .withWorkPhone( "415-550-2929" )
            .create()
                      
          var accountContactBuilder = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .withRole( "insured" )

          account = new AccountBuilder()
            .withName( accountName)
            .withNumber( accountNumber)
            .withParentAccount(getEmployerAccount())
            .withBillingPlan(billingPlan)
            .withDelinquencyPlan(delinquencyPlan)
            .withInvoiceDayOfMonth(18)
            .asMailInvoiceDeliveryMethod()
            .withPaymentMethod( "ach" )
            .addSoleContact( accountContactBuilder )
            .withOrganizationType("")
            .withFEIN("314-02-9100")
            .create(bundle)
        }
      )
    }
//    pcf.AccountDetailSummary.go(account);
    return account
  }
 
   /**
  * Finds Account04 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
   public static function getEmployee03() : Account {

    var accountName  = Version.addVersion("Employee Moe", localVersion)
    var accountNumber = Version.addVersion("0003", localVersion)
    var account = GeneralUtil.findAccountByName(accountName)

    if (account == null) {
      var billingPlan = BillingPlanEntity.getBillingPlan01()
      var delinquencyPlan = DelinquencyPlanEntity.getInsuredAcccountDelinquencyPlan()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          var accountContactAddress  = new AddressBuilder()
            .withAddressLine1( "121 Wilshire Blvd" )
            .withCity( "Los Angeles")
            .withState("CA")
            .withPostalCode("90047")
            .withCountry( "US" )
            .create(bundle)

          var person = new PersonBuilder()
            .withFirstName( "Steve" )
            .withLastName( "Smith")
            .withAddress( accountContactAddress)
            .withWorkPhone( "213-397-2091" )
            .create()
                      
          var accountContactBuilder = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .withRole( "insured" )

          account = new AccountBuilder()
            .withName( accountName)
            .withNumber( accountNumber)
            .withParentAccount(getEmployerAccount())
            .withBillingPlan(billingPlan)
            .withDelinquencyPlan(delinquencyPlan)
            .withInvoiceDayOfMonth(1)
            .asMailInvoiceDeliveryMethod()
            .withPaymentMethod( "ach" )
            .addSoleContact( accountContactBuilder )
            .withOrganizationType("")
            .withFEIN("640-18-5654")
            .create(bundle)
        }
      )
    }
//    pcf.AccountDetailSummary.go(account);
    return account
  }

  /**
  * Finds Account05 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
   public static function getAccount05() : Account {

    var accountName  = Version.addVersion("05 Pure Water", localVersion)
    var accountNumber = Version.addVersion("0005", localVersion)
    var account = GeneralUtil.findAccountByName(accountName)

    if (account == null) {
      var billingPlan = BillingPlanEntity.getBillingPlan01()
      var delinquencyPlan = DelinquencyPlanEntity.getInsuredAcccountDelinquencyPlan()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          var accountContactAddress  = new AddressBuilder()
            .withAddressLine1( "121 La Brea Blvd" )
            .withCity( "Los Angeles")
            .withState("CA")
            .withPostalCode("90068")
            .withCountry( "US" )
            .create(bundle)

          var person = new PersonBuilder()
            .withFirstName( "Lindsay" )
            .withLastName( "Buckingham")
            .withAddress( accountContactAddress)
            .withWorkPhone( "310-109-6831" )
            .create()
          
          var accountContactBuilder = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .withRole( "insured" )

          account = new AccountBuilder()
            .withName( accountName)
            .withNumber( accountNumber)
            .withBillingPlan(billingPlan)
            .withDelinquencyPlan(delinquencyPlan)
            .asDueDateBilling()
            .withInvoiceDayOfMonth( 15 )
            .asMailInvoiceDeliveryMethod()
            .withPaymentMethod( "ach" )
            .addSoleContact( accountContactBuilder )
            .withOrganizationType("")
            .withFEIN("123-21-0912")
            .create(bundle)
        }
      )
    }
    pcf.AccountDetailSummary.go(account);
    return account
  }

  /**
  * Finds Account06 in database. <br>
  * If it finds one then it returns it. <br>
  * Else it creates and returns it.<br>
  */
   public static function getAccount06() : Account {

    var accountName  = Version.addVersion("06 Stone Rollers Inc.", localVersion)
    var accountNumber = Version.addVersion("0006", localVersion)
    var account = GeneralUtil.findAccountByName(accountName)


    if (account == null) {
      var billingPlan = BillingPlanEntity.getBillingPlan01()
      var delinquencyPlan = DelinquencyPlanEntity.getInsuredAcccountDelinquencyPlan()

      Transaction.runWithNewBundle( \ bundle -> 
        {
          var accountContactAddress  = new AddressBuilder()
            .withAddressLine1( "210 S. Michigan Ave" )
            .withCity( "Chicago")
            .withState("IL")
            .withPostalCode("60616")
            .withCountry( "US" )
            .create(bundle)

          var person = new PersonBuilder()
            .withFirstName( "Michael" )
            .withLastName( "Haggard")
            .withAddress( accountContactAddress)
            .withWorkPhone( "312-326-7970" )
            .create()
          
          var accountContactBuilder = new AccountContactBuilder()
            .asPrimaryPayer()
            .withContact(person)
            .withRole( "insured" )

          account = new AccountBuilder()
            .withName( accountName)
            .withNumber( accountNumber)
            .withBillingPlan(billingPlan)
            .withDelinquencyPlan(delinquencyPlan)
            .asDueDateBilling()
            .withInvoiceDayOfMonth( 15 )
            .asMailInvoiceDeliveryMethod()
            .withPaymentMethod( "ach" )
            .addSoleContact( accountContactBuilder )
            .withOrganizationType("")
            .withFEIN("123-21-0912")
            .create(bundle)
        }
      )
    }
    pcf.AccountDetailSummary.go(account);
    return account
  }
}