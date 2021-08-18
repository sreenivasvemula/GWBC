package gw.api.name

uses java.util.Set

/**
 * For use with the Name PCFs and NameFormatter for both Person and non-Person contacts.
 */
@Export
class BCNameOwner extends NameOwnerBase {

  construct (fields : ContactNameFields) {
    ContactName = fields
  }

  construct (contact : entity.Contact) {
    if (contact.Subtype == typekey.Contact.TC_PERSON) {
      ContactName = new PersonNameDelegate(contact as Person)
    } else {
      ContactName = new ContactNameDelegate(contact)
    }
  }

  public static final var BC_REQUIRED_NAME_FIELDS : Set<NameOwnerFieldId> =
    NameOwnerFieldId.REQUIRED_NAME_FIELDS.union(NameOwnerFieldId.FIRST_LAST_FIELDS).freeze()

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return BC_REQUIRED_NAME_FIELDS
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return NameOwnerFieldId.NO_FIELDS
  }

}
