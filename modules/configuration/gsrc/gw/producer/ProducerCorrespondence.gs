package gw.producer;

/**
 * Gosu class for setting recipients by ProdCorrespondenceType from the UI. This class adds an additional layer of indirection
 * between the Correspondence DV and the ProducerContact entity, thereby eliminating the need to use the "setter" attribute.
 **/
@Export
class ProducerCorrespondence {

  // ----------- Static Members ----------------

  /**
   * Returns a list of rows, one per ProdCorrespondenceType of which the ProducerContact may be recipient.
   **/
  public static function getRows(producerContact : ProducerContact) : ProducerCorrespondence[] {
    var results = new java.util.ArrayList();
    for (t in ProdCorrespondenceType.getTypeKeys(false)) {
      results.add(new ProducerCorrespondence(producerContact, t));
    }
    return results as ProducerCorrespondence[];
  }

  // ----------- Instance Members ----------------

  var _producerContact : ProducerContact;
  var _correspondenceType : ProdCorrespondenceType;

  construct(producerContact : ProducerContact, type : ProdCorrespondenceType) {
    _producerContact = producerContact;
    _correspondenceType = type;
  }

  public property get CorrespondenceType() : ProdCorrespondenceType {
    return _correspondenceType;
  }

  public property get Recipient() : Boolean {
    return _producerContact.isRecipientOfCorrespondence(_correspondenceType);
  }

  public property set Recipient(isRecipient : Boolean) {
    _producerContact.setRecipientOfCorrespondence( _correspondenceType, isRecipient );
  }
}