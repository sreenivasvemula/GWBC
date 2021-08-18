package gw.webservice.bc.bc801

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.webservice.exception.DataConversionException

@Export
class PaymentInstruments {

  static function toRecord(instrument : PaymentInstrument) : PaymentInstrumentRecord {
    return new PaymentInstrumentRecord() {
        : PublicID = instrument.PublicID,
        : DisplayName = instrument.DisplayName,
        : PaymentMethod = instrument.PaymentMethod,
        : Token = instrument.Token
    
        // Customer configuration: populate custom properties in the record from
        // extension columns you added to PaymentInstrument
    }
  }

  /**
   * Returns a PaymentInstrument entity for the given PaymentInstrumentRecord.
   * If a PaymentInstrument with the PaymentInstrumentRecord's PublicID exists, it is returned.
   * If no PaymentInstrument with the PaymentInstrumentRecord's PublicID exists, a new PaymentInstrument is created using information from the PaymentInstrumentRecord.
   */
  static function toEntity( record : PaymentInstrumentRecord ) : PaymentInstrument {
    var paymentInstrument : PaymentInstrument
    
    if (record.PublicID != null) {
      paymentInstrument = makeIdentifiedInstrumentLookupResult(record.PublicID).AtMostOneRow
    }
    
    if (paymentInstrument == null) { 
      paymentInstrument= new PaymentInstrument() {
          : PaymentMethod = record.PaymentMethod,
          : Token = record.Token,

          // The record is not required to provide a publicID but it may.  If
          // the record does not provide a PublicID, one will be generated when
          // the new paymentInstrument is saved to the database.
          : PublicID = record.PublicID
      }
    }
    
    // Customer configuration: populate extension columns in the new payment instrument from custom properties you added to PaymentInstrumentRecord

    return paymentInstrument
  }

  /**
   * Validates a {@link PaymentInstrumentRecord} for creation.
   *
   * {@code OneTime} {@link PaymentInstrument}s are not allowed. Also, if the
   * {@code PublicID} is specified, a corresponding instrument must not exist.
   *
   * @param paymentInstrumentRecord the record that describes the
   *                                {@link PaymentInstrument} to be created
   */
  static function validateForCreation(paymentInstrumentRecord : PaymentInstrumentRecord) {
    if (paymentInstrumentRecord.OneTime) {
      throw new DataConversionException(
          displaykey.PaymentInstrument.API.CannotAddOneTimePaymentInstrumentToAccountOrProducer)
    }
    // If PublicID is null then this is a new PaymentInstrument and we are OK else...
    if (paymentInstrumentRecord.PublicID != null) {
      // check that instrument with PublicID does not exist...
      final var results = makeIdentifiedInstrumentLookupResult(paymentInstrumentRecord.PublicID)
      if (!results.Empty) {
        // If the PaymentInstrument for this PaymentInstrumentRecord already exists, we have a problem
        throw new DataConversionException(
            displaykey.PaymentInstrument.API.CannotCreateAlreadyExistingInstrument)
      }
    }
  }

  private static function makeIdentifiedInstrumentLookupResult(publicID: String)
      : IQueryBeanResult<PaymentInstrument> {
    return Query.make(PaymentInstrument)
        .compare("PublicID", Equals, publicID)
        .select()
  }
}
