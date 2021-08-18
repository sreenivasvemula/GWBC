package gw.search

uses gw.api.database.BooleanExpression
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Restriction
uses gw.api.database.Table
uses gw.util.concurrent.LockingLazyVar

uses java.io.Serializable
uses java.util.Arrays
uses gw.entity.IEntityType

@Export
class DelinquencySearchCriteria implements Serializable {

  final static var SHOULD_IGNORE_CASE = true

  var _accountNumber : String as AccountNumber
  var _policyNumber : String as PolicyNumber
  var _delinquencyActiveStatus : ActiveStatus as DelinquencyActiveStatus
  var _segment : AccountSegment as Segment
  var _status : DelinquencyProcessStatus as Status
  var _currentEventName : DelinquencyEventName as CurrentEventName

  var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()
  
  // default search function retruns DelinquencySearchView for the actual search page
  function performSearch() : IQueryBeanResult<DelinquencySearchView> {
    return performSearch(DelinquencySearchView.Type) as IQueryBeanResult<DelinquencySearchView>
  }

  // overloaded version of the function can specify a type. This way it can return
  // DelinquencyProcess instead of DelinquencySearchView for use in unit testing, for example
  function performSearch(entityType : IEntityType) : IQueryBeanResult<DelinquencyProcess> {
    var query1 = buildQueryForDelinquencyProcessesOnViewablePolicyPeriodsWithSpecifiedContactInfo(entityType)
    var query2 = buildQueryForDelinquencyProcessesOnViewablePolicyPeriodsOnAccountsWithSpecifiedContactInfo(entityType)
    var query3 = buildQueryForDelinquencyProcessesOnViewableAccountsWithSpecifiedContactInfo(entityType)
    return query1.union(query2).union(query3).select()
  }

  private function buildQueryForDelinquencyProcessesOnViewablePolicyPeriodsWithSpecifiedContactInfo(entityType : IEntityType) : Query<DelinquencyProcess> {
    var query = buildRootQuery(entityType)
    restrictSearchByPolicyPeriodSecurityZone(query)
    restrictOnPolicyContacts(query)
    return query
  }
  
  private function buildQueryForDelinquencyProcessesOnViewablePolicyPeriodsOnAccountsWithSpecifiedContactInfo(entityType : IEntityType) : Query<DelinquencyProcess> {
    var query = buildRootQuery(entityType)
    restrictSearchByPolicyPeriodSecurityZone(query)
    restrictOnAccountContacts(query)
    return query
  }
    
  private function buildQueryForDelinquencyProcessesOnViewableAccountsWithSpecifiedContactInfo(entityType : IEntityType) : Query<DelinquencyProcess> {
    var query = buildRootQuery(entityType)
    query.compare("subtype", Relop.Equals, gw.bc.delinquency.typekey.DelinquencyProcess.TC_DELINQUENCYPROCESS)
    restrictSearchByAccountSecurityZone(query)
    restrictOnAccountContacts(query)
    return query
  }
  
  // Build a root query without restrictions on security zone or contacts
  private function buildRootQuery(entityType : IEntityType) : Query<DelinquencyProcess> {

    var query : Query<DelinquencyProcess>
    query = gw.api.database.Query.make(entityType)

    restrictSearchByCurrentEvent(query)
    restrictSearchBySegment(query)
    restrictSearchByStatus(query)
    restrictSearchByActiveStatus(query)
    restrictSearchByAccountNumber(query)
    restrictSearchByPolicyNumber(query)

    return query
  }
  
  private function restrictSearchByAccountNumber(query : Query) {
    if (AccountNumber.NotBlank) {
      var accountTable = query.join("Account")
      accountTable.startsWith("AccountNumber", AccountNumber, SHOULD_IGNORE_CASE)
    }
  }
  
  private function restrictSearchByStatus(query : Query) {
    if (Status != null) {
      query.compare("Status", Relop.Equals, Status)     
    }
  }
  
  function restrictSearchBySegment(query : Query) {
    if (Segment != null) {
      var accountTable = query.join("Account") as Table<Account>
      accountTable.compare("Segment", Relop.Equals, Segment)     
    }
  }

  private function restrictSearchByPolicyNumber(query : Query) {
    if (PolicyNumber.NotBlank) {
      var policyPeriodTable = query.join(PolicyDlnqProcess, "PolicyPeriod")
      policyPeriodTable.startsWith("PolicyNumberLong", PolicyNumber, true)
    }

  }
  
  private function restrictSearchByCurrentEvent(query : Query) {
    if (CurrentEventName != null) {
      var currentEventTable = query.join("CurrentEventDenorm")
      currentEventTable.compare("EventName", Relop.Equals, CurrentEventName)
    }
  }
  
  private function restrictSearchByActiveStatus(query : Query) {
    if (DelinquencyActiveStatus == ActiveStatus.TC_CLOSED) {
      query.compare("Status", Relop.Equals, DelinquencyProcessStatus.TC_CLOSED)
    }
    else if (DelinquencyActiveStatus == ActiveStatus.TC_OPEN) {
      query.compareIn("Status",
      { DelinquencyProcessStatus.TC_ERROR, DelinquencyProcessStatus.TC_ONHOLD, DelinquencyProcessStatus.TC_OPEN } as java.lang.Object[])
    }
  }
  
  private function restrictOnAccountContacts(query : Query) {
    var accountTable = query.join("Account")
    
    var lazyContactTable = LockingLazyVar.make(\ -> accountTable.subselect("ID", CompareIn, AccountContact, "Account").join("Contact") as Table<Contact>)
    ContactCriteria.restrictTable(lazyContactTable, StringCriterionMode.TC_STARTSWITH)
  }
  
  private function restrictOnPolicyContacts(query : Query) {
    var policyPeriodTable = query.join(PolicyDlnqProcess, "PolicyPeriod")
    var lazyContactTable = LockingLazyVar.make(\ -> policyPeriodTable.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod").join("Contact") as Table<Contact>)
    ContactCriteria.restrictTable(lazyContactTable, StringCriterionMode.TC_STARTSWITH)
  }
  

  private function restrictSearchByAccountSecurityZone(query : Query) {
    if (perm.System.acctignoresecurityzone) {
      return // no need to consider security zones
    }
    
    var accountTable = query.join("Account")
    
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
    
  private function restrictSearchByPolicyPeriodSecurityZone(query : Query) {
    if (perm.System.plcyignoresecurityzone) {
      return // no need to consider security zones
    }
    
    var policyPeriodTable = query.join(PolicyDlnqProcess, "PolicyPeriod")
    
    policyPeriodTable.or(new BooleanExpression() {
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
}
