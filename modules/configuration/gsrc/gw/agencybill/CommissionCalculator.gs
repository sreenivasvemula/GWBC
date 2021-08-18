package gw.agencybill

uses com.google.common.base.Preconditions
uses gw.api.financials.MonetaryAmounts
uses gw.api.system.BCConfigParameters
uses gw.api.util.DisplayableException
uses gw.api.util.Ratio
uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal

@Export
class CommissionCalculator {

  static function convertNetToApplyToGrossAndCommissionToApply( netToApply : MonetaryAmount, agencyDistItem : BaseDistItem ) {
    Preconditions.checkArgument(agencyDistItem.CommissionModifiable,
        displaykey.Java.Error.BaseDistItem.CannotModifyCommission(agencyDistItem))
    // First, check to make sure the NetToApply is in scale
    if (netToApply != null) {
      var roundedNetToApply = roundMoney(netToApply)
      if (netToApply.movePointRight(2) != roundedNetToApply.movePointRight(2)) {
       throw new DisplayableException(
           displaykey.Java.Error.AgencyCycleDistChargeOwnerView.InvalidNetAmountToApply(netToApply))
      }
    }

    final var immutableNetToApply = MonetaryAmounts.zeroIfNull(netToApply, agencyDistItem.Currency)

    var grossToApply = calculateGrossToApplyFromNet(immutableNetToApply, agencyDistItem)
    var commissionToApply = calculateCommissionToApplyFromNet(immutableNetToApply, grossToApply, agencyDistItem)
       
    agencyDistItem.GrossAmountToApply = grossToApply
    agencyDistItem.CommissionAmountToApply = commissionToApply
  }

  static function convertPercentToApplyToGrossAndCommissionToApply( percentToApply : BigDecimal, agencyDistItem : BaseDistItem) {
    Preconditions.checkArgument(agencyDistItem.CommissionModifiable,
        displaykey.Java.Error.BaseDistItem.CannotModifyCommission(agencyDistItem))
    agencyDistItem.CommissionAmountToApply = roundMoney(agencyDistItem.GrossAmountToApply * percentToApply / 100)
  }
  
  static function convertGrossToApplyToGrossAndCommissionToApply(agencyDistItem : BaseDistItem) {
    var grossAmount = agencyDistItem.GrossAmountToApply
    if (agencyDistItem.CommissionModifiable) {
      var percentOwed = getCommissionPercent(agencyDistItem)
      agencyDistItem.CommissionAmountToApply = roundMoney(grossAmount * percentOwed / 100)
    }
  }
  
  static function getCommissionPercentToApply( agencyDistItem : BaseDistItem ) : BigDecimal {
    var commission = agencyDistItem.CommissionAmountToApply 
    var gross = agencyDistItem.GrossAmountToApply
    return commission.percentageOfAsBigDecimal(gross)
  }
  
  static function getCommissionPercent( agencyDistItem : BaseDistItem ) : BigDecimal {
    var commission = agencyDistItem.ItemCommissionToTarget == null
        ? 0bd.ofCurrency(agencyDistItem.Currency)
        : agencyDistItem.ItemCommissionToTarget.CommissionAmount
    var gross = agencyDistItem.InvoiceItem.Amount
    return commission.percentageOfAsBigDecimal(gross)
  }
  
  private static function calculateGrossToApplyFromNet(
              netToApply : MonetaryAmount, agencyDistItem : BaseDistItem) : MonetaryAmount {
    var gross = agencyDistItem.InvoiceItem.Amount
    if (gross.IsZero) {
      return gross
    } else if (netToApply == agencyDistItem.NetAmountOwed) {
      return agencyDistItem.GrossAmountOwed
    } else {
      return Ratio.valueOf(netToApply.Amount, 100 - getCommissionPercent(agencyDistItem))
            .multiply(100)
            .toMonetaryAmount(gross.Currency)
    }
  }
  
  private static function calculateCommissionToApplyFromNet(
        netToApply : MonetaryAmount, grossToApply : MonetaryAmount, agencyDistItem : BaseDistItem) : MonetaryAmount {
    var commission = agencyDistItem.InvoiceItem.PrimaryCommissionAmount
     if (commission.IsZero) {
      return commission
    } else if (netToApply == agencyDistItem.NetAmountOwed) {
      return agencyDistItem.CommissionAmountOwed
    } else {
      return grossToApply - netToApply
    }
  }
  
  private static function roundMoney(value : MonetaryAmount) : MonetaryAmount {
    return MonetaryAmounts.scaleToCurrency(value, BCConfigParameters.DefaultRoundingMode)
  }
}
