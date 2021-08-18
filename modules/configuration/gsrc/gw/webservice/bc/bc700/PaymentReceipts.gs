package gw.webservice.bc.bc700
uses gw.api.financials.CurrencyAmount
uses gw.pl.currency.MonetaryAmount

@Export
class PaymentReceipts {
  
  /**
   * Returns a PaymentReceiptRecord for the given entity.
   */
  public static function toRecord( entity : PaymentReceipt ) : PaymentReceiptRecord {
    var record = new PaymentReceiptRecord()
    if (entity typeis DirectBillMoneyDetails) {
      
      record.PaymentReceiptType = PaymentReceiptRecord.paymentReceiptType.DIRECTBILLMONEYDETAILS
      record.CurrencyAmount = new CurrencyAmount(entity.Amount.Amount, entity.Amount.Currency)
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
      record.CurrencyAmount = new CurrencyAmount(entity.Amount.Amount, entity.Amount.Currency)
      record.PaymentDate=entity.PaymentDate
      record.PaymentInstrumentRecord = PaymentInstruments.toRecord(entity.PaymentInstrument)
      
      // Customer configuration: populate extension columns from custom properties you added to SuspensePayment
    }
    return record
  }
  
  /**
   * Returns a PaymentReceipt entity for the given record.
   */
  public static function toEntity( record : PaymentReceiptRecord ) : PaymentReceipt {
    if (record.PaymentReceiptType == PaymentReceiptRecord.paymentReceiptType.DIRECTBILLMONEYDETAILS) {
      
      var entity = new DirectBillMoneyDetails()
      entity.Amount = new MonetaryAmount(record.CurrencyAmount.Amount, record.CurrencyAmount.Currency)
      entity.Description = record.Description
      entity.PaymentInstrument =  PaymentInstruments.toEntity(record.PaymentInstrumentRecord)
      entity.ReceivedDate = record.ReceivedDate
      entity.RefNumber = record.RefNumber
      
      // Customer configuration: populate extension columns from custom properties you added to DirectBillMoneyDetails
      
      return entity
    } else  if (record.PaymentReceiptType == PaymentReceiptRecord.paymentReceiptType.SUSPENSEPAYMENT) {
      
      var entity = new SuspensePayment(record.CurrencyAmount.Currency)
      // The record is not required to provide a publicID but it may.  If the record does not provide a PublicID,
      // one will be generated when the new entity is saved to the database.
      entity.PublicID = record.PublicID
      entity.AccountNumber=record.AccountNumber
      entity.PolicyNumber=record.PolicyNumber
      entity.OfferNumber=record.OfferNumber
      entity.Amount = new MonetaryAmount(record.CurrencyAmount.Amount, record.CurrencyAmount.Currency)
      entity.PaymentDate=record.PaymentDate
      entity.PaymentInstrument = PaymentInstruments.toEntity(record.PaymentInstrumentRecord)

      // Customer configuration: populate extension columns from custom properties you added to SuspensePayment

      return entity  
    }
    throw "Unknown payment receipt type ${record.PaymentReceiptType}"
  }
  
}
