package gw.webservice.bc.bc801

uses gw.xml.ws.annotation.WsiExportable

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.Address} for use by a WS-I webservice.
 * <p>The specific mappings for {@link AddressDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>AddressBookUID</td><td>Address.AddressBookUID</td></tr><tr><td>AddressType</td><td>Address.AddressType</td></tr><tr><td>PublicID</td><td>Address.PublicID</td></tr><tr><td>AddressLine1</td><td>Address.AddressLine1</td></tr><tr><td>AddressLine1Kanji</td><td>Address.AddressLine1Kanji</td></tr><tr><td>AddressLine2</td><td>Address.AddressLine2</td></tr><tr><td>AddressLine2Kanji</td><td>Address.AddressLine2Kanji</td></tr><tr><td>AddressLine3</td><td>Address.AddressLine3</td></tr><tr><td>City</td><td>Address.City</td></tr><tr><td>CityKanji</td><td>Address.CityKanji</td></tr><tr><td>County</td><td>Address.County</td></tr><tr><td>State</td><td>Address.State</td></tr><tr><td>Country</td><td>Address.Country</td></tr><tr><td>PostalCode</td><td>Address.PostalCode</td></tr><tr><td>CEDEX</td><td>Address.CEDEX</td></tr><tr><td>CEDEXBureau</td><td>Address.CEDEXBureau</td></tr></table></p>
 * Customer configuration: modify this file by adding a property that should be displayed in the summary.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/AddressDTO")
final class AddressDTO  {

  var _addressBookUID    : String               as AddressBookUID
  var _addressType       : typekey.AddressType  as AddressType
  var _publicID          : String               as PublicID
  var _addressLine1      : String               as AddressLine1
  var _addressLine1Kanji : String               as AddressLine1Kanji
  var _addressLine2      : String               as AddressLine2
  var _addressLine2Kanji : String               as AddressLine2Kanji
  var _addressLine3      : String               as AddressLine3
  var _city              : String               as City
  var _cityKanji         : String               as CityKanji
  var _county            : String               as County
  var _state             : typekey.State        as State
  var _country           : typekey.Country      as Country
  var _postalCode        : String               as PostalCode
  var _cedex             : Boolean              as CEDEX
  var _cedexBureau       : String               as CEDEXBureau



  /**
   * Creates a new AddressDTO that represents the current state of the supplied Address.
   * @param that The Address to be represented.
   */
  static function valueOf(that : Address) : AddressDTO {
    return new AddressDTO().readFrom(that)
  }

  construct() { }


  /**
   * Set the fields in this DTO using the supplied Address
   * @param that The Address to copy from.
   */
  final function readFrom(that : Address) : AddressDTO {

      AddressBookUID    = that.AddressBookUID
      AddressType       = that.AddressType
      PublicID          = that.PublicID
      AddressLine1      = that.AddressLine1
      AddressLine1Kanji = that.AddressLine1Kanji
      AddressLine2      = that.AddressLine2
      AddressLine2Kanji = that.AddressLine2Kanji
      AddressLine3      = that.AddressLine3
      City              = that.City
      CityKanji         = that.CityKanji
      County            = that.County
      State             = that.State
      Country           = that.Country
      PostalCode        = that.PostalCode
      CEDEX             = that.CEDEX
      CEDEXBureau       = that.CEDEXBureau

    return this
  }

}