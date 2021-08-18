package gw.search

uses gw.api.database.BooleanExpression
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Restriction
uses gw.api.database.Table
uses gw.util.concurrent.LockingLazyVar

uses java.io.Serializable
uses java.util.Arrays

/**
 * Criteria used to perform a producer search in the ProducerSearchDV.
 */
@Export
class ProducerSearchCriteria implements Serializable {

  final static var SHOULD_IGNORE_CASE = true

  var _hasAgencyBillPlan : Boolean as HasAgencyBillPlan
  var _producerName : String as ProducerName
  var _producerNameKanji : String as ProducerNameKanji
  var _producerCode : String as ProducerCode

  var _currencyCriterion : Currency as CurrencyCriterion
  var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()

  static function searchProducersByName(producerName: String): ProducerSearchView {
    // no-op if no producer name specified (see CC-15050)
    producerName = producerName.trim();
    if (producerName.Empty) {
      return null;
    }
    var criteria = new ProducerSearchCriteria()
    criteria.ProducerName = producerName
    return criteria.performSearch(StringCriterionMode.TC_STARTSWITH).FirstResult
  }

  function performSearch(contactCriteriaSearchMode : StringCriterionMode) : IQueryBeanResult<ProducerSearchView> {
    var query = buildQuery() as Query<ProducerSearchView>
    restrictSearchByContact(query, contactCriteriaSearchMode)
    restrictSearchByProducerCode(query)  
    return query.select()
  }
  
  function buildQuery() : Query {
    var query = gw.api.database.Query.make(ProducerSearchView)
    restrictSearchByProducerFields(query)
    restrictSearchByUserPermissions(query)
    restrictSearchByUserSecurityZone(query)
    restrictSearchByCurrency(query)
    return query
  }
  
  /** Restrict on items directly on the Producer table. */
  private function restrictSearchByProducerFields(query : Query) {
    if (ProducerName.NotBlank) {
      query.startsWith("Name", ProducerName, SHOULD_IGNORE_CASE)
    }
    if (ProducerNameKanji.NotBlank) {
      query.startsWith("NameKanji", ProducerNameKanji, false)
    }
    if (HasAgencyBillPlan) {
      query.compare("AgencyBillPlan", NotEquals, null)
    }
  }
  
  private function restrictSearchByContact(query : Query, contactCriteriaSearchMode : StringCriterionMode) {
    // Use a LockingLazyVar so that if no contact criteria was specified, we avoid doing the subselect entirely
    var lazyContactTable = LockingLazyVar.make(\ ->
        query.subselect("ID", CompareIn, ProducerContact, "Producer").join("Contact") as Table<Contact>)
    ContactCriteria.restrictTable(lazyContactTable, contactCriteriaSearchMode)
  }

  private function restrictSearchByUserPermissions(query : Query) {
    if (perm.System.prodsearch) {
      // User is permitted to search all producers
      return
    }
    
    // User is only permitted to search producers that they have created.
    query.compare("CreateUser", Equals, User.util.CurrentUser)
  }
  
  private function restrictSearchByProducerCode(query : Query) {
    var lazyProducerCodeTable = LockingLazyVar.make(\ ->
       query.subselect("ID", CompareIn, entity.ProducerCode, "Producer"))

    if (ProducerCode.NotBlank) {
      lazyProducerCodeTable.get().startsWith("Code", ProducerCode, SHOULD_IGNORE_CASE)
    }
  }
  
  private function restrictSearchByUserSecurityZone(query : Query) {
    if (perm.System.acctignoresecurityzone) {
      return // no need to consider security zones
    }
    query.or(new BooleanExpression() {
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

  private function restrictSearchByCurrency(query : Query) {
    if (CurrencyCriterion != null) {
      query.compare("Currency", Equals, CurrencyCriterion)
    }
  }
}
