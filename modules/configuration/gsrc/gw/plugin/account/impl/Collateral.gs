package gw.plugin.account.impl;

uses gw.api.database.Query
uses gw.plugin.account.ICollateral
uses java.util.Date;
uses gw.pl.currency.MonetaryAmount

@Export
class Collateral implements ICollateral
{
  construct()
  {
  }
  
  override function createCashRequirementCharge() :Boolean{
    return true;    
  }
  
  override function getCollateralChargeDate(collateralRequirement : CollateralRequirement) : Date {
    if(collateralRequirement != null and collateralRequirement.PolicyPeriod != null){
      if(gw.api.util.DateUtil.verifyDateOnOrAfterToday( collateralRequirement.PolicyPeriod.PolicyPerEffDate )){
        return collateralRequirement.PolicyPeriod.PolicyPerEffDate; 
      }
    }    
    return gw.api.util.DateUtil.currentDate();
  }
  
  override function getCollateralRequirementsSorted(collateral : Collateral) : CollateralRequirement[]{
    var collateralRequirements = collateral.Requirements
    return collateralRequirements.sortBy( \ c -> c.EffectiveDate )
  }

  override function paySegregatedCashRequirements(collateral : Collateral, totalCashAtCollateral : MonetaryAmount){
    var q = Query.make(CollateralRequirement)
    q.compare("Collateral", Equals, collateral)
    q.compare("Segregated", Equals, true)
    q.compare("Compliance", Equals, ComplianceStatus.TC_NOTCOMPLIANT)
    var requirements = q.select()
    for (requirement in requirements){
      requirement = collateral.Bundle.add( requirement )
      requirement.tryToSegregateShortfallFromExcess()
    }
  }

  override function handleDepositRequirement(plcyBI : PlcyBillingInstruction) {
    if (plcyBI.DepositRequirement != null) {
      var collateralRequirement = !plcyBI.DepositRequirement.IsZero ? plcyBI.createSegregatedCollateralRequirementForDepositRequirement() : null;
      var collateralRequirementIterator = plcyBI.PolicyPeriod.getAssociatedSegregatedCollateralRequirements();
      while (collateralRequirementIterator.hasNext()) {
        var segregatedRequirement = plcyBI.Bundle.add(collateralRequirementIterator.next())
        if (collateralRequirement != null) {
          var cashValueAlreadySegregated = segregatedRequirement.TotalCashValue
          var amountToTransfer = cashValueAlreadySegregated.min(collateralRequirement.getShortfall());
          collateralRequirement.transferSegregatedCashToThisRequirement(segregatedRequirement, amountToTransfer);
        }
        segregatedRequirement.Compliance = ComplianceStatus.TC_CLOSED
      }
    }
  }

}
