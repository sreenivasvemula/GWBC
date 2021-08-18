package gw.webservice.policycenter.bc700

uses gw.webservice.bc.bc700.PaymentInstrumentRecord
uses gw.webservice.bc.bc700.PaymentInstruments
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/AccountBillingSettings" )
@Export
final class AccountBillingSettings {
  var _InvoiceDeliveryMethod : String as InvoiceDeliveryMethod
  var _PaymentInstrumentRecord : PaymentInstrumentRecord as PaymentInstrumentRecord
  
  construct()
  {
  }
  
  construct(account : Account) {
    this.InvoiceDeliveryMethod = account.InvoiceDeliveryType.Code
    this.PaymentInstrumentRecord = PaymentInstruments.toRecord(account.DefaultPaymentInstrument)
  }
  
}
