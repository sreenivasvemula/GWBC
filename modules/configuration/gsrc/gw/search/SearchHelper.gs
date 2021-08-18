package gw.search

uses java.util.Date
uses java.math.BigDecimal
uses gw.api.util.DisplayableException
uses java.util.Collection
uses gw.api.database.Query
uses gw.api.database.IQuery

/**
 * Utility class to handle validation for search classes.
 */
@Export
class SearchHelper {

  construct() {

  }

  static function getDefaultCurrencyIfNull(currency : Currency) : Currency {
    return (currency == null ? gw.api.util.CurrencyUtil.getDefaultCurrency() : currency)
  }
  
  static function checkForNumericExceptions(min : BigDecimal, max : BigDecimal) {
    if ((min != null && max == null) || (min == null && max != null)) {
      throw new DisplayableException(displaykey.Web.Error.MustSpecifyBothMinAndMax);
    }
    if (min != null && max.compareTo(min) < 0) {
      throw new DisplayableException(displaykey.Web.Error.MaxAmountLessThanMinAmount);
    }
  }
  
  static function checkForDateExceptions(earlierDate : Date, laterDate : Date) {
    if (earlierDate != null && laterDate != null && laterDate.before(earlierDate)) {
      throw new DisplayableException(displaykey.Web.Error.LaterDateBeforeEarlierDate);
    }
  }

  // returns the union of all queries in a collection  
  static function getUnionedQuery(queryList : Collection<Query>) : IQuery {
    var groupedQuery : IQuery
    
    for (query in queryList) {
      groupedQuery = groupedQuery == null ? query : groupedQuery.union(query)
    }
    
    return groupedQuery
  }

}
