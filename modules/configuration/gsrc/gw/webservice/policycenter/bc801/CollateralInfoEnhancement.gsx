package gw.webservice.policycenter.bc801

uses gw.webservice.policycenter.bc801.entity.types.complex.CollateralInfo
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException

@Export
enhancement CollateralInfoEnhancement: CollateralInfo {
  
  function executeCollateralBI() : String {
    var bi = new CollateralBI(this.Currency)
    var account = this.findOwnerAccount()
    bi.Account = account
    bi.CollateralRequirement = findCollateralRequirement(account, this.CollateralRequirementID)
    return this.execute(bi)
  }

  function executeSegregatedCollateralBI() : String {
    var bi = new SegregatedCollReqBI(this.Currency)
    var account = this.findOwnerAccount()
    bi.Account = account
    bi.SegregatedCollReq = findSegregatedCollateralRequirement(account, this.CollateralRequirementID)
    return this.execute(bi)
  }


  private function findCollateralRequirement(account : Account, collateralRequirementID : String) : CollateralRequirement {
    var req = account.Collateral.Requirements.firstWhere( \ cr -> cr.PublicID == collateralRequirementID)
    if (req == null && collateralRequirementID != null) {
      throw new BadIdentifierException(displaykey.BillingAPI.Error.CollateralReqNotFound(account.AccountNumber, collateralRequirementID))
    } else if (req.Segregated) {
      throw new BadIdentifierException(displaykey.BillingAPI.Error.CollateralReqSegregated(collateralRequirementID))
    }
    return req
  }

  private function findSegregatedCollateralRequirement(account : Account, collateralRequirementID : String) : CollateralRequirement {
    if (collateralRequirementID == null) {
      throw new RequiredFieldException(displaykey.BillingAPI.Error.CollateralReqRequired)
    }
    var req = account.Collateral.Requirements.firstWhere( \ cr -> cr.PublicID == collateralRequirementID)
    if (req == null) {
      throw new BadIdentifierException(displaykey.BillingAPI.Error.CollateralReqNotFound(account.AccountNumber, collateralRequirementID))
    } else if (!req.Segregated) {
      throw new BadIdentifierException(displaykey.BillingAPI.Error.CollateralReqNotSegregated(collateralRequirementID))
    }
    return req
  }
}
