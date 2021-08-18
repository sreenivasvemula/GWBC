package libraries
uses java.math.BigDecimal
uses com.guidewire.bc.util.Percentage
uses gw.api.util.Ratio
uses com.guidewire.bc.system.dependency.BCDependencies
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

@Export
enhancement BCBigDecimalExt : BigDecimal {
  
  function percentageOf(base : BigDecimal) : Percentage {
    if (base.signum() == 0) {
      return Percentage.ZERO_PERCENT
    }
    return Percentage.fromRatioBetween( this, base )
  }

  function percentageOfAsBigDecimal(base : BigDecimal ) : BigDecimal {  
    if (base.signum() == 0) {
      return BigDecimal.ZERO
    }
    return Ratio.valueOf(this, base).resolve( 5, BCDependencies.getGlobalSettings().getRoundingMode() ).movePointRight( 2 )
  }

  function ofCurrency(currency : Currency) : MonetaryAmount {
    return new MonetaryAmount(this, currency)
  }

  function ofDefaultCurrency() : MonetaryAmount {
    return new MonetaryAmount(this, CurrencyUtil.getDefaultCurrency())
  }

}
