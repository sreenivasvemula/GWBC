package gw.search

uses com.google.common.base.Preconditions
uses gw.api.database.IQueryBeanResult
uses gw.api.database.InOperation
uses gw.api.database.Query
uses gw.search.InvoiceItemQueryHelper.DistributionTypeEnum

uses java.io.Serializable
uses java.lang.IllegalStateException

/**
 * Class to find Policy Periods in the context of any Agency Bill Distribution.
 */
@Export
class PolicyPeriodSearchCriteria  implements Serializable {

 /**
  * Required
  * The type of results we want will depend on the context of this search.  When we are searching
  * for policy periods that are eligible on a given set of Statement Invoices all paid by the
  * payer producer (like we do from the AgencyDistributionWizard_MoneyDetailsScreen) we will want
  * to restrict our policy period results to policy periods that have at least one invoice item
  * on the given set of statements.
  * Otherwise, we will include any policy period for which there exists at least one invoice item
  * where either there is not primary active item commission, or the the primary active item
  * is earning on a producer code associated with the payer producer.  (This is a necessary
  * restriction because a producer is not permitted to pay an invoice item for which it is not the
  * primary active earner).
  * NOTE: If you choose PoliciesOngivenStatements, you must also provide an array of StatementInvoices.
  * If you choose AnyPolicy, the array of StatementInvoices should be empty.
  */
  public static enum SearchContextEnum {
    PoliciesOnGivenStatements,
    AnyPolicy  
  }

 /**
  * Optional
  * You may want to restrict your policy period results by a Payer.  You can choose to either
  * restrict by a Producer payer or an Account payer.
  * We will return any policy period for which all the other limiting requirements are met, and
  * at least one otherwise eligible invoice item exists which is paid by the given payer.
  * For Account Payer, you must not only specify the payer type, but also the AccountPayer.
  * For Producer Payer, you need only specify the payer type, as the Producer must be the PayerProducer
  */
  public static enum PayerTypeEnum {
    Producer(\ -> displaykey.Web.Search.PolicyPeriods.PayerType.Producer),
    Account(\ -> displaykey.Web.Search.PolicyPeriods.PayerType.Account),
    
    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }
    
    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  private var logSQL = false //for debugging
  
  var _query : Query<PolicyPeriod>
  var _invoiceItemSubselect : Query<InvoiceItem>
  var _payerProducer : Producer
  var _distributionType : DistributionTypeEnum
  var _searchContext : SearchContextEnum

  var _payerAccount : Account as PayerAccount
  var _payerType : PayerTypeEnum as PayerType
  var _ownerAccount : Account as OwnerAccount
  var _policyNumber : String as PolicyNumber
  var _product : LOBCode as Product
  var _statementInvoices : StatementInvoice[] as StatementInvoices
  var _invoiceItemsToExclude : InvoiceItem[] as InvoiceItemsToExclude
  
  construct(distributionType : DistributionTypeEnum, searchContext : SearchContextEnum, producer : Producer) {
    Preconditions.checkNotNull(distributionType, displaykey.Web.Search.PolicyPeriods.Error.BadArgument.DistributionTypeIsNull)
    Preconditions.checkNotNull(searchContext, displaykey.Web.Search.PolicyPeriods.Error.BadArgument.SearchContextIsNull)
    Preconditions.checkNotNull(producer, displaykey.Web.Search.PolicyPeriods.Error.BadArgument.ProducerIsNull)
    _distributionType = distributionType
    _searchContext = searchContext
    _payerProducer = producer
  }
  
  function performSearch() : IQueryBeanResult<PolicyPeriod> {
    if (_searchContext == SearchContextEnum.PoliciesOnGivenStatements && _statementInvoices.IsEmpty) {
      throw new IllegalStateException(displaykey.Web.Search.PolicyPeriods.Error.PoliciesOnGivenStatementsWithNoStatements)  
    }
    if (_searchContext == SearchContextEnum.AnyPolicy && _statementInvoices.length > 0) {
      throw new IllegalStateException(displaykey.Web.Search.PolicyPeriods.Error.AnyPolicyWithStatements)  
    }
    if (_searchContext == SearchContextEnum.PoliciesOnGivenStatements && PayerTypeIsAccount) { 
      throw new IllegalStateException(displaykey.Web.Search.PolicyPeriods.Error.PoliciesOnGivenStatementsWithFilterByAccountPayer)
    }

    buildQuery()
    return _query.select()
  }

  private function buildQuery() {  
    _query = Query.make(PolicyPeriod)

    _invoiceItemSubselect = new InvoiceItemQueryHelper(_distributionType)
        .restrictInvoiceItemsByIsNotReversedOrReversal()
        .restrictInvoiceItemsByIsNotCommissionRemainder()
        .filterOutFullySettledInvoiceItems()
        .asSubselect(_query, "PolicyPeriod")
        .InvoiceItemQuery

    restrictPolicyPeriodByPayerOrEarner()
    restrictPolicyPeriodByOwnerAccount()
    restrictPolicyPeriodByPolicyNumber()
    restrictPolicyPeriodByProduct()
    restrictPolicyPeriodByPolicyStatus()

    _query.withDistinct(true)
  }
  
  private function restrictPolicyPeriodByPayerOrEarner() {  
    if (_searchContext == SearchContextEnum.AnyPolicy) {
      if (PayerTypeIsProducer) {
        restrictPolicyPeriodByPayerProducer()
      } else {
        restrictPolicyPeriodByEarningProducer()
        restrictPolicyPeriodByPayerAccount()
      }
    } else if (_searchContext == SearchContextEnum.PoliciesOnGivenStatements) {
      restrictPolicyPeriodByPayerProducer()
    } else {
      throw new IllegalStateException(displaykey.Web.Search.PolicyPeriods.Error.UnrecognizedSearchContext(_searchContext))
    }
  }
  
  public property get PayerProducer() : Producer {
    return _payerProducer  
  }
  
  public property get PayerTypeIsAccount() : boolean {
    return PayerType == PayerTypeEnum.Account 
  }
  
  public property get PayerTypeIsProducer() : boolean {
    return PayerType == PayerTypeEnum.Producer 
  }
  
  public property set StatementInvoices (statementInvoicesToAdd : StatementInvoice[])  {
    if (_searchContext != SearchContextEnum.PoliciesOnGivenStatements) {
      throw new IllegalStateException(displaykey.Web.Search.PolicyPeriods.Error.AnyPolicyWithStatements) 
    }
    _statementInvoices = statementInvoicesToAdd
  }
      
  private function restrictPolicyPeriodByEarningProducer() {
     // the items must not be earning primary active at all or else earning primary active on the payer producer  
     var noPrimaryActiveItemCommissionSubselect = Query.make(ItemCommission)
     noPrimaryActiveItemCommissionSubselect
       .compare("Active", Equals, true)
       .join("PolicyCommission")
       .compare("Role", Equals, PolicyRole.TC_PRIMARY)
     var activePrimaryItemCommissionEarnsOnPayerProducerSubselect = Query.make(ItemCommission)
     activePrimaryItemCommissionEarnsOnPayerProducerSubselect
       .compare("Active", Equals, true)
       .join("PolicyCommission")
       .compare("Role", Equals, PolicyRole.TC_PRIMARY)
       .join("ProducerCode")
       .compare("Producer", Equals, PayerProducer)
       
     _invoiceItemSubselect.and(\ andRestriction -> {
       andRestriction.or(\ orRestriction -> {
         orRestriction.subselect("ID", InOperation.CompareNotIn, noPrimaryActiveItemCommissionSubselect, "InvoiceItem")
         orRestriction.subselect("ID", InOperation.CompareIn, activePrimaryItemCommissionEarnsOnPayerProducerSubselect, "InvoiceItem")
        })
     })
  }
  
  private function restrictPolicyPeriodByPayerProducer() {
      var statementInvoiceTable = _invoiceItemSubselect.join("Invoice").cast(StatementInvoice.Type)
      if (_searchContext == SearchContextEnum.PoliciesOnGivenStatements) {
          statementInvoiceTable.compareIn("ID", _statementInvoices.map(\ statement -> statement.ID))
      }
      statementInvoiceTable.join("AgencyBillCycle").compare("Producer", Equals, PayerProducer)
  }
  
  private function restrictPolicyPeriodByPayerAccount() {
    if (PayerTypeIsAccount && PayerAccount != null) {      
      _invoiceItemSubselect
        .join("Invoice")
        .cast(AccountInvoice.Type)
        .compare("Account", Equals, PayerAccount)
    }  
  }

  private function restrictPolicyPeriodByOwnerAccount() {
    if (OwnerAccount != null) {
      _query.join("Policy").compare("Account", Equals, OwnerAccount)
    }
  }
  
  private function restrictPolicyPeriodByPolicyNumber() {
    if (PolicyNumber.NotBlank) {
      _query.or(\ restriction -> restriction.startsWith("PolicyNumber", PolicyNumber, true))
      _query.or(\ restriction -> restriction.startsWith("PolicyNumberLong", PolicyNumber, true))
    }
  }
  
  private function restrictPolicyPeriodByProduct() {
    if (Product != null) {
      _query.join("Policy").compare("LOBCode", Equals, Product)
    }
  }
  
  private function restrictPolicyPeriodByPolicyStatus() {
    _query.compare("ClosureStatus", NotEquals, PolicyClosureStatus.TC_CLOSED)
  }

}
