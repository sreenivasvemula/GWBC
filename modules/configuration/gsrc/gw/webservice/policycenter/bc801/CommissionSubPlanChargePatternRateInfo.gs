package gw.webservice.policycenter.bc801

uses java.math.BigDecimal
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/CommissionSubPlanChargePatternRateInfo" )
@Export
final class CommissionSubPlanChargePatternRateInfo {
  var _rate              : BigDecimal          as Rate
  var _role              : typekey.PolicyRole  as Role
  var _chargePatternCode : String              as ChargePatternCode

  construct() {}

  construct(commissionSubPlanChargePatternRate : CommissionSubPlanChargePatternRate) {
    this.Rate               = commissionSubPlanChargePatternRate.Rate
    this.Role               = commissionSubPlanChargePatternRate.Role
    this.ChargePatternCode  = commissionSubPlanChargePatternRate.ChargePattern.ChargeCode
  }


}