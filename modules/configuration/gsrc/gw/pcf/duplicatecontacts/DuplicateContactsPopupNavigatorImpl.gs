package gw.pcf.duplicatecontacts

uses gw.api.util.DisplayableException
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.DuplicateContactResultContainer
uses pcf.DuplicateContactsPopup
uses gw.plugin.Plugins
uses gw.plugin.contact.DuplicateContactResult
uses gw.api.database.Query
uses gw.api.contact.ContactCopier

@Export
class DuplicateContactsPopupNavigatorImpl implements DuplicateContactsPopupNavigator {
  var _contactBeingCreatedThroughUI: Contact
  private var _contactSystemPlugin = Plugins.get(ContactSystemPlugin)
  var _duplicateResultsContainer: DuplicateContactResultContainer
  var _contactInBCDatabaseThatMatchesDuplicateContactResult: Contact as ContactInBCDatabaseThatMatchesDuplicateContactResult
  private var _contactsAlreadyOnTheAccountOrPolicy: Contact[]
  private var _haveAlreadyCheckedForDuplicates = false
  private var _contactHolderType: Type
  /**
   * @param contact the new contact being created through the UI on the Create Account Contact or Create Policy Contact page
   * @param contactsAlreadyOnTheAccountOrPolicy array of Contacts that are already on the Account (if we're dealing 
   *                                            with the Create Account Contact page) or the Policy (if we're dealing with
   *                                            the Create Policy Contact page)
   * @param typeOfEntityHoldingTheNewContact the type of entity (either Account or Policy) on which the contact is being created 
   */
  construct(contact: Contact, contactsAlreadyOnTheAccountOrPolicy: Contact[], typeOfEntityHoldingTheNewContact: Type) {
    _contactBeingCreatedThroughUI = contact
    _contactsAlreadyOnTheAccountOrPolicy = contactsAlreadyOnTheAccountOrPolicy
    _contactHolderType = typeOfEntityHoldingTheNewContact
  }

  override property get ContactHolderType(): Type {
    return _contactHolderType
  }

  override property get DuplicateResultsContainer(): DuplicateContactResultContainer {
    return _duplicateResultsContainer
  }

  override property get ContactBeingCreatedThroughUI(): Contact {
    return _contactBeingCreatedThroughUI
  }

  override function pushFromCurrentLocationToDuplicateContactsPopup() {
    _haveAlreadyCheckedForDuplicates = true
    validate()
    DuplicateContactsPopup.push(this)
  }

  override function checkForDuplicatesOrUpdate(commit()) {
    if (not _haveAlreadyCheckedForDuplicates and hasDuplicateResults()) {
      pushFromCurrentLocationToDuplicateContactsPopup()
      return
    }
    commit()
  }

  private function hasDuplicateResults(): boolean {
    try {
      _duplicateResultsContainer = ContactBeingCreatedThroughUI.getPotentialDuplicates()
    } catch (rfe: wsi.remote.gw.webservice.ab.ab700.abcontactapi.faults.RequiredFieldException) {
      // in this case, we are trying to commit the contact, but don't have enough info to check dupes - allow the user to commit anyway
      return false
    } catch (rfe: wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.RequiredFieldException) {
      // in this case, we are trying to commit the contact, but don't have enough info to check dupes - allow the user to commit anyway
      return false
    } catch (rfe: gw.api.webservice.exception.RequiredFieldException) {
      // in this case, we are trying to commit the contact, but don't have enough info to check dupes - allow the user to commit anyway
      return false
    }
    return _duplicateResultsContainer.Results.HasElements
  }

  override property get ShowCheckForDuplicatesButton(): boolean {
    return _contactSystemPlugin.supportsFindingDuplicates() and ContactBeingCreatedThroughUI.AddressBookUID == null
  }

  private function validate() {
    try {
      _duplicateResultsContainer = ContactBeingCreatedThroughUI.getPotentialDuplicates()
    } catch (rfe: wsi.remote.gw.webservice.ab.ab700.abcontactapi.faults.RequiredFieldException) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.MissingRequiredFields(rfe.Message))
    } catch (rfe: wsi.remote.gw.webservice.ab.ab801.abcontactapi.faults.RequiredFieldException) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.MissingRequiredFields(rfe.Message))
    } catch (rfe: gw.api.webservice.exception.RequiredFieldException) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.MissingRequiredFields(rfe.Message))
    }
    if (_duplicateResultsContainer.Results.Empty) {
      throw new DisplayableException(displaykey.Web.Contact.CheckForDuplicates.Error.NoResults)
    }
  }

  override function copyDataFromDuplicateABContactToBCContact(duplicateResult: DuplicateContactResult) {
    _contactInBCDatabaseThatMatchesDuplicateContactResult = findContactInBCDatabaseWithSameABUIDAs(duplicateResult)
    duplicateResult.overwriteContactFields(ContactBeingCreatedThroughUI)
  }

  override function selectedDuplicateContactMatchesContactThatAlreadyExistsOnAccountOrPolicy(selectedDuplicate: DuplicateContactResult): boolean {
    return _contactsAlreadyOnTheAccountOrPolicy.hasMatch(\c -> {
      return c.AddressBookUID == selectedDuplicate.ContactAddressBookUID
    })
  }

  private function findContactInBCDatabaseWithSameABUIDAs(duplicateResult: DuplicateContactResult): Contact {
    return Query.make(Contact).compare("AddressBookUID", Equals, duplicateResult.ContactAddressBookUID).select().AtMostOneRow
  }

  override function beforeCommitOfContactCreationPage(repointContactJoinEntityAt(contact: Contact)) {
    if (ContactInBCDatabaseThatMatchesDuplicateContactResult != null) {
      copyInformationToContactAlreadyInBCDatabaseFromContactBeingCreatedThroughUI()
      discardContactBeingCreatedThroughUI()
      repointContactJoinEntityAt(ContactInBCDatabaseThatMatchesDuplicateContactResult)
    }
  }

  private function discardContactBeingCreatedThroughUI() {
    if (ContactBeingCreatedThroughUI.PrimaryAddress != null) {
      ContactBeingCreatedThroughUI.PrimaryAddress.remove()
    }
    for (officialID in ContactBeingCreatedThroughUI.OfficialIDs) {
      officialID.remove()
    }
    ContactBeingCreatedThroughUI.remove()
  }

  private function copyInformationToContactAlreadyInBCDatabaseFromContactBeingCreatedThroughUI() {
    var activeBundle = ContactBeingCreatedThroughUI.Bundle
    var query = new Query <Contact>(Contact)
    query.compare("PublicID", Equals, ContactInBCDatabaseThatMatchesDuplicateContactResult.PublicID)
    _contactInBCDatabaseThatMatchesDuplicateContactResult = activeBundle.add(query.select().getAtMostOneRow())
    new ContactCopier(ContactBeingCreatedThroughUI).copyInto(ContactInBCDatabaseThatMatchesDuplicateContactResult)
  }
}
