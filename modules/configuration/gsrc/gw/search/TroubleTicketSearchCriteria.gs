package gw.search

uses gw.api.database.IQuery
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Table
uses gw.util.concurrent.LockingLazyVar

uses java.io.Serializable

/**
 * Criteria used to perform an invoice search in the InvoiceSearchDV.
 */
@Export
class TroubleTicketSearchCriteria implements Serializable {

  final static var SHOULD_IGNORE_CASE = true

  var _troubleTicketNumber : String as TroubleTicketNumber
  var _policyNumber : String as PolicyNumber
  var _accountNumber : String as AccountNumber
  var _producerName : String as ProducerName
  var _producerNameKanji : String as ProducerNameKanji
  var _title : String as Title
  
  var _isClosed : TroubleTicketStatus as IsClosed
  var _hasHold : boolean as HasHold
  var _assignedToUser : User as AssignedToUser

  var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()

  function performSearch() : IQueryBeanResult {
    return getCompletedQuery().select()
  }
  
  // build a root query that takes into account our restrictions
  
  private function buildRootQuery() : Query {
    var query = gw.api.database.Query.make(TroubleTicket)
    
    restrictSearchByTroubleTicketFields(query)
    restrictSearchByAccountNumber(query)
    restrictSearchByProducerName(query)
    restrictSearchByHasHold(query)
    restrictSearchByIsClosed(query)
    
    return query
  }
  
  private function getAccountContactQuery() : Query {
    var accountContactQuery = buildRootQuery()
    restrictByAccountContact(accountContactQuery)
    
    return accountContactQuery  
  }
  
  private function getProducerContactQuery() : Query {
    var producerContactQuery = buildRootQuery()
    restrictByProducerContact(producerContactQuery)
    
    return producerContactQuery  
  }
  
  private function getCompletedQuery() : IQuery {
    var policyContactQuery = buildRootQuery()    
    var policyPeriodContactQuery = buildRootQuery()

    restrictByPolicyPeriodContact(policyPeriodContactQuery)
    restrictByPolicyContact(policyContactQuery)
    
    var policyQueries = { getAccountContactQuery(), getProducerContactQuery(), policyContactQuery }
    var policyPeriodQueries = { getAccountContactQuery(), getProducerContactQuery(), policyPeriodContactQuery }

    // restrict one set of queries by policy and the other by policy period
    policyQueries.each(\ q -> restrictByPolicyNumber(q))
    policyPeriodQueries.each(\ q -> restrictByPolicyPeriodNumber(q))

    // union all the queries
    return SearchHelper.getUnionedQuery(policyQueries.concat(policyPeriodQueries))
  }
  
  private function restrictSearchByTroubleTicketFields(query : Query) {
    if (TroubleTicketNumber.NotBlank) {
      query.startsWith("TroubleTicketNumber", TroubleTicketNumber, true)  
    }
    
    if (Title.NotBlank) {
      query.startsWith("Title", Title, true)  
    }
   
    if (AssignedToUser != null) {
      query.compare("AssignedUser", Relop.Equals, AssignedToUser.ID)
    }
  }
  
  private function restrictSearchByAccountNumber(query : Query) {
    if (AccountNumber.NotBlank) {
      var accountJoinTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Account") as Table<Account>
      accountJoinTable.startsWith("AccountNumber", AccountNumber, SHOULD_IGNORE_CASE)     
    }
  }
  
  private function restrictSearchByProducerName(query : Query) {
    if (ProducerName.NotBlank) {
      var producerJoinTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Producer") as Table<Producer>
      producerJoinTable.startsWith("Name", ProducerName, SHOULD_IGNORE_CASE)     
    }
    if (ProducerNameKanji.NotBlank) {
      var producerJoinTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Producer") as Table<Producer>
      producerJoinTable.startsWith("NameKanji", ProducerNameKanji, false)
    }
  }
  
  private function restrictByPolicyPeriodNumber(query : Query) {
    if (PolicyNumber.NotBlank) {
      var policyJoinTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("PolicyPeriod") as Table<PolicyPeriod>
      policyJoinTable.startsWith("PolicyNumberLong", PolicyNumber, SHOULD_IGNORE_CASE)
    }
  }  
  
  private function restrictByPolicyNumber(query : Query) {
    if (PolicyNumber.NotBlank) {
      var policyJoinTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Policy") as Table<Policy>
      var policyPeriodTable = policyJoinTable.subselect("ID", CompareIn, PolicyPeriod, "Policy")
      policyPeriodTable.startsWith("PolicyNumberLong", PolicyNumber, SHOULD_IGNORE_CASE)
    }
  }
  
  private function restrictSearchByHasHold(query : Query) {
    if (HasHold) {
      query.subselect("ID", CompareIn, HoldTypeEntry, "Hold")
    }
  }

  private function restrictSearchByIsClosed(query : Query) {
    if (IsClosed != null) {
      if (IsClosed == TroubleTicketStatus.TC_CLOSED) {
        query.compare("CloseDate", Relop.NotEquals, null)  
      }
      else if (IsClosed == TroubleTicketStatus.TC_OPEN) {
        query.compare("CloseDate", Relop.Equals, null)          
      }
    }
  }
  
  private function restrictByAccountContact(query : Query) {
    var lazyContactTable = LockingLazyVar.make(\ -> {
      var accountTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Account")
      return accountTable.subselect("ID", CompareIn, AccountContact, "Account").join("Contact") as Table<Contact>
    })
    ContactCriteria.restrictTable(lazyContactTable, StringCriterionMode.TC_STARTSWITH)
  }
  
  private function restrictByProducerContact(query : Query) {
    var lazyContactTable = LockingLazyVar.make(\ -> {
      var producerTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Producer")
      return producerTable.subselect("ID", CompareIn, ProducerContact, "Producer").join("Contact") as Table<Contact>
    })
    ContactCriteria.restrictTable(lazyContactTable, StringCriterionMode.TC_STARTSWITH)
  }
  
  private function restrictByPolicyContact(query : Query) {

    var lazyContactTable = LockingLazyVar.make(\ -> {
      var policyJoinTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("Policy")
      var policyPeriodTable = policyJoinTable.subselect("ID", CompareIn, PolicyPeriod, "Policy")
      return policyPeriodTable.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod").join("Contact") as Table<Contact>
    })
    ContactCriteria.restrictTable(lazyContactTable, StringCriterionMode.TC_STARTSWITH)
  }
  
  private function restrictByPolicyPeriodContact(query : Query) {
    var lazyContactTable = LockingLazyVar.make(\ -> {
      var policyPeriodTable = query.subselect("ID", CompareIn, TroubleTicketJoinEntity, "TroubleTicket").join("PolicyPeriod")
      return policyPeriodTable.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod").join("Contact") as Table<Contact>
    })
    ContactCriteria.restrictTable(lazyContactTable, StringCriterionMode.TC_STARTSWITH)
  }
}
