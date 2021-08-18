package gw.webservice.bc.bc801

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPServerException
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.bc.bc801.util.WebservicePreconditions
uses gw.xml.ws.annotation.WsiWebService

uses java.util.Collection

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/InvoiceDetailsAPI")
@Export
class InvoiceDetailsAPI {

  /**
   * Retrieves summary info. about the invoice items on a given invoice
   *
   * @param invoicePublicID PublicID of an existing Invoice
   * @return An array of InvoiceItemDTO objects, each one carrying summary info. of an invoice item on the {@link entity.Invoice}
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If invoicePublicID is null.")
  @Throws(BadIdentifierException, "If there is no invoice with PublicID matching invoicePublicID.")
  function getInvoiceItemsOnInvoice(invoicePublicID: String)  : InvoiceItemDTO[] {
    WebservicePreconditions.notNull(invoicePublicID, "invoicePublicID")
    var invoice = WebserviceEntityLoader.loadInvoice(invoicePublicID)
    return invoice.InvoiceItems.map( \ invoiceItem -> InvoiceItemDTO.valueOf(invoiceItem))
  }

  /**
   * Retrieves summary info. about the invoice items on a given policy period sorted by their event date
   *
   * @param policyPeriodPublicID PublicID of an existing PolicyPeriod
   * @return An array of InvoiceItemDTO objects, each one carrying summary info. of an invoice item on the {@link entity.PolicyPeriod}. The array
   *         is sorted by the event date of the items
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyperiodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no policy period with PublicID matching policyperiodPublicID.")
  function getInvoiceItemsOnPolicyPeriodSortedByEventDate(policyPeriodPublicID: String)  : InvoiceItemDTO[] {
    WebservicePreconditions.notNull(policyPeriodPublicID, "policyPeriodPublicID")
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    return policyPeriod.getInvoiceItemsSortedByEventDate().map(\ invoiceItem -> InvoiceItemDTO.valueOf(invoiceItem))
  }

  /**
   * Retrieves summary info. about the invoices on a given account sorted by their bill date (event date)
   *
   * @param accountPublicID PublicID of an existing Account
   * @param status Optional, if null, invoices with any status, and otherwise only those of the given status, would be returned
   * @return An array of InvoiceDTO objects, each one carrying summary info. of an invoice on the {@link entity.Account}. The array
   *         is sorted by the bill date (event date) of the invoices
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountPublicID.")
  function getInvoicesOnAccountSortedByBillDate(accountPublicID: String,  status: typekey.InvoiceStatus) : InvoiceDTO[] {
    WebservicePreconditions.notNull(accountPublicID, "accountPublicID")
    var account = WebserviceEntityLoader.loadAccount(accountPublicID)
    var invoices = filterInvoicesByStatus(account.InvoicesSortedByEventDate, status)
    return invoices.map( \ invoice -> InvoiceDTO.valueOf(invoice)).toTypedArray()
  }

  /**
   * Retrieves summary info. about the invoices on a given policy period sorted by their bill date (event date)
   *
   * @param policyPeriodPublicID PublicID of an existing PolicyPeriod
   * @param status Optional, if null, invoices with any status, and otherwise only those of the given status, would be returned
   * @return An array of InvoiceDTO objects, each one carrying summary info. of an invoice carrying items on the {@link entity.PolicyPeriod}. The array
   *         is sorted by the bill date (event date) of the invoices
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyperiodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no policy period with PublicID matching policyperiodPublicID.")
  function getInvoicesOnPolicyPeriodSortedByBillDate(policyPeriodPublicID: String,  status: typekey.InvoiceStatus) : InvoiceDTO[] {
    WebservicePreconditions.notNull(policyPeriodPublicID, "policyPeriodPublicID")
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var invoices = filterInvoicesByStatus(policyPeriod.InvoicesSortedByEventDate, status)
    return invoices.map( \ invoice -> InvoiceDTO.valueOf(invoice)).toTypedArray()
  }

  /**
   * Retrieves summary info. about the invoices on a given invoice stream sorted by their bill date (event date)
   *
   * @param invoiceStreamPublicID PublicID of an existing InvoiceStream
   * @param status Optional, if null, invoices with any status, and otherwise only those of the given status, would be returned
   * @return An array of InvoiceDTO objects, each one carrying summary info. of an invoice on the {@link entity.InvoiceStream}. The array
   *         is sorted by the bill date (event date) of the invoices
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If invoiceStreamPublicID is null.")
  @Throws(BadIdentifierException, "If there is no invoice stream with PublicID matching invoiceStreamPublicID.")
  function getInvoicesOnInvoiceStreamSortedByBillDate(invoiceStreamPublicID: String,  status: typekey.InvoiceStatus) : InvoiceDTO[] {
    WebservicePreconditions.notNull(invoiceStreamPublicID, "invoiceStreamPublicID")
    var invoiceStream = WebserviceEntityLoader.loadInvoiceStream(invoiceStreamPublicID)
    var invoices = filterInvoicesByStatus(invoiceStream.InvoicesSortedByEventDate, status)
    return invoices.map( \ invoice -> InvoiceDTO.valueOf(invoice)).toTypedArray()
  }

  private function filterInvoicesByStatus(invoices: Collection<Invoice>, status: InvoiceStatus) : Collection<Invoice> {
    if (status != null) {
      return invoices.where( \ invoice -> invoice.Status == status)
    }
    return invoices
  }

}