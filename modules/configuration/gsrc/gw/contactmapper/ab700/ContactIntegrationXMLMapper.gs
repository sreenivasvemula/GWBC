package gw.contactmapper.ab700

uses gw.api.system.BCLoggerCategory
uses gw.internal.xml.xsd.typeprovider.XmlSchemaTypeToGosuTypeMappings
uses gw.lang.reflect.IType
uses gw.pl.persistence.core.Key
uses gw.webservice.contactapi.ab700.ContactIntegrationXMLMapperAppBase
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Field
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Fk

/**
 * Use this file to map between BillingCenter entities and XmlBackedInstance objects that represent ContactManager entities.
 * @deprecated (since 8.0.0) Please use the ab800/contactmapper package instead
 */
@java.lang.Deprecated
@Export
class ContactIntegrationXMLMapper extends ContactIntegrationXMLMapperAppBase {
  private static var _logger = BCLoggerCategory.CONTACT_MANAGER_INTEGRATION
  private static var _mapper = new ContactIntegrationXMLMapper()

  static function getInstance() : ContactIntegrationXMLMapper {
    _logger.trace("ContactIntegrationXMLMapper.getInstance() returned a " + _mapper.IntrinsicType.Name)
    return _mapper
  }

  protected construct() {}
  
  override function getNameMapper() : gw.webservice.contactapi.NameMapper {return NameMapper.getInstance()}

  
  function populateXMLFromContact(contact : Contact) : XmlBackedInstance {
    return populateXMLFromContact(contact, false)
  }
  /**
   * This function creates and populates an XmlBackedInstance from the contents of a Contact entity if lateBoundABUIDs is set to true. 
   * The function traverses the Contact's object graph in memory and records the fields that have changed in 
   * the Contact since it was last loaded from the database. 
   * 
   * This means that the generated XmlBackedInstance represents only the changes in the Contact. However, when the 
   * Contact is known to be a new contact, then the XmlBackedInstance actually represents the entire contact.
   *  
   * @param contact a Contact entity from BillingCenter
   * @return an XmlBackedInstance object that can be sent off to ContactManager
   */
  function populateXMLFromContact(contact : Contact, laterBoundABUIDs : boolean) : XmlBackedInstance {

    var xmlBackedInstanceToPopulate = createXmlBackedInstance(contact)

    populateXMLWithValuesFromContactEntity(contact, xmlBackedInstanceToPopulate)

    if(laterBoundABUIDs) {
      addLateBoundTag(xmlBackedInstanceToPopulate)
    }

    if (contact typeis Company) {
      populateTaxIDFieldInXMLWithValueFromCompanyEntity(xmlBackedInstanceToPopulate, contact)
    }
    
    if (contact typeis Person) {
      populateXMLWithValuesFromPersonEntity(contact, xmlBackedInstanceToPopulate)
    }

    // For history tracking
    xmlBackedInstanceToPopulate.External_UpdateApp = com.guidewire.pl.system.server.Version.getAppCode()
    xmlBackedInstanceToPopulate.External_UpdateUser = User.util.CurrentUser.Credential.UserName

    return xmlBackedInstanceToPopulate
  }
  
  /**
   * This function populates a Contact entity from the contents of an XmlBackedInstance. The function maps every field 
   * in the XmlBackedInstance to a corresponding field in the Contact, and overwrites whatever was there before. In this way, 
   * the function serves to update the field values in the Contact.
   *  
   * @param contactToPopulate the Contact to populate
   * @param xmlBackedInstance that contains update values with which to populate the contact
   * @return the populated contact
   */
  function populateContactFromXML(contactToPopulate : Contact, xmlBackedInstance : XmlBackedInstance) : Contact {

    populateContactEntityWithValuesFromXML(xmlBackedInstance, contactToPopulate)
    
    if (contactToPopulate typeis Person) {
      populatePersonEntityWithValuesFromXML(xmlBackedInstance, contactToPopulate)
    }

    populateAddresses(contactToPopulate, xmlBackedInstance)

    return contactToPopulate  
  }  
  
  override function populateABContactAddressFromABContactAddressXML(bean : KeyableBean, xml : XmlBackedInstance) {
    populateBeanField(bean, ADDRESS_BOOK_UID, xml, LINK_ID)
    populateFkBean(bean,
                   "Address",
                   xml,
                   "Address",
                   \ b : KeyableBean, x : XmlBackedInstance ->populateAddressFromAddressXML(b, x))
  }

  override function populateAddressFromAddressXML(bean : KeyableBean, xml : XmlBackedInstance) {
    populateBeanField(bean, ADDRESS_BOOK_UID, xml, LINK_ID)    
    populateBeanField(bean, "AddressLine1", xml)
    populateBeanField(bean, "AddressLine2", xml)
    populateBeanField(bean, "AddressLine3", xml)
    populateBeanField(bean, "AddressType" , xml)
    populateBeanField(bean, "City"        , xml)
    populateBeanField(bean, "Country"     , xml)
    populateBeanField(bean, "County"      , xml)
    populateBeanField(bean, "Description" , xml)
    populateBeanField(bean, "PostalCode"  , xml)
    populateBeanField(bean, "State"       , xml)
    populateBeanField(bean, "ValidUntil"  , xml)    
  }
  
  private function populateContactEntityWithValuesFromXML(xmlBackedInstance : XmlBackedInstance, contactToPopulate : Contact) {
    populateBeanField(contactToPopulate, ADDRESS_BOOK_UID   , xmlBackedInstance, LINK_ID)
    populateBeanField(contactToPopulate, "EmailAddress1"    , xmlBackedInstance)
    populateBeanField(contactToPopulate, "EmailAddress2"    , xmlBackedInstance)
    populateBeanField(contactToPopulate, "Name"             , xmlBackedInstance)
    populateBeanField(contactToPopulate, "Notes"            , xmlBackedInstance)
    populateBeanField(contactToPopulate, "Preferred"        , xmlBackedInstance)
    populateBeanField(contactToPopulate, "PreferredCurrency", xmlBackedInstance)
    populateBeanField(contactToPopulate, "PrimaryPhone"     , xmlBackedInstance)
    populateBeanField(contactToPopulate, "TaxStatus"        , xmlBackedInstance)
    populateBeanField(contactToPopulate, "WithholdingRate"  , xmlBackedInstance)

    populateBeanPhone(contactToPopulate, "FaxPhone", xmlBackedInstance)
    populateBeanPhone(contactToPopulate, "HomePhone", xmlBackedInstance)
    populateBeanPhone(contactToPopulate, "WorkPhone", xmlBackedInstance)

    populateOfficialIDFieldOnContactEntityWithValueFromXML(contactToPopulate, xmlBackedInstance)

    populateArrayBean(contactToPopulate,
                      "Tags",
                      xmlBackedInstance,
                      "Tags",
                      \ b : KeyableBean, x : XmlBackedInstance -> populateContactTagFromContactTagXML(b,x))
  }
  
  private function populatePersonEntityWithValuesFromXML(xmlBackedInstance : XmlBackedInstance, personToPopulate : Person) {
    populateBeanPhone(personToPopulate, "CellPhone"       , xmlBackedInstance)

    populateBeanField(personToPopulate, "DateOfBirth"     , xmlBackedInstance)
    populateBeanField(personToPopulate, "FirstName"       , xmlBackedInstance)
    populateBeanField(personToPopulate, "FormerName"      , xmlBackedInstance)
    populateBeanField(personToPopulate, "Gender"          , xmlBackedInstance)
    populateBeanField(personToPopulate, "LastName"        , xmlBackedInstance)
    populateBeanField(personToPopulate, "LicenseNumber"   , xmlBackedInstance)
    populateBeanField(personToPopulate, "LicenseState"    , xmlBackedInstance)
    populateBeanField(personToPopulate, "MaritalStatus"   , xmlBackedInstance)
    populateBeanField(personToPopulate, "MiddleName"      , xmlBackedInstance)
    populateBeanField(personToPopulate, "NumDependents"   , xmlBackedInstance)
    populateBeanField(personToPopulate, "NumDependentsU18", xmlBackedInstance)
    populateBeanField(personToPopulate, "NumDependentsU25", xmlBackedInstance)
    populateBeanField(personToPopulate, "Occupation"      , xmlBackedInstance)
    populateBeanField(personToPopulate, "Prefix"          , xmlBackedInstance)
    populateBeanField(personToPopulate, "Suffix"          , xmlBackedInstance)
  }
  
  private function getOriginalValuesXML(contact : Contact) : XmlBackedInstance {
    var originalValuesXML = contact.OriginalValuesXML == null
        ? null
        : contact.OriginalValuesXML.Element as XmlBackedInstance
    return originalValuesXML
  }
  
  private function populateXMLWithValuesFromContactEntity(contact : Contact, xmlBackedInstanceToPopulate : XmlBackedInstance) {

    var originalValuesXML = getOriginalValuesXML(contact)

    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, LINK_ID            , contact, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, EXTERNAL_PUBLIC_ID , contact, PUBLIC_ID       )
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "EmailAddress1"    , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "EmailAddress2"    , contact)
//    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "FaxPhone"         , contact)
//    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "HomePhone"        , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Name"             , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Notes"            , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Preferred"        , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "PreferredCurrency", contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "PrimaryPhone"     , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "TaxStatus"        , contact)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "WithholdingRate"  , contact)
//    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "WorkPhone"        , contact)

    populatePhoneXML(originalValuesXML, xmlBackedInstanceToPopulate, "FaxPhone", contact)
    populatePhoneXML(originalValuesXML, xmlBackedInstanceToPopulate, "HomePhone", contact)
    populatePhoneXML(originalValuesXML, xmlBackedInstanceToPopulate, "WorkPhone", contact)

    populateFkXML(getOriginalValuesXML(contact),
                  xmlBackedInstanceToPopulate,     // parent XmlBackedInstance
                  "PrimaryAddress", // name of FK on parent XmlBackedInstance (determined by ContactManager datamodel)
                  contact,          // local parent bean
                  "PrimaryAddress", // name of FK on local parent bean
                  \ xml, b : KeyableBean ->createAddressXMLFromAddress(xml, b))

    populateArrayXML(getOriginalValuesXML(contact),
                     xmlBackedInstanceToPopulate,       // parent XmlBackedInstance
                     "ContactAddresses", // name of array on parent XmlBackedInstance (determined by ContactManager datamodel)
                     contact,            // local parent bean
                     "ContactAddresses", // name of array on local parent bean
                     \ xml, b : KeyableBean ->createABContactAddressXMLFromABContactAddress(xml, b))
                     
    populateArrayXML(getOriginalValuesXML(contact),
                     xmlBackedInstanceToPopulate,  // parent XmlBackedInstance
                     "Tags",        // name of array on parent XmlBackedInstance (determined by ContactManager datamodel)
                     contact,       // local parent bean
                     "Tags",        // name of array on local parent bean
                     \ xml, b : KeyableBean ->createABContactTagXMLFromContactTag(xml,b))
    
  }
  
  private function populateXMLWithValuesFromPersonEntity(person : Person, xmlBackedInstanceToPopulate : XmlBackedInstance) {
    var originalValuesXML = getOriginalValuesXML(person)
//    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "CellPhone"       , person)
    populatePhoneXML(originalValuesXML, xmlBackedInstanceToPopulate, "CellPhone", person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "DateOfBirth"     , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "FirstName"       , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "FormerName"      , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Gender"          , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "LastName"        , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "LicenseNumber"   , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "LicenseState"    , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "MaritalStatus"   , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "MiddleName"      , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "NumDependents"   , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "NumDependentsU18", person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "NumDependentsU25", person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Occupation"      , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Prefix"          , person)
    populateFieldXML(originalValuesXML, xmlBackedInstanceToPopulate, "Suffix"          , person)

    var ssn = person.OfficialIDs.firstWhere(\ o -> o.OfficialIDType == TC_SSN)
    var colType = OfficialID.Type.TypeInfo.getProperty("OfficialIDValue").FeatureType
    var ssnOriginalValue = ssn != null ? ssn.getOriginalValue("OfficialIDValue") : person.getOriginalValue("TaxID")
    populateFieldInXMLWithValue(xmlBackedInstanceToPopulate, "TaxID", person.SSNOfficialID, ssnOriginalValue, colType, person.New)  
  }
  
  private function createABContactTagXMLFromContactTag(originalValuesXML: XmlBackedInstance, contactTag : KeyableBean) : XmlBackedInstance {
    var instance = createXmlBackedInstance(contactTag)
    populateFieldXML(originalValuesXML, instance, LINK_ID            , contactTag, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, instance, EXTERNAL_PUBLIC_ID , contactTag, PUBLIC_ID       )
    populateFieldXML(originalValuesXML, instance, "Type"             , contactTag)
    return instance
  }

  private function populateOfficialIDFieldOnContactEntityWithValueFromXML(contactToPopulate : Contact, xmlBackedInstance : XmlBackedInstance) {
    if (contactToPopulate typeis Person) {
      contactToPopulate.SSNOfficialID = xmlBackedInstance.fieldValue("TaxID")
    } else {
      contactToPopulate.FEINOfficialID = xmlBackedInstance.fieldValue("TaxID")
    }
  }
  
  private function populateContactTagFromContactTagXML(bean : KeyableBean, xml : XmlBackedInstance) {
    populateBeanField(bean, ADDRESS_BOOK_UID   , xml, LINK_ID)
    populateBeanField(bean, "Type"             , xml)
  }
  
  private function populateTaxIDFieldInXMLWithValueFromCompanyEntity(xmlBackedInstanceToPopulate : XmlBackedInstance, company : Company) {
      var officialIDWithTypeFein = company.OfficialIDs.firstWhere(\ officialID -> officialID.OfficialIDType == TC_FEIN)
      var officialIDValuePropertyType = OfficialID.Type.TypeInfo.getProperty("OfficialIDValue").FeatureType
      var feinOriginalValue = officialIDWithTypeFein != null
        ? officialIDWithTypeFein.getOriginalValue("OfficialIDValue")
        : company.getOriginalValue("TaxID")
      populateFieldInXMLWithValue(xmlBackedInstanceToPopulate, "TaxID", company.FEINOfficialID, 
                                feinOriginalValue, officialIDValuePropertyType, company.New)    
  }

  private function populateFieldInXMLWithValue(xmlBackedInstance     : XmlBackedInstance,
                                      nameOfFieldInXML: String,
                                      valueToSetIntoField : Object,
                                      originalValue   : Object,
                                      columnType      : IType,
                                      beanIsNew       : boolean) {

    var fieldInXML = new XmlBackedInstance_Field()
    xmlBackedInstance.Field.add(fieldInXML)
    fieldInXML.Name = nameOfFieldInXML
    
    var typeAndXmlSimpleValueFactoryPair = XmlSchemaTypeToGosuTypeMappings.gosuToSchema(columnType)

    fieldInXML.Type = typeAndXmlSimpleValueFactoryPair.First

    fieldInXML.setAttributeSimpleValue(XmlBackedInstance_Field.$ATTRIBUTE_QNAME_Value,
               typeAndXmlSimpleValueFactoryPair.Second.gosuValueToStorageValue(valueToSetIntoField))

    if (beanIsNew or nameOfFieldInXML == LINK_ID or nameOfFieldInXML == EXTERNAL_PUBLIC_ID) {
      return
    }
    
    fieldInXML.setAttributeSimpleValue(XmlBackedInstance_Field.$ATTRIBUTE_QNAME_OrigValue,
               typeAndXmlSimpleValueFactoryPair.Second.gosuValueToStorageValue(originalValue))
  }

  protected function createAddressXMLFromAddress(originalValuesXML: XmlBackedInstance, address : KeyableBean) : XmlBackedInstance {
    var instance = createXmlBackedInstance(address)
    populateFieldXML(originalValuesXML, instance, LINK_ID            , address, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, instance, EXTERNAL_PUBLIC_ID , address, PUBLIC_ID       )
    populateFieldXML(originalValuesXML, instance, "AddressLine1"     , address)
    populateFieldXML(originalValuesXML, instance, "AddressLine2"     , address)
    populateFieldXML(originalValuesXML, instance, "AddressLine3"     , address)
    populateFieldXML(originalValuesXML, instance, "AddressType"      , address)
    populateFieldXML(originalValuesXML, instance, "City"             , address)
    populateFieldXML(originalValuesXML, instance, "Country"          , address)
    populateFieldXML(originalValuesXML, instance, "County"           , address)
    populateFieldXML(originalValuesXML, instance, "Description"      , address)
    populateFieldXML(originalValuesXML, instance, "GeocodeStatus"    , address)
    populateFieldXML(originalValuesXML, instance, "PostalCode"       , address)
    populateFieldXML(originalValuesXML, instance, "State"            , address)
    populateFieldXML(originalValuesXML, instance, "ValidUntil"       , address)
    return instance
  }
  
  private function createABContactAddressXMLFromABContactAddress(originalValuesXML: XmlBackedInstance, 
                                                                   abContactAddress : KeyableBean) : XmlBackedInstance {
    var instance = createXmlBackedInstance(abContactAddress)
    populateFieldXML(originalValuesXML, instance, LINK_ID, abContactAddress, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, instance, EXTERNAL_PUBLIC_ID, abContactAddress, PUBLIC_ID)
    
    populateFkXML(originalValuesXML,
                  instance,         // parent XmlBackedInstance
                  "Address",        // name of FK on parent XmlBackedInstance (determined by ContactManager datamodel)
                  abContactAddress, // local parent bean
                  "Address",        // name of FK on local parent bean
                  \ xml, b : KeyableBean ->createAddressXMLFromAddress(xml, b))
    return instance
  }
  
  //This function inserts this special field in the xml - LATE_BOUNDS. This field will indicate whether the payload needs to be
  //modified and replaced the ABUIDs in the payload, when the message request process the payload. If it is set to TRUE, populate
  //the XML from a contact. This field will be removed after modification.
  //Original value for address FK or contactAddress FK is usually populated with ABUIDs if there is any. If lateBoundABUIDs is true,
  //it will be populated with PublicID if ABUID does not exist yet. Then the message request knows that ABUID should be replaced with
  //the corresponding address's publicID.
  private function addLateBoundTag(instanceXML     : XmlBackedInstance) {
    var fieldXML = new gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Field()
    instanceXML.Field.add(fieldXML)
    fieldXML.Name = LATE_BOUND_ABUIDS
    fieldXML.Value = "true"
  } 
  
  override public function populateFkXML(originalValuesXML : XmlBackedInstance, parentXML : XmlBackedInstance,
                                   fkName_XML : String, parentBean : KeyableBean, fkName_Bean : String,
                                   fkPopulatorFn(originalValuesXML : XmlBackedInstance, fkBean : KeyableBean) : XmlBackedInstance,
                                   setOrigToPublicIDIfNoABUID : boolean) {
    var fk_entity = parentBean.getFieldValue(fkName_Bean) as KeyableBean
    var instance_Fk = new XmlBackedInstance_Fk()
    var originalInstance_Fk = originalValuesXML == null ? null : originalValuesXML.foreignKeyByName(fkName_XML).XmlBackedInstance
    instance_Fk.Name = fkName_XML

    var origLinkID : String = null
    
    if (originalInstance_Fk == null) {
      // populate new instance's orig value from the parent bean as well
      var original_FK = parentBean.getOriginalValue(fkName_Bean) as Key
      if (original_FK != null) {
        var original_FK_entity = parentBean.Bundle.loadByKey(original_FK)
        if (original_FK_entity != null) {
          if (setOrigToPublicIDIfNoABUID and original_FK_entity.getFieldValue(ADDRESS_BOOK_UID) == null) {
            origLinkID = LATE_BOUND_PREFIX + original_FK_entity.getFieldValue(PUBLIC_ID) as java.lang.String
          } else {
            origLinkID = original_FK_entity.getFieldValue(ADDRESS_BOOK_UID) as java.lang.String
          }
        }
      }
    } else {
      // populate orig values from the originalValuesXML
        if (setOrigToPublicIDIfNoABUID and originalInstance_Fk.fieldValue(LINK_ID) == null) {
          origLinkID = LATE_BOUND_PREFIX + originalInstance_Fk.fieldValue(EXTERNAL_PUBLIC_ID)
        } else {
          origLinkID = originalInstance_Fk.fieldValue(LINK_ID)
        }
    }
      
    if (fk_entity == null) {
      if(origLinkID != null) {
        parentXML.Fk.add(instance_Fk)
        instance_Fk.OrigValue = origLinkID
        instance_Fk.XmlBackedInstance = new XmlBackedInstance()
        instance_Fk.XmlBackedInstance.updateFieldValue("LinkID", instance_Fk.OrigValue)
        instance_Fk.XmlBackedInstance.Action = REMOVE
      }
    }
    else {
      parentXML.Fk.add(instance_Fk)
      instance_Fk.OrigValue = origLinkID
      // populate new instance foreign key with the data from the parentBean
      instance_Fk.XmlBackedInstance = fkPopulatorFn(originalInstance_Fk, fk_entity)
    }
  }
}
