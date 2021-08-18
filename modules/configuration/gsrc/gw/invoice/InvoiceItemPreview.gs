package gw.invoice

uses java.math.BigDecimal
uses java.util.Date

/**
 * @deprecated (Since 8.0.0) Restricted to bc700 and earlier interfaces only; do not use outside of those packages!
 */
@gw.xml.ws.annotation.WsiExportable("http://guidewire.com/bc/ws/gw/invoice/InvoiceItemPreview")
@java.lang.Deprecated
@Export
final class InvoiceItemPreview {
  private var _invoiceDate: DateTime as InvoiceDate;
  private var _invoiceDueDate: DateTime as InvoiceDueDate;
  private var _chargeName: String as ChargeName;
  private var _amount: BigDecimal as Amount;
  private var _type: InvoiceItemType as Type;
  construct() {
  }

  construct(invoiceDateIn: DateTime,
            invoiceDueDateIn: DateTime,
            chargeNameIn: String,
            amountIn: BigDecimal,
            typeIn: InvoiceItemType) {
    _invoiceDate = invoiceDateIn;
    _invoiceDueDate = invoiceDueDateIn;
    _chargeName = chargeNameIn;
    _amount = amountIn;
    _type = typeIn;
  }
}