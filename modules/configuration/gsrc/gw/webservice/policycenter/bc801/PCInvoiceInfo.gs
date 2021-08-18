package gw.webservice.policycenter.bc801

uses gw.pl.currency.MonetaryAmount
uses gw.xml.ws.annotation.WsiExportable

uses java.math.BigDecimal
uses java.util.Collection

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/PCInvoiceInfo" )
@Export
final class PCInvoiceInfo {
  var _invoiceNumber : String as InvoiceNumber
  var _status : String as Status
  var _invoiceDate : DateTime as InvoiceDate
  var _invoiceDueDate : DateTime as InvoiceDueDate
  var _amount : MonetaryAmount as Amount
  var _paid : MonetaryAmount as Paid
  var _unpaid : MonetaryAmount as Unpaid
  var _billed : MonetaryAmount as Billed
  var _pastDue : MonetaryAmount as PastDue
  var _InvoiceStream : String as InvoiceStream
  var _paidStatus : String as PaidStatus
  
  construct() {}

  construct(invoiceItems : Collection<InvoiceItem>) {
    // var locale : ILocale = (localeCode == null ? ILocale.EN_US : ILocale.valueOf(localeCode))
    var invoice = invoiceItems.first().Invoice
    InvoiceDate = invoice.EventDate
    InvoiceDueDate = invoice.DueDate
    Amount = invoiceItems.map(\i -> i.Amount).sum(invoice.Currency)
    Paid = invoiceItems.map(\i -> i.PaidAmount).sum(invoice.Currency)
    Unpaid = Amount.subtract(Paid)
    Billed = invoice.Status == InvoiceStatus.TC_BILLED ? Unpaid : BigDecimal.ZERO.ofCurrency(Unpaid.Currency)
    PastDue = invoice.Status == InvoiceStatus.TC_DUE ? Unpaid : BigDecimal.ZERO.ofCurrency(Unpaid.Currency)
    InvoiceStream = invoice.InvoiceStream.PCDisplayName // Deliberate use of DisplayName, not Code
    PaidStatus = new gw.plugin.invoice.impl.Invoice().getPaidStatus(invoice).toString()
  }

  construct(invoice : Invoice) {
    InvoiceDate = invoice.EventDate
    InvoiceDueDate = invoice.DueDate
    InvoiceNumber = invoice.InvoiceNumber
    Status = invoice.Status.getDisplayName() // Deliberate use of DisplayName, not Code
    Amount = invoice.Amount
    Unpaid = invoice.AmountDue
    InvoiceStream = invoice.InvoiceStream.PCDisplayName // Deliberate use of DisplayName, not Code
    PaidStatus = new gw.plugin.invoice.impl.Invoice().getPaidStatus(invoice).toString()
  }
}