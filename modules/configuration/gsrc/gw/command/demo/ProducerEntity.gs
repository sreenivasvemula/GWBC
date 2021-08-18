package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.AddressBuilder
uses gw.api.databuilder.CompanyBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.ProducerContactBuilder
uses gw.transaction.Transaction

@Export
class ProducerEntity extends BaseCommand {
  private static var localVersion = "a"

  construct() {
  }

  public static function createAll() : String {
    return "Producer " + 
      getProducer01().Name + 
      " Created"
  }

  public static function getProducer01() : Producer {

    var producerName   = Version.addVersion("01 Acme Insurance", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith25DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserBBaker()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null) {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1( "123 Main Street" )
            .withCity( "Plover")
            .withState("WI")
            .withPostalCode( "54667")
            .withCountry( "US" )
            .create(bundle)
          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName( "Joe Smith" )
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
    }
    return producer
  }

  public static function getProducer02() : Producer {

    var producerName   = Version.addVersion("02 Rainbow Insurance", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith45DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserBBaker()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1( "2288 N Garden St" )
            .withCity( "Boise")
            .withState("ID")
            .withPostalCode( "83706")
            .withCountry("US")
            .create(bundle)
    
          var contact = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName( "Megan Dyer" )
            .create()
          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(contact)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan( "0001" , commissionPlan)
            .withRecurringProducerPayment( "monthly", 15 )
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer03() : Producer {

    var producerName   = Version.addVersion("03 Smith and Co", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith45DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserBBaker()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("2020 Independence Blvd")
            .withCity("Waltham")
            .withState("MA")
            .withPostalCode("02451")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Peggy Lee")
            .create()

          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer04() : Producer {

    var producerName   = Version.addVersion("04 Cost-U-Nothing Insurance", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith25DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserBBaker()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("201 Evergreen Way")
            .withCity("San Jose")
            .withState("CA")
            .withPostalCode("95130")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Michelle Bautista")
            .create()

          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer05() : Producer {

    var producerName   = Version.addVersion("05 Sunset Insurance", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith25DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserBBaker()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("201 Evergreen Way")
            .withCity("San Jose")
            .withState("CA")
            .withPostalCode("95130")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Michelle Bautista")
            .create()
          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer101() : Producer {

    var producerName   = Version.addVersion("Maple Insurance", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith45DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserSuperUser()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("1 Jefferson Blvd")
            .withCity("Los Angeles")
            .withState("CA")
            .withPostalCode("90007")
            .withCountry("US")
            .create(bundle)
          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Joe Everhardt")
            .create()
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer102() : Producer {

    var producerName   = Version.addVersion("Rocky Ridge Assurance Co", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith45DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserSuperUser()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("2 Jefferson Blvd")
            .withCity("Los Angeles")
            .withState("CA")
            .withPostalCode("90007")
            .withCountry("US")
            .create(bundle)
          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Jane Dover")
            .create()          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer103() : Producer {

    var producerName   = Version.addVersion("Placid Services Company", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith45DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserSuperUser()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("3 Jefferson Blvd")
            .withCity("Los Angeles")
            .withState("CA")
            .withPostalCode("90007")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Jim Plover")
            .create()
          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer104() : Producer {

    var producerName   = Version.addVersion("General Insurance Services", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith25DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserSuperUser()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("4 Jefferson Blvd")
            .withCity("Los Angeles")
            .withState("CA")
            .withPostalCode("90007")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Julie Sterns")
            .create()          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer105() : Producer {

    var producerName   = Version.addVersion("All Covered Inc", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith25DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserSuperUser()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("5 Jefferson Blvd")
            .withCity("Los Angeles")
            .withState("CA")
            .withPostalCode("90007")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Jerry Maa")
            .create()          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

  public static function getProducer106() : Producer {

    var producerName   = Version.addVersion("Pacific Insurance Co", localVersion)
    var agencyBillPlan = AgencyBillPlanEntity.getAgencyBillPlanWith25DayLead()
    var commissionPlan = CommissionPlanEntity.getCommissionPlan01()
    var billingRep = UserEntity.getUserSuperUser()
    var producer = GeneralUtil.findProducerByName(producerName)

    if (producer == null)
    {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          var producerContactAddress = new AddressBuilder()
            .withAddressLine1("6 Jefferson Blvd")
            .withCity("Los Angeles")
            .withState("CA")
            .withPostalCode("90007")
            .withCountry("US")
            .create(bundle)

          var company = new CompanyBuilder()
            .withAddress( producerContactAddress)
            .withName("Jenny Craig")
            .create()
          
          var producerContact = new ProducerContactBuilder()
            .asPrimary()
            .withContact(company)
            .create(bundle)

          producer = new ProducerBuilder()
            .withName(producerName)
            .withTier( "silver" )
            .withAccountRep( billingRep)
            .withNegativeAmountsNotUnapplied()
            .withPaymentMethod( typekey.PaymentMethod.TC_CHECK)
            .withAgencyBillPlan(agencyBillPlan)
            .withProducerCodeHavingCommissionPlan("0001", commissionPlan)
            .withRecurringProducerPayment("monthly", 15)
            .withContact( producerContact )
            .create(bundle)
        }
      )
    }
    return producer
  }

}
