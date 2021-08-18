package gw.plugin.commission.impl

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.commission.ICommission

uses java.lang.UnsupportedOperationException
uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.List
uses java.util.Map
uses java.util.Set

@Export
class Commission implements ICommission {

  construct() {
  }

  public override function selectSubPlan(policyPeriod : PolicyPeriod, commissionPlan : CommissionPlan) : CommissionSubPlan[] {
    return new CommissionSubPlan[0]
  }

  public override function getCommissionRate( policyCommission : PolicyCommission, charge : Charge ) : BigDecimal {
    var role = policyCommission.Role
    var chargeOverrideOfRate = getChargeOverrideOfCommissionRate( charge, role )
    if (chargeOverrideOfRate != null) {
      return chargeOverrideOfRate
    }
    var policyCommissionOverrideOfRate = getPolicyCommissionOverrideOfCommissionRate( policyCommission, charge, role )
    if (policyCommissionOverrideOfRate != null) {
      return policyCommissionOverrideOfRate
    }
    return getCommissionSubPlanRateForCharge( policyCommission.CommissionSubPlan, charge, role )
  }

  private function getChargeOverrideOfCommissionRate( charge : Charge, role : PolicyRole ) : BigDecimal {
    if (charge == null) {
       return null
    }
    return charge.getChargeLevelCommissionRateOverride( role )
  }

  private function getPolicyCommissionOverrideOfCommissionRate( policyCommission : PolicyCommission, charge : Charge,
      role : PolicyRole ) : BigDecimal {
    if (charge != null && !policyCommission.CommissionSubPlan.isCommissionable( charge.ChargePattern, role )) {
      return null
    }
    return policyCommission.CmsnPlanOverridePercentage
  }

  private function getCommissionSubPlanRateForCharge(commissionSubPlan : CommissionSubPlan, charge : Charge, role : PolicyRole ) : BigDecimal {
    if (charge != null && !isCommissionable(commissionSubPlan, charge, role)) {
      return null
    }
    return commissionSubPlan.getBaseRate( charge.ChargePattern, role )
  }

  /**
   * @deprecated 8.0.0 Use {@link
   * #shouldWriteOffActiveCommissionForChargeWrittenOff(ChargeWrittenOff)}
   * to control write-off instead. Add enhancement method returning {@code
   * charge.PaidAmount - charge.GrossAmountWrittenOff} if functionality desired
   * for other purposes.
   */
  override function getNetAmountForPaymentReceivedPayableCalculator(charge : Charge) : MonetaryAmount {
    throw new UnsupportedOperationException() // deprecated, no longer used...
  }

  override function shouldMakeCommissionPayable(policyCommission : PolicyCommission, amountToMakePayable : MonetaryAmount) : Boolean {
    return true
  }

  override function shouldMakeCommissionPayable(itemCommission : ItemCommission, amountToMakePayable : MonetaryAmount) : Boolean {
    return true
  }

  override function getCommissionRateOverrideDuringProducerTransferForNewPolicyCommission( originalPolicyCommission : PolicyCommission ) : BigDecimal {
    return originalPolicyCommission.CmsnPlanOverridePercentage
  }

  override function getCustomItemCommissionAllocations(itemCommissions : Set<ItemCommission>) : Map<InvoiceItem,MonetaryAmount> {
   //note: by default the "custom" setting merely allocates all unpaid commission
   var allocations = new HashMap<InvoiceItem, MonetaryAmount>()
    foreach(itemCommission in  itemCommissions) {
      var invoiceItem = itemCommission.getInvoiceItem()
      var unpaid = itemCommission.CommissionReserve
      if (!unpaid.IsZero) {
        allocations.put(invoiceItem, unpaid)
      }
    }
    return allocations
  }

  override function shouldWriteoffCommissionWhenProducerCodeRemoved(itemCommission : ItemCommission) : boolean {
    return true
  }

  override function distributeCommissionWriteoffAcrossItemCommissions(itemCommissions : List<ItemCommission>, writeoffAmount : MonetaryAmount) : Map<ItemCommission,MonetaryAmount> {
    var sortedItems = itemCommissions.sortBy(\ itemCommission -> itemCommission.InvoiceItem.EventDate)
    var allocations = new HashMap<ItemCommission, MonetaryAmount>()
    var writeoffRemaining = writeoffAmount

    // Distribute across commission reserve
    for(var itemCommission in sortedItems) {
      var itemCommissionReserve = itemCommission.CommissionReserve
      // Only allocate to reserve when it reduces the remaining write-off amount
      if (itemCommissionReserve.isSameSignAs(writeoffAmount)) {
        var itemWriteoffAmount = 0bd.ofCurrency(writeoffAmount.Currency)
        if (writeoffAmount.IsPositive) {
          itemWriteoffAmount = itemCommissionReserve.min(writeoffRemaining)
        } else if (itemCommissionReserve.IsNegative) {
          itemWriteoffAmount = itemCommissionReserve.max(writeoffRemaining)
        }

        if (!itemWriteoffAmount.IsZero) {
          allocations.put(itemCommission, itemWriteoffAmount)
          writeoffRemaining = writeoffRemaining.subtract(itemWriteoffAmount)
        }
      }
    }

    // Distribute any remaining across earned commissions not paid on payment receipt
    for (var itemCommission in sortedItems) {
      var earnedCommissionThatIsEligibleToUnearn = itemCommission.CommissionEligibleToWriteOff
      var itemCommissionReserve = itemCommission.CommissionReserve
      // Avoid allocating to items if the reserve has opposite sign
      // and only allocate to earnings when it reduces the remaining write-off amount
      if ((itemCommissionReserve.isSameSignAs(writeoffAmount) || itemCommissionReserve.IsZero)
          && earnedCommissionThatIsEligibleToUnearn.isSameSignAs(writeoffAmount)) {
        var itemWriteoffAmount = 0bd.ofCurrency(writeoffAmount.Currency)
        if (writeoffAmount.IsPositive) {
          itemWriteoffAmount = earnedCommissionThatIsEligibleToUnearn.min(writeoffRemaining)
        } else if (earnedCommissionThatIsEligibleToUnearn.IsNegative) {
          itemWriteoffAmount = earnedCommissionThatIsEligibleToUnearn.max(writeoffRemaining)
        }

        if (!itemWriteoffAmount.IsZero) {
          var totalAllocation = itemWriteoffAmount
          var existingAllocation = allocations.get(itemCommission)
          if (existingAllocation != null) {
            totalAllocation += existingAllocation
          }
          allocations.put(itemCommission, totalAllocation)
          writeoffRemaining = writeoffRemaining.subtract(itemWriteoffAmount)
        }
      }
    }
    return allocations
  }

  override function shouldWriteOffActiveCommissionForChargeWrittenOff(chargeWrittenOff : ChargeWrittenOff) : boolean {
    return false
  }

  /**
   * Determines whether or not the given charge should be given commission.  Typically the answer to
   * this question would be whether or not the charge is commissionable according to the default charge commission's
   * policy commission's commission sub plan, unless a commission sub plan is explicitly provided, or if the charge
   * is not a policy period charge.
   * See {@link CommissionSubPlan#isCommissionable(gw.bc.accounting.config.entity.ChargePattern, gw.bc.account.typekey.PolicyRole)}
   * @param commissionSubPlan optional parameter of an explicit subplan to use, rather than getting it off of the
   * default charge commission
   * @param charge The charge that we wish to check if it should be given commission
   * @param role The role in which to check if the given charge is commissionable
   * @return True if the provided charge should be given commission
   */
  override function isCommissionable(commissionSubPlan : CommissionSubPlan, charge : Charge, role : PolicyRole) : boolean {
      if (commissionSubPlan != null) {
        return commissionSubPlan.isCommissionable( charge.ChargePattern, role )
      } else if (!charge.PolicyPeriodCharge || charge.getDefaultChargeCommission(role) == null) {
        return false
      } else {
        return charge.getDefaultChargeCommission(role).PolicyCommission.CommissionSubPlan.isCommissionable( charge.ChargePattern, role )
      }
  }
}
