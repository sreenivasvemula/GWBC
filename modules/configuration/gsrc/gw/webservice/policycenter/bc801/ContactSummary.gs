package gw.webservice.policycenter.bc801
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/ContactSummary" )
@Export
final class ContactSummary {
  public var Name : String
  public var Address : String
  public var Phone : String

  construct() {
  }

}
