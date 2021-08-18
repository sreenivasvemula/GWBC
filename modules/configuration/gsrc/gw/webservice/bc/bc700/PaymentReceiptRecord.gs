package gw.webservice.bc.bc700

uses gw.xml.ws.annotation.WsiExportable
uses gw.api.financials.CurrencyAmount


/**
 * A PaymentReceiptRecord is a data transfer object POGO for passing the details of a PaymentReceipt
 * to and from a web service.  When the record is used to pass the details of a new PaymentReceipt to a
 * web service, the PublicID may be be null.
 *
 * Customer configuration: modify this to add a variable for each extension column you added to PaymentReceipt or
 * to any entity that implements PaymentReceipt
 * 
 */
@WsiExportable ("http://guidewire.com/bc/ws/gw/webservice/bc/bc700/PaymentReceiptRecord")
@Export
final class PaymentReceiptRecord {
  
   /////////////////// polymorphism  workaround //////////////////
  //it is necessary to use a type discriminator approach since an exportable class cannot extend another class, nor can it be extended
  
  static enum paymentReceiptType {
    ANONYMOUS,    // equivalent to the following in Java: new PaymentReceipt() {}
    DIRECTBILLMONEYDETAILS,
    SUSPENSEPAYMENT
  }

  private var _paymentReceiptType : paymentReceiptType as PaymentReceiptType

  /////////////////// fields in PaymentReceipt base class //////////////////
  
  private var _currencyAmount : CurrencyAmount as CurrencyAmount
  
  private var _paymentInstrumentRecord : PaymentInstrumentRecord as PaymentInstrumentRecord
  
  // The PublicID may be null if the PaymentReceipt does not yet exist.
  private var _publicID : String as PublicID
  
  private var _refNumber : String as RefNumber
  
  /////////////////// DirectBillMoneyDetails //////////////////
    
  private var _description : String as Description
  
  //The date that funds were physically received (e.g., the date the check arrived in the mail).
  private var _receivedDate : DateTime as ReceivedDate 
  
  /////////////////// SuspensePayment ///////////////////////
  
  //The account to apply the payment to
  private var _accountNumber : String as AccountNumber
   
  private var _offerNumber : String as OfferNumber
   
  private var _offerOption : String as OfferOption
   
  //The date of the payment
  private var _paymentDate : DateTime as PaymentDate
   
  //The policy to apply the payment to
  private var _policyNumber : String as PolicyNumber
  

}
