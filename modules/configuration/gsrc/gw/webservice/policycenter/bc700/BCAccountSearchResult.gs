package gw.webservice.policycenter.bc700
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/BCAccountSearchResult" )
@Export
final class BCAccountSearchResult {
  public var AccountNumber : String
  public var AccountName : String
  public var PrimaryPayer : String

  construct() {
  }
  
  construct(account : Account) {
    this.AccountName = account.AccountName
    this.AccountNumber = account.AccountNumber
    this.PrimaryPayer = account.PrimaryPayer.DisplayName
  }
}
