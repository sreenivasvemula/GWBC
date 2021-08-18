package gw.api.address

uses gw.api.name.ContactCriteriaDelegate
uses gw.search.ContactCriteria

@Export
class ContactCriteriaAddressOwner extends SearchAddressOwnerBase {

  construct(criteria : ContactCriteria) {
    _delegate = new ContactCriteriaDelegate(criteria)
    AlwaysShowSeparateFields = true
  }

  override property get SelectedCountry() : Country {
    return _delegate.Country
  }

  override property get Address(): entity.Address {
    throw notSupported()
  }
}