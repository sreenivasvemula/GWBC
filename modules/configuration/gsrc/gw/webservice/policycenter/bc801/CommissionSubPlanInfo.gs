package gw.webservice.policycenter.bc801

uses gw.xml.ws.annotation.WsiExportable
uses java.lang.Integer

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/CommissionSubPlanInfo" )
@Export
final class CommissionSubPlanInfo {
  var _name                       : String                                    as Name
  var _payableCriteria            : typekey.PayableCriteria                   as PayableCriteria
  var _priority                   : Integer                                   as Priority
  var _suspendForDelinquency      : Boolean                                   as SuspendForDelinquency
  var _commissionableChargeItems  : String[]                                  as CommissionableChargeItems
  var _rates                      : CommissionSubPlanRateInfo[]               as Rates
  var _specialRates               : CommissionSubPlanChargePatternRateInfo[]  as SpecialRates
  var _premiumIncentives          : PremiumIncentiveInfo[]                    as PremiumIncentives
  var _publicID                   : String                                    as PublicID

  construct() {}

  construct(commissionSubPlan : CommissionSubPlan) {
    this.Name                       = commissionSubPlan.Name
    this.PayableCriteria            = commissionSubPlan.PayableCriteria
    this.Priority                   = commissionSubPlan.Priority
    this.SuspendForDelinquency      = commissionSubPlan.SuspendForDelinquency
    this.CommissionableChargeItems  = commissionSubPlan.CommissionableChargeItems.map( \ commissionableChargeItem -> commissionableChargeItem.ChargePattern.ChargeCode)
    this.Rates                      = PolicyRole.getTypeKeys(false).map( \ policyRole -> new CommissionSubPlanRateInfo(policyRole, commissionSubPlan.getBaseRate(policyRole))).toTypedArray()
    this.SpecialRates               = commissionSubPlan.SpecialChargePatternRates.map( \ commissionSubPlanChargePatternRate -> new CommissionSubPlanChargePatternRateInfo(commissionSubPlanChargePatternRate))
    this.PremiumIncentives          = commissionSubPlan.Incentives.whereTypeIs(PremiumIncentive).map( \ premiumIncentive -> new PremiumIncentiveInfo(premiumIncentive))
    this.PublicID                   = commissionSubPlan.PublicID
  }

}