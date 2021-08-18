package gw.webservice.policycenter.bc801

uses gw.xml.ws.annotation.WsiExportable

@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/PCUnappliedInfo" )
@Export
final class PCUnappliedInfo {
  var _description : String as Description
  var _id : String as PublicID

  construct() {
  }

  construct(unappliedFund : UnappliedFund) {
    _description = unappliedFund.DisplayName
    _id = unappliedFund.PublicID
  }

  construct(unappliedFund : UnappliedFund, override_description : String) {
    _description = override_description
    _id = unappliedFund.PublicID
  }

}
