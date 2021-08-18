package gw.webservice.policycenter.bc700

uses gw.xml.ws.annotation.WsiExportable

uses java.math.BigDecimal

/**
 * A summary object that provides the billing summary for an account designed
 * explicitly for use with the PolicyCenter product.
 */
@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/BCPCAccountBillingSummary" )
@Export
final class BCPCAccountBillingSummary {
  var _AccountName : String as AccountName
  var _billedOutstandingTotal : BigDecimal as BilledOutstandingTotal
  var _billedOutstandingCurrent : BigDecimal as BilledOutstandingCurrent
  var _billedOutstandingPastDue : BigDecimal as BilledOutstandingPastDue

  var _unbilledTotal : BigDecimal as UnbilledTotal
  var _unappliedFundsTotal : BigDecimal as UnappliedFundsTotal

  var _collateralRequirement : BigDecimal as CollateralRequirement
  var _collateralHeld : BigDecimal as CollateralHeld
  var _collateralChargesUnbilled : BigDecimal as CollateralChargesUnbilled
  var _collateralChargesBilled : BigDecimal as CollateralChargesBilled
  var _collateralChargesPastDue : BigDecimal as CollateralChargesPastDue

  var _delinquent : boolean as Delinquent
  
  var _BillingSettings : AccountBillingSettings as BillingSettings
  var _PrimaryPayer : ContactSummary as PrimaryPayer
}



