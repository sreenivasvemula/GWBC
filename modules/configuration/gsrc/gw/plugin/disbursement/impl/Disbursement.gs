package gw.plugin.disbursement.impl

uses gw.plugin.disbursement.IDisbursement

uses gw.pl.currency.MonetaryAmount
uses java.util.Date

@Export
class Disbursement implements IDisbursement {

  construct() {
  }

  /**
   * Configure whether a new amount to be disbursed should be added to the oldest pending Disbursement, or
   * whether a new pending Disbursement should be created.
   *
   * @param account - the Account that will receive this Disbursment
   * @param amountToDisburse - the amount to be disbursed
   * @param newDisbursementDueDate - the date on which a new Disbursement, if created, would be due
   * @param oldDisbursementAmount - the amount of the oldest pending disbursement
   * @param oldDisbursementDueDate - the date on which the oldest pending disbursement will be paid
   * @return true to add newAmountToDisburse to the oldest pending Disbursement; false to create a new Disbursement
   */
  override function shouldAddAmountToOldestPendingDisbursement(account: Account,
                                                               amountToDisburse : MonetaryAmount,
                                                               newDisbursementDueDate : Date,
                                                               oldDisbursementAmount : MonetaryAmount,
                                                               oldDisbursementDueDate : Date) : boolean {
    // By default we maintain BC 3.0.3 behavior, and add the amount to the oldest pending Disbursement
    return true
  }

}
