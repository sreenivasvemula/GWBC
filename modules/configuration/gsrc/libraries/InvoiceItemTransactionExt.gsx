package libraries

uses com.guidewire.bc.util.Percentage

uses java.lang.IllegalArgumentException
uses gw.pl.currency.MonetaryAmount
uses java.math.BigDecimal
uses java.math.RoundingMode

@Export
enhancement InvoiceItemTransactionExt : entity.ChargeInvoicingTxn {

  function getCommissionAmount() : MonetaryAmount
  {
    var commissionAmount : MonetaryAmount
    var zero = 0bd.ofCurrency(this.Currency)
   
    if (this typeis ChargeBilled or this typeis ChargeDue) {
      var invoiceItem = this.InvoiceItem
      commissionAmount = invoiceItem.PrimaryCommissionAmount
      if ( commissionAmount == null ) {
        commissionAmount = zero
      }
    }
    else if (this typeis ChargeWrittenOff) {
      commissionAmount = zero
    }
    else if (this typeis ChargePaidFromUnapplied)
    {
      var invoiceItem = this.InvoiceItem
      if ( invoiceItem.PrimaryCommissionAmount == null  ) {
        commissionAmount = zero
      } else {
        commissionAmount = invoiceItem.PrimaryCommissionAmount.negate()
      }
    }
    else if (this typeis CommissionsReserveWriteoffTxn) {
      commissionAmount = this.Amount
    }
    else {
      throw new IllegalArgumentException("Unsupported transaction type: " + this.Subtype);
    }
    return commissionAmount
  }

  function getGrossAmount() : MonetaryAmount {
    // print (typeof this)
    var grossAmount : MonetaryAmount
    if (this typeis ChargeBilled or this typeis ChargeDue) {
      grossAmount = this.Amount
    }
    else if (this typeis ChargePaidFromUnapplied or this typeis ChargeWrittenOff) {
      return this.Amount.negate()
    }
    else if (this typeis CommissionsReserveWriteoffTxn) {
      grossAmount = 0bd.ofCurrency(this.Currency)
    }
    else {
      throw new IllegalArgumentException("Unsupported transaction type: " + this.Subtype);
    }
    return grossAmount
  }

  function getNetAmount() : MonetaryAmount {
    return this.getGrossAmount().subtract( this.getCommissionAmount() );
  }

  function getCommissionPercentage() : Percentage {
    if (this.getGrossAmount().signum() == 0) {
      return Percentage.ZERO_PERCENT
    }
    return this.getCommissionAmount().percentageOf( this.getGrossAmount() )
  }
  
  function getCommissionPercentageAsBigDecimal() : BigDecimal {
    if (this.getGrossAmount().signum() == 0) {
      return BigDecimal.ZERO
    }
    return this.getCommissionAmount().percentageOfAsBigDecimal( this.getGrossAmount() )
  }
  
  function getAverageCommissionRate() : BigDecimal {
    var totalGross = this.InvoiceItem.GrossUnsettledAmount
    if (totalGross.signum() == 0) {
      return BigDecimal.ZERO
    }
    return this.getCommissionAmount().divide( totalGross, RoundingMode.DOWN ).movePointRight( 2 ).setScale( 2,  RoundingMode.DOWN )
  }

  function isReversible() : Boolean {
    if (this typeis ChargeBilled) {
      return false;
    }
    return this.canReverse()
  }

  function isEditable() : Boolean
  {
    return this typeis ChargePaidFromProducer and (not this.Reversed) and (not this.Reversal)
  }

  function getPaymentComments() : String {
    if (this typeis ChargePaidFromProducer) {
      return this.AgencyPaymentItem.PaymentComments
    }
    return "";
  }

  /**
   * If the transaction is a ChargePaidFromProducer, then we can't reverse it directly, we have to reverse the AgencyPaymentItem.
   */
  function doReverse() {
    if (this typeis ChargePaidFromProducer) {
      var agencyPaymentItem = this.AgencyPaymentItem
      agencyPaymentItem.reverse()
    } else {
      this.reverse()
    }
  }
}
