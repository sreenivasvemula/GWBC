package gw.webservice.policycenter.bc700
uses gw.webservice.bc.bc700.PaymentInstruments
uses gw.webservice.bc.bc700.PaymentInstrumentRecord

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
