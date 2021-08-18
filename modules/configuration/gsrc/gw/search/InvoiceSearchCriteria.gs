package gw.search

uses gw.api.database.BooleanExpression
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Restriction
uses gw.api.database.Table
uses gw.api.util.DateUtil
uses gw.pl.currency.MonetaryAmount
uses gw.util.concurrent.LockingLazyVar

uses java.io.Serializable
uses java.util.Arrays
uses java.util.Date

/**
 * Criteria used to perform an invoice search in the InvoiceSearchDV.
 */
@Export
class InvoiceSearchCriteria implements Serializable {

  final static var SHOULD_IGNORE_CASE = true

  var _invoiceNumber : String as InvoiceNumber
  var _accountNumber : String as AccountNumber

  var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()
  var _earliestDate : Date as EarliestDate
  var _latestDate : Date as LatestDate
  var _minAmount : MonetaryAmount as MinAmount
  var _maxAmount : MonetaryAmount as MaxAmount
  var _currencyCriterion : Currency as CurrencyCriterion

  function performSearch() : IQueryBeanResult<InvoiceSearchView> {
    return performSearch(StringCriterionMode.TC_STARTSWITH)
  }

  function performSearch(contactCriteriaSearchMode : StringCriterionMode) : IQueryBeanResult<InvoiceSearchView> {

    SearchHelper.checkForDateExceptions(EarliestDate, LatestDate);
    SearchHelper.checkForNumericExceptions(MinAmount, MaxAmount);
    var query = buildQuery() as Query<InvoiceSearchView>
    restrictSearchByContact(query, contactCriteriaSearchMode)
    return query.select()
  }
  
  // build a query that takes into account our restrictions
  
  function buildQuery() : Query {
    var query = gw.api.database.Query.make(InvoiceSearchView)
    restrictSearchByInvoiceNumber(query)
    restrictSearchBySecurityZone(query)
    restrictSearchByAccountNumber(query)
    restrictSearchByDate(query)
    restrictSearchByInvoiceStatusNotPlanned(query)
    restrictSearchByMinAndMaxAmount(query)
    restrictSearchByCurrency(query)
    return query
  }
  
  function restrictSearchByAccountNumber(query : Query) {
    if (AccountNumber.NotBlank) {
      query.join("Account").startsWith("AccountNumber", AccountNumber, SHOULD_IGNORE_CASE);     
    }
  }

  // various restrictions for narrowing down the invoice search

  function restrictSearchByContact(query : Query, contactCriteriaSearchMode : StringCriterionMode) {
    
    // Use a LazyVar so that if no contact criteria was specified, we avoid doing the subselect entirely
    
    var accountInvoiceTable = query.cast(AccountInvoice)
    var accountTable = accountInvoiceTable.join("Account")
    var lazyContactTable = LockingLazyVar.make(\ -> accountTable.subselect("ID", CompareIn, AccountContact, "Account").join("Contact") as Table<Contact>)
    ContactCriteria.restrictTable(lazyContactTable, contactCriteriaSearchMode)
  }

  function restrictSearchByDate(query : Query) {
    if (EarliestDate != null || LatestDate != null) {
      // If a latest date has been entered, make sure it is set to the end of the day so that the query
      // will return results after midnight that morning
      var endOfLatestDate = LatestDate != null ? DateUtil.endOfDay(LatestDate) : LatestDate
      
      query.between("EventDate", EarliestDate,  endOfLatestDate);
    }
  }

  function restrictSearchByInvoiceStatusNotPlanned(query : Query) {
    query.compare("Status", NotEquals, InvoiceStatus.TC_PLANNED.Value);
  }

  function restrictSearchByMinAndMaxAmount(query : Query) {
    if (MinAmount != null || MaxAmount != null) {
      query.between("Amount", MinAmount, MaxAmount)
    }
  }

  function restrictSearchBySecurityZone(query : Query) {
    if (perm.System.acctignoresecurityzone) {
      return // no need to consider security zones
    }
    
    var accountInvoiceTable = query.cast(AccountInvoice)
    var accountTable = accountInvoiceTable.join("Account")
    
    accountTable.or(new BooleanExpression() {
      final var groupUsers = Arrays.asList(User.util.CurrentUser.GroupUsers)
      override function execute(restriction : Restriction) {
        restriction.compare("SecurityZone", Equals, null) // Everyone can see null SecurityZone
        for (groupUser in groupUsers) {
          
          // And user can see their own security zones
          
          restriction.compare("SecurityZone", Equals, groupUser.Group.SecurityZone)
        }
      }
    })
  }
  
  function restrictSearchByInvoiceNumber(query : Query) {
    if (InvoiceNumber.NotBlank) {
      query.startsWith("InvoiceNumber", InvoiceNumber, SHOULD_IGNORE_CASE)
    }
  }

  function restrictSearchByCurrency(query : Query) {
    if (CurrencyCriterion != null) {
      query.compare("Currency", Equals, CurrencyCriterion)
    }
  }
}
