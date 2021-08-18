package gw.plugin.invoice.impl
uses gw.plugin.invoice.IInvoiceStream
uses gw.api.domain.invoice.InvoicePayer
uses gw.api.domain.invoice.AnchorDate
uses java.util.ArrayList

@Export
class InvoiceStream implements IInvoiceStream {

  construct() {
  }

  override function getInvoiceStreamPeriodicityFor( payer : InvoicePayer, paymentPlan : PaymentPlan,
      defaultInvoiceStreamPeriodicity : Periodicity ) : Periodicity {
    return payer.Producer ? Periodicity.TC_MONTHLY : defaultInvoiceStreamPeriodicity
  }

  override function getExistingInvoiceStreamFor( payer : InvoicePayer, owner : TAccountOwner,
      invoiceStreamPeriodicity : Periodicity, defaultExistingInvoiceStream : InvoiceStream ) : InvoiceStream {
    return defaultExistingInvoiceStream
  }

  override function customizeNewInvoiceStream( payer : InvoicePayer, owner : TAccountOwner, newInvoiceStream : InvoiceStream ) {
  }

  override function customizeNewInvoiceStream( payer : InvoicePayer, newInvoiceStream : InvoiceStream ) {
  }

  override function getAnchorDatesForCustomPeriodicity( invoicePayer : InvoicePayer, customPeriodicity : Periodicity )
      : List<AnchorDate> {
    return new ArrayList<AnchorDate>();
  }
}
