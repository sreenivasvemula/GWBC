package gw.plugin.contact.ab800

uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.ABContactAPIAddressSearch
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.anonymous.types.complex.ABContactAPISearchCriteria_Tags
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.ABContactAPISearchCriteria

@Export
enhancement ABContactSearchCriteriaInfoEnhancement : ABContactAPISearchCriteria {
  function sync(searchCriteria : ContactSearchCriteria){
    var isPerson =  Person.Type.isAssignableFrom(searchCriteria.ContactIntrinsicType)
    this.ContactType = isPerson ? "ABPerson" : "ABCompany"
    this.FirstName = searchCriteria.FirstName
    this.FirstNameKanji = searchCriteria.FirstNameKanji
    this.Keyword = searchCriteria.Keyword
    this.KeywordKanji = searchCriteria.KeywordKanji
    this.TaxID = searchCriteria.TaxID
    this.OrganizationName = searchCriteria.OrganizationName
    var address = new ABContactAPIAddressSearch()
    address.City = searchCriteria.Address.City
    address.CityKanji = searchCriteria.Address.CityKanji
    address.State = searchCriteria.Address.State.Code
    address.PostalCode = searchCriteria.Address.PostalCode
    address.Country = searchCriteria.Address.Country.Code
    this.Address.$TypeInstance = address
    this.Tags.$TypeInstance = new ABContactAPISearchCriteria_Tags()
    this.Tags.Entry.add(ContactTagType.TC_CLIENT.Code)
  }  
}
