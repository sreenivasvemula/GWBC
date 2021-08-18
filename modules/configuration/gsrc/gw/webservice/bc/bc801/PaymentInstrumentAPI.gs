package gw.webservice.bc.bc801

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.SOAPServerException
uses gw.xml.ws.annotation.WsiWebService
uses gw.transaction.Transaction
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/PaymentInstrumentAPI")
@Export
class PaymentInstrumentAPI {

  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(DataConversionException, "If the accountNumber is null.")
  @Throws(BadIdentifierException, "If there are no Accounts with the given accountNumber.")
  function getPaymentInstrumentsForAccount( accountNumber: String ) : PaymentInstrumentRecord[] {
    var account = WebserviceEntityLoader.loadAccountByAccountNumber( accountNumber )
    return account.PaymentInstruments.map( \ instrument -> PaymentInstruments.toRecord( instrument )) as PaymentInstrumentRecord[]
  }

  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(BadIdentifierException, "If there are no Accounts with the given accountNumber.")
  @Throws(DataConversionException, "If the accountNumber is null.")
  @Throws(DataConversionException, "If paymentInstrumentRecord.PublicId is not null (The PaymentInstrument already exists in the system)")
  @Throws(DataConversionException, "If paymentInstrumentRecord.OneTime is true")
  function createPaymentInstrumentOnAccount( accountNumber : String, paymentInstrumentRecord : PaymentInstrumentRecord ) : PaymentInstrumentRecord {
    PaymentInstruments.validateForCreation(paymentInstrumentRecord)

    var newInstrument : PaymentInstrument
    Transaction.runWithNewBundle( \ bundle -> {
      var account = WebserviceEntityLoader.loadAccountByAccountNumber( accountNumber )
      newInstrument = PaymentInstruments.toEntity( paymentInstrumentRecord )
      newInstrument.Account = account
    })
    return PaymentInstruments.toRecord( newInstrument )
  }
  
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(DataConversionException, "If the producerID is null.")
  @Throws(BadIdentifierException, "If there are no Producers with the given producerID.")
  function getPaymentInstrumentsForProducer( producerID: String ) : PaymentInstrumentRecord[] {
    var producer = WebserviceEntityLoader.loadProducer( producerID )
    return producer.PaymentInstruments.map( \ instrument -> PaymentInstruments.toRecord( instrument )) as PaymentInstrumentRecord[]
  }

  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(BadIdentifierException, "If there are no Producers with the given producerID.")
  @Throws(DataConversionException, "If the producerID is null.")
  @Throws(DataConversionException, "If paymentInstrumentRecord.PublicId is not null (the PaymentInstrument already exists in the system))")
  @Throws(DataConversionException, "If paymentInstrumentRecord.OneTime is true")
  function createPaymentInstrumentOnProducer( producerID : String, paymentInstrumentRecord : PaymentInstrumentRecord ): PaymentInstrumentRecord { 
    PaymentInstruments.validateForCreation(paymentInstrumentRecord)
    
    var newInstrument : PaymentInstrument
    Transaction.runWithNewBundle( \ bundle -> {
      var producer = WebserviceEntityLoader.loadProducer( producerID )
      newInstrument = PaymentInstruments.toEntity( paymentInstrumentRecord )
      newInstrument.Producer = producer
    })
    return PaymentInstruments.toRecord( newInstrument )
  }
}
