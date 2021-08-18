package gw.webservice.bc.bc700
uses gw.api.web.payment.PaymentInstrumentFactory

@Export
class PaymentInstruments {

  public static function toRecord( instrument : PaymentInstrument ) : PaymentInstrumentRecord {
    var record = new PaymentInstrumentRecord()
    record.PublicID = instrument.PublicID
    record.DisplayName = instrument.DisplayName
    record.PaymentMethod = instrument.PaymentMethod
    record.Token = instrument.Token
    
    // Customer configuration: populate custom properties in the record from extension columns you added to PaymentInstrument
    
    return record
  }

  /**
   * Returns a PaymentInstrument entity for the given PaymentInstrumentRecord.
   * If a PaymentInstrument with the PaymentInstrumentRecord's PublicID exists, it is returned.
   * If no PaymentInstrument with the PaymentInstrumentRecord's PublicID exists, a new PaymentInstrument is created using information from the PaymentInstrumentRecord.
   */
  public static function toEntity( record : PaymentInstrumentRecord ) : PaymentInstrument {
    var paymentInstrument : PaymentInstrument
    
    if (record.PublicID != null) {
      paymentInstrument=gw.api.database.Query.make(entity.PaymentInstrument).compare("PublicID", Equals, record.PublicID).select().getAtMostOneRow()
    }
    
    if (paymentInstrument == null) { 
      paymentInstrument= new PaymentInstrument()
      paymentInstrument.PaymentMethod = record.PaymentMethod
      paymentInstrument.Token = record.Token

      // The record is not required to provide a publicID but it may.  If the record does not provide a PublicID,
      // one will be generated when the new paymentInstrument is saved to the database.
      paymentInstrument.PublicID = record.PublicID
    }
    
    // Customer configuration: populate extension columns in the new payment instrument from custom properties you added to PaymentInstrumentRecord

    return paymentInstrument
  }
}
