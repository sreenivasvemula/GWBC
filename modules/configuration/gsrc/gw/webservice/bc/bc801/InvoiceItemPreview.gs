package gw.webservice.bc.bc801

uses gw.pl.currency.MonetaryAmount

uses java.util.Date

@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/bc/bc801/InvoiceItemPreview" )
@Export
final class InvoiceItemPreview {

  private var _invoiceDate : DateTime as InvoiceDate
  private var _invoiceDueDate : DateTime as InvoiceDueDate
  private var _chargeName : String as ChargeName
  private var _amount : MonetaryAmount as Amount
  private var _type : InvoiceItemType as Type

  construct(){}

  construct(invoiceDateIn : DateTime,
            invoiceDueDateIn : DateTime,
            chargeNameIn : String,
            amountIn : MonetaryAmount,
            typeIn : InvoiceItemType) {
    _invoiceDate = invoiceDateIn
    _invoiceDueDate = invoiceDueDateIn
    _chargeName = chargeNameIn
    _amount = amountIn
    _type = typeIn
  }
}