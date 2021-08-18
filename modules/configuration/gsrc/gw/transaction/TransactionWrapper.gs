package gw.transaction

@Export
class TransactionWrapper {

  var _transaction : Transaction as transaction
  var _type : TransactionType as transactionType


  construct(t : Transaction, type : TransactionType) {
    _transaction = t
    _type = type
  }

  enum TransactionType {
    CHARGE(\ -> displaykey.Web.AgencyBillPolicyTxnsLV.Charge),
    PAYMENTANDCREDIT (\ -> displaykey.Web.AgencyBillPolicyTxnsLV.PaymentsAndCredit)

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

}
