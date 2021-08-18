package gw.webservice.bc.bc700
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.domain.invoice.ReversePaymentsWhenMovingInvoiceItem
uses java.lang.IllegalStateException

//@RpcWebService
@Export
class IPolicyPeriodAPI {
  construct() { }
  
  /**
   * Change policy period's billing method from direct bill to agency bill
   * @param policyPeriodPublicID public id of the policy period
   */
  @Throws(BadIdentifierException, "Policy period public id is not valid")
  @Throws(RequiredFieldException, "Policy period public id cannot be null")
  function changeBillingMethodToAgencyBill(policyPeriodID : String){
    if (policyPeriodID == null) {
      throw new RequiredFieldException("Policy period public id cannot be null")  
    }
    var policyPeriod = gw.api.database.Query.make(PolicyPeriod).compare("PublicID", Equals, policyPeriodID).select().getAtMostOneRow()
    if (policyPeriod == null) {
      throw new BadIdentifierException(policyPeriodID)
    }
    
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.changeBillingMethodToAgencyBill(ReversePaymentsWhenMovingInvoiceItem.No)
    })
  }

  /**
   * Changes the Billing Method from Agency Bill to Direct Bill.
   * <p/>
   * It will try to make it appear as if the original policy period was Direct Bill to begin with and deal with
   * reallocating commissions, moving invoice items, etc.
   */
  @Throws(IllegalStateException, "if this PolicyPeriod is already Direct Bill")
  @Throws(BadIdentifierException, "Policy period public id is not valid")
  @Throws(RequiredFieldException, "Policy period public id cannot be null")
  function changeBillingMethodToDirectBill(createInvoiceForToday : boolean, policyPeriodID : String) {
    if (policyPeriodID == null) {
      throw new RequiredFieldException("Policy period public id cannot be null")  
    }
    var plcyPeriod = gw.api.database.Query.make(PolicyPeriod).compare("PublicID", Equals, policyPeriodID).select().getAtMostOneRow()
    if (plcyPeriod == null) {
      throw new BadIdentifierException(policyPeriodID)
    }
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      plcyPeriod = bundle.add(plcyPeriod)
      plcyPeriod.changeBillingMethodToDirectBill( createInvoiceForToday, ReversePaymentsWhenMovingInvoiceItem.OnlyForNonPlanned )  
    })
  }
}
