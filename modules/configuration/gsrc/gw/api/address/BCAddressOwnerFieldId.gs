package gw.api.address

uses java.util.*

/**
 * A class that contains the defined Field ID constants
 */
@Export
class BCAddressOwnerFieldId extends AddressOwnerFieldId {
  private construct(aName:String) {
    super(aName)
  }

  public final static var REQUIRED_FIELDS : Set<AddressOwnerFieldId> =
      { ADDRESSLINE1, CITY, COUNTRY }.freeze()

}