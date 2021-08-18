package gw.plugin.fundstracking.impl

uses com.google.common.base.Objects
uses com.google.common.collect.Sets
uses gw.api.domain.fundstracking.PaymentItemsNarrative.Action

uses java.util.Set

/**
 * PaymentItemGroupingCriteria are the criteria for grouping FundsTracking Actions into PaymentItemGroups --
 * they determine how FundsTracking Actions are grouped together to create PaymentItemGroups.
 * 
 * Note: Two actions which should be in the same PaymentItemGroup must have PaymentItemGroupingCriteria which are .equals() to
 * each other.  Therefore, if you add any instance variables, then update equals() and hashCode().  
 */
@Export
class PaymentItemGroupingCriteria {
  private var _tAccountOwnerOfChargesBeingPaid : TAccountOwner as readonly TAccountOwnerOfChargesBeingPaid
  private var _payerUnappliedFunds : UnappliedFund
  private var _groupReason : PaymentItemGroupReason as readonly GroupReason

  construct(action : Action) {
    var paymentItem = action.paymentItem()
    _payerUnappliedFunds = paymentItem.DirectBillPayment.DirectBillMoneyRcvd.UnappliedFund
    _tAccountOwnerOfChargesBeingPaid = calculateTAccountOwnerOfChargesBeingPaid(action)
    _groupReason = calculateGroupReason(action)
  }
  
  private function calculateTAccountOwnerOfChargesBeingPaid(action : Action) : TAccountOwner {
    var paymentItem = action.paymentItem()
    if (paymentItem typeis DirectBillPaymentItem) {
      return calculateDirectBillPaymentItemTAccountOwner(paymentItem.getTAccountOwner())
    }
    if (paymentItem typeis CollateralPaymentItem) {
      return _payerUnappliedFunds.Account.Collateral
    }
    return null;
  }

  private function calculateDirectBillPaymentItemTAccountOwner(paymentItemTAccountOwner : TAccountOwner) : TAccountOwner {
    return paymentItemTAccountOwner typeis CollateralRequirement
      ? paymentItemTAccountOwner.Collateral
      : paymentItemTAccountOwner
  }

  private function calculateGroupReason(action : Action) : PaymentItemGroupReason{
    if (_tAccountOwnerOfChargesBeingPaid typeis PolicyPeriod) {
      if (getParentReasons(action).contains(PaymentItemGroupReason.TC_POLICYPERIODPAIDRETURNPREMIUM)) {
        return PaymentItemGroupReason.TC_POLICYPERIODPAIDRETURNPREMIUM
      }
      if (getParentReasons(action).contains(PaymentItemGroupReason.TC_PAYMENTREVERSED)) {
        return PaymentItemGroupReason.TC_POLICYPERIODPAIDPAYMENTREVERSED
      }
      return PaymentItemGroupReason.TC_POLICYPERIODPAID
    }
    if (_tAccountOwnerOfChargesBeingPaid typeis Account) {
      return PaymentItemGroupReason.TC_ACCOUNTPAID
    }
    if (_tAccountOwnerOfChargesBeingPaid typeis Collateral or _tAccountOwnerOfChargesBeingPaid typeis CollateralRequirement) {
      return PaymentItemGroupReason.TC_COLLATERALPAID
    }
    return PaymentItemGroupReason.TC_UNKNOWN
  }

  override function equals(other : Object) : boolean {
    if (other typeis PaymentItemGroupingCriteria) {
      return Objects.equal(_tAccountOwnerOfChargesBeingPaid, other._tAccountOwnerOfChargesBeingPaid)
        && Objects.equal(_payerUnappliedFunds, other._payerUnappliedFunds)
        && Objects.equal(_groupReason, other._groupReason)
    }
    return false;
  }

  override function hashCode() : int {
    return Objects.hashCode({_tAccountOwnerOfChargesBeingPaid, _payerUnappliedFunds, _groupReason})
  }

  private function getParentReasons(action : Action) : Set<PaymentItemGroupReason> {
    var context = action.context()
    var reasons = Sets.newHashSet<PaymentItemGroupReason>()
    while (context != null) {
      reasons.add(context.reason())
      context = context.parentReference()
    }
    return reasons
  }
}