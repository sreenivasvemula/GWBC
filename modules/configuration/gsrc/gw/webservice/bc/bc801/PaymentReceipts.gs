package gw.webservice.bc.bc801
uses gw.webservice.bc.bc801.util.WebservicePreconditions
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.api.web.producer.agencybill.AgencyBillMoneySetupFactory
uses gw.api.web.producer.agencybill.AgencyBillPaymentMoneySetup

@Export
class PaymentReceipts {
  
  /**
   * Returns a PaymentReceiptRecord for the given entity.
   */
  public static function toRecord( entity : PaymentReceipt ) : PaymentReceiptRecord {
    var record = new PaymentReceiptRecord()
    if (entity typeis DirectBillMoneyDetails) {
      
      record.PaymentReceiptType = PaymentReceiptRecord.paymentReceiptType.DIRECTBILLMONEYDETAILS
      record.MonetaryAmount = entity.Amount
      record.Description = entity.Description
      record.PaymentInstrumentRecord =  PaymentInstruments.toRecord(entity.PaymentInstrument)
      record.ReceivedDate = entity.ReceivedDate
      record.RefNumber = entity.RefNumber 
      
      // Customer configuration: populate extension columns from custom properties you added to DirectBillMoneyDetails
      
    } else if (entity typeis SuspensePayment) {
      
      record.PaymentReceiptType = PaymentReceiptRecord.paymentReceiptType.SUSPENSEPAYMENT
      record.PublicID = entity.PublicID
      record.AccountNumber=entity.AccountNumber
      record.PolicyNumber=entity.PolicyNumber
      record.OfferNumber=entity.OfferNumber
      record.MonetaryAmount=entity.Amount
      record.PaymentDate=entity.PaymentDate
      record.PaymentInstrumentRecord =PaymentInstruments.toRecord(entity.PaymentInstrument)
      
      // Customer configuration: populate extension columns from custom properties you added to SuspensePayment
    } else if (entity typeis AgencyBillMoneyRcvd) {
      
      record.PaymentReceiptType = PaymentReceiptRecord.paymentReceiptType.AGENCYBILLMONEYRECEIVED
      record.ProducerID = entity.Producer.PublicID
      record.MonetaryAmount = entity.Amount
      record.PublicID = entity.PublicID
      record.Description = entity.Description
      record.ReceivedDate = entity.ReceivedDate
      record.RefNumber = entity.RefNumber
      record.PaymentInstrumentRecord = PaymentInstruments.toRecord(entity.PaymentInstrument)
      
      // Customer configuration: populate extension columns from custom properties you added to AgencyBillMoneyRcvd
    }
    return record
  }
  
  /**
   * Returns a PaymentReceipt entity for the given record.  Must pass in a writeable bundle, which means
   * this will almost always be called within the context of gw.transaction.Transaction.runWithNewBundle()
   */
  public static function toEntity( record : PaymentReceiptRecord, bundle : gw.pl.persistence.core.Bundle) : PaymentReceipt {
    if (record.PaymentReceiptType == PaymentReceiptRecord.paymentReceiptType.DIRECTBILLMONEYDETAILS) {
      
      var entity = new DirectBillMoneyDetails(bundle)
      entity.Amount = record.MonetaryAmount
      entity.Description = record.Description
      entity.PaymentInstrument =  PaymentInstruments.toEntity(record.PaymentInstrumentRecord)
      entity.ReceivedDate = record.ReceivedDate
      entity.RefNumber = record.RefNumber
      
      // Customer configuration: populate extension columns from custom properties you added to DirectBillMoneyDetails
      
      return entity
    } else  if (record.PaymentReceiptType == PaymentReceiptRecord.paymentReceiptType.SUSPENSEPAYMENT) {
      
      var entity = new SuspensePayment(record.MonetaryAmount.Currency, bundle)
      // The record is not required to provide a publicID but it may.  If the record does not provide a PublicID,
      // one will be generated when the new entity is saved to the database.
      entity.PublicID = record.PublicID
      entity.AccountNumber = record.AccountNumber
      entity.PolicyNumber = record.PolicyNumber
      entity.OfferNumber = record.OfferNumber
      entity.Amount = record.MonetaryAmount
      entity.PaymentDate = record.PaymentDate
      entity.PaymentInstrument = PaymentInstruments.toEntity(record.PaymentInstrumentRecord)
      
      // Customer configuration: populate extension columns from custom properties you added to SuspensePayment

      return entity  
    } else if (record.PaymentReceiptType == PaymentReceiptRecord.paymentReceiptType.AGENCYBILLMONEYRECEIVED) {
  
      var moneySetup = createAgencyBillPaymentMoneySetup(record, bundle)

      // Customer configuration: populate extension columns from custom properties you added to AgencyBillMoneyRcvd
      return moneySetup.Money
    }
    throw "Unknown payment receipt type ${record.PaymentReceiptType}"
  }
  
  /**
   * Returns an AgencyBillMoneyReceivedSetup for the given record.  Only valid if the record is of PaymentReceiptType AgencyBillMoneyReceived.
   */
  private static function createAgencyBillPaymentMoneySetup(record : PaymentReceiptRecord, bundle : gw.pl.persistence.core.Bundle) : AgencyBillPaymentMoneySetup {
    WebservicePreconditions.checkArgument(record.PaymentReceiptType 
          == PaymentReceiptRecord.paymentReceiptType.AGENCYBILLMONEYRECEIVED, 
              displaykey.PaymentAPI.Error.InvalidRecordForAgencyMoney)
    
    var producer = WebserviceEntityLoader.loadProducer(record.ProducerID)
      
    var moneySetup = AgencyBillMoneySetupFactory.createNewPaymentMoney(producer, bundle)
    var entity = moneySetup.Money
    // The record is not required to provide a publicID but it may.  If the record does not provide a PublicID,
    // one will be generated when the new entity is saved to the database.
    entity.Amount = record.MonetaryAmount
    entity.Description = record.Description
    entity.ReceivedDate = record.ReceivedDate
    entity.RefNumber = record.RefNumber
    entity.PaymentInstrument = PaymentInstruments.toEntity(record.PaymentInstrumentRecord)
      
    return moneySetup
    
  }
  
}
