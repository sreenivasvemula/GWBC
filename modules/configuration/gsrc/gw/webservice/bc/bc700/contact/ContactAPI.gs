package gw.webservice.bc.bc700.contact

uses gw.api.system.BCLoggerCategory
uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.contact.ExternalAppThreadLocal
uses gw.contactmapper.ab700.ContactIntegrationXMLMapper
uses gw.pl.persistence.core.Bundle
uses gw.plugin.Plugins
uses gw.plugin.contact.ContactCreator
uses gw.plugin.contact.ContactSystemPlugin
uses gw.webservice.bc.bc700.APITestBase
uses gw.webservice.contactapi.ab700.ABClientAPI

uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.Throwable

/**
 * BillingCenter's implementation of the ABClientAPI interface.  This API allows ContactManager to send messages to BillingCenter.
 * @deprecated (since 8.0.0) Please use the ab800 package.
 */
@java.lang.Deprecated
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/bc/ws/gw/webservice/bc/bc700/contact/ContactAPI" )
@Export
class ContactAPI extends APITestBase implements ABClientAPI {
  
  
  /**
   * Merge a given contact with another.
   * 
   * @param keptContactABUID the AddressBook Unique ID of the contact that should survive the merging process
   * @param deletedContactABUID the AddressBook Unique ID of the contact that will be merged into the suriving contact
   * @param transactionID the transaction ID of this message
   * 
   * Merge the deletedContact into the keptContact Contact.
   * Merging Contacts will have the following results:
   * <ul>
   *   <li>Non-duplicate entities on arrays (Addresses, RelatedContacts, CategoryScores, OfficialIDs, Tags) are merged 
   * onto the kept Contact; duplicate entries are discarded</li>
   *   <li>Fields on the deletedContact are not preserved</li>
   *   <li>AccountContacts referencing the deletedContact are changed to reference the keptContact; if both exist 
   * on the same Account the keptContact's AccountContact is used</li>
   *   <li>AccountContactRoles on a merged AccountContact are moved to the keptContact's AccountContact; again in 
   * the case of duplicate Roles the keptContact's roles are preserved</li>
   *   <li>The deletedContact and any duplicate sub-Entity (AccountContacts, AccountContactRoles) are retired</li>
   *   <li>The keptContact is refreshed from the external Contact Management System (calls through to
   * {@link ContactSystemPlugin#retrieveContact(String, Bundle)})</li>
   * </ul>
   * 
   * @param keptContactABUID the AddressBook Unique ID of the contact that should survive the merging process
   * @param deletedContactABUID the AddressBook Unique ID of the contact that will be merged into the suriving contact
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(IllegalArgumentException, "If any argument is invalid")
  override function mergeContacts(keptContactABUID : String, deletedContactABUID : String, transactionID : String) {

    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {

      var keptContact = bundle.add(Contact.findFromAddressBookUID(keptContactABUID))
      var deletedContact = bundle.add(Contact.findFromAddressBookUID(deletedContactABUID))      
      var keptContactIsInBillingCenterAlready = keptContact != null
      var deletedContactIsInBillingCenterAlready = deletedContact != null      

      if (!keptContactIsInBillingCenterAlready and !deletedContactIsInBillingCenterAlready) {
        return
      }

      if (keptContactIsInBillingCenterAlready and !deletedContactIsInBillingCenterAlready) {
        Plugins.get(ContactSystemPlugin).retrieveContact(keptContact.AddressBookUID, new ContactCreator(bundle))
        return
      }
      
      if (!keptContactIsInBillingCenterAlready and deletedContactIsInBillingCenterAlready) {
        // Kept contact was NOT in BC database, so get it from contact manager
        keptContact = Plugins.get(ContactSystemPlugin).retrieveContact(keptContactABUID, new ContactCreator(bundle))
      } else {
        // Kept contact WAS already in BC database, so just get updated information about the contact from contact manager.
        // Need to do this because part of the merging process (merging addresses for example) was already done on the CM side.
        keptContact = keptContact.syncWithContactManager()
      }
      
      keptContact.mergeWithContact(deletedContact)
    })
  }
  
  
  /**
   * Update a contact in BillingCenter.
   * 
   * @param contactXML the updates expressed as a SOAP object
   * @param transactionID the transaction ID of this message
   */
  @Throws(SOAPException, "If communication errors occur")   
  @Throws(BadIdentifierException, "If no matching contact can be found in BillingCenter")
  @Throws(IllegalStateException, "If update is not allowed")
  @Throws(RequiredFieldException, "If required field is missing")
  override function updateContact(contactXML : gw.webservice.contactapi.beanmodel.XmlBackedInstance, transactionID : String) {
    require(contactXML, "contactXML")   
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      convertToSOAPException(\ -> {updateContact(contactXML, bundle)})
    })
  }
  
  @Throws(BadIdentifierException, "If no matching contact can be found in BillingCenter")
  @Throws(IllegalStateException, "If update is not allowed")
  private function updateContact(contactXML : gw.webservice.contactapi.beanmodel.XmlBackedInstance, bundle : Bundle) {
    var contact = bundle.add(findContact(contactXML.LinkID))
    if (contact == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByAddressBookUID(contactXML.LinkID))
    }
    if (contact.AutoSync != AutoSync.TC_ALLOW) {
      throw new IllegalStateException(displaykey.Webservice.Error.CannotUpdateContactUnlessAutoSyncIsAllowed(contact.AddressBookUID))
    }
    var mappingPlugin = ContactIntegrationXMLMapper.getInstance()
    mappingPlugin.populateContactFromXML(contact, contactXML)
    ExternalAppThreadLocal.setExternalApp(contactXML.External_UpdateApp)             
  }
  
  /**
   * Return true if the contact associated with the <code>AddressBookUID</code> can be deleted
   * or no contact is associated with <code>AddressBookUID</code>, false otherwise.
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   * @return true if the associated contact is deletable or nonexistant, false otherwise.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")  
  override function isContactDeletable(addressBookUID : String) : boolean {

    require(addressBookUID, "addressBookUID")
            
    var contact = findContactByAddressBookUID(addressBookUID)        
    if(contact == null){
      return true
    }

    if (contact.AutoSync != AutoSync.TC_ALLOW) {
      return false
    }
    
    if (contact typeis UserContact || isContactReferencedByAnything(contact)){
      return false
    }
    
    return true
  }

  private function findContactByAddressBookUID(addressBookUID : String) : Contact {
    var query = Query.make(Contact)
    query.compare("AddressBookUID", Equals, addressBookUID)
    return query.select().AtMostOneRow
  }
  
  private function isContactReferencedByAnything(contact : Contact) : boolean {

    var isReferencedByAccount = Query.make(AccountContact).compare("Contact", Equals, contact).select().HasElements
    if (isReferencedByAccount) {
      return true
    }

    var isReferencedByPolicyPeriod = Query.make(PolicyPeriodContact).compare("Contact", Equals, contact).select().HasElements
    if (isReferencedByPolicyPeriod) {
      return true
    }
   
    var isReferencedByProducer = Query.make(ProducerContact).compare("Contact", Equals, contact).select().HasElements
    if (isReferencedByProducer) {
      return true
    }

    return false;    
  }
  
  /**
   * Removes the specified contact.
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   * @param transactionID the transaction ID of this message
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(IllegalStateException, "If remove is not allowed")   
  override public function removeContact(addressBookUID : String, transactionID : String) {

    require(addressBookUID, "addressBookUID")    

    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      convertToSOAPException(\ -> {removeContact(addressBookUID, bundle)})
    })
  }

  @Throws(IllegalStateException, "If remove is not allowed") 
  private function removeContact(addressBookUID : String, bundle : Bundle) {

    var contact = bundle.add(findContact(addressBookUID))
    if (contact == null) {
      return
    }

    if (contact.AutoSync != AutoSync.TC_ALLOW) {
      throw new IllegalStateException(displaykey.Webservice.Error.CannotRemoveContactUnlessAutoSyncIsAllowed(addressBookUID))
    }

    if (isContactDeletable(addressBookUID)) {           
      contact.remove()
    } else {
      contact.AddressBookUID = null
    }            
  }
  
  private function findContact(addressBookUID : String) : Contact {
    return gw.api.database.Query.make(Contact).compare("AddressBookUID", Equals, addressBookUID).select().AtMostOneRow
  } 
  
  /**
   * Calls the block and converts any exception to a SOAPException
   */
  static function convertToSOAPException(call : block()) {   
    try {
      call()
    }
    catch (e : SOAPException) {
      // Log the exception because we're losing the stack trace from the original exception
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error(e, e)
      throw e
    }
    catch (e : Throwable) {
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error(e, e)
      throw new SOAPException(e.toString())
    }
  }   
}


