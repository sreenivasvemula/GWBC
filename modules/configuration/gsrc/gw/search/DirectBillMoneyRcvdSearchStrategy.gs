package gw.search

uses gw.api.database.BooleanExpression
uses gw.api.database.IQuery
uses gw.api.database.Query
uses gw.api.database.Restriction
uses gw.api.database.Table
uses gw.entity.IEntityType
uses gw.util.concurrent.LockingLazyVar

uses java.util.Arrays

/**
 * Strategy used to search for direct bill payments.
 */
@Export
class DirectBillMoneyRcvdSearchStrategy extends SearchStrategy {
  
  construct(searchCriteria : gw.search.PaymentSearchCriteria) {
    super(searchCriteria)
  }
  
  override function getEntityType() : IEntityType {
    return DirectBillMoneyReceivedSearchView.Type
  }

  override function criteriaMootsSearch() : boolean {
    return PaymentCriteria.hasProducerCriteria()
  }

  override function addConditions(query : Query) {
    if (PaymentCriteria.AccountNumber != null)
    {
      var accountTable = query.join("Account")
      accountTable.startsWith("AccountNumber", PaymentCriteria.AccountNumber, true)
    }
    
    //restrict on policy number if available
    if (PaymentCriteria.PolicyNumber != null)
    {
      var baseDistTable = query.join("BaseDist")
      var activeDistTable = baseDistTable.subselect("ID", CompareIn, BaseDistItem, "ActiveDist")
      var invoiceItemTable = activeDistTable.join("InvoiceItem")
      var policyPeriodTable = invoiceItemTable.join("PolicyPeriod")

      policyPeriodTable.startsWith("PolicyNumberLong", PaymentCriteria.PolicyNumber, true)
    }
    
    if (PaymentCriteria.OwnerOfActiveSuspenseItems) {
        addSuspenseItemsCriterionForPaymentSearch(query)
    }
  }

  override function getPaymentDateColumn() : String {
    return "ReceivedDate"
  }
  
  private function restrictContactsOnAccount(accountTable : Table) {
    // get contacts via account
    var contactTable = LockingLazyVar.make(\ -> accountTable.subselect("ID", CompareIn, AccountContact, "Account").join("Contact") as Table<Contact>)
    PaymentCriteria.ContactCriteria.restrictTable(contactTable, SearchMode)
  }
  
  private function restrictContactsOnPolicyPeriod(query : Query) {
    // get contacts via policy period
    var policyPeriodTable = query.join("PolicyPeriod")
    var contactTable = LockingLazyVar.make(\ -> policyPeriodTable.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod").join("Contact") as Table<Contact>)
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

  override function getRestrictedSecurityZoneQuery() : IQuery {
    var accountSecurityZoneQuery = buildRootQuery(getEntityType())
    
    if (!perm.System.acctignoresecurityzone) {
      var accountTable = accountSecurityZoneQuery.join("Account")
      restrictSearchByAccountSecurityZone(accountTable)
    }
    
    return accountSecurityZoneQuery
  }

  override function getRestrictedContactQuery() : IQuery {
    var contactsOnAccountQuery = createQueryRestrictedByContactsOnAccount()    
    var contactsOnPolicyPeriodQuery = createQueryRestrictedByContactsOnPolicyPeriod()
    return contactsOnAccountQuery.union(contactsOnPolicyPeriodQuery)
  }

  private function createQueryRestrictedByContactsOnAccount() : Query {
    var contactsOnAccountQuery = buildRootQuery(getEntityType())
    var accountTableFromContactsOnAccountQuery = contactsOnAccountQuery.join("Account")    
    restrictContactsOnAccount(accountTableFromContactsOnAccountQuery)
    if (!perm.System.acctignoresecurityzone) {    
      restrictSearchByAccountSecurityZone(accountTableFromContactsOnAccountQuery)
    }
    return contactsOnAccountQuery    
  }
  
  private function createQueryRestrictedByContactsOnPolicyPeriod() : Query {
    var contactsOnPolicyPeriodQuery = buildRootQuery(getEntityType())
    var accountTableFromContactsOnPolicyPeriodQuery = contactsOnPolicyPeriodQuery.join("Account")
    restrictContactsOnPolicyPeriod(contactsOnPolicyPeriodQuery)
    if (!perm.System.acctignoresecurityzone) {    
      restrictSearchByAccountSecurityZone(accountTableFromContactsOnPolicyPeriodQuery)
    }
    return contactsOnPolicyPeriodQuery    
  }
  
}
