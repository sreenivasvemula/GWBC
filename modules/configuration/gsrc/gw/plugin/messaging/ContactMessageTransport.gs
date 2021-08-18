package gw.plugin.messaging

uses com.guidewire.pl.system.dependency.PLDependencies
uses com.guidewire.bc.system.logging.BCLoggerCategory
uses gw.api.database.Query
uses gw.api.system.PLConfigParameters
uses gw.datatype.DataTypes
uses gw.plugin.contact.ContactCommunicationException
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.Plugins
uses java.lang.Exception

@Export
class ContactMessageTransport implements MessageTransport {
  public static final var DEST_ID : int = 67
  public static final var TRANSACTION_ID_PREFIX : String = PLConfigParameters.PublicIDPrefix.Value + ":"

  override function send(message : Message, transformedPayload : String) {
    var contact = message.MessageRoot as Contact
    var updateUser = contact.UpdateUser  // get the update user before the contact modified by api call. So activity can be assigned correctly
    var plugin = Plugins.get(ContactSystemPlugin)
    try {
      switch (message.EventName) {
        case "ContactAdded":
        case "ContactChanged":
          addOrUpdateContactIfNecessary(contact, transformedPayload, getTransactionId(message))
          break
        case "ContactRemoved":
          if (not contact.IsLocalOnly) {
            plugin.removeContact(contact, transformedPayload, getTransactionId(message))
          }
          break
        default:
          BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error("Unknown Contact Message event: " + message.EventName)
      }
      message.reportAck()
    } catch (ce : ContactCommunicationException) {
      if (ce.notifyAdmin()) {
        createActivityForAdmin(contact, transformedPayload, ce)
      } else {
        createActivity(contact, transformedPayload, updateUser, ce)
      }
      if (!ce.Retryable) {
        message.reportAck()
      } else {
        message.reportError()
      }
    } catch(e : Exception) {
      message.ErrorDescription = e.LocalizedMessage
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.debug("Exception occurred while sending message in CM", e)
      message.reportError()
    }
  }


  private function addOrUpdateContactIfNecessary(contact : Contact, transformedPayload : String, transactionID : String){
    var plugin = Plugins.get(ContactSystemPlugin)

    if (contact.ShouldSendToContactSystem and contact.IsLocalOnly){
      plugin.addContact(contact,transformedPayload, transactionID)
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.debug("Contact '${contact}' is synced with Contact Manager")
    } else if (not contact.IsLocalOnly) {
      plugin.updateContact(contact, transformedPayload, transactionID)
    }
  }


  private function getTransactionId(message : Message) : String {
     return TRANSACTION_ID_PREFIX + message.ID
  }

  private function createActivity(contact : Contact, changes : String, updateUser : User, e : Exception) {
    createActivity(contact, changes, e, \ a -> {a.assignUserAndDefaultGroup(updateUser)})
  }

  private function createActivityForAdmin(contact : Contact, changes : String, e : Exception) {
    var user = getAdminUserForIntegrationHandling()
    if (user != null) {
      createActivity(contact, changes, e, \ a -> {a.assign( user.Organization.RootGroup, user )})
    }
  }


  private function createActivity(contact : Contact, payload : String, e : Exception,
                        assignUserCodeBlock : block(activity : Activity))  {

    var query = Query.make(AccountContact).compare("Contact", Equals, contact).select()
    if (query.Empty) {
      BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error("Could not add/update contact ${contact} to ContactManager with payload ${payload}", e)
      return
    }
    
    for (accountContact in query.iterator()){
      contact.Bundle.add(accountContact)
//    TODO: Figure out if we need this chunk of code
//    if (not contact.UpdateUser.canView(accountContact.Account)) {
//      continue
//    }      
      var activity = accountContact.newActivity()
      assignUserCodeBlock(activity)
      var message = e.Message == null ? e.Class.Name : e.Message
      if (message.length > DataTypes.mediumtext().asPersistentDataType().Length) {
        message = message.substring(0, DataTypes.mediumtext().asPersistentDataType().Length - 1)
      }
      if (contact.AddressBookUID == null) {
        generateActivityMessageTextForFailureToAddNewContact(contact, activity, message)
      } else {
        generateActivityMessageTextForFailureToUpdateExistingContact(contact, activity, message)
      }

      // if we get this far, we've created an activity and can stop
      return
    }
  }


  private function generateActivityMessageTextForFailureToAddNewContact(contact : Contact, activity : Activity, exceptionMessage : String) {
    activity.Subject =  displaykey.Web.ContactManager.Error.FailToAddContact.Subject(contact)
    activity.Description = displaykey.Web.ContactManager.Error.FailToAddContact.Description(exceptionMessage)
  }

  private function generateActivityMessageTextForFailureToUpdateExistingContact(contact : Contact, activity : Activity, exceptionMessage : String) {
    activity.Subject = displaykey.Web.ContactManager.Error.FailToUpdateContact.Subject(contact)
    activity.Description = displaykey.Web.ContactManager.Error.FailToUpdateContact.Description(exceptionMessage)
  }
  
  /**
   * Return the user we would like to assign the activity to if there is a
   * unexpected exception thrown from contact manager. Extract this out
   * so it's easier for customization
   */
  private function getAdminUserForIntegrationHandling() : User {
     return PLDependencies.getUserFinder().findByCredentialName("admin")

  }

  override function resume() { }

  override function setDestinationID(id: int) { }

  override function shutdown() {
    BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error("Contact integration is shutdown")
  }

  override function suspend() {
    BCLoggerCategory.CONTACT_MANAGER_INTEGRATION.error("Contact integration is suspended")
  }

}
