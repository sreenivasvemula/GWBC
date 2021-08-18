package gw.webservice.policycenter.bc700

uses com.google.common.annotations.VisibleForTesting
uses gw.api.domain.invoice.InvoiceStreamFactory
uses gw.api.domain.invoice.AnchorDate
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc700.entity.types.complex.NewInvoiceStream

/**
 * Creates an InvoiceStream from the webservice DTO NewInvoiceStream.  
 * If NewInvoiceStream.PaymentInstrumentID is not null, then the new
 * stream uses the specified payment instrument as its overriding payment
 * instrument.  If the payment instrument is not specified but 
 * NewInvoiceStream.PaymentMethod is Responsive, then the new invoice stream
 * will use the Responsive payment instrument as the overriding
 * payment instrument.
 */
@Export
enhancement NewInvoiceStreamEnhancement : NewInvoiceStream {
  
  function createInvoiceStreamFor(account : Account, bundle : Bundle) : InvoiceStream {
    if (account.Bundle != bundle) {
      account = bundle.add(account)
    }

    var streamPeriodicity = this.Interval
    var invoiceStream = InvoiceStreamFactory.createInvoiceStreamFor(account, streamPeriodicity)
    invoiceStream.OverridingAnchorDates = getOverridingAnchorDates()
    invoiceStream.OverridingPaymentInstrument = getOverridingPaymentInstrumentFrom(account)
    invoiceStream.OverridingBillDateOrDueDateBilling = getOverridingBillDateOrDueDateBilling()
    return invoiceStream  
  }
  
  @VisibleForTesting
  function getOverridingAnchorDates() : List<AnchorDate> {
    // PC sends a NewInvoiceStream with DayOfWeek, FirstDayOfMonth, 
    // and SecondDayOfMonth all non-null, so use the stream periodicity
    // to determine which are really the overriding anchor dates.
    var streamPeriodicity : Periodicity = this.Interval
    if (streamPeriodicity == Periodicity.TC_MONTHLY) {
      return { AnchorDate.fromDayOfMonth(this.FirstDayOfMonth) }
    }
    if (streamPeriodicity == Periodicity.TC_TWICEPERMONTH) {
      return { AnchorDate.fromDayOfMonth(this.FirstDayOfMonth), AnchorDate.fromDayOfMonth(this.SecondDayOfMonth) }
    }
    if (streamPeriodicity == Periodicity.TC_EVERYWEEK) {
      return { AnchorDate.fromDayOfWeek(this.DayOfWeek) }
    }
    if (this.AnchorDate != null)  {
      return { AnchorDate.fromDate(this.AnchorDate.toCalendar().Time) }
    }
    return {}
  }
  
  
  private function getOverridingBillDateOrDueDateBilling() : BillDateOrDueDateBilling {
    return this.DueDateBilling 
      ? BillDateOrDueDateBilling.TC_DUEDATEBILLING
      : BillDateOrDueDateBilling.TC_BILLDATEBILLING
  }

  @VisibleForTesting
  function getOverridingPaymentInstrumentFrom(account : Account) : PaymentInstrument {
    // If NewInvoiceStream.PaymentInstrumentID is not null, then the new
    // stream uses the specified payment instrument as its overriding payment
    // instrument.  If the payment instrument is not specified but 
    // NewInvoiceStream.PaymentMethod is Responsive, then the new invoice stream
    // uses the Responsive payment instrument as the overriding
    // payment instrument.   
    if (this.PaymentInstrumentID != null) {
      return findExistingPaymentInstrument(this.PaymentInstrumentID)
    }
    if (this.PaymentMethod == PaymentMethod.TC_RESPONSIVE.Code) {
      return account.PaymentInstruments.firstWhere(\ instrument -> instrument.PaymentMethod == PaymentMethod.TC_RESPONSIVE)
    }
    return null
  }
  
  private function findExistingPaymentInstrument(publicID : String) : PaymentInstrument {
    var paymentInstrument = gw.api.database.Query.make(PaymentInstrument).compare("PublicID", Equals, publicID).select().getAtMostOneRow()
    if (paymentInstrument == null) {
      throw new BadIdentifierException("Unknown payment instrument with ID: " + publicID)
    }
    return paymentInstrument
  }
    
}
