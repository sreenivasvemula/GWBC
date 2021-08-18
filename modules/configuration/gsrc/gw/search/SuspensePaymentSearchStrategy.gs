package gw.search

uses gw.api.database.BooleanExpression
uses gw.api.database.IQuery
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Restriction
uses gw.api.database.Table
uses gw.entity.IEntityType
uses gw.util.concurrent.LockingLazyVar

uses java.util.Arrays

/**
 * Strategy used to search for suspense payments.
 */
@Export
class SuspensePaymentSearchStrategy extends SearchStrategy {

  construct(searchCriteria : gw.search.PaymentSearchCriteria) {
    super(searchCriteria)
  }

  override function criteriaMootsSearch() : boolean {
    return PaymentCriteria.hasProducerCriteria()
  }

  override function getEntityType() : IEntityType {
    return SuspensePayment.Type
  }

  override function addConditions(query : Query) {
    if (PaymentCriteria.AccountNumber.NotBlank) {
      query.startsWith("AccountNumber", PaymentCriteria.AccountNumber, true)
    }
    
    if (PaymentCriteria.PolicyNumber.NotBlank) {
      query.startsWith("PolicyNumber", PaymentCriteria.PolicyNumber, true)
    }
    
    return
  }
  
  private function restrictContactsOnAccount(accountTable : Table) {
    // get contacts via account
    var contactTable = LockingLazyVar.make(\ -> accountTable.subselect("ID", CompareIn, AccountContact, "Account").join("Contact") as Table<Contact>)
    PaymentCriteria.ContactCriteria.restrictTable(contactTable, SearchMode)
  }
  
  private function restrictContactsOnPolicyPeriod(policyPeriodTable : Table) {
    // get contacts via policy period
    var contactTable = LockingLazyVar.make(\ -> policyPeriodTable.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod").join("Contact") as Table<Contact>)
    PaymentCriteria.ContactCriteria.restrictTable(contactTable, SearchMode)
  }
  
  private function restrictContactsOnProducer(producerTable : Table) {
    // get contacts via producer
    var contactTable = LockingLazyVar.make(\ -> producerTable.subselect("ID", CompareIn, ProducerContact, "Producer").join("Contact") as Table<Contact>)
    PaymentCriteria.ContactCriteria.restrictTable(contactTable, SearchMode)
  }

  private function restrictSearchByAccountSecurityZone(accountTable : Table) {
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
  
  private function restrictSearchByProducerSecurityZone(producerTable : Table) {    
    producerTable.or(new BooleanExpression() {
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
  
  private function restrictSearchByPolicyPeriodSecurityZone(policyPeriodTable : Table) {
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

  override function getPaymentDateColumn() : String {
    return "PaymentDate"
  }

  override function getRestrictedSecurityZoneQuery() : IQuery {
    var accountSecurityZoneQuery = buildRootQuery(getEntityType())
    var policySecurityZoneQuery = buildRootQuery(getEntityType())
    var producerSecurityZoneQuery = buildRootQuery(getEntityType())
    
    var unappliedPayments = buildUnappliedQuery()
    
    if (!perm.System.acctignoresecurityzone) {
     var accountTable = accountSecurityZoneQuery.join("AccountAppliedTo")
     restrictSearchByAccountSecurityZone(accountTable)
    }
    if (!perm.System.plcyignoresecurityzone) {
      var policyPeriodTable = policySecurityZoneQuery.join("PolicyPeriodAppliedTo")
      restrictSearchByPolicyPeriodSecurityZone(policyPeriodTable)
    }
    if (!perm.System.prodignoresecurityzone) {
      var producerTable = producerSecurityZoneQuery.join("ProducerAppliedTo")
      restrictSearchByProducerSecurityZone(producerTable)
    }
    
    return (accountSecurityZoneQuery.union(policySecurityZoneQuery).union(producerSecurityZoneQuery).union(unappliedPayments))
  }
  
  override function getRestrictedContactQuery() : IQuery {
    var accountContactsQuery = buildRootQuery(getEntityType())
    var policyContactsQuery = buildRootQuery(getEntityType())
    var producerContactsQuery = buildRootQuery(getEntityType())
    
    var accountTable = accountContactsQuery.join("AccountAppliedTo")    
    restrictContactsOnAccount(accountTable)
    if (!perm.System.acctignoresecurityzone) {
     restrictSearchByAccountSecurityZone(accountTable)
    }

    var policyPeriodTable = policyContactsQuery.join("PolicyPeriodAppliedTo")
    restrictContactsOnPolicyPeriod(policyPeriodTable)
    if (!perm.System.plcyignoresecurityzone) {
      restrictSearchByPolicyPeriodSecurityZone(policyPeriodTable)
    }

    var producerTable = producerContactsQuery.join("ProducerAppliedTo")
    restrictContactsOnProducer(producerTable)
    if (!perm.System.prodignoresecurityzone) {
      restrictSearchByProducerSecurityZone(producerTable)
    }
    
    return accountContactsQuery.union(policyContactsQuery).union(producerContactsQuery)
  }
  
  private function buildUnappliedQuery() : IQuery {
    var unappliedQuery = buildRootQuery(getEntityType())
    
    unappliedQuery.compare("AccountAppliedTo", Relop.Equals, null)
    unappliedQuery.compare("ProducerAppliedTo", Relop.Equals, null)
    unappliedQuery.compare("PolicyPeriodAppliedTo", Relop.Equals, null)
    
    return unappliedQuery
  }
}
