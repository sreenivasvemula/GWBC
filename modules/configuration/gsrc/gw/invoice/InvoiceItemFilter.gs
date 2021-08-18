package gw.invoice

uses java.lang.UnsupportedOperationException

@Export
class InvoiceItemFilter {
  static function getFilter(invoiceItemFilterType : InvoiceItemFilterType, includeDownPaymentInvoiceItems : boolean)
      : block(item : InvoiceItem) : boolean {

    switch (invoiceItemFilterType) {
      case TC_ALLITEMS:
          return (\ i : InvoiceItem -> true)

      case TC_PLANNEDITEMS:
          return (\ i : InvoiceItem -> i.Invoice.Planned || (includeDownPaymentInvoiceItems && i.Type == TC_DEPOSIT))

      case TC_NOTFULLYPAIDITEMS:
          return (\ i : InvoiceItem -> {
            if (i.Invoice typeis StatementInvoice) {
              return i.CanBePaidMoreByAgencyBill || (includeDownPaymentInvoiceItems && i.Type == TC_DEPOSIT)
            } else {
              return !i.FullyConsumed || (includeDownPaymentInvoiceItems && i.Type == TC_DEPOSIT)
            }
          })

      default:
        throw new UnsupportedOperationException("Unexpected InvoiceItemFilterType")
    }
  }
}
