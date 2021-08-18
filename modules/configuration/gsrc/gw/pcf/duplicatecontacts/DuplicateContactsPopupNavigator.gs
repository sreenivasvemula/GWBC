package gw.pcf.duplicatecontacts
uses gw.plugin.contact.DuplicateContactResult
uses gw.plugin.contact.DuplicateContactResultContainer

/**
 * Interface for any class that navigates between any contact creation page (e.g. NewAccountPopup.pcf) and 
 * and the DuplicateContactsPopup pcf page.
 */
 @Export
interface DuplicateContactsPopupNavigator {
  
  /**
   * @return the type of the entity that the new contact is being created on (the so-called "ContactHolder" that will hold
   *         the newly created contact).  This will either be an Account or a PolicyPeriod.
   */
  property get ContactHolderType() : Type
  
  /**
   * @return true if the CheckForDuplicates button should be visible on contact creation pages (e.g. NewAccountPopup.pcf)
   */
  property get ShowCheckForDuplicatesButton() : boolean
  
  /**
   * @return DuplicateResultsContainer that contains any duplicate contact results returned from ContactManager
   *         as the result of doing a check for duplicates
   */
  property get DuplicateResultsContainer() : DuplicateContactResultContainer
  
  /**
   * @return new Contact that the user is in the process of creating on a contact creation page (e.g. NewAccountPopup.pcf)
   */
  property get ContactBeingCreatedThroughUI() : Contact

  /**
   * Navigate from a content creation page (e.g. NewAccountPopup.pcf) to the DuplicateContactsPopup page
   */
  function pushFromCurrentLocationToDuplicateContactsPopup()
  
  /**
   * This method is bound to an update button on a contact creation page (such as NewAccountPopup.pcf).  If
   * a CheckForDuplicates has already been done from the contact creation page (for example, user has already
   * clicked the CheckForDuplicates button), then this method will simply do an Update/Commit of the contact
   * creation page.  If a CheckForDuplicates has NOT ever been done from the content creation page, then this method
   * will force a CheckForDuplicates.  If no duplicates come up, this method will simply do an Update/Commit. But
   * if duplicates are returned from ContactManager, then this method will navigate the user to the
   * DuplicateContactsPopup page where the returned duplicates will be displayed.
   */
  function checkForDuplicatesOrUpdate(commit())

  /**
   * Copies information from a duplicate contact returned from ContactManager into a BillingCenter contact.
   * Called when the user clicks the Select button next to a DuplicateContactResult on the DuplicateContactsPopup page
   */
  function copyDataFromDuplicateABContactToBCContact(duplicateResult : DuplicateContactResult )

  /**
   * Called from the beforeCommit page attribute of the contact creation page (e.g. NewAccountPopup.pcf).
   * Performs any operations necessary dealing with duplicate contact functionality when the contact creation page is committed.
   * 
   * @param repointContactJoinEntityAt() method passed in from the contact creation page that MAY be used inside this method
   *        to repoint a contact join entity (such as an AccountContact) so that instead of pointing at the contact that was 
   *        being created in the UI it will point at a contact which already existed in the BillingCenter database.
   */
  function beforeCommitOfContactCreationPage(repointContactJoinEntityAt(contact:Contact))

  /**
   * @return true if the duplicate contact result selected by the user matches a contact that already exists on the Account
   *         or Policy (meaning the user is accidentally trying to add a contact to the account or policy which is actually
   *         already there)
   */
  function selectedDuplicateContactMatchesContactThatAlreadyExistsOnAccountOrPolicy(selectedDuplicate : DuplicateContactResult) : boolean

}
