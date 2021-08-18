package gw.webservice.policycenter.bc801
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/BCAccountSearchResult" )
@Export
final class BCAccountSearchResult {
  public var AccountNumber : String
  public var AccountName : String
  public var AccountNameKanji : String
  public var PrimaryPayer : String

  construct() {
  }
  
  construct(account : Account) {
    this.AccountName = account.AccountName
    this.AccountNameKanji = account.AccountNameKanji
    this.AccountNumber = account.AccountNumber
    this.PrimaryPayer = account.PrimaryPayer.DisplayName
  }
}
