package gw.webservice.policycenter.bc700

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/BCAccountSearchCriteria" )
@Export
final class BCAccountSearchCriteria {
  public var AccountNumber : String
  public var AccountName : String
  public var IsListBill : Boolean
  
  construct() {
  }

  function searchForAccountNumbers() : IQueryBeanResult<Account> {
    var q = new Query<Account>(Account)
    q.compare("CloseDate", Relop.Equals, null)
    if (AccountNumber != null) {
      q.compare("AccountNumber", Relop.Equals, this.AccountNumber)
    }
    if (AccountName != null) {
      q.startsWith("AccountName", AccountName, true)
    }
    if (IsListBill) {
      q.compare("AccountType", Relop.Equals, AccountType.TC_LISTBILL)
    }
    return q.select()
  }
}
