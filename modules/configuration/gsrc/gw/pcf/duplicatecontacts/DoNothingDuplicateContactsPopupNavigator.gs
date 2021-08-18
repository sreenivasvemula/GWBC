package gw.pcf.duplicatecontacts
uses gw.plugin.contact.DuplicateContactResultContainer
uses gw.plugin.contact.DuplicateContactResult

/**
 * Implementation of the DuplicateContactsPopupNavigator interface that does nothing.  This can be useful
 * in situations where a UI page needs to use a screen that wants to be passed a DuplicateContactsPopupNavigator
 * instance, but it is desired to not have any navigation to the DuplicateContactsPopup pcf take place from that screen.
 */
@Export
class DoNothingDuplicateContactsPopupNavigator implements DuplicateContactsPopupNavigator {

  var _contactBeingCreatedThroughUI : Contact
  
  construct(contact : Contact) {
    _contactBeingCreatedThroughUI = contact
  }

  override property get ContactHolderType() : Type {
    return Account
  }
  
  override property get ShowCheckForDuplicatesButton() : boolean {
    return false
  }

  override property get DuplicateResultsContainer() : DuplicateContactResultContainer {
    return null
  }

  override property get ContactBeingCreatedThroughUI() : Contact {
    return _contactBeingCreatedThroughUI
  }

  override function pushFromCurrentLocationToDuplicateContactsPopup() {
  }

  override function checkForDuplicatesOrUpdate(commit()) {
  }

  override function copyDataFromDuplicateABContactToBCContact(duplicateResult : DuplicateContactResult) {
  }

  override function beforeCommitOfContactCreationPage(repointContactJoinEntityAt(contact:Contact):void) {
  }
  
  override function selectedDuplicateContactMatchesContactThatAlreadyExistsOnAccountOrPolicy(selectedDuplicate : DuplicateContactResult) : boolean {
    return false
  }
}
