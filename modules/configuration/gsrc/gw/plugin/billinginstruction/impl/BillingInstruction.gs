package gw.plugin.billinginstruction.impl

uses gw.plugin.billinginstruction.IBillingInstruction

@Export
class BillingInstruction implements IBillingInstruction {

  construct() {
  }

  public override function addAdditionalCharges(billingInstruction : BillingInstruction) {
  }

  public override function onSpecialHandlingHoldChargesForFinalAudit(charge : Charge) : void {
    charge.setHold( ChargeHoldStatus.TC_FINALAUDIT, null, null )
  }

  public override function onSpecialHandlingHoldAllUnbilledItemsForFinalAudit(policyPeriod : PolicyPeriod) : void {
    for (var charge in policyPeriod.Charges) {
      charge.setHold( ChargeHoldStatus.TC_FINALAUDITUNBILLED, null, null )  
    }   
  }
  
}