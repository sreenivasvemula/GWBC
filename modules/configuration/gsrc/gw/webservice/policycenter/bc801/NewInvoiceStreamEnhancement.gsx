package gw.webservice.policycenter.bc801

uses com.google.common.annotations.VisibleForTesting
uses gw.api.domain.invoice.AnchorDate
uses gw.api.domain.invoice.InvoiceStreamFactory
uses gw.pl.persistence.core.Bundle
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.policycenter.bc801.entity.types.complex.NewInvoiceStream

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

    var unappliedFund : UnappliedFund
    if (this.UnappliedFundID != null) {
      unappliedFund = bundle.add(UnappliedFund)
    } else if (this.UnappliedDescription != null) {
      unappliedFund = account.createDesignatedUnappliedFund(this.UnappliedDescription)
    } else {
      // out-of-the-box this only happens when the account did not exist
      // before issuance; if it can happen otherwise configure as desired...
      unappliedFund = account.DefaultUnappliedFund
    }

    var invoiceStream = InvoiceStreamFactory.createInvoiceStreamFor(unappliedFund, this.Interval)
    invoiceStream.OverridingAnchorDates = OverridingAnchorDates
    invoiceStream.OverridingPaymentInstrument = getOverridingPaymentInstrumentFrom(account)
    invoiceStream.OverridingBillDateOrDueDateBilling = OverridingBillDateOrDueDateBilling
    invoiceStream.Description = this.Description
    return invoiceStream
  }
  
  @VisibleForTesting
  property get OverridingAnchorDates() : List<AnchorDate> {
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

  private property get OverridingBillDateOrDueDateBilling() : BillDateOrDueDateBilling {
    return this.DueDateBilling ? TC_DUEDATEBILLING : TC_BILLDATEBILLING
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
      return WebserviceEntityLoader
          .loadByPublicID<PaymentInstrument>(this.PaymentInstrumentID, "PaymentInstrumentID")
    }
    if (this.PaymentMethod == PaymentMethod.TC_RESPONSIVE.Code) {
      return account.PaymentInstruments.firstWhere(\ instrument -> instrument.PaymentMethod == TC_RESPONSIVE)
    }
    return null
  }

  private property get UnappliedFund() : UnappliedFund {
    return this.UnappliedFundID == null
        ? null : WebserviceEntityLoader
            .loadByPublicID<UnappliedFund>(this.UnappliedFundID, "UnappliedFundID")
  }
}
