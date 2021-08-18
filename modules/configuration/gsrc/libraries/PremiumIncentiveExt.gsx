package libraries


@Export
enhancement PremiumIncentiveExt : entity.PremiumIncentive
{
  // If the commissionable amount of charges on the policy exceeds the threshold, then apply the
  // incentive. The bonus is equal to the bonus percentage times the commissionable amount.
  function calculateBonus(policyCommission : PolicyCommission) : gw.pl.currency.MonetaryAmount {
    var commissionableAmount = policyCommission.calculateCommissionBasis();
    if (policyCommission.Role == "primary" and commissionableAmount > this.Threshold) {
      return commissionableAmount * this.BonusPercentage / 100;
    }
    return null;
  }


}