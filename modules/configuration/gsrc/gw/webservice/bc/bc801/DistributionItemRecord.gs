package gw.webservice.bc.bc801
uses gw.xml.ws.annotation.WsiExportable
uses gw.pl.currency.MonetaryAmount

@WsiExportable ("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/DistributionItemRecord")
@Export
final class DistributionItemRecord {

  //PublicID of the InvoiceItem to distribute to
  private var _invoiceItemID : String as InvoiceItemID
  
  private var _grossAmount : MonetaryAmount as GrossAmount
  private var _commissionAmount : MonetaryAmount as CommissionAmount

  //Optional: Default value is Auto-Exception
  private var _disposition : DistItemDisposition as Disposition

}
