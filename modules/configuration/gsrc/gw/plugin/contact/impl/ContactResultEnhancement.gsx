package gw.plugin.contact.impl
uses gw.plugin.contact.ContactCreator
uses gw.api.address.AddressFormatter
uses gw.api.name.ContactNameFieldsImpl
uses gw.api.name.PersonNameFieldsImpl
uses gw.api.name.NameFormatter
uses gw.api.name.NameOwnerFieldId
uses gw.api.util.phone.GWPhoneNumberBuilder
uses gw.api.util.PhoneUtil

@Export
enhancement ContactResultEnhancement : gw.plugin.contact.ContactResult {
  
  property get DisplayName() : String {
    if (this.ContactType == typekey.Contact.TC_COMPANY) {
      var contact = new ContactNameFieldsImpl() {
        :Name = this.CompanyName,
        :NameKanji = this.CompanyNameKanji
      }
      return new NameFormatter().format(contact, " ")
    } else {
      var person = new PersonNameFieldsImpl() {
        :LastName = this.LastName,
        :LastNameKanji = this.LastNameKanji,
        :FirstName = this.FirstName,
        :FirstNameKanji = this.FirstNameKanji,
        :Suffix = this.Suffix,
        :Prefix = this.Prefix,
        :Particle = this.Particle,
        :MiddleName = this.MiddleName,
        :Name = this.CompanyName,
        :NameKanji = this.CompanyNameKanji
      }
      return new NameFormatter().format(person, " ", NameOwnerFieldId.DISPLAY_NAME_FIELDS)
    }
  }

  property get SortByName() : String {
    return (this.ContactType == typekey.Contact.TC_COMPANY ? this.CompanyName : this.LastName + " " + this.FirstName)
  }
  
  property get DisplayAddress() : String {
    var addressFormatter = populateAddressFormatter()
    addressFormatter.IncludeCountry = true
    addressFormatter.IncludeCounty = false
    return addressFormatter.format(addressFormatter, ", ")
  }
  
  property get hasName() : boolean {
    return (this.ContactType == typekey.Contact.TC_COMPANY) ? 
            this.CompanyName.NotBlank :
           (this.FirstName.NotBlank and this.LastName.NotBlank)
  }
  
  property get hasPrimaryAddress() : boolean {
    return this.PrimaryAddressLine1.NotBlank and
           this.PrimaryAddressCity.NotBlank and
           this.PrimaryAddressState != null and
           this.PrimaryAddressPostalCode.NotBlank
  }
  
  private function populateAddressFormatter() : AddressFormatter {
    var addrFormatter = new AddressFormatter()
    addrFormatter.AddressLine1 = this.PrimaryAddressLine1
    addrFormatter.AddressLine1Kanji = this.PrimaryAddressLine1Kanji
    addrFormatter.AddressLine2 = this.PrimaryAddressLine2
    addrFormatter.AddressLine2Kanji = this.PrimaryAddressLine2Kanji
    addrFormatter.City = this.PrimaryAddressCity
    addrFormatter.CityKanji = this.PrimaryAddressCityKanji
    addrFormatter.County = this.PrimaryAddressCounty
    addrFormatter.PostalCode = this.PrimaryAddressPostalCode
    addrFormatter.CEDEX = this.PrimaryAddressCEDEX
    addrFormatter.CEDEXBureau = this.PrimaryAddressCEDEXBureau
    addrFormatter.State = this.PrimaryAddressState
    addrFormatter.Country = this.PrimaryAddressCountry
    return addrFormatter
  }

  public function convertToContactInNewBundleAndCommit() : Contact {
    var resultContact : Contact
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> { resultContact = this.convertToContact(new ContactCreator(bundle))})
    return resultContact
  }

  private function formatPhone(countryCode : PhoneCountryCode, phone : String, extension : String) : String {
    var gwPhone = new GWPhoneNumberBuilder().withCountryCode(PhoneCountryCode.get(countryCode as String))
        .withNationalNumber(phone).withExtension(extension).build()
    return gwPhone == null ? null : gwPhone.formatWithLocalizedExtension(PhoneUtil.getUserDefaultPhoneCountry())
  }

  property get FaxPhoneValue() : String {
    return formatPhone(this.FaxPhoneCountry, this.FaxPhone, this.FaxPhoneExtension)
  }

  property get CellPhoneValue() : String {
    return formatPhone(this.CellPhoneCountry, this.CellPhone, this.CellPhoneExtension)
  }

  property get HomePhoneValue() : String {
    return formatPhone(this.HomePhoneCountry, this.HomePhone, this.HomePhoneExtension)
  }

  property get WorkPhoneValue() : String {
    return formatPhone(this.WorkPhoneCountry, this.WorkPhone, this.WorkPhoneExtension)
  }
}
