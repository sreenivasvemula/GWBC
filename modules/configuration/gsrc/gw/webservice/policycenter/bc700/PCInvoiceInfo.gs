package gw.webservice.policycenter.bc700
uses java.math.BigDecimal
uses java.util.Collection
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/PCInvoiceInfo" )
@Export
final class PCInvoiceInfo {
  var _invoiceNumber : String as InvoiceNumber
  var _status : String as Status
  var _invoiceDate : DateTime as InvoiceDate
  var _invoiceDueDate : DateTime as InvoiceDueDate
  var _amount : BigDecimal as Amount
  var _paid : BigDecimal as Paid
  var _unpaid : BigDecimal as Unpaid
  var _billed : BigDecimal as Billed
  var _pastDue : BigDecimal as PastDue
  var _InvoiceStream : String as InvoiceStream
  var _paidStatus : String as PaidStatus
  
  construct() {
  }
  
  construct(invoiceItems : Collection<InvoiceItem>) {
    // var locale : ILocale = (localeCode == null ? ILocale.EN_US : ILocale.valueOf(localeCode))
    var invoice = invoiceItems.first().Invoice
    InvoiceDate = invoice.EventDate
    InvoiceDueDate = invoice.DueDate
    Amount = invoiceItems.map( \ i -> i.Amount.Amount ).fold( \ b, b2 -> b.add( b2 ) )
    Paid = invoiceItems.map( \ i -> i.PaidAmount.Amount ).fold( \ b, b2 -> b.add( b2 ) )
    Unpaid = Amount.subtract( Paid )
    Billed = invoice.Status == InvoiceStatus.TC_BILLED ? Unpaid : BigDecimal.ZERO
    PastDue = invoice.Status == InvoiceStatus.TC_DUE ? Unpaid : BigDecimal.ZERO
    PaidStatus = new gw.plugin.invoice.impl.Invoice().getPaidStatus(invoice).toString()
  }
  
  construct(invoice : Invoice) {
    InvoiceDate = invoice.EventDate
    InvoiceDueDate = invoice.DueDate
    InvoiceNumber = invoice.InvoiceNumber
    Status = invoice.Status.getDisplayName()
    Amount = invoice.Amount.Amount
    Unpaid = invoice.AmountDue.Amount
    InvoiceStream = invoice.InvoiceStream.PCDisplayName_bc700
    PaidStatus = new gw.plugin.invoice.impl.Invoice().getPaidStatus(invoice).toString()
  }
}
