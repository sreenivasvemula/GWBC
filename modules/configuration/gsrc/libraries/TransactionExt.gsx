package libraries
uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount
uses java.math.RoundingMode

@Export
enhancement TransactionExt : Transaction
{
  function getGrossAmount(transactionContext : TransactionRelation) : MonetaryAmount{
    if(this typeis CommissionsReserveTxn or this typeis CommissionsReserveWriteoffTxn)
    {
      return 0bd.ofCurrency(this.Currency)
    }
    return this.Amount
  }
  
  function getCommissionAmount(transactionContext : TransactionRelation) : MonetaryAmount {
    if(this typeis CommissionAdjusted)
    {
      return this.CommissionAmountChanged
    }
    else if(this typeis CommissionsReserveTxn)
    {
      return this.CommissionAmount
    }
    else if(this typeis InitialChargeTxn)
    {
      return this.CommissionAmount
    }
    else if(this typeis ChargePaidFromUnapplied)
    {
      return this.CommissionAmount
    }
    else if(this typeis CommissionsReservePositiveWriteoffTxn)
    {
      return this.Amount.negate()
    }
    else if (this typeis CommissionsReserveNegativeWriteoffTxn) {
      return this.Amount
    }
    return 0bd.ofCurrency(this.Currency)
  }
  
  function getCommissionRate(TransactionContext : TransactionRelation) : BigDecimal {
    var gross = getGrossAmount(TransactionContext)
    var commission = getCommissionAmount(TransactionContext)
    if (gross.IsZero || commission.IsZero) {
      return 0
    } else {
      return (commission * 100).divide( gross, 5, RoundingMode.DOWN )
    }
  }
  
  function getNetAmount(TransactionContext : TransactionRelation) : MonetaryAmount {
    return getGrossAmount(TransactionContext)
    .subtract( getCommissionAmount(TransactionContext) )
  }
}
