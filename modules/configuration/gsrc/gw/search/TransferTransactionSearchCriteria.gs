package gw.search

uses com.guidewire.pl.web.controller.UserDisplayableException
uses gw.api.database.IQueryBeanResult
uses gw.api.database.PropertyResolver
uses gw.api.database.Query
uses gw.util.GosuStringUtil

uses java.io.Serializable
uses java.util.Date

@Export
class TransferTransactionSearchCriteria implements Serializable {

  private static final var SECONDS_IN_A_DAY = 86400

  public static enum TransferType{
    FromAccountToProducer(\ -> displaykey.Web.TransferTransactionSearchCriteria.FromAccountToProducer),
    FromAccountToDifferentAccount(\ -> displaykey.Web.TransferTransactionSearchCriteria.FromAccountToDifferentAccount),
    FromAccountToSameAccount(\ -> displaykey.Web.TransferTransactionSearchCriteria.FromAccountToSameAccount),
    FromProducerToAccount(\ -> displaykey.Web.TransferTransactionSearchCriteria.FromProducerToAccount),
    FromProducerToProducer(\ -> displaykey.Web.TransferTransactionSearchCriteria.FromProducerToProducer)

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  var _transactionNumber : String as TransactionNumber
  var _earliestDate : Date as EarliestDate
  var _latestDate : Date as LatestDate
  var _transferType : TransferType as TransferType

  function performSearch() : IQueryBeanResult<TransferTransaction> {

    verifyMinimumSearchCriteria()

    var query = Query.make(TransferTransaction)

    SearchHelper.checkForDateExceptions(EarliestDate, LatestDate);

    if (TransactionNumber != null) {
      query.compare("TransactionNumber", Equals, TransactionNumber)
    }

    if (EarliestDate != null or LatestDate != null) {
      // The date in the db has a time component, so adjust the date parameters to include all records
      // containing transactions that occurred on that day
      query.between("TransactionDate",
          EarliestDate != null ? EarliestDate.trimToMidnight() : null,
          LatestDate != null ? LatestDate.trimToMidnight().addSeconds(SECONDS_IN_A_DAY - 1) : null);
    }

    var contextTable = query.join("TransferTxContext");

    switch(_transferType){

      case FromAccountToProducer:
        contextTable.compare("SourceAccount", NotEquals, null)
        contextTable.compare("TargetProducer", NotEquals, null)
        break;

      case FromProducerToAccount:
        contextTable.compare("SourceProducer", NotEquals, null)
        contextTable.compare("TargetAccount", NotEquals, null)
        break;

      case FromAccountToDifferentAccount:
        contextTable.compare("SourceAccount", NotEquals, null)
        contextTable.compare("TargetAccount", NotEquals, null)
        contextTable.compare("TargetAccount", NotEquals, PropertyResolver.getProperty(TransferTxContext, "SourceAccount"))
        break;

      case FromAccountToSameAccount:
        contextTable.compare("TargetAccount", Equals, PropertyResolver.getProperty(TransferTxContext, "SourceAccount"))
        break;

      case FromProducerToProducer:
        contextTable.compare("SourceProducer", NotEquals, null)
        contextTable.compare("TargetProducer", NotEquals, null)
        break;
    }

    return query.select()
  }

  function verifyMinimumSearchCriteria(){

    if (GosuStringUtil.isBlank(_transactionNumber) and _transferType == null){
      throw new UserDisplayableException(displaykey.Web.NewTransferFundsReversal.NeedsMinimumSearchCriteria)
    }

  }

}