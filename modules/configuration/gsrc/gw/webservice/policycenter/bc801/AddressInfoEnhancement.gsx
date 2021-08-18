package gw.webservice.policycenter.bc801
uses gw.webservice.policycenter.bc801.entity.types.complex.AddressInfo

@Export
enhancement AddressInfoEnhancement : AddressInfo {
  function toAddress() : Address {
    var address = new Address()
    address.AddressBookUID = this.AddressBookUID
    address.AddressLine1 = this.AddressLine1
    address.AddressLine1Kanji = this.AddressLine1Kanji
    address.AddressLine2 = this.AddressLine2
    address.AddressLine2Kanji = this.AddressLine2Kanji
    address.City = this.City
    address.CityKanji = this.CityKanji
    address.State = this.State
    address.PostalCode = this.PostalCode
    address.Country = this.Country
    address.CEDEX= this.CEDEX
    address.CEDEXBureau = this.CEDEXBureau
    return address
  }
}
