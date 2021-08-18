package gw.search

uses gw.api.database.IQueryBeanResult
uses gw.pl.currency.MonetaryAmount

uses java.io.Serializable
uses java.util.Date

/**
 * Criteria used to perform a payment search in the PaymentSearchDV as well
 * as the AgencyMoneyReceived search on AgencyMoneyReceivedSearchDV.
 */
@Export
class PaymentSearchCriteria implements Serializable  {

  private var _earliestDate : Date as EarliestDate
  private var _latestDate : Date as LatestDate
  private var _minAmount : MonetaryAmount as MinAmount
  private var _maxAmount : MonetaryAmount as MaxAmount
  private var _producerName : String as ProducerName
  private var _producerNameKanji : String as ProducerNameKanji
  private var _producerCode : String as ProducerCode
  private var _accountNumber : String as AccountNumber
  private var _policyNumber : String as PolicyNumber
  private var _ownerOfActiveSuspenseItems : boolean as OwnerOfActiveSuspenseItems
  
  private var _method : PaymentMethod as Method
  private var _token : String as Token
  private var _checkNumber : String as CheckNumber
  private var _currency : Currency as CurrencyType
  
  private var _directBillMoneyReceivedCriteria : DirectBillMoneyRcvdSearchStrategy as DirectBillMoneyReceivedCriteria
  private var _agencyMoneyReceivedCriteria : AgencyBillMoneyRcvdSearchStrategy as AgencyMoneyReceivedCriteria
  private var _suspensePaymentCriteria : SuspensePaymentSearchStrategy as SuspensePaymentCriteria

  private var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()
    
  private var _directBillMoneyRcvdSearchResults : DirectBillMoneyReceivedSearchViewQuery as DirectBillMoneyRcvdSearchResults
  private var _agencyBillMoneyRcvdSearchResults : DirectBillMoneyReceivedSearchViewQuery as AgencyBillMoneyRcvdSearchResults
  private var _suspensePaymentSearchResults : DirectBillMoneyReceivedSearchViewQuery as SuspensePaymentSearchResults
    
  private var _directBillMoneyRcvdSearchResultsCount : int as DirectBillMoneyRcvdSearchResultsCount
  private var _agencyBillMoneyRcvdSearchResultsCount : int as AgencyBillMoneyRcvdSearchResultsCount
  private var _suspensePaymentSearchResultsCount : int as SuspensePaymentSearchResultsCount
  
  function performSearch() : IQueryBeanResult {
    validateCriteria()
    
    DirectBillMoneyRcvdSearchResults = new DirectBillMoneyRcvdSearchStrategy(this).getSearchResults()
    AgencyBillMoneyRcvdSearchResults = new AgencyBillMoneyRcvdSearchStrategy(this).getSearchResults()
    SuspensePaymentSearchResults = new SuspensePaymentSearchStrategy(this).getSearchResults()

    DirectBillMoneyRcvdSearchResultsCount = DirectBillMoneyRcvdSearchResults.Count
    AgencyBillMoneyRcvdSearchResultsCount = AgencyBillMoneyRcvdSearchResults.Count
    SuspensePaymentSearchResultsCount = SuspensePaymentSearchResults.Count

    if (DirectBillMoneyRcvdSearchResultsCount > 0) {
      return DirectBillMoneyRcvdSearchResults
    } else if (SuspensePaymentSearchResultsCount > 0) {
      return SuspensePaymentSearchResults
    } else if (AgencyBillMoneyRcvdSearchResultsCount > 0) {
      return AgencyBillMoneyRcvdSearchResults
    } else {
      return DirectBillMoneyRcvdSearchResults
    }
  }
  
  function performAgencySearchOnly() : IQueryBeanResult {
    validateCriteria()
    
    AgencyBillMoneyRcvdSearchResults = new AgencyBillMoneyRcvdSearchStrategy(this).getSearchResults()

    AgencyBillMoneyRcvdSearchResultsCount = AgencyBillMoneyRcvdSearchResults.Count

    return AgencyBillMoneyRcvdSearchResults
  }

  protected  function validateCriteria() {
    SearchHelper.checkForDateExceptions(EarliestDate, LatestDate);
    SearchHelper.checkForNumericExceptions(MinAmount, MaxAmount);
  }
  
  protected function hasContactCriteria() : boolean {
    return ContactCriteria.isReasonablyConstrainedForSearch()
  }
  
  protected function hasProducerCriteria() : boolean {
    return ProducerCode != null || ProducerName != null || ProducerNameKanji != null;
  }
  
  protected function hasPaymentInstrumentCriteria() : boolean {
    return (Method != null || Token != null)
  }
  
  function NumPaymentSearchResults() : int {
    return DirectBillMoneyRcvdSearchResultsCount != null ? DirectBillMoneyRcvdSearchResultsCount : 0;
  }

  function NumAgencyMoneyReceivedSearchResults() : int {
    return AgencyBillMoneyRcvdSearchResults != null ? AgencyBillMoneyRcvdSearchResultsCount : 0;
  }

  function NumSuspensePaymentSearchResults() : int {
    return SuspensePaymentSearchResultsCount != null ? SuspensePaymentSearchResultsCount : 0;
  }
}
