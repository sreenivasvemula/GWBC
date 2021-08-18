package gw.search

uses com.guidewire.pl.system.database.EmptyQueryProcessor
uses gw.api.database.IQuery
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Table
uses gw.api.util.DateUtil
uses gw.entity.IEntityType

/**
 * Class from which other payment search strategies extend from.
 */
@Export
abstract class SearchStrategy {

  private var _paymentCriteria : gw.search.PaymentSearchCriteria as PaymentCriteria
  private var _searchMode : StringCriterionMode as readonly SearchMode = StringCriterionMode.TC_STARTSWITH

  construct(currentPayment : gw.search.PaymentSearchCriteria) {
    PaymentCriteria = currentPayment
  }

  abstract function criteriaMootsSearch() : boolean
  abstract function getEntityType() : IEntityType
  abstract function addConditions(query : Query)
  abstract function getPaymentDateColumn() : String
  abstract function getRestrictedSecurityZoneQuery() : IQuery
  abstract function getRestrictedContactQuery() : IQuery
  
  function getSearchResults() : IQueryBeanResult {
    if (criteriaMootsSearch()) {
      return new EmptyQueryProcessor(getEntityType())
    }
    
    return restrictContactsAndSecurityZones().select()
  }
  
  protected function buildRootQuery(entityType : IEntityType) : Query {
    // make initial query
    var query = Query.make(entityType)
    
    addCommonRestrictions(query)
    addConditions(query)

    return query
  }
  
  private function addCommonRestrictions(query : Query) {
    // pare down by dates/amounts
    if (PaymentCriteria.EarliestDate != null || PaymentCriteria.LatestDate != null) {
       
       // If a latest date has been entered, make sure it is set to the end of the day so that the query
       // will return results after midnight that morning
       var endOfLatestDate = PaymentCriteria.LatestDate != null ? DateUtil.endOfDay(PaymentCriteria.LatestDate) : PaymentCriteria.LatestDate
      
       query.between(getPaymentDateColumn(), PaymentCriteria.EarliestDate, endOfLatestDate)
    }
    if (PaymentCriteria.MinAmount != null || PaymentCriteria.MaxAmount != null) {
      query.between(getAmountColumn(), PaymentCriteria.MinAmount, PaymentCriteria.MaxAmount)
    }
    
    // pare down based on the payment method or the token
    if (PaymentCriteria.hasPaymentInstrumentCriteria()) {
      var instrumentTable = query.join("PaymentInstrument")
      
      if (PaymentCriteria.Method != null) {
        instrumentTable.compare("PaymentMethod", Relop.Equals, PaymentCriteria.Method)        
      }
      
      if (PaymentCriteria.Token != null) {
        instrumentTable.compare("Token", Relop.Equals, PaymentCriteria.Token)        
      }
    }
    
    // compare check number
    if (PaymentCriteria.CheckNumber != null) {
      query.startsWith("RefNumber", PaymentCriteria.CheckNumber, true)
    }
    
    if (PaymentCriteria.CurrencyType != null) {
      query.compare("Currency", Relop.Equals, PaymentCriteria.CurrencyType)
    }
  }
  
  protected function restrictContactsAndSecurityZones() : IQuery {
    if (!PaymentCriteria.ContactCriteria.isAnyFieldPopulated()) {
      return getRestrictedSecurityZoneQuery()
    }
    else { 
      return getRestrictedContactQuery()
    }
  }
  
  protected function getAmountColumn() : String {
    return "Amount"
  }

  protected function addSuspenseItemsCriterionForPaymentSearch(query : Query) {
    var baseDistTable = query.join("BaseDist")
    var nonRecTable = baseDistTable.subselect("ID", CompareIn, BaseNonReceivableDistItem, "ActiveDist") as Table<BaseNonReceivableDistItem>
    
    nonRecTable.cast(BaseSuspDistItem)

    nonRecTable.compare("ReleasedDate", Relop.Equals, null)
    nonRecTable.compare("ReversedDate", Relop.Equals, null)
    nonRecTable.compare("ExecutedDate", Relop.NotEquals, null)
  }

}
