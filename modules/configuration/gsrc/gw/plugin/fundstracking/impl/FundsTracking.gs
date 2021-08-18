package gw.plugin.fundstracking.impl

uses gw.api.domain.fundstracking.PaymentItemsNarrative
uses gw.plugin.fundstracking.IFundsTracking

uses java.util.Set

@Export
class FundsTracking implements IFundsTracking {

  /**
   * Allots funds for an unapplied fund from the sourceTrackers to the useTrackers.
   *
   * @param sourceTrackers all of the unapplied fund's source trackers which are not fully allotted
   * @param useTrackers    all of the unapplied fund's use trackers which are not fully allotted
   */
  override function allotFunds(sourceTrackers : Set<FundsSourceTracker>, useTrackers : Set<FundsUseTracker>) {
    var allotter = new FundsAllotter(sourceTrackers, useTrackers)
    allotter.allotFunds()
  }
  
  /**
   * Divides all Actions on the PaymentItemsNarrative into groupings and creates PaymentItemGroups from them.
   *
   * @param paymentItemsNarrative Describes all of the actions that took place on payment items in the current bundle
   *                              and in what contexts they took place.
   */
  override function createPaymentItemGroupings(paymentItemNarrative : PaymentItemsNarrative) {
    var criteriaToActions = paymentItemNarrative.actions().partition(\ action -> new PaymentItemGroupingCriteria(action))
    var paymentItemGroupBuilder = paymentItemNarrative.paymentItemGroupsGenerator()
    for (criteria in criteriaToActions.keySet()) {
      var actions = criteriaToActions.get(criteria).toSet()
      var paymentItemGroup = paymentItemGroupBuilder.generatePaymentItemGroup(actions, criteria.GroupReason)
      setPaymentItemGroupTAccountOwner(paymentItemGroup, criteria.TAccountOwnerOfChargesBeingPaid)
    }
  }
    
  private function setPaymentItemGroupTAccountOwner(paymentItemGroup : PaymentItemGroup, tAccountOwnerOfChargesBeingPaid: TAccountOwner) {
    if (tAccountOwnerOfChargesBeingPaid typeis PolicyPeriod) {
      paymentItemGroup.PolicyPeriod = tAccountOwnerOfChargesBeingPaid
    } else if (tAccountOwnerOfChargesBeingPaid typeis Account) {
      paymentItemGroup.OwnerAccount = tAccountOwnerOfChargesBeingPaid
    } else if (tAccountOwnerOfChargesBeingPaid typeis Collateral) {
      paymentItemGroup.Collateral = tAccountOwnerOfChargesBeingPaid
    } else if (tAccountOwnerOfChargesBeingPaid typeis CollateralRequirement) {
      paymentItemGroup.Collateral = tAccountOwnerOfChargesBeingPaid.Collateral
    }
  }
}
