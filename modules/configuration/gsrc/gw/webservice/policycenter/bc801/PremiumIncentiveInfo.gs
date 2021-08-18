package gw.webservice.policycenter.bc801

uses gw.xml.ws.annotation.WsiExportable
uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount


@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/PremiumIncentiveInfo" )
@Export
final class PremiumIncentiveInfo {
  var _bonusPercentage : BigDecimal         as BonusPercentage
  var _threshold       : MonetaryAmount     as Threshold

  construct() {}

  construct(premiumIncentive : PremiumIncentive) {
    this.BonusPercentage = premiumIncentive.BonusPercentage
    this.Threshold       = premiumIncentive.Threshold
  }

}