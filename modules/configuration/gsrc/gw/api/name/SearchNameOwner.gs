package gw.api.name
uses gw.search.ContactCriteria
uses java.util.Set

@Export
class SearchNameOwner extends NameOwnerBase {

  construct (criteria : ContactCriteria) {
    ContactName = new ContactCriteriaDelegate(criteria)
    AlwaysShowSeparateFields = true
  }

  construct (criteria : ContactSearchCriteria) {
    ContactName = new ContactSearchNameDelegate(criteria)
    AlwaysShowSeparateFields = true
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return NameOwnerFieldId.NO_FIELDS
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return NameOwnerFieldId.HIDDEN_FOR_SEARCH
  }

  override property get ContactNameLabel() : String {
    return displaykey.Web.ContactCriteria.CompanyName
  }

  override property get ContactNamePhoneticLabel() : String {
    return displaykey.Web.ContactCriteria.CompanyNamePhonetic
  }

  override property get ShowNameSummary() : boolean {
    return false
  }
}