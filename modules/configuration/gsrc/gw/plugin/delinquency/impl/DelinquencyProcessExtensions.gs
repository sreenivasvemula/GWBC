package gw.plugin.delinquency.impl;

uses gw.plugin.delinquency.IDelinquencyProcessExtensions
uses java.util.Date

/**
 * Gosu implementation of IDelinquencyProcesessExtensions plugin. This implementation
 * simply passes through all method calls to the appropriate DelinquencyProcess extension
 * methods.
 *
 * WARNING: This class should not be edited as part of the configuration process.
 *  To change this functionality, edit the DelinquencyProcess extension methods.
 */
@Export
class DelinquencyProcessExtensions implements IDelinquencyProcessExtensions {

  construct() {
  }

  public override function onChargesPaid(delinquencyProcess : DelinquencyProcess, chargesPaid : List<Charge>) {
    delinquencyProcess.onChargesPaid(chargesPaid);
  }
  
  public override function onCompliance(collateral : entity.Collateral) {
    collateral.onCompliance();
  }

  public override function pushForwardHeldEvents(delinquencyProcess : DelinquencyProcess, heldSince : Date) {
    delinquencyProcess.pushForwardHeldEvents(heldSince);    
  }
  
  public override function discoverPastDueDelinquencies(account : Account) : List<DelinquencyProcess> {
    return account.discoverDelinquencies()
  }
  
  public override function onNonCompliance( collateral : Collateral ) : DelinquencyProcess {
   return collateral.onNonCompliance(); 
  }
}