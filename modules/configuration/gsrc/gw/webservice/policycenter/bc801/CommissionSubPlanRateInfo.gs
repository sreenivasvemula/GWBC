package gw.webservice.policycenter.bc801

uses java.math.BigDecimal
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/CommissionSubPlanRateInfo" )
@Export
final class CommissionSubPlanRateInfo {
  var _rate : BigDecimal         as Rate
  var _role : typekey.PolicyRole as Role

  construct() {}

  construct(policyRole : PolicyRole, rate : BigDecimal) {
    this.Role = policyRole
    this.Rate = rate
  }

}