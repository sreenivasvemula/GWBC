package gw.plugin.contact.ab800

uses gw.api.system.BCLoggerCategory
uses com.guidewire.pl.domain.contact.XmlElementByteContainer
uses gw.api.system.BCConfigParameters
uses gw.api.util.DisplayableException
uses gw.entity.IEntityType
uses gw.lang.reflect.TypeSystem
uses gw.contactmapper.ab800.ContactIntegrationMapperFactory
uses gw.plugin.contact.ContactCommunicationException
uses gw.plugin.contact.ContactCreator
uses gw.plugin.contact.ContactResult
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.DuplicateContactResultContainer
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.xml.XmlException
uses java.lang.Exception
uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.NullPointerException
uses java.util.Collection
uses java.util.Set
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.ABContactAPI
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.anonymous.elements.AddressBookUIDContainer_AddressBookUIDTuples_Entry
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.AlreadyExecutedException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.BadIdentifierException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.DataConversionException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.EntityStateException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.RequiredFieldException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.SOAPException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.SOAPSenderException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.SOAPSenderException
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.ABContactAPISearchSpec
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.ABContactAPISearchCriteria
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.AddressBookUIDContainer
uses gw.webservice.contactapi.ContactAPIUtil
uses gw.api.database.Query
uses gw.api.util.LocaleUtil
uses gw.util.StreamUtil

@Export
class ABContactSystemPlugin implements ContactSystemPlugin {
  private var _abContactAPI: ABContactAPI
  private var _mapper = ContactIntegrationMapperFactory.get()
  construct() {
    _abContactAPI = new ABContactAPI()
  }

  /**
   * Notifies ContactManager about the creation of a a new contact. If communication with Contact Manager
   * is successful, this method updates the contact, primary address and secondary addresses with their AddressBookUIDs.
   * If unsuccessful, this method creates an activity for the update user describing the update that failed.
   *
   * @param contact contact that ContactManager is being notified about.
   * @param transactionId the transactionID to make this call
   *
   */
  override function addContact(contact: Contact, transactionId: String) {
    var xml = _mapper.populateXMLFromContact(contact)
    addContact(contact, xml.asUTFString(), transactionId)
  }

  override function addContact(contact: Contact, payload: String, transactionId: String) {
    if (contact.AddressBookUID != null) {
      throw new IllegalArgumentException(displaykey.Java.ABContactSystemPlugin.Error.ContactAlreadyExists)
    }
    BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.debug("Adding '${contact}' to ContactManager with transaction id '${transactionId}'")
    try {
      var abuidContainer: AddressBookUIDContainer
      var abXmlBackedInstance = wsi.remote.gw.webservice.ab.ab801.beanmodel.XmlBackedInstance.parse(StreamUtil.toBytes(payload))
      setTransactionId(transactionId)
      abuidContainer = callWebService(\api -> api.createContact(abXmlBackedInstance))
      updateAddressBookUIDs(contact, abuidContainer)
    } catch (e: Exception) {
      handleErrors(e)
    }
  }

  /**
   * Notifies ContactManager about changes to a contact. If communication with ContactManager is
   * successful, this updates the contact, primary address and secondary addresses with their AddressBookUIDs.
   * If communication with ContactManager is unsuccessful, this method creates an activity for the update user 
   * describing the update that failed.
   *
   * If communication with ContactManager fails with an EntityStateException (version conflict), this method creates 
   * an activity and also tries to retrieve the latest version of the contact.
   *
   * @param contact contact that ContactManager is being notified about.
   * @param changes XML of changes that conforms to ContactManager's ABContactModel.xsd
   * @param transactionId the transactionID to make this call
   */
  override function updateContact(contact: Contact, changes: String, transactionId: String) {
    BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.debug("Sending updates to ContactManager for '${contact}' with transaction id '${transactionId}'")
    if (contact.AddressBookUID == null) {
      throw new IllegalArgumentException(displaykey.Java.ABContactSystemPlugin.Error.CannotUpdateUnlinkedContact)
    }
    try {
      var abuidContainer: AddressBookUIDContainer
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.debug("Sending contact info,\n${changes}")
      var abXmlBackedInstance = wsi.remote.gw.webservice.ab.ab801.beanmodel.XmlBackedInstance.parse(StreamUtil.toBytes(changes))
      setTransactionId(transactionId)
      abuidContainer = callWebService(\api -> api.updateContact(abXmlBackedInstance))
      updateAddressBookUIDs(contact, abuidContainer)
    } catch (ese: EntityStateException) {
      // Non retryable, just ack the message. Will be fixed by activity
      retrieveLatestContactForFailedUpdateContact(contact)
      handleErrors(ese)
    } catch (e: Exception) {
      handleErrors(e)
    }
  }

  override function removeContact(contact: Contact, removeInfo: String, transactionId: String) {
    try {
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.debug("Sending remove instruction to ContactManager for '${contact}'")
      if (contact.AddressBookUID == null) {
        throw new IllegalArgumentException(displaykey.Java.ABContactSystemPlugin.Error.CannotRemoveUnlinkedContact)
      }
      var abXmlBackedInstance = wsi.remote.gw.webservice.ab.ab801.beanmodel.XmlBackedInstance.parse(StreamUtil.toBytes(removeInfo))
      setTransactionId(transactionId)
      callWebService(\api -> api.removeContact(abXmlBackedInstance))
    } catch (e: Exception) {
      handleErrors(e)
    }
  }

  override function retrieveContact(addressBookUID: String, creator: ContactCreator): Contact {
    var returnedContact: Contact = null
    var contactXml = retrieveContactXML(addressBookUID)
    if (contactXml != null) {
      var contactType = ContactIntegrationMapperFactory.get().getNameMapper().getLocalEntityName(contactXml.EntityType)
      returnedContact = creator.loadOrCreateContact(contactXml.LinkID, contactType)
      validateAutoSyncState(returnedContact, addressBookUID)
      overwriteContactFromXml(returnedContact, contactXml)
    }
    return returnedContact
  }

  override function overwriteContactWithLatestValues(contact: Contact, addressBookUID: String) {
    validateAutoSyncState(contact, addressBookUID)
    var contactXml = retrieveContactXML(addressBookUID)
    overwriteContactFromXml(contact, contactXml)
  }

  override function supportsFindingDuplicates(): boolean {
    return true
  }

  override function supportsExternalContactSystemIntegration(): boolean {
    return true
  }

  override function findDuplicates(contact: Contact): DuplicateContactResultContainer {
    var searchSpec = new ABContactAPISearchSpec()
    searchSpec.ChunkSize = BCConfigParameters.MaxContactSearchResults.Value
    searchSpec.TagMatcher.Tags.Entry = {ContactTagType.TC_CLIENT.Code}
    searchSpec.TagMatcher.MatchAllTags = false
    searchSpec.LocaleCode = LocaleUtil.CurrentLocaleType.Code
    var xml = _mapper.populateXMLFromContact(contact)
    // don't send LinkID
    var linkIDField = xml.Field.firstWhere(\i -> i.Name == "LinkID")
    xml.Field.remove(linkIDField)
    return new DuplicateContactResultContainerImpl(callWebService(\api -> {
      var abXmlBackedInstance = wsi.remote.gw.webservice.ab.ab801.beanmodel.XmlBackedInstance.parse(xml.asUTFString())
      return api.findDuplicates(abXmlBackedInstance, searchSpec)
    }))
  }

  override function searchContacts(searchCriteria: ContactSearchCriteria): ContactResult[] {
    if (searchCriteria == null) {
      throw new NullPointerException("Search criteria cannot be null")
    }
    var abSearchCriteria = new ABContactAPISearchCriteria()
    abSearchCriteria.sync(searchCriteria)
    try {
      var searchSpec = new ABContactAPISearchSpec()
      searchSpec.ChunkSize = BCConfigParameters.MaxContactSearchResults.Value
      searchSpec.LocaleCode = LocaleUtil.CurrentLocaleType.Code
      throwExceptionIfContactManagerReturnsTooManyResults(abSearchCriteria, searchSpec)
      return findContactsFromContactManager(abSearchCriteria, searchSpec)
    } catch (e: RequiredFieldException) {
      throw new DisplayableException(e.Message)
    } catch (e: SOAPSenderException) {
      wrap(e)
    } catch (e: SOAPException) {
      wrap(e)
    } catch (e: org.apache.axis.AxisFault) {
      wrap(e)
    } catch (e: gw.xml.ws.WebServiceException) {
      wrap(e)
    }
    return null
  }

  override function createAsyncMessage(messageContext: MessageContext, contact: Contact, lateBoundABUID: boolean) {
    var contactMapper = ContactIntegrationMapperFactory.get()
    var contactXML = contactMapper.populateXMLFromContact(contact, lateBoundABUID)
    messageContext.createMessage(contactXML.asUTFString())
  }

  private function findContactsFromContactManager(abSearchCriteria: ABContactAPISearchCriteria,
                                                  searchSpec: ABContactAPISearchSpec): ContactResultFromSearch[] {
    searchSpec.GetNumResultsOnly = false
    var result = callWebService(\api -> {
      return api.searchContact(abSearchCriteria, searchSpec)
    })
    return result.Results.Entry.map(\a -> new ContactResultFromSearch(a.$TypeInstance)).toTypedArray()
  }

  private function throwExceptionIfContactManagerReturnsTooManyResults(abSearchCriteria: ABContactAPISearchCriteria,
                                                                       searchSpec: ABContactAPISearchSpec) {
    searchSpec.GetNumResultsOnly = true
    var searchResultContainer = callWebService(\api -> {
      return api.searchContact(abSearchCriteria, searchSpec)
    })
    if (searchResultContainer.TotalResults > BCConfigParameters.MaxContactSearchResults.Value) {
      throw new DisplayableException(displaykey.Web.ContactManager.Error.TooManyResults)
    }
  }

  protected function callWebService<T>(call: block(api: ABContactAPI): T): T {
    try {
      return call(_abContactAPI)
    } catch (e: AlreadyExecutedException) {
      handleAlreadyExecutedException(e)
    }
    return null
  }

  protected function handleAlreadyExecutedException(e: AlreadyExecutedException) {
    BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.warn(e)
  }

  private function wrap(e: Exception) {
    BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error(displaykey.Web.ContactManager.Error.GeneralException(e.Message), e)
    throw new DisplayableException(displaykey.Web.ContactManager.Error.GeneralException(e.Message))
  }

  /**
   * Updates the contact, its primary address, and secondary addresses with the AddressBookUIDs from ContactManager.
   */
  private function updateAddressBookUIDs(contact: Contact, abuidContainer: AddressBookUIDContainer) {
    contact.AddressBookUID = abuidContainer.ContactABUID
    var insertedAndUpdatedBeansInBundle = contact.Bundle.InsertedBeans.iterator().toList().union(contact.Bundle.UpdatedBeans.iterator().toList())
    var beansRemovedFromBundle = contact.Bundle.RemovedBeans.iterator().toList()
    for (addressBookUIDEntry in abuidContainer.AddressBookUIDTuples.Entry) {
      populateAddressBookUIDField(addressBookUIDEntry, contact, insertedAndUpdatedBeansInBundle, beansRemovedFromBundle)
    }
  }

  private function populateAddressBookUIDField(addressBookUIDEntry: AddressBookUIDContainer_AddressBookUIDTuples_Entry,
                                               contact: Contact,
                                               insertedAndUpdatedBeansInBundle: Set <entity.KeyableBean>,
                                               beansRemovedFromBundle: List <entity.KeyableBean>) {
    if (addressBookUIDEntry.External_PublicID == null) {
      return
    }
    var localEntityName = ContactIntegrationMapperFactory.get().getNameMapper().getLocalEntityName(addressBookUIDEntry.EntityType)
    var entityType = TypeSystem.getByRelativeName(localEntityName) as IEntityType
    if (findBeanByRelativeNameAndPublicID(beansRemovedFromBundle, entityType.RelativeName, addressBookUIDEntry.External_PublicID) != null) {
      return
    }
    var bean = findBeanByRelativeNameAndPublicID(insertedAndUpdatedBeansInBundle, entityType.RelativeName, addressBookUIDEntry.External_PublicID)
    if (bean == null) {
      var query = new Query <KeyableBean>(entityType)
      query.compare("PublicID", Equals, addressBookUIDEntry.External_PublicID)
      bean = contact.Bundle.loadBean(query.select().getAtMostOneRow().ID)
    }
    bean.setFieldValue("AddressBookUID", addressBookUIDEntry.LinkID)
  }

  private static function findBeanByRelativeNameAndPublicID(beans: Collection <KeyableBean>, relativeName: String, publicID: String): KeyableBean {
    return beans.firstWhere(\k -> k.IntrinsicType.RelativeName == relativeName
        and (k.getFieldValue("PublicID") as String) == publicID)
  }

  protected function handleErrors(e: Exception) {
    if (e typeis IllegalArgumentException or
        e typeis EntityStateException or
        e typeis RequiredFieldException or
        e typeis DataConversionException or
        e typeis BadIdentifierException or
        e typeis XmlException) {
      // Non retryable, just acknowledge the message. Will be fixed by activity
      throw new ContactCommunicationException(e.Message, e.Cause, false)
    } else if (e typeis SOAPSenderException or  e typeis SOAPException) {
      // Retryable and should notifyAdmin
      throw new ContactCommunicationException(e.Message, e.Cause, true, true)
    } else {
      throw e
      // Let it through for other types of exception
    }
  }

  private function retrieveContactXML(addressBookUID: String): XmlBackedInstance {
    var abContactXML: wsi.remote.gw.webservice.ab.ab801.beanmodel.XmlBackedInstance
    try {
      abContactXML = callWebService(\api -> api.retrieveContact(addressBookUID))
    } catch (e: SOAPException) {
      wrap(e)
    } catch (e: org.apache.axis.AxisFault) {
      wrap(e)
    }
    return abContactXML == null
        ? null
        : XmlBackedInstance.parse(abContactXML.asUTFString())
  }

  /**
   * This function is called when updateContact has failed because of an EntityStateException.
   */
  private function retrieveLatestContactForFailedUpdateContact(contact: Contact) {
    try {
      retrieveContact(contact.AddressBookUID, new ContactCreator(contact.Bundle))
    } catch (e: Exception) {
      // do nothing here. exception has already been logged. 
    }
  }

  private function overwriteContactFromXml(contact: Contact, contactXml: XmlBackedInstance) {
    if (contactXml != null) {
      if (contact.AddressBookUID == null or contact.New) {
        contact.OriginalValuesXML = XmlElementByteContainer.getContainerForElement(contactXml)
      }
      _mapper.populateContactFromXML(contact, XmlBackedInstance.parse(contactXml.asUTFString()))
    }
    contact.AutoSync = TC_ALLOW
  }

  private function validateAutoSyncState(contact: Contact, addressBookUID: String) {
    if (contact.AutoSync == AutoSync.TC_DISALLOW) {
      throw new IllegalStateException(displaykey.Web.ContactManager.Error.CannotRetrieveContactWhenAutoSyncDisallowed(addressBookUID))
    }
  }

  private function setTransactionId(tid: String) {
    ContactAPIUtil.setTransactionId(_abContactAPI.Config, tid)
  }
}
