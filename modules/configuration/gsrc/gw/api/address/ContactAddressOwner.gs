package gw.api.address
uses java.util.Set

@Export
class ContactAddressOwner extends AddressOwnerBase {

  private var _contact : Contact as readonly Owner
    
  construct(contact : Contact) {
    _contact = contact
  }

  private var _editable : boolean as Editable = true
  
  override property get Address() : Address {
    return Owner.PrimaryAddress
  }

  override property set Address( value: Address ) {
    Owner.PrimaryAddress = value
  }
  
  override property get RequiredFields() : Set<AddressOwnerFieldId> {
    return BCAddressOwnerFieldId.REQUIRED_FIELDS
  }

  override property get HiddenFields() : Set<AddressOwnerFieldId> {
    return BCAddressOwnerFieldId.NO_FIELDS
  }

  override function isEditable(fieldId : AddressOwnerFieldId) : boolean {
    return Editable
  }
}