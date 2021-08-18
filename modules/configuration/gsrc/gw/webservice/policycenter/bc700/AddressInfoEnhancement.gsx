package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.AddressInfo

@Export
enhancement AddressInfoEnhancement : AddressInfo {
  function toAddress() : Address {
    var address = new Address()
    address.AddressBookUID = this.AddressBookUID
    address.AddressLine1 = this.AddressLine1
    address.AddressLine2 = this.AddressLine2
    address.City = this.City
    address.State = this.State
    address.PostalCode = this.PostalCode
    address.Country = this.Country
    return address
  }
}
