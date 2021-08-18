package gw.webservice.bc.bc801

uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.RequiredFieldException;

/**
 * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI instead
 */
@RpcWebService
@Export
@java.lang.Deprecated
class ICollateralAPI
{
  construct()
  {
  }

  /**
   * Creates a collateralRequirement in BillingCenter.
   *
   * @param account the CollateralRequirement entity to create.  Must include all non-nullable fields (please refer to data
   *                dictionary for the current set of required fields for Collateral Requirement)
   * @return the newly created account entity
   * @throws DataConversionException if account is null
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#createCollateralRequirement instead.
   */
  @Throws(DataConversionException, "if collateralRequirement is null")
  @java.lang.Deprecated
  function createCollateralRequirement(collateralRequirement: CollateralRequirement): CollateralRequirement {
    require(collateralRequirement, "collateralRequirement")
    collateralRequirement.Bundle.commit();
    return collateralRequirement;
  }

  @Throws(RequiredFieldException, "if the element is null")
  private function require(element: Object, parameterName: String) {
    if (element == null) {
      throw new RequiredFieldException(displaykey.ICollateralAPI.Error.ElementCannotBeNull(parameterName))
    }
  }
}
