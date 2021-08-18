package gw.webservice.bc.bc700

uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.BadIdentifierException

@Export
class APITestBase {

  @Throws(DataConversionException, "If the accountNumber is null.")
  @Throws(BadIdentifierException, "If there are no Accounts with the given accountNumber.")
  function getAccountWithNumber( accountNumber : String ) : Account {
    require(accountNumber, "accountNumber")

    var account = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().getAtMostOneRow()
    if (account == null) {
      throw new BadIdentifierException( accountNumber )
    }
    return account
  }
  
  @Throws(RequiredFieldException, "if the element is null")
  protected function require(element : Object, parameterName : String) {
    if (element == null) {
      throw new RequiredFieldException(parameterName + " cannot be null")  
    }
  }
  
  @Throws(DataConversionException, "if the accountID is null or does not correspond to a valid account")
  @Throws(BadIdentifierException, "If there are no Accounts with the given Account ID.")
  function loadAccount(accountID : String) : Account {
    require(accountID, "accountID")
    var account = gw.api.database.Query.make(Account).compare("PublicID", Equals, accountID).select().getAtMostOneRow()
    if (account == null) {
      throw new BadIdentifierException(accountID)
    }
    
    return account
  }

  @Throws(DataConversionException, "if the policyPeriodID is null or does not correspond to a valid policyperiod")
  @Throws(BadIdentifierException, "If there are no Policy Periods with the given Policy Period ID.")
  function loadPolicyPeriod(policyPeriodID : String) : PolicyPeriod {
    require(policyPeriodID, "policyPeriodID")
    var policyPeriod = gw.api.database.Query.make(PolicyPeriod).compare("PublicID", Equals, policyPeriodID).select().getAtMostOneRow()
    if (policyPeriod == null) {
      throw new BadIdentifierException(policyPeriodID)
    }
    
    return policyPeriod
  }
  
  @Throws(DataConversionException, "if the producerID is null or does not correspond to a valid producer")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer ID.")
  function loadProducer(producerID : String) : Producer {
    require(producerID, "producerID")
    var producer = gw.api.database.Query.make(Producer).compare("PublicID", Equals, producerID).select().getAtMostOneRow()
    if (producer == null) {
      throw new BadIdentifierException(producerID)
    }
    
    return producer;
  }
  
  @Throws(DataConversionException, "if the addressID is null or does not correspond to a valid address")
  @Throws(BadIdentifierException, "If there are no Addresses with the given Address ID.")
  function loadAddress(addressID : String) : Address {
    require(addressID, "addressID")
    var address = gw.api.database.Query.make(Address).compare("PublicID", Equals, addressID).select().getAtMostOneRow()
    if (address == null) {
      throw new BadIdentifierException(addressID)
    }
    
    return address
  }
}