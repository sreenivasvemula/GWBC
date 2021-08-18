package gw.plugin.messaging

uses com.guidewire.bc.system.logging.BCLoggerCategory
uses gw.pl.persistence.core.Bundle
uses gw.webservice.contactapi.ContactIntegrationXMLMapperBase
uses gw.webservice.contactapi.ab800.ContactIntegrationXMLMapperAppBase
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Fk

uses java.lang.Exception
uses gw.api.database.Query

@Export
class ContactMessageRequest implements MessageRequest {
  construct() {
  }

  override function beforeSend(message: Message): String {
    if (message.Payload.contains(ContactIntegrationXMLMapperBase.LATE_BOUND_ABUIDS)) {
      try {
        var modifiedPayload = updateABUIDsInXML(message.MessageRoot as Contact, message.Payload)
        modifiedPayload.Field.removeWhere(\x -> x.Name == ContactIntegrationXMLMapperBase.LATE_BOUND_ABUIDS)
        /// remove the indicator field
        return modifiedPayload.asUTFString()
      } catch (e: Exception) {
        BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error("Cannot modify the payload for ${Contact} with payload ${message.Payload} : \n" + e)
      }
    }
    return message.Payload
  }

  override function resume() {
  }

  override function setDestinationID(p0: int) {
  }

  override function shutdown() {
  }

  override function suspend() {
  }

  override function afterSend(p0: Message) {
  }

  public function updateABUIDsInXML(contact: Contact, payload: String): XmlBackedInstance {
    var addresses = contact.AllAddresses
    var xmlContact = XmlBackedInstance.parse(payload)
    if (!xmlContact.LinkID.Empty) {
      xmlContact.updateFieldValue("LinkID", contact.AddressBookUID)
    }
    var tagsXML = xmlContact.arrayByName("Tags").XmlBackedInstance
    for (tagXML in tagsXML) {
      modifyLinkIDAndAction(tagXML, \x -> contact.Tags.firstWhere(\c -> c.PublicID == x.ExternalPublicID).AddressBookUID)
    }
    var primaryAddressFk = xmlContact.foreignKeyByName("PrimaryAddress")
    modifyOriginalValue(primaryAddressFk, contact.Bundle)
    modifyLinkIDForAddress(primaryAddressFk.XmlBackedInstance, addresses)
    var contactAddressesXML = xmlContact.arrayByName("ContactAddresses").XmlBackedInstance
    for (joinArrayElem in contactAddressesXML) {
      modifyLinkIDAndAction(joinArrayElem,
          \x -> contact.ContactAddresses.firstWhere(\c -> c.PublicID == x.ExternalPublicID).AddressBookUID)
      var addressFK = joinArrayElem.Fk.firstWhere(\i -> i.Name == "Address")
      modifyOriginalValue(addressFK, contact.Bundle)
      modifyLinkIDForAddress(addressFK.XmlBackedInstance, addresses)
    }
    return xmlContact
  }

  private function modifyLinkIDAndAction(xmlElem: XmlBackedInstance, matchBlock(elem: XmlBackedInstance): String) {
    if (!xmlElem.LinkID.Empty) {
      var matchValue = matchBlock(xmlElem)
      if (matchValue != null) {
        if (xmlElem.Action == "Add") {
          xmlElem.Action = null
        }
        xmlElem.updateFieldValue("LinkID", matchValue)
      }
    }
  }

  private function modifyLinkIDForAddress(xmlElement: XmlBackedInstance, addresses: Address[]) {
    if (!xmlElement.LinkID.Empty) {
      var matchingAddress = addresses.firstWhere(\a -> a.PublicID == xmlElement.ExternalPublicID)
      if (matchingAddress != null and matchingAddress.AddressBookUID != null) {
        xmlElement.updateFieldValue("LinkID", matchingAddress.AddressBookUID)
      }
    }
  }

  private function modifyOriginalValue(xmlElementFk: XmlBackedInstance_Fk, bundle: Bundle) {
    var origValue = xmlElementFk.OrigValue
    var lateBoundPrefix = ContactIntegrationXMLMapperAppBase.LATE_BOUND_PREFIX
    if (origValue != null and origValue.contains(lateBoundPrefix)) {
      var query = new Query <Address>(Address)
      query.compare("PublicID", Equals, origValue.substring(lateBoundPrefix.length))
      var orgAdd = query.select().getAtMostOneRow()
      bundle.loadBean(orgAdd.ID)
      xmlElementFk.OrigValue = orgAdd.AddressBookUID
    }
  }
}
