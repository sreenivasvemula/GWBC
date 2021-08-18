package gw.webservice.bc.bc801

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.domain.invoice.ReversePaymentsWhenMovingInvoiceItem
uses java.lang.IllegalStateException

/**
 * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI instead
 */
@RpcWebService
@Export
@java.lang.Deprecated
class IPolicyPeriodAPI
{
  construct()
  {
  }

  /**
   * Change policy period's billing method from direct bill to agency bill
   * @param policyPeriodPublicID public id of the policy period
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#changeBillingMethodToAgencyBill instead.
   */
  @Throws(BadIdentifierException, "Policy period public id is not valid")
  @Throws(RequiredFieldException, "Policy period public id cannot be null")
  @java.lang.Deprecated
  function changeBillingMethodToAgencyBill(policyPeriodID: String) {
    if (policyPeriodID == null) {
      throw new RequiredFieldException(displaykey.IPolicyPeriodAPI.Error.PolicyPeriodPublicIDCannotBeNull)
    }
    var policyPeriod = gw.api.database.Query.make(entity.PolicyPeriod).compare("PublicID", Equals, policyPeriodID).select().getAtMostOneRow()
    if (policyPeriod == null) {
      throw new BadIdentifierException(policyPeriodID)
    }
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.changeBillingMethodToAgencyBill(ReversePaymentsWhenMovingInvoiceItem.No)
    })
  }

  /**
   * Changes the Billing Method from Agency Bill to Direct Bill.
   * <p/>
   * It will try to make it appear as if the original policy period was Direct Bill to begin with and deal with
   * reallocating commissions, moving invoice items, etc.
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#changeBillingMethodToDirectBill instead.
   */
  @Throws(IllegalStateException, "if this PolicyPeriod is already Direct Bill")
  @Throws(BadIdentifierException, "Policy period public id is not valid")
  @Throws(RequiredFieldException, "Policy period public id cannot be null")
  @java.lang.Deprecated
  function changeBillingMethodToDirectBill(createInvoiceForToday: boolean, policyPeriodID: String) {
    if (policyPeriodID == null) {
      throw new RequiredFieldException(displaykey.IPolicyPeriodAPI.Error.PolicyPeriodPublicIDCannotBeNull)
    }
    var plcyPeriod = gw.api.database.Query.make(entity.PolicyPeriod).compare("PublicID", Equals, policyPeriodID).select().getAtMostOneRow()
    if (plcyPeriod == null) {
      throw new BadIdentifierException(policyPeriodID)
    }
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      plcyPeriod = bundle.add(plcyPeriod)
      plcyPeriod.changeBillingMethodToDirectBill(createInvoiceForToday, ReversePaymentsWhenMovingInvoiceItem.OnlyForNonPlanned)
    })
  }
}
