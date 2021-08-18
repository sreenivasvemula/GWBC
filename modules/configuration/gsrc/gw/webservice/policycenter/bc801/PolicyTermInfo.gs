package gw.webservice.policycenter.bc801

uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date

/**
 * Defines the term information for a {@link PolicyPeriod} that is encapsulated
 * by the {@link gw.webservice.policycenter.bc801.PolicyBillingSummary}.
 *
 */
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/PolicyTermInfo")
@Export
final class PolicyTermInfo {
  var _policyNumber : String as PolicyNumber
  var _termNumber : int as TermNumber
  var _effDate : Date as EffectiveDate
  var _expDate : Date as ExpirationDate

  construct(){} // for WSI generation...

  construct(period : PolicyPeriod) {
    _policyNumber = period.PolicyNumber
    _termNumber = period.TermNumber
    _effDate = period.PolicyPerEffDate
    _expDate = period.PolicyPerExpirDate
  }
}