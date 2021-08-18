package gw.account;

/**
 * Utility class for setting recipients by {@link AcctCorrespondenceType}.
 *
 * This class adds an additional layer of indirection between the Correspondence
 * DV and {@link AccountContact}, thereby eliminating the need to use the "setter"
 * attribute.
 */
@Export
class AccountCorrespondence {

  // ----------- Static Members ----------------

  /**
   * @param accountContact the {@link AccountContact}.
   * @return An array of {@link AccountCorrespondence account correspondences},
   *         one per {@link AcctCorrespondenceType} of which the specified
   *         {@link #accountContact} may be recipient.
   */
  static function getRows(accountContact : AccountContact) : AccountCorrespondence[] {
    return AcctCorrespondenceType.getTypeKeys(false)
        .map(\ t -> new AccountCorrespondence(accountContact, t))
        .toTypedArray()
  }

  // ----------- Instance Members ----------------

  var _accountContact : AccountContact
  var _correspondenceType : AcctCorrespondenceType as readonly CorrespondenceType

  construct(accountContact : AccountContact, type : AcctCorrespondenceType) {
    _accountContact = accountContact
    _correspondenceType = type
  }

  property get Recipient() : boolean {
    return _accountContact.isRecipientOfCorrespondence(_correspondenceType)
  }

  property set Recipient(isRecipient : boolean) {
    _accountContact.setRecipientOfCorrespondence(_correspondenceType, isRecipient)
  }
}