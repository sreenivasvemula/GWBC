package gw.webservice.policycenter.bc801

uses gw.pl.currency.MonetaryAmount
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/DisplayableBillingStatus" )
@Export
final class DisplayableBillingStatus {
  private var _Delinquent : boolean as Delinquent
  private var _TotalBilled : MonetaryAmount as TotalBilled
  private var _PastDue : MonetaryAmount as PastDue
  private var _Unbilled : MonetaryAmount as Unbilled
  private var _BillingMethod : String as BillingMethodCode

  construct() { }

  construct(policyPeriod : PolicyPeriod) {
    Delinquent = policyPeriod.hasActiveDelinquenciesOutOfGracePeriod()
    TotalBilled = policyPeriod.BilledAmount
    PastDue = policyPeriod.DelinquentAmount
    Unbilled = policyPeriod.UnbilledAmount
    BillingMethodCode = policyPeriod.BillingMethod.Code
  }
}