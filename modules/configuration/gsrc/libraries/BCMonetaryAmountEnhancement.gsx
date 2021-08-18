package libraries

uses com.guidewire.bc.system.dependency.BCDependencies
uses com.guidewire.bc.util.Percentage
uses gw.api.financials.MonetaryAmounts
uses gw.api.util.Ratio
uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal

@Export
enhancement BCMonetaryAmountEnhancement : MonetaryAmount {
  
  function percentageOf(base : MonetaryAmount) : Percentage {
    if (base.signum() == 0) {
      return Percentage.ZERO_PERCENT
    }
    return Percentage.fromRatioBetween( this, base )
  }
  
  function percentageOfAsBigDecimal(base : MonetaryAmount ) : BigDecimal {
    if (base.signum() == 0) {
      return BigDecimal.ZERO
    }
    return Ratio.valueOf(this, base).resolve( 5, BCDependencies.getGlobalSettings().getRoundingMode() ).movePointRight( 2 )
  }
  
  function render() : String {
    return MonetaryAmounts.render(this);
  }

  function renderWithZeroDash() : String {
    if (IsZero) {
      return "-"
    } else {
      return render()
    }
  }

  property get IsZero() : boolean {
    return this.Amount.IsZero
  }
  
  property get IsNotZero() : boolean {
    return !IsZero
  }
  
  property get IsPositive() : boolean {
    return this.Amount.compareTo(0) > 0;
  }

  property get IsNegative() : boolean {
    return this.Amount.compareTo(0) < 0;
  }

  /**
   * Compares the sign of this amount to the sign of the given amount
   * @param anotherAmount The MonetaryAmount to compare to
   * @return <code>True</code> if both are positive, both are negative, or both are zero
  */
  function isSameSignAs(anotherAmount : MonetaryAmount) : boolean {
    return this.signum() == anotherAmount.signum()
  }
}
