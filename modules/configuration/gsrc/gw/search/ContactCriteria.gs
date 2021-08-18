package gw.search

uses gw.api.database.Table
uses gw.util.concurrent.LockingLazyVar
uses gw.xml.ws.annotation.WsiExportable

uses java.io.Serializable
uses java.lang.IllegalArgumentException

/**
 * Criteria used to select a contact.
 */
@Export
@WsiExportable( "http://guidewire.com/bc/ws/gw/search/ContactCriteria" )
final class ContactCriteria implements Serializable {

  final static var SHOULD_IGNORE_CASE = true
 
  private var _companyName : String as CompanyName
  private var _firstName: String as FirstName
  private var _lastName: String as LastName
  private var _companyNameKanji: String as CompanyNameKanji
  private var _firstNameKanji: String as FirstNameKanji
  private var _lastNameKanji: String as LastNameKanji

  private var _addressLine1 : String as AddressLine1
  private var _city : String as City
  private var _cityKanji : String as CityKanji
  private var _state : State as State
  private var _postalCode : String as PostalCode
  private var _country : Country as Country

  function isAnyFieldPopulated() : boolean {
    return (CompanyName.NotBlank or
            FirstName.NotBlank or
            FirstNameKanji.NotBlank or
            LastName.NotBlank or
            LastNameKanji.NotBlank or
            AddressLine1.NotBlank or
            City != null or
            CityKanji.NotBlank or
            State != null or
            Country != null or
            PostalCode.NotBlank)
  }

  /**
   * Returns true if the criteria is a good faith effort to avoid returning all contacts.
   * This is for performance reasons so that an overly large result set won't be returned which
   * may cause other queries to blow up. 
   */
  function isReasonablyConstrainedForSearch() : boolean {
    return (CompanyName.NotBlank or
            CompanyNameKanji.NotBlank or
            FirstName.NotBlank or
            FirstNameKanji.NotBlank or
            LastName.NotBlank or
            LastNameKanji.NotBlank)
  }

  /**
   * Restricts the given contactTable according to the criteria in this object. 
   * 
   * Note:  This method accepts a LockingLazyVar because it is possible that no search criteria
   * has been specified, and hence no restrictions will need to be added.
   */
  function restrictTable(contactTable : LockingLazyVar<Table<Contact>>, contactCriteriaSearchMode : StringCriterionMode) {
    // If both the CompanyName and FirstName/LastName are provided, prefer to use
    // CompanyName instead of FirstName/LastName.
    if (CompanyName.NotBlank) {
      restrictUsingMode(contactTable.get().cast(Company), "Name", CompanyName, contactCriteriaSearchMode)
    } else {
      if (FirstName.NotBlank) {
        restrictUsingMode(contactTable.get().cast(Person), "FirstName", FirstName, contactCriteriaSearchMode)
      }
      if (LastName.NotBlank) {
        restrictUsingMode(contactTable.get().cast(Person), "LastName", LastName, contactCriteriaSearchMode)
      }
    }
    
    if (CompanyNameKanji.NotBlank) {
      restrictUsingMode(contactTable.get().cast(Company), "NameKanji", CompanyNameKanji, contactCriteriaSearchMode, :ignoreCase = false)
    } else {
      if (FirstNameKanji.NotBlank) {
        restrictUsingMode(contactTable.get().cast(Person), "FirstNameKanji", FirstNameKanji, contactCriteriaSearchMode, :ignoreCase = false)
      }
      if (LastNameKanji.NotBlank) {
        restrictUsingMode(contactTable.get().cast(Person), "LastNameKanji", LastNameKanji, contactCriteriaSearchMode, :ignoreCase = false)
      }
    }
    
    // Use a LockingLazyVar so that if nobody needs the Address table, we avoid the cost of doing a join.
    var lazyAddressTable = LockingLazyVar.make(\ ->contactTable.get().join("PrimaryAddress"))
    
    if (AddressLine1.NotBlank) {
      restrictUsingMode(lazyAddressTable.get(), "AddressLine1", AddressLine1, contactCriteriaSearchMode)
    }
    if (City.NotBlank) {
      restrictUsingMode(lazyAddressTable.get(), "City", City, contactCriteriaSearchMode)
    }
    if (CityKanji.NotBlank) {
      restrictUsingMode(lazyAddressTable.get(), "CityKanji", CityKanji, contactCriteriaSearchMode, :ignoreCase = false)
    }
    if (State != null) {
      lazyAddressTable.get().compare("State", Equals, State)
    }
    if (Country != null) {
      lazyAddressTable.get().compare("Country", Equals, Country)
    }
    if (PostalCode.NotBlank) {
      restrictUsingMode(lazyAddressTable.get(), "PostalCode", PostalCode, contactCriteriaSearchMode)
    }
  }
  
  /**
   * Restricts the table to those where the given property matches the given value using
   * the specified StringCriterionMode (TC_CONTAINS, TC_STARTSWITH, or TC_EQUALS).
   */
  private static function restrictUsingMode(table : Table, propertyName : String, value : String, mode : StringCriterionMode, ignoreCase : boolean = SHOULD_IGNORE_CASE ) {
    switch (mode) {
      case StringCriterionMode.TC_CONTAINS:
        table.contains(propertyName, value, ignoreCase)
        break
      case StringCriterionMode.TC_STARTSWITH:
        table.startsWith(propertyName, value, ignoreCase)
        break
      case StringCriterionMode.TC_EQUALS:
        table.compareIgnoreCase(propertyName, Equals, value)
        break
      default:
        throw new IllegalArgumentException("Unrecognized StringCriterionMode: " + mode)
    }
  }
}