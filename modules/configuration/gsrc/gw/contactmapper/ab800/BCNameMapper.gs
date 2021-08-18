package gw.contactmapper.ab800

uses gw.webservice.contactapi.NameMapperImpl
uses gw.webservice.contactapi.NameMapper

/**
 * Class for handling name mapping between BillingCenter and ContactManager entities and typelists.
 * If an entity is added to the contact graph, and the names differ between BillingCenter and ContactManager,
 * then a mapping need to be added to this class in the create() method below.  All entity names and
 * typelist values in the XML sent between the applications via the ABContactAPI is in terms of
 * the ContactManager data model, thus BillingCenter needs to translate the names from the BillingCenter
 * (local) namespace to the ContactManager (AB) namespace.
 */
@Export
internal class BCNameMapper extends NameMapperImpl<BCNameMapper> {

  private static var _instance : BCNameMapper

  internal static property get Instance() : NameMapper {
    if (_instance == null)
      _instance = create()
    return _instance
  }

  private construct() {
    super()
  }

  private static function create() : BCNameMapper {

    var nameMapper = new BCNameMapper()
        // This is the code to map BC entity, typelist and typecode names to the corresponding
        // AB names.  See NameMapperImpl for more documentation.

        // two way mappings between the BC and AB entities
        .entity(Contact, "ABContact")
        .entity(Company, "ABCompany")
        .entity(Person, "ABPerson")
        .entity(ContactTag, "ABContactTag")
        .entity(ContactContact, "ABContactContact")
        .entity(ContactAddress, "ABContactAddress")

        // one way mapping from an AB to a BC entity
        .abToLocalEntity("ABAutoRepairShop", Company)
        .abToLocalEntity("ABAutoTowingAgcy", Company)
        .abToLocalEntity("ABCompanyVendor", Company)
        .abToLocalEntity("ABLawFirm", Company)
        .abToLocalEntity("ABMedicalCareOrg", Company)
        .abToLocalEntity("ABPolicyCompany", Company)
        .abToLocalEntity("ABAdjudicator", Person)
        .abToLocalEntity("ABAttorney", Person)
        .abToLocalEntity("ABDoctor", Person)
        .abToLocalEntity("ABPersonVendor", Person)
        .abToLocalEntity("ABPolicyPerson", Person)

        // Typelist mapping
        .typeList(TypeListMapping.make(MaritalStatus)
          .typeCode(MaritalStatus.TC_S, "single")
          .typeCode(MaritalStatus.TC_M, "married")
          .typeCode(MaritalStatus.TC_D, "divorced")
          .typeCode(MaritalStatus.TC_W, "widowed")
          .typeCode(MaritalStatus.TC_C, "common")
          .typeCode(MaritalStatus.TC_P, "separated")
          .typeCode(MaritalStatus.TC_U, "unknown"))

    return nameMapper
  }
}
