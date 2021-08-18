package gw.api.address

@Export
class ContactSearchAddressOwner extends SearchAddressOwnerBase {

  private var _contactSearchCriteria : ContactSearchCriteria

  construct(contactSearchCriteria : ContactSearchCriteria) {
    _contactSearchCriteria = contactSearchCriteria
  }


  override property get SelectedCountry() : Country {
    return _contactSearchCriteria.Address.Country
  }

  override property get Address() : Address {
    return _contactSearchCriteria.Address
  }

}
