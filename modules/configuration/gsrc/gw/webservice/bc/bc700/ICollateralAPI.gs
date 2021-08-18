package gw.webservice.bc.bc700


uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.RequiredFieldException;

//@RpcWebService
@Export
class ICollateralAPI {
  construct() { }
  
    /**
   * Creates a collateralRequirement in BillingCenter.
   *
   * @param account the CollateralRequirement entity to create.  Must include all non-nullable fields (please refer to data
   *                dictionary for the current set of required fields for Collateral Requirement)
   * @return the newly created account entity
   * @throws DataConversionException if account is null
   */
  @Throws(DataConversionException, "if collateralRequirement is null")
  function createCollateralRequirement(collateralRequirement : CollateralRequirement) : CollateralRequirement {
    require(collateralRequirement, "collateralRequirement")
    collateralRequirement.Bundle.commit();
    return collateralRequirement;
  }
  
  
  @Throws(RequiredFieldException, "if the element is null")
  private function require(element : Object, parameterName : String) {
    if (element == null) {
      throw new RequiredFieldException(parameterName + " cannot be null")  
    }
  }
  
}
