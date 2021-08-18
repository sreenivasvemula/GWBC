package gw.payment

uses com.google.common.collect.ImmutableList

@Export
class PaymentInstrumentFilters {
  
  /*
  
  Lists with the name *Options contain the PaymentMethods that are available when creating a new PaymentInstrument in a given context
  
  Lists with the name *Filter are used to filter an existing collection of PaymentInstruments by PaymentMethod
  
  Lists are final and immutable to prevent changes at run time.
  
  */

  // PaymentMethods that are available when creating a new PaymentInstrument from the "New Payment" page (for Direct Bill)
  public static final var directBillPaymentInstrumentOptions : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_MISC,
    PaymentMethod.TC_WIRE
  )
  
  public static final var directBillPaymentInstrumentFilter : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CASH,
    PaymentMethod.TC_CHECK,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_MISC,
    PaymentMethod.TC_WIRE
  )

  // PaymentMethods that are available when creating a new PaymentInstrument from the "New Payment Request" page
  public static final var paymentRequestPaymentInstrumentOptions: ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_WIRE
  )

 public static final var paymentRequestPaymentInstrumentFilter: ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_WIRE
  )

  // PaymentMethods that are available when creating a new PaymentInstrument from the "Account Details Summary" and "New Account" pages
  public static final var accountDetailsPaymentInstrumentOptions : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD
  )
  
   public static final var accountDetailsPaymentInstrumentFilter : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_RESPONSIVE
  )
  
  // PaymentMethods that are available when creating a new PaymentInstrument from the "Agency Payment" page 
  public static final var agencyPaymentInstrumentOptions : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_MISC,
    PaymentMethod.TC_WIRE
  )
  
  public static final var agencyPaymentInstrumentFilter : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CASH,
    PaymentMethod.TC_CHECK,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_MISC,
    PaymentMethod.TC_WIRE
  )
  
  // PaymentMethods that are available when creating a new PaymentInstrument from the "Agency Payment" page (zero dollar)
  public static final var agencyZeroDollarPaymentInstrumentFilter : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_PRODUCERUNAPPLIED
  )

  // PaymentMethods that are available when creating a new PaymentInstrument from the "Producer Summary" page
  public static final var producerDetailsPaymentInstrumentOptions : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH
  )
  
  public static final var producerDetailsPaymentInstrumentFilter : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CHECK,
    PaymentMethod.TC_RESPONSIVE
  )

  // PaymentMethods that are available when creating a new PaymentInstrument from the "New Suspense Payment" page
  public static final var suspensePaymentInstrumentOptions : ImmutableList<PaymentMethod> = ImmutableList.of(
    PaymentMethod.TC_ACH,
    PaymentMethod.TC_CREDITCARD,
    PaymentMethod.TC_MISC,
    PaymentMethod.TC_WIRE
  )
  
  // filtering functionality
  public static function applyFilter(paymentInstrumentRange : PaymentInstrumentRange, paymentMethods : List<PaymentMethod>) : List<PaymentInstrument> {
    final var paymentInstruments = paymentInstrumentRange.AvailableInstruments
    return (paymentInstruments == null)
        ? {}
        : paymentInstruments.where(\ pi -> paymentMethods.contains(pi.PaymentMethod))
  }
  
}
