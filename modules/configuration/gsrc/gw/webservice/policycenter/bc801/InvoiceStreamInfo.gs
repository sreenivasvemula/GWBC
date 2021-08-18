package gw.webservice.policycenter.bc801
uses gw.xml.ws.annotation.WsiExportable
uses gw.webservice.bc.bc801.PaymentInstrumentRecord
uses gw.i18n.DateTimeFormat
uses gw.webservice.bc.bc801.PaymentInstruments

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/InvoiceStreamInfo" )
@Export
final class InvoiceStreamInfo {
  var _id : String as PublicID
  var _description : String as Description
  var _interval : Periodicity as Interval
  var _day : String as Days
  var _DueDateBilling : Boolean as DueDateBilling
  var _paymentInstrumentRecord : PaymentInstrumentRecord as PaymentInstrumentRecord

  construct() { }
  
  construct(invoiceStream : InvoiceStream) { 
    PublicID = invoiceStream.PublicID
    Description = invoiceStream.DisplayName
    Interval = invoiceStream.Periodicity
    PaymentInstrumentRecord = PaymentInstruments.toRecord(invoiceStream.PaymentInstrument)
    if (invoiceStream.Periodicity == Periodicity.TC_EVERYWEEK) {
      Days = invoiceStream.AnchorDates[0].toDayOfWeek() as String
    } else if (invoiceStream.Periodicity == Periodicity.TC_EVERYOTHERWEEK) {
      Days = invoiceStream.AnchorDates[0].toDate().formatDate(DateTimeFormat.SHORT)
    } else if (invoiceStream.Periodicity == Periodicity.TC_MONTHLY) {
      Days = invoiceStream.AnchorDates[0].toDayOfMonth() as String
    } else if (invoiceStream.Periodicity == Periodicity.TC_TWICEPERMONTH) {
      Days = invoiceStream.AnchorDates[0].toDayOfMonth() + "," + invoiceStream.AnchorDates[1].toDayOfMonth()
    }
    DueDateBilling = invoiceStream.BillDateOrDueDateBilling == BillDateOrDueDateBilling.TC_DUEDATEBILLING
  }

}
