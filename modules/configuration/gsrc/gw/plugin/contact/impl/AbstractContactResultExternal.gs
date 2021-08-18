package gw.plugin.contact.impl

uses gw.plugin.Plugins
uses gw.plugin.contact.ContactCreator
uses gw.plugin.contact.ContactResult
uses gw.plugin.contact.ContactSystemPlugin

uses java.lang.IllegalStateException
uses java.util.Map

/**
 * Abstract class to represent an implementation of the ContactResult interface generated from
 * some external source.  All sub-classes of this class are guaranteed to return true for
 * the External property.  Handles some generic conversion of AB Contact Types to PC Contact
 * Types, as well as a default implementation of the convertToContact method.
 */
@Export
abstract class AbstractContactResultExternal extends AbstractContactResult implements ContactResult {
  
  private static final var _contactTypeMap : Map<String, typekey.Contact> = {
    "ABCompany" -> typekey.Contact.TC_COMPANY,
    "ABCompanyVendor" -> typekey.Contact.TC_COMPANY,
    "ABPolicyCompany" -> typekey.Contact.TC_COMPANY,
    "ABLawFirm" -> typekey.Contact.TC_COMPANY,
    "ABMedicalCareOrg" -> typekey.Contact.TC_COMPANY,
    "ABAutoRepairShop" -> typekey.Contact.TC_COMPANY,
    "ABAutoTowingAgcy" -> typekey.Contact.TC_COMPANY,
    "ABPerson" -> typekey.Contact.TC_PERSON,
    "ABUserContact" -> typekey.Contact.TC_PERSON,
    "ABPersonVendor" -> typekey.Contact.TC_PERSON,
    "ABPolicyPerson" -> typekey.Contact.TC_PERSON,
    "ABAdjudicator" -> typekey.Contact.TC_PERSON,
    "ABDoctor" -> typekey.Contact.TC_PERSON,
    "ABAttorney" -> typekey.Contact.TC_PERSON
  }
  
  protected final function translateContactType(rawContactType : String) : typekey.Contact {
    var convertedContactType = _contactTypeMap.get(rawContactType)
    if (convertedContactType == null) {
      throw new IllegalStateException("Unrecognized contact type : ${rawContactType}")
    }
    return convertedContactType
  }

  override function convertToContact(creator : ContactCreator) : Contact {
    return Plugins.get(ContactSystemPlugin).retrieveContact(ContactAddressBookUID, creator)
  }
  
  override final property get External() : boolean {
    return true
  }
}
