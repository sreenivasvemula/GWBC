package gw.api.contact

/**
 * Copies fields exposed in the BillingCenter UI from one Contact (the "source") to another Contact (the "target").
 * Specifically, the UI fields copied are those which exist on the NewAccountScreen.pcf and NewPolicyContactPopup.pcf
 * pages
 */
@Export
class ContactCopier {

  var _contact : Contact as readonly Source
  
  construct(contact : Contact) {
    _contact = contact
  }

  function copyInto(target : Contact) {
    copy(target)
  }
   
  function copy(target : Contact) {
    copyPrimaryAddressFieldsFromSourceTo(target)
    copyContactFieldsFromSourceTo(target)
    if (target typeis Company) {
      copyCompanyFieldsFromSourceTo(target)
    } else if (target typeis Person) {
      copyPersonFieldsFromSourceTo(target)
    }
  }

  private function copyPrimaryAddressFieldsFromSourceTo(target : Contact) {
    var targetPrimaryAddress = target.PrimaryAddress
    var sourcePrimaryAddress = _contact.PrimaryAddress
    targetPrimaryAddress.AddressLine1 = sourcePrimaryAddress.AddressLine1
    targetPrimaryAddress.AddressLine2 = sourcePrimaryAddress.AddressLine2
    targetPrimaryAddress.City = sourcePrimaryAddress.City
    targetPrimaryAddress.State = sourcePrimaryAddress.State
    targetPrimaryAddress.PostalCode = sourcePrimaryAddress.PostalCode
    targetPrimaryAddress.Country = sourcePrimaryAddress.Country
  }
  
  private function copyContactFieldsFromSourceTo(target : Contact) {
    target.EmailAddress1  = _contact.EmailAddress1  
    target.Name = _contact.Name
    target.WorkPhone = _contact.WorkPhone
    target.WorkPhoneCountry = _contact.WorkPhoneCountry
    target.WorkPhoneExtension = _contact.WorkPhoneExtension
  }  
  
  private function copyPersonFieldsFromSourceTo(target : Person) {
    var person = _contact as Person
    target.FirstName = person.FirstName
    target.LastName = person.LastName
  }
  
  private function copyCompanyFieldsFromSourceTo(target : Company) {
    var company = _contact as Company
    target.Name = company.Name
  }
}
