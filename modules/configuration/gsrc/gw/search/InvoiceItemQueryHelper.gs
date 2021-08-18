package gw.search

uses gw.api.database.InOperation
uses gw.api.database.Query

uses java.math.BigDecimal

/**
 * Common invoice item search expression helper
 */
@Export
class InvoiceItemQueryHelper {
  static final var ZERO = BigDecimal.ZERO
  var _query: Query <InvoiceItem> as InvoiceItemQuery
  var _distributionType: DistributionTypeEnum
  /**
   * Required
   * The type of Agency Bill Distribution that you would like to search on.
   * This is necessary for determining what invoice items are fully settled, as for promise
   * distributions, we will count promised amounts as well as paid amounts towards settled
   * values, but for payment distributions we should only count paid amounts.
   */
  public static enum DistributionTypeEnum {
    Promise,
    Payment
  }

  public construct(distributionType: DistributionTypeEnum) {
    _query = Query.make(InvoiceItem)
    _distributionType = distributionType
  }

  public function filterOutFullySettledInvoiceItems(): InvoiceItemQueryHelper {
    if (SearchingForPayment) {
      _query.compare("CanBePaidMoreByAgencyBill", Equals, true)
    } else {
      _query.compare("CanBePromisedMoreByAgencyBill", Equals, true)
    }
    return this
  }

  public function restrictInvoiceItemsByIsNotCommissionRemainder(): InvoiceItemQueryHelper {
    _query.compare("Type", NotEquals, InvoiceItemType.TC_COMMISSIONREMAINDER)
    return this
  }

  public function restrictInvoiceItemsByIsNotReversedOrReversal(): InvoiceItemQueryHelper {
    _query.compare("Reversed", NotEquals, true).compare("ReversedInvoiceItem", Equals, null)
    return this
  }

  public function asSubselect(parent: Query, compareIn: String): InvoiceItemQueryHelper {
    parent.subselect("ID", InOperation.CompareIn, _query, compareIn)
    return this
  }

  private property get SearchingForPromise(): boolean {
    return _distributionType == DistributionTypeEnum.Promise
  }

  private property get SearchingForPayment(): boolean {
    return _distributionType == DistributionTypeEnum.Payment
  }
}
