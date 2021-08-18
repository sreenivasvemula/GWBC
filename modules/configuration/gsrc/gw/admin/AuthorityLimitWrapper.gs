package gw.admin

uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount

/**
 * Defines a utility wrapper for managing the {@link AuthorityLimit}
 * {@link AuthorityLimit#LimitAmount}.
 */
@Export
class AuthorityLimitWrapper {
  private var _authorityLimit : AuthorityLimit

  construct(limit : AuthorityLimit) {
    _authorityLimit = limit
  }

  property set Currency(newCurrency : Currency) {
    _authorityLimit.LimitAmount = new MonetaryAmount(0, newCurrency)
  }

  property set Amount(newAmount : BigDecimal) {
    _authorityLimit.LimitAmount = new MonetaryAmount(newAmount, Currency)
  }

  property get Currency() : Currency {
    return _authorityLimit.LimitAmount.Currency
  }

  property get Amount() : BigDecimal {
    return _authorityLimit.LimitAmount.Amount
  }
}