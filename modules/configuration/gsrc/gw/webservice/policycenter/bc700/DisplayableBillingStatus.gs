package gw.webservice.policycenter.bc700
uses java.math.BigDecimal
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/DisplayableBillingStatus" )
@Export
final class DisplayableBillingStatus {
  private var _Delinquent : boolean as Delinquent
  private var _TotalBilled : BigDecimal as TotalBilled
  private var _PastDue : BigDecimal as PastDue
  private var _Unbilled : BigDecimal as Unbilled
  private var _BillingMethod : String as BillingMethodCode
  
  construct() { }
  
  construct(policyPeriod : PolicyPeriod) {
    Delinquent = policyPeriod.hasActiveDelinquenciesOutOfGracePeriod()
    TotalBilled = policyPeriod.BilledAmount.Amount
    PastDue = policyPeriod.DelinquentAmount.Amount
    Unbilled = policyPeriod.UnbilledAmount.Amount
    BillingMethodCode = policyPeriod.BillingMethod.Code
  }
}
