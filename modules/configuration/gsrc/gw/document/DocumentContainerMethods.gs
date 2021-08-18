package gw.document

@Export
class DocumentContainerMethods {
  public static function addHistoryIfDCIsAccount(documentContainer : DocumentContainer) {
    if (documentContainer typeis Account) {
      documentContainer.addHistoryFromGosu( DateTime.CurrentDate, 
          HistoryEventType.TC_DOCUMENTSUPDATED, 
          displaykey.Java.AccountHistory.DocumentsUpdated, 
          null, null, true )
    }
  }
}
