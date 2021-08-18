package gw.webservice.bc.bc801

uses gw.pl.currency.MonetaryAmount
uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.Invoice} for use by the WS-I layer.
 * <p>The specific mappings for {@link InvoiceDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>AdHoc</td><td>Invoice.AdHoc</td></tr><tr><td>Amount</td><td>Invoice.Amount</td></tr><tr><td>AmountDue</td><td>Invoice.AmountDue</td></tr><tr><td>Description</td><td>Invoice.Description</td></tr><tr><td>EventDate</td><td>Invoice.EventDate</td></tr><tr><td>InvoiceNumber</td><td>Invoice.InvoiceNumber</td></tr><tr><td>InvoiceStreamName</td><td>Invoice.InvoiceStream.DisplayName</td></tr><tr><td>PaymentDueDate</td><td>Invoice.PaymentDueDate</td></tr><tr><td>PublicID</td><td>Invoice.PublicID</td></tr><tr><td>Status</td><td>Invoice.Status</td></tr></table></p>
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the Invoice entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/InvoiceDTO")
final class InvoiceDTO {
  var _adHoc                  : Boolean                 as AdHoc
  var _amount                 : MonetaryAmount          as Amount
  var _amountDue              : MonetaryAmount          as AmountDue
  var _description            : String                  as Description
  var _eventDate              : Date                    as EventDate
  var _invoiceNumber          : String                  as InvoiceNumber
  var _invoiceStreamName      : String                  as InvoiceStreamName
  var _paymentDueDate         : Date                    as PaymentDueDate
  var _publicID               : String                  as PublicID
  var _status                 : typekey.InvoiceStatus   as Status

  /**
   * Answer a new InvoiceDTO that represents the current state of the supplied Invoice.
   * @param that The Invoice to be represented.
   */
  static function valueOf(that : Invoice) : InvoiceDTO {
    return new InvoiceDTO().readFrom(that)
  }

  construct() { }

  /**
   * Copies the platform-managed fields from the supplied Invoice
   * @param that The Invoice to copy from.
   */
  protected function _copyReadOnlyFieldsFrom(that : Invoice) {
    // if field is on base class
      _amount            = that.Amount
      _amountDue         = that.AmountDue
      _invoiceStreamName = that.InvoiceStream.DisplayName
      _status            = that.Status
    //
  }

  /**
   * Set the fields in this DTO using the supplied Invoice
   * @param that The Invoice to copy from.
   */
  final function readFrom(that : Invoice) : InvoiceDTO {
    _copyReadOnlyFieldsFrom(that)

    // if field is on base class
      AdHoc           = that.AdHoc
      Description     = that.Description
      EventDate       = that.EventDate
      InvoiceNumber   = that.InvoiceNumber
      PaymentDueDate  = that.PaymentDueDate
      PublicID        = that.PublicID
    //
    return this
  }


}