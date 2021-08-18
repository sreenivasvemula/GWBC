package SampleData
uses gw.api.databuilder.AddressBuilder

@Export
class Address {
  function create(addressType : AddressType,
                  addressLine1 : String,
                  city : String,
                  state : State,
                  postalCode : String,
                  country : Country) : Address {

    /* This class no longer searches for existing Addresses to re-use because it is no longer recommended
     * and more importantly, no longer allowed for Contacts, to re-use Address instances.
     * -- ELF 2/28/08
     */

      var addressBuilder = new AddressBuilder()
      
      var address = addressBuilder.withAddressLine1( addressLine1 )
      .withCity( city )
      .withState( state )
      .withPostalCode( postalCode )
      .withCounty( country as java.lang.String )
      .withAddressType(addressType)
      .create()

      address.Bundle.commit()
      return address
  }
}
