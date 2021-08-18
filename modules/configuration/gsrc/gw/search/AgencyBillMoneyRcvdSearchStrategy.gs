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
 * Strategy used to search for agency bill payments.
 */
@Export
class AgencyBillMoneyRcvdSearchStrategy extends SearchStrategy {

  construct(searchCriteria : gw.search.PaymentSearchCriteria) {
    super(searchCriteria)
  }

  override function criteriaMootsSearch() : boolean {
    return PaymentCriteria.AccountNumber != null || PaymentCriteria.PolicyNumber != null
  }

  override function getEntityType() : IEntityType {
    return AgencyMoneyReceivedSearchView.Type
  }
  
  override function addConditions(query : Query) {
    if (PaymentCriteria.OwnerOfActiveSuspenseItems) {
        addSuspenseItemsCriterionForPaymentSearch(query)
    }

    //restrict on producer name if available
    if (PaymentCriteria.ProducerName != null)
    {
      var producerTable = query.join("Producer")
      producerTable.startsWith("Name", PaymentCriteria.ProducerName, true)
    }

    if (PaymentCriteria.ProducerNameKanji != null)
    {
      var producerTable = query.join("Producer")
      producerTable.startsWith("NameKanji", PaymentCriteria.ProducerNameKanji, false)
    }

    //restrict on producer code if available
    if (PaymentCriteria.ProducerCode != null)
    {
      var producerTable = query.join("Producer")
      var producerCodeTable = producerTable.subselect("ID", CompareIn, entity.ProducerCode, "Producer")
      producerCodeTable.startsWith("Code", PaymentCriteria.ProducerCode, true)
    }

  }
  
  private function restrictContactsOnProducer(producerTable : Table) {
    // get contacts via producer
    var contactTable = LockingLazyVar.make(\ -> producerTable.subselect("ID", CompareIn, ProducerContact, "Producer").join("Contact") as Table<Contact>)
    PaymentCriteria.ContactCriteria.restrictTable(contactTable, SearchMode)
  }

  override function getPaymentDateColumn() : String {
    return "ReceivedDate"
  }
  
  function restrictSearchByProducerSecurityZone(producerTable : Table) {
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

  override function getRestrictedSecurityZoneQuery() : IQuery {
    var producerSecurityZoneQuery = buildRootQuery(getEntityType())

    if (!perm.System.prodignoresecurityzone) {
      var producerTable = producerSecurityZoneQuery.join("Producer")
      restrictSearchByProducerSecurityZone(producerTable)
    }
    
    return producerSecurityZoneQuery
  }

  override function getRestrictedContactQuery() : IQuery {
    var contactsOnProducerQuery = buildRootQuery(getEntityType())
    var producerTable = contactsOnProducerQuery.join("Producer")
    restrictContactsOnProducer(producerTable)
    if (!perm.System.prodignoresecurityzone) {
      restrictSearchByProducerSecurityZone(producerTable)
    }
    return contactsOnProducerQuery
  }

}
