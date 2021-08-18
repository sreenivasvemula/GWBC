package gw.transaction

@Export
class TransferFundsReversalWizardContext {

  private var _transferFundTransaction : TransferTransaction
  var _reversalReason : ReversalReason
  var _fundsTransferReversal : FundsTransferReversal
  
  construct() {
    _fundsTransferReversal = new FundsTransferReversal()
  }

  function setTransferFundTransaction(transferFund : Transaction) {
    _transferFundTransaction = transferFund as TransferTransaction
    _fundsTransferReversal.FundsTransferTransaction = _transferFundTransaction
  }

  function getTransferFundTransaction() : Transaction {
    return _transferFundTransaction
  }


  function getSourceName() : String{
    if (_transferFundTransaction.FundsTransfer.SourceUnapplied != null) {
      return _transferFundTransaction.FundsTransfer.SourceUnapplied.TransactionSpecialDisplayName;
    } else {
      return _transferFundTransaction.FundsTransfer.SourceProducer.DisplayName
    }
  }
  
  
  function getDestinationName() : String{
    if (_transferFundTransaction.FundsTransfer.TargetUnapplied != null) {
      return  _transferFundTransaction.FundsTransfer.TargetUnapplied.TransactionSpecialDisplayName;
    } else {
      return _transferFundTransaction.FundsTransfer.TargetProducer.DisplayName
    }
  }
  
  function setReversalReason(reason : ReversalReason){
    _reversalReason = reason
  }
  
  function createReversal(){
    _fundsTransferReversal.ReversalReason = _reversalReason
    _fundsTransferReversal.execute()
  }
  
  function approvalRequiredAlertBarVisible() : boolean {
    return !_fundsTransferReversal.getApprovalHandler().isCurrentUserCanApproveAction()
  }
}