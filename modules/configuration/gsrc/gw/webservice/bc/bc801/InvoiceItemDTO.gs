package gw.webservice.bc.bc801

uses gw.pl.currency.MonetaryAmount
uses gw.xml.ws.annotation.WsiExportable

uses java.lang.Integer
uses java.util.Date

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.InvoiceItem} for use by the WS-I layer.
 * <p>The specific mappings for {@link InvoiceItemDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>Amount</td><td>InvoiceItem.Amount</td></tr><tr><td>ChargePublicID</td><td>InvoiceItem.Charge.PublicID</td></tr><tr><td>Comments</td><td>InvoiceItem.Comments</td></tr><tr><td>Description</td><td>InvoiceItem.Description</td></tr><tr><td>EventDate</td><td>InvoiceItem.EventDate</td></tr><tr><td>GrossAmountWrittenOff</td><td>InvoiceItem.GrossAmountWrittenOff</td></tr><tr><td>GrossSettled</td><td>InvoiceItem.GrossSettled</td></tr><tr><td>InstallmentNumber</td><td>InvoiceItem.InstallmentNumber</td></tr><tr><td>InvoicePublicID</td><td>InvoiceItem.Invoice.PublicID</td></tr><tr><td>PaidAmount</td><td>InvoiceItem.PaidAmount</td></tr><tr><td>PolicyPeriodPublicID</td><td>InvoiceItem.PolicyPeriod.PublicID</td></tr><tr><td>PublicID</td><td>InvoiceItem.PublicID</td></tr><tr><td>Type</td><td>InvoiceItem.Type</td></tr></table></p>
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the InvoiceItem entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/InvoiceItemDTO")
final class InvoiceItemDTO {
  var _amount                : MonetaryAmount                as Amount
  var _chargePublicID        : String                        as ChargePublicID
  var _comments              : String                        as Comments
  var _description           : String                        as Description
  var _eventDate             : Date                          as EventDate
  var _grossAmountWrittenOff : MonetaryAmount                as GrossAmountWrittenOff
  var _grossSettled          : Boolean                       as GrossSettled
  var _installmentNumber     : Integer                       as InstallmentNumber
  var _invoicePublicID       : String                        as InvoicePublicID
  var _ownerPublicID         : String                        as OwnerPublicID
  var _paidAmount            : MonetaryAmount                as PaidAmount
  var _policyPeriodPublicID  : String                        as PolicyPeriodPublicID
  var _publicID              : String                        as PublicID
  var _type                  : typekey.InvoiceItemType       as Type
  /**
   * Answer a new InvoiceItemDTO that represents the current state of the supplied InvoiceItem.
   * @param that The InvoiceItem to be represented.
   */
  static function valueOf(that : InvoiceItem) : InvoiceItemDTO {
    return new InvoiceItemDTO().readFrom(that)
  }

  construct() { }

  /**
   * Copies the platform-managed fields from the supplied InvoiceItem
   * @param that The InvoiceItem to copy from.
   */
  protected function _copyReadOnlyFieldsFrom(that : InvoiceItem) {
      _amount                = that.Amount
      _chargePublicID        = that.Charge.PublicID
      _grossAmountWrittenOff = that.GrossAmountWrittenOff
      _grossSettled          = that.GrossSettled
      _paidAmount            = that.PaidAmount
      _policyPeriodPublicID  = that.PolicyPeriod.PublicID
      _type                  = that.Type
      _ownerPublicID         = that.Owner.PublicID
  }

  /**
   * Set the fields in this DTO using the supplied InvoiceItem
   * @param that The InvoiceItem to copy from.
   */
  final function readFrom(that : InvoiceItem) : InvoiceItemDTO {
    _copyReadOnlyFieldsFrom(that)
      Comments              = that.Comments
      Description           = that.Description
      EventDate             = that.EventDate
      InstallmentNumber     = that.InstallmentNumber
      InvoicePublicID       = that.Invoice.PublicID
      PublicID              = that.PublicID
    return this
  }
}