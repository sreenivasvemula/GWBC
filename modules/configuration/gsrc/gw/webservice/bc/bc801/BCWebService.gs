package gw.webservice.bc.bc801

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader

/**
 * This is the base class for BC RPC webservices.  WSI webservices have no need of this class.
 *
 * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI instead.
 */
@Export
@java.lang.Deprecated
class BCWebService {

  /**
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#getAccountInfo instead.
   */
  @Throws(DataConversionException, "If the accountNumber is null.")
  @Throws(BadIdentifierException, "If there are no Accounts with the given accountNumber.")
  @java.lang.Deprecated
  function getAccountWithNumber( accountNumber : String ) : Account {
   return WebserviceEntityLoader.loadAccountByAccountNumber(accountNumber)
  }

  /**
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#getAccountInfo instead.
   */
  @Throws(DataConversionException, "if the accountID is null or does not correspond to a valid account")
  @Throws(BadIdentifierException, "If there are no Accounts with the given Account ID.")
  @java.lang.Deprecated
  function loadAccount(accountID : String) : Account {
    return WebserviceEntityLoader.loadAccount(accountID)
  }

  /**
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#getPolicyPeriodInfo instead.
   */
  @Throws(DataConversionException, "if the policyPeriodID is null or does not correspond to a valid policyperiod")
  @Throws(BadIdentifierException, "If there are no Policy Periods with the given Policy Period ID.")
  @java.lang.Deprecated
  function loadPolicyPeriod(policyPeriodID : String) : PolicyPeriod {
    return WebserviceEntityLoader.loadPolicyPeriod(policyPeriodID)
  }

  /**
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#getProducerInfo instead.
   */
  @Throws(DataConversionException, "if the producerID is null or does not correspond to a valid producer")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer ID.")
  @java.lang.Deprecated
  function loadProducer(producerID : String) : Producer {
    return WebserviceEntityLoader.loadProducer(producerID)
  }

  /**
   * @deprecated (Since 8.0.1) Removed.
   */
  @Throws(DataConversionException, "if the addressID is null or does not correspond to a valid address")
  @Throws(BadIdentifierException, "If there are no Addresses with the given Address ID.")
  @java.lang.Deprecated
  function loadAddress(addressID : String) : Address {
    return WebserviceEntityLoader.loadAddress(addressID)
  }
}
