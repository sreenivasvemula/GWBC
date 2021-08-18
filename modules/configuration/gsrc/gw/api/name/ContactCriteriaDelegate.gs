package gw.api.name

uses gw.api.address.AddressFillableExtension
uses gw.search.ContactCriteria
uses java.lang.UnsupportedOperationException

@Export
class ContactCriteriaDelegate implements ContactNameFields, PersonNameFields, AddressFillableExtension {
  private var _contactCriteria : ContactCriteria

  construct (contactCriteria : ContactCriteria) {
    _contactCriteria = contactCriteria
  }

  // ContactNameFields
  override property get Name() : String {
    return _contactCriteria.CompanyName
  }

  override property set Name(value : String) {
    _contactCriteria.CompanyName = value
  }

  override  property get NameKanji() : String {
    return _contactCriteria.CompanyNameKanji
  }

  override property set NameKanji(value : String) {
    _contactCriteria.CompanyNameKanji = value
  }

  // PersonNameFields
  override property get FirstName() : String {
    return _contactCriteria.FirstName
  }

  override property set FirstName(value : String) {
    _contactCriteria.FirstName = value
  }

  override property get LastName() : String {
    return _contactCriteria.LastName
  }

  override property set LastName(value : String) {
    _contactCriteria.LastName = value
  }

  override property get FirstNameKanji() : String {
    return _contactCriteria.FirstNameKanji
  }

  override property set FirstNameKanji(value : String) {
    _contactCriteria.FirstNameKanji = value
  }

  override property get LastNameKanji() : String {
    return _contactCriteria.LastNameKanji
  }

  override property set LastNameKanji(value : String) {
    _contactCriteria.LastNameKanji = value
  }

  // AddressFillableExtension

  override property get Country() : Country {
    return _contactCriteria.Country
  }

  override property set Country(value : Country) {
    _contactCriteria.Country = value
  }

  override property get AddressLine1() : String {
    return _contactCriteria.AddressLine1
  }

  override property set AddressLine1(value : String) {
    _contactCriteria.AddressLine1 = value
  }

  override property get City() : String {
    return _contactCriteria.City
  }

  override property set City(value : String) {
    _contactCriteria.City = value
  }

  override property get State() : State {
    return _contactCriteria.State
  }

  override property set State(value : State) {
    _contactCriteria.State = value
  }

  override property get PostalCode() : String {
    return _contactCriteria.PostalCode
  }

  override property set PostalCode(value : String) {
    _contactCriteria.PostalCode = value
  }

  override property get CityKanji() : String {
    return _contactCriteria.CityKanji
  }

  override property set CityKanji(value : String) {
    _contactCriteria.CityKanji = value
  }


  // unsupported properties
  override property get MiddleName() : String {
    return null
  }

  override property set MiddleName(value : String) {
    throw notSupported()
  }

  override property get Particle() : String {
    return null
  }

  override property set Particle(value : String) {
    throw notSupported()
  }

  override property get Prefix() : NamePrefix {
    return null
  }

  override property set Prefix(value : NamePrefix) {
    throw notSupported()
  }

  override property get Suffix() : NameSuffix {
    return null
  }

  override property set Suffix(value : NameSuffix) {
    throw notSupported()
  }


  override property get AddressLine2() : String {
    return null
  }

  override property set AddressLine2(value : String) {
    throw notSupported()
  }

  override property get AddressLine3() : String {
    return null
  }

  override property set AddressLine3(value : String) {
    throw notSupported()
  }

  override property get County() : String {
    return null
  }

  override property set County(value : String) {
    throw notSupported()
  }

  override property get AddressLine1Kanji() : String {
    return null
  }

  override property set AddressLine1Kanji(value : String) {
    throw notSupported()
  }

  override property get AddressLine2Kanji() : String {
    return null
  }

  override property set AddressLine2Kanji(value : String) {
    throw notSupported()
  }

  override property get CEDEX() : Boolean {
    return null
  }

  override property set CEDEX(value : Boolean) {
    throw notSupported()
  }

  override property get CEDEXBureau() : String {
    return null
  }

  override property set CEDEXBureau(value : String) {
    throw notSupported()
  }


  private function notSupported() : UnsupportedOperationException {
    return new UnsupportedOperationException("Field is not used for ContactCriteriaDelegate")
  }

}
