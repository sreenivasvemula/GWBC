package gw.webservice.policycenter.bc801

uses gw.api.database.GroupingQuery
uses gw.api.database.Query
uses gw.api.database.IQueryBeanResult
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.xml.ws.annotation.WsiExportable

/**
 * Defines {@link Account} search for the PC/BC interface.
 */
@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/BCAccountSearchCriteria" )
@Export
final class BCAccountSearchCriteria {
  public var AccountNumber : String
  public var AccountName : String
  public var AccountNameKanji : String
  /**
   * Specifies whether to restrict to {@link AccountType.TC_LISTBILL ListBill}
   *    {@link Account}s only.
   *
   * If {@code true}, must also specify {@link #Currency}.
   */
  public var IsListBill : Boolean
  /**
   * The {@link Currency} defined for a {@link AccountType.TC_LISTBILL ListBill}
   *    {@link Account}. Required if {@link #IsListBill} is {@code true}.
   *    Otherwise, ignored.
   */
  public var Currency : Currency

  construct() {}

  /**
   * Executes a search for active {@link Account}s based on the values
   *    set for the properties of this search criteria.
   *
   * @return A query result for active {@link Account}s.
   */
  @Throws(RequiredFieldException, "If IsListBill=TRUE and Currency is not specified")
  function searchForAccountNumbers() : IQueryBeanResult<Account> {
    if (restricts()) {
      return makePrimaryAccountQuery(
          \ query -> applyRestrictions(query)).select()
    } else {
      // (optimize) no restrictions...
      final var query = makeActiveAccountQuery()
      query.or(\ orClause -> {
        /* no currency group... */
        orClause.compare("_AccountCurrencyGroup", Equals, null)
        /* or main account of currency group only... */
        orClause.subselect("ID", CompareIn,
            MixedCurrencyAccountGroup, "MainAccount")
      })
      return query.select()
    }
  }

  private function restricts() : boolean {
    return IsListBill or AccountNumber != null
        or AccountName != null or AccountNameKanji != null
  }

  private function applyRestrictions(final query : Query<Account>) {
    if (AccountNumber != null) {
      query.compare("AccountNumber", Equals, AccountNumber)
    }
    if (AccountName != null) {
      query.startsWith("AccountName", AccountName, true)
    }
    if (AccountNameKanji != null) {
      query.startsWith("AccountNameKanji", AccountNameKanji, false)
    }
    if (IsListBill) {
      if (Currency == null) {
        throw new RequiredFieldException(displaykey.Webservice.Error.MissingRequiredField("Currency"))
      }
      query.compare("AccountType", Equals, AccountType.TC_LISTBILL)
      query.compare("Currency", Equals, Currency)
    }
  }

  /**
   * Verify that the {@link #AccountNumber} matches that of the single
   *     {@link Account} result.
   *
   * @return The {@link Account} from the {@code results} with the specified
   *         {@link #AccountNumber}.
   */
  internal function matchAccountNumber() : Account {
    final var account = this.searchForAccountNumbers().AtMostOneRow
    if (account != null and isMainAccount(account)
        and this.AccountNumber.trim().toLowerCase()
            != account.AccountNumber.toLowerCase()) {
      throw new BadIdentifierException(
          displaykey.Webservice.Error.BadAccountNumber(
              this.AccountNumber, account.AccountNumber))
    }
    return account
  }

  private static function isMainAccount(account : Account) : boolean {
    return !account.ListBill and account.AccountCurrencyGroup != null
  }

  /**
   * Lookup an {@link Account} by {@link Account#ACCOUNTNUMBER_PROP number}.
   *    ({@code Account} {@code number}s are required and unique.)
   *
   * For splinter currency {@code Account}s in a mixed currency group, the
   * returned {@code Account} will be the main one of the group.
   *
   * @param accountNumber the {@code Account} number (exact-match).
   * @return The {@code Account} whose unique number matches the specified
   *         number; <code>null</code> if no {@code Account} matches.
   */
  static function findByAccountNumber(accountNumber : String) : Account {
    if (accountNumber == null) {
      // AccountNumber is required so null matches nothing...
      return null
    }
    final var criteria = new BCAccountSearchCriteria()
    criteria.AccountNumber = accountNumber

    return criteria.matchAccountNumber()
  }

  /**
   * Make a query primary active (<em>not</em> {@link Account#isClosed closed})
   *    {@link Account}s. A <em>primary</em> {@code Account} is either one that
   *    does not belong to a {@link MixedCurrencyAccountGroup mixed-currency
   *    group} or is the {@link MixedCurrencyAccountGroup#getMainAccount main
   *    account} of one.
   *<p/>
   * This will return a {@link GroupingQuery union query} that targets the two
   * types of {@code Account}s separately. Use the {@link #restrict} block to
   * apply restrictions to both types. If you do not have any restrictions, do
   * not use this query since it may not perform adequately in that case.
   *
   * @param restrict a block that applies restrictions to an {@link Account}
   *                 query.
   * @returns A {@link GroupingQuery} that will perform the specified look-up.
   */
  internal static function makePrimaryAccountQuery(
          restrict: block(query: Query <Account>)) : GroupingQuery<Account> {
    final var nonSplinterQuery = makeActiveAccountQuery()
    /* no currency group... */
    nonSplinterQuery.compare("_AccountCurrencyGroup", Equals, null)
    restrict(nonSplinterQuery)

    /* or main account of currency group that has a splinter that matches...
     *
     * SELECT FROM Accounts
     * WHERE Not Closed
     *   AND this IN (SELECT MainAccount FROM MixedCurrencyAccountGroup
     *      WHERE this IN (SELECT ForeignEntity FROM AccountCurrencyGroup
     *          WHERE Owner IN (SELECT FROM ACCOUNT
     *              WHERE <restrictions from criteria)))
     */
    final var mainsQuery = makeActiveAccountQuery()
    final var currencyGroupQuery = Query.make(MixedCurrencyAccountGroup)
    mainsQuery.subselect("ID", CompareIn, currencyGroupQuery, "MainAccount")

    /* currency group identifying main account... */
    final var splintersGroupQuery = Query.make(AccountCurrencyGroup)
    currencyGroupQuery.subselect("ID", CompareIn, splintersGroupQuery, "ForeignEntity")

    /* accounts matching restrictions including main... */
    final var splintersQuery = Query.make(Account)
    splintersQuery.compare("_AccountCurrencyGroup", NotEquals, null)
    /* note "closed" splinters will match for unclosed mains... */
    /* restrict to splinters that match criteria... */
    restrict(splintersQuery)

    /* matching accounts in currency group... */
    splintersGroupQuery.subselect("Owner", CompareIn, splintersQuery, "ID")

    return nonSplinterQuery.union(mainsQuery)
  }

  private static function makeActiveAccountQuery() : Query<Account> {
    final var query = Query.make(Account)
    query.compare("CloseDate", Equals, null) // active
    return query
  }
}
