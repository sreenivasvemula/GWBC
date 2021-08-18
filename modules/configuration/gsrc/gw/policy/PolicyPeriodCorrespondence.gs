package gw.policy;

/**
 * Utility class for setting recipients by {@link PlcyCorrespondenceType}.
 *
 * This class adds an additional layer of indirection between the Correspondence
 * DV and {@link PolicyPeriodContact}, thereby eliminating the need to use the "setter"
 * attribute.
 */
@Export
class PolicyPeriodCorrespondence {

  // ----------- Static Members ----------------

  /**
   * @param policyPeriodContact the {@link PolicyPeriodContact}.
   * @return An array of {@link PolicyPeriodCorrespondence policy period
   *         correspondences}, one per {@link PlcyCorrespondenceType} of
   *         which the specified {@link #policyPeriodContact} may be
   *         recipient.
   */
  public static function getRows(policyPeriodContact : PolicyPeriodContact) : PolicyPeriodCorrespondence[] {
    return PlcyCorrespondenceType.getTypeKeys(false)
        .map(\ t -> new PolicyPeriodCorrespondence(policyPeriodContact, t))
        .toTypedArray()
  }

  // ----------- Instance Members ----------------

  var _policyPeriodContact : PolicyPeriodContact
  var _correspondenceType : PlcyCorrespondenceType as readonly CorrespondenceType

  construct(policyPeriodContact : PolicyPeriodContact, type : PlcyCorrespondenceType) {
    _policyPeriodContact = policyPeriodContact
    _correspondenceType = type
  }

  property get Recipient() : boolean {
    return _policyPeriodContact.isRecipientOfCorrespondence(_correspondenceType)
  }

  property set Recipient(isRecipient : boolean) {
    _policyPeriodContact.setRecipientOfCorrespondence(_correspondenceType, isRecipient)
  }
}