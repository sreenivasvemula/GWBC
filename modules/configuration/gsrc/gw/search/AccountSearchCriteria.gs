package gw.search

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Table
uses gw.util.concurrent.LockingLazyVar

uses java.io.Serializable
uses java.util.Arrays
uses java.util.HashSet

/**
 * Criteria used to perform an account search in the AccountSearchDV.
 */
@Export
class AccountSearchCriteria implements Serializable {

  final static var SHOULD_IGNORE_CASE = true

  var _accountName : String as AccountName
  var _accountNameKanji : String as AccountNameKanji
  var _accountNumber : String as AccountNumber
  
  var _delinquencyStatus : DelinquencyStatus as DelinquencyStatus
  var _FEIN : String as FEIN
  var _chargeHeld : Boolean as ChargeHeld
  var _accountSegment : AccountSegment as Segment
  var _organizationType : String as OrganizationType
  var _policyNumber : String as PolicyNumber
  var _currencyCriterion : Currency as CurrencyCriterion

  var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()
  
  var _accountType : AccountType as AccountType

  /**
   * Performs an Account search using this object's fields to narrow down results.
   */
  function performSearch(contactCriteriaSearchMode : StringCriterionMode) : IQueryBeanResult<AccountSearchView> {
    var query = gw.api.database.Query.make(AccountSearchView)
    restrictSearchByAccountFields(query)
    restrictSearchByUserPermissions(query)
    restrictSearchByContact(query, contactCriteriaSearchMode)
    restrictSearchByUserSecurityZone(query)
    restrictSearchByPolicyNumberCriterion(query)
    return query.select()
  }

  /**
  * Performs an Account search using only the AccountNumber.
  */
  static function searchAccountsByNumber(accountNumber : String) : AccountSearchView {
    accountNumber = accountNumber.trim()
    if (accountNumber.Empty) {
      return null
    }

    var criteria = new AccountSearchCriteria()
    criteria.AccountNumber = accountNumber
    return criteria.performSearch(StringCriterionMode.TC_EQUALS).FirstResult
  }

  /** Restrict on items directly on the Account table. */
  private function restrictSearchByAccountFields(query : Query) {
    if (AccountNumber.NotBlank) {
      query.startsWith("AccountNumber", AccountNumber, SHOULD_IGNORE_CASE)
    }
    if (AccountName.NotBlank) {
      query.startsWith("AccountName", AccountName, SHOULD_IGNORE_CASE)
    }
    if (AccountNameKanji.NotBlank) {
      query.startsWith("AccountNameKanji", AccountNameKanji, false)
    }
    if (AccountType != null) {
      query.compare("AccountType", Equals, AccountType)
    }
    if (DelinquencyStatus != null) {
      query.compare("DelinquencyStatus", Equals, DelinquencyStatus)
    }
    if (FEIN.NotBlank) {
      query.startsWith("FEIN", FEIN, SHOULD_IGNORE_CASE)
    }
    if (OrganizationType != null) {
      query.compare("OrganizationType", Equals, OrganizationType)
    }
    if (Segment != null) {
      query.compare("Segment", Equals, Segment)
    }
    if (ChargeHeld) {
      query.compare("ChargeHeld", Relop.Equals, true)
    }
    if (CurrencyCriterion != null) {
      query.compare("Currency", Equals, CurrencyCriterion)
    }
  }
  
  private function restrictSearchByUserPermissions(query : Query) {
    if (perm.System.acctsearch) {
      // User is permitted to search all accounts
      return
    }
    if (perm.System.grpacctsearch) {
      // User is only permitted to search accounts created by the user's group members.
      var usersInThisUsersGroups = new HashSet();
      for (groupsToWhichThisUserBelong in User.util.CurrentUser.GroupUsers) {
        for (userThatSharesAGroupWithThisUser in groupsToWhichThisUserBelong.Group.Users) {
          usersInThisUsersGroups.add(userThatSharesAGroupWithThisUser.User);
        }
      }
      query.compareIn("CreateUser", usersInThisUsersGroups.toArray())
      return
    }
    // User is only permitted to search accounts that they have created.
    query.compare("CreateUser", Equals, User.util.CurrentUser)
  }
  
  private function restrictSearchByContact(query : Query, contactCriteriaSearchMode : StringCriterionMode) {
    // Use a LockingLazyVar so that if no contact criteria was specified, we avoid doing the subselect entirely
    var lazyContactTable = LockingLazyVar.make(\ ->
        query.subselect("ID", CompareIn, AccountContact, "Account").join("Contact") as Table<Contact>)
    ContactCriteria.restrictTable(lazyContactTable, contactCriteriaSearchMode)
  }
  
  private function restrictSearchByUserSecurityZone(query : Query) {
    if (perm.System.acctignoresecurityzone) {
      return // no need to consider security zones
    }
    final var groupUsers = Arrays.asList(User.util.CurrentUser.GroupUsers)
    query.or(\ restriction -> {
        restriction.compare("SecurityZone", Equals, null) // Everyone can see null SecurityZone
        for (groupUser in groupUsers) {
          // And user can see their own security zones
          restriction.compare("SecurityZone", Equals, groupUser.Group.SecurityZone)
        }
    })
  }
  
  private function restrictSearchByPolicyNumberCriterion(query : Query) {
    if (PolicyNumber.NotBlank) {
      query.subselect("ID", CompareIn, Policy, "Account")
          .subselect("ID", CompareIn, PolicyPeriod, "Policy")
          .or(\ restriction -> {
            restriction.startsWith("PolicyNumber", PolicyNumber, SHOULD_IGNORE_CASE)
            restriction.startsWith("PolicyNumberLong", PolicyNumber, SHOULD_IGNORE_CASE)
          })
    }
  }

}
