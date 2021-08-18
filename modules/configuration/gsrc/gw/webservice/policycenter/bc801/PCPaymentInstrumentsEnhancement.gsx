package gw.webservice.policycenter.bc801
uses gw.webservice.bc.bc801.PaymentInstruments
uses gw.webservice.bc.bc801.PaymentInstrumentRecord

@Export
enhancement PCPaymentInstrumentsEnhancement : PaymentInstruments {
  
  public static function toPCRecord(instrument : PaymentInstrument) : PaymentInstrumentRecord {
    var record = PaymentInstruments.toRecord(instrument)
    if (instrument.PaymentMethod == TC_Responsive) {
      record.DisplayName = displaykey.PaymentInstrument.API.Responsive.PCDisplayName      
    }
    return record
  }
  
  
}
