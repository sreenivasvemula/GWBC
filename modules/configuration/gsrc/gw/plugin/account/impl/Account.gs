package gw.plugin.account.impl

uses gw.plugin.account.IAccount

@Export
class Account implements IAccount {
  construct() {
  }

  override function getDistributionLimitType(account : Account,
                                             accountDistributionLimitType : DistributionLimitType) : DistributionLimitType {
    if (account.PaymentAllocationPlan == null) return DistributionLimitType.TC_OUTSTANDING

    var planFilters = account.PaymentAllocationPlan.DistributionFilters

    if (planFilters.contains(DistributionFilterType.TC_NEXTPLANNEDINVOICE)) {
      return DistributionLimitType.TC_NEXTINVOICE
    } else if (planFilters.contains(DistributionFilterType.TC_BILLEDORDUE)) {
      return DistributionLimitType.TC_OUTSTANDING
    } else if (planFilters.contains(DistributionFilterType.TC_PASTDUE)) {
      return DistributionLimitType.TC_PASTDUE
    }

    return DistributionLimitType.TC_UNDERCONTRACT
  }

  override function getShouldHoldAutomaticDisbursment(account : Account) : Boolean  {
    return false;
  }

  override function getShouldHoldAutomaticDisbursement(unappliedFund : UnappliedFund) : Boolean  {
    return false;
  }
}