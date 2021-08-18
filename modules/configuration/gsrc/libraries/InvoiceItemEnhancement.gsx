package libraries
uses pcf.AgencyBillStatementDetailPopup

@Export
enhancement InvoiceItemEnhancement : entity.InvoiceItem {
  function StatementInvoiceDetailViewAction() {
    if (this.Invoice typeis StatementInvoice) {
      AgencyBillStatementDetailPopup.push(this.Invoice)
    }
  }
}
