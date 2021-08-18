package gw.webservice.policycenter.bc801

uses gw.api.web.account.AccountBalancesView
uses gw.pl.currency.MonetaryAmount
uses gw.xml.ws.annotation.WsiExportable

/**
 * A summary object that provides the billing summary for an account designed
 * explicitly for use with the PolicyCenter product.
 */
@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/BCPCAccountBillingSummary" )
@Export
final class BCPCAccountBillingSummary {
  var _accountName : String as AccountName
  var _accountNameKanji : String as AccountNameKanji
  var _currency : Currency as Currency
  var _billedOutstandingTotal : MonetaryAmount as BilledOutstandingTotal
  var _billedOutstandingCurrent : MonetaryAmount as BilledOutstandingCurrent
  var _billedOutstandingPastDue : MonetaryAmount as BilledOutstandingPastDue

  var _unbilledTotal : MonetaryAmount as UnbilledTotal
  var _unappliedFundsTotal : MonetaryAmount as UnappliedFundsTotal

  var _collateralRequirement : MonetaryAmount as CollateralRequirement
  var _collateralHeld : MonetaryAmount as CollateralHeld
  var _collateralChargesUnbilled : MonetaryAmount as CollateralChargesUnbilled
  var _collateralChargesBilled : MonetaryAmount as CollateralChargesBilled
  var _collateralChargesPastDue : MonetaryAmount as CollateralChargesPastDue

  var _delinquent : boolean as Delinquent

  var _billingSettings : AccountBillingSettings as BillingSettings
  var _primaryPayer : ContactSummary as PrimaryPayer

  construct() {}

  internal construct(account : Account) {
    _currency = account.Currency

    _accountName = account.AccountName
    _accountNameKanji = account.AccountNameKanji

    final var accountBalances = new AccountBalancesView(account)
    _billedOutstandingTotal = accountBalances.AdjustedOutstandingAmount
    _billedOutstandingCurrent = accountBalances.AdjustedBilledAmount
    _billedOutstandingPastDue = account.DelinquentAmount
    _unbilledTotal = accountBalances.AdjustedUnbilledAmount
    _unappliedFundsTotal = account.TotalUnappliedAmount

    _collateralRequirement = account.Collateral.TotalRequirementValue
    _collateralHeld = account.Collateral.TotalCollateralValue
    _collateralChargesUnbilled = account.Collateral.UnbilledAmount
    _collateralChargesBilled = account.Collateral.BilledAmount
    _collateralChargesPastDue = account.Collateral.DueAmount

    _delinquent = (account).hasActiveDelinquenciesOutOfGracePeriod()

    final var primaryPayer = account.PrimaryPayer.Contact
    _primaryPayer = new ContactSummary() {
        :Name = primaryPayer.DisplayName,
        :Address = primaryPayer.PrimaryAddress.DisplayName,
        :Phone = primaryPayer.PrimaryPhoneValue
    }

    _billingSettings = new AccountBillingSettings(account)
  }
}



