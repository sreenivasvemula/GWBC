package gw.plugin.commission.impl;

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.commission.IIncentiveCalculator

@Export
class IncentiveCalculator implements IIncentiveCalculator {

  construct() {
  }

  public override function calculatePolicyBasedIncentiveBonus(incentive : PolicyBasedIncentive, policyCommission : PolicyCommission) : MonetaryAmount {
    var bonus : MonetaryAmount;
    if (incentive typeis PremiumIncentive) {
      bonus = incentive.calculateBonus(policyCommission)
    } else {
      throw "Unhandled incentive type: " + (typeof incentive)
    }
    return bonus;
  }
}