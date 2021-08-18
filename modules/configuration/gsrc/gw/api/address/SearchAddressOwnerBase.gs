package gw.api.address

uses gw.api.admin.BaseAdminUtil

uses java.lang.UnsupportedOperationException
uses java.util.Set

@Export
abstract class SearchAddressOwnerBase extends AddressOwnerBase implements AddressOwner {
  override property get RequiredFields(): Set <AddressOwnerFieldId> {
    return AddressOwnerFieldId.NO_FIELDS
  }

  override property get HiddenFields(): Set<AddressOwnerFieldId> {
    return AddressOwnerFieldId.HIDDEN_FOR_SEARCH
  }

  override property get AutofillEnabled(): boolean {
    return false
  }

  override property get ShowAddressSummary() : boolean {
    return false
  }

  override property set SelectedCountry(value : Country) {
    super.SelectedCountry = value
  }

  property get InputSetMode() : Country {
    return SelectedCountry != null ? SelectedCountry : BaseAdminUtil.getDefaultCountry()
  }


  override property set Address(value: entity.Address) {
    throw notSupported()
  }

  function notSupported() : UnsupportedOperationException {
    return new UnsupportedOperationException("Field is not used for ContactCriteriaAddressOwner")
  }
}

