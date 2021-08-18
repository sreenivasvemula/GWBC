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
 * Criteria used to perform an policy search in the PolicySearchDV.
 */
@Export
class PolicySearchCriteria implements Serializable {
  
  final static var SHOULD_IGNORE_CASE = true

  var _accountNumber : String as AccountNumber
  var _policyNumber : String as PolicyNumber
  var _closureStatus : PolicyClosureStatus as ClosureStatus
  var _lobCode : LOBCode as LOBCode
  var _billingMethod : PolicyPeriodBillingMethod as BillingMethod
  var _producerCode : String as ProducerCode
  var _producer : Producer as Producer

  var _contactCriteria : ContactCriteria as ContactCriteria = new ContactCriteria()
  
  var _currencyCriterion : Currency as CurrencyCriterion

  static function searchPoliciesByNumber(policyNumber: String): PolicySearchView {
    // no-op if no producer name specified (see CC-15050)
    policyNumber = policyNumber.trim();
    if (policyNumber.Empty) {
      return null;
    }
    var criteria = new PolicySearchCriteria()
    criteria.PolicyNumber = policyNumber
    return criteria.performSearch(StringCriterionMode.TC_STARTSWITH).FirstResult
  }

  function performSearch(contactCriteriaSearchMode : StringCriterionMode) : IQueryBeanResult<PolicySearchView> {
    var baseQuery = gw.api.database.Query.make(PolicySearchView)
    var accountQuery = buildQuery(baseQuery, contactCriteriaSearchMode) as Query<PolicySearchView>
    return accountQuery.select()
  }

  private function buildQuery(query : Query, contactCriteriaSearchMode : StringCriterionMode) : Query {
    restrictSearchByPolicyPeriodFields(query)
    restrictSearchByPolicyFields(query)
    restrictSearchByProducer(query)
    restrictSearchByUserPermissions(query)
    restrictSearchByAccountNumber(query)
    restrictSearchByContact(query, contactCriteriaSearchMode)
    restrictSearchByCurrency(query)

    query.and(\ restriction : Restriction -> {
      restrictSearchByUserSecurityZone(restriction)
      restrictSearchByPolicyNumber(restriction)
    })

    return query
  }
  
  private function restrictSearchByPolicyPeriodFields(query : Query) {
    if (ClosureStatus != null) {
      query.compare("ClosureStatus", Equals, ClosureStatus)
    }
    if (BillingMethod != null) {
      query.compare("BillingMethod", Equals, BillingMethod)
    }
  }

  private function restrictSearchByPolicyFields(query : Query) {
    if (LOBCode != null) {
      query.join("Policy").compare("LOBCode", Equals, LOBCode)
    }
  }

  private function restrictSearchByProducer(query : Query) {
    // Use a LockingLazyVar so that if no criteria needs the PrimaryPolicyPeriod,
    // we avoid doing the subselect
    var lazyProducerCodeTable = LockingLazyVar.make(\ ->
       query.subselect("ID", CompareIn, PolicyCommission, "PrimaryPolicyPeriod")
           .join("ProducerCode"))

    if (Producer != null) {
      lazyProducerCodeTable.get().compare("Producer", Equals, Producer)
    }

    if (ProducerCode.NotBlank) {
      lazyProducerCodeTable.get().startsWith("Code", ProducerCode, SHOULD_IGNORE_CASE)
    }
  }
  
  private function restrictSearchByUserPermissions(query : Query) {
    if (perm.System.plcysearch) {
      // User is permitted to search all policies
      return
    }
    // User is only permitted to search for policies that they have created.
    query.compare("CreateUser", Equals, User.util.CurrentUser)
  }
  
  private function restrictSearchByAccountNumber(query : Query) {
    if (AccountNumber.NotBlank) {
      query.join("Policy").join("Account").startsWith("AccountNumber", AccountNumber, SHOULD_IGNORE_CASE)
    }
  }

  private function restrictSearchByUserSecurityZone(rest : Restriction) {
    if (perm.System.plcyignoresecurityzone) {
      return // no need to consider security zones
    }
    rest.or(new BooleanExpression() {
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
  
  private function restrictSearchByPolicyNumber(rest : Restriction) {
    if (PolicyNumber.NotBlank) {
      rest.or(\ restriction : Restriction -> {
                        restriction.startsWith("PolicyNumber", PolicyNumber, SHOULD_IGNORE_CASE)
                        restriction.startsWith("PolicyNumberLong", PolicyNumber, SHOULD_IGNORE_CASE)
                      })
    }
  }
  
  private function restrictSearchByContact(query : Query, contactCriteriaSearchMode : StringCriterionMode) {
    // Use a LockingLazyVar so that if no contact criteria was specified, we avoid doing the subselect entirely
    var lazyContactTable = LockingLazyVar.make(\ ->
        query.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod").join("Contact") as Table<Contact>)
    ContactCriteria.restrictTable(lazyContactTable, contactCriteriaSearchMode)
  }
  
  private function restrictSearchByCurrency(query : Query) {
    if (CurrencyCriterion != null) {
      query.compare("Currency", Equals, CurrencyCriterion)
    }
  }
}
