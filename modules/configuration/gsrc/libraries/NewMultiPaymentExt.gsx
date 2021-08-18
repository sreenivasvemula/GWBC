package libraries

uses gw.api.web.payment.PaymentInstrumentFactory

@Export
enhancement NewMultiPaymentExt : NewMultiPayment {
  
  /**
   * @return array of all non blank NewMultiPaymentEntry children of this NewMultiPayment
   */
  property get NonBlankPaymentEntries() : PaymentEntry[] {
    return this.Payments.where( \ n -> !n.isUnusedEntry() )
  }
  
  /**
   * Iterates over all child payment entries and invokes createEntryPayment() on each one.
   *
   * @see com.guidewire.bc.domain.payment.NewMultiPaymentEntry#createEntryPayment() 
   */
  function createPayments() {
    var entries = this.NonBlankPaymentEntries
    for (entry in entries) {
      entry.validateEntry()
    }
    for (entry in entries) {
      entry.createEntryPayment()
    }
  }  

  /**
   *  Adds a set of empty payment rows to this NewMultiPayment.  Primarily used when the user
   *  hits the Add button in the UI to add a bunch of new empty rows that can be typed into.
   *
   * @return array holding all the empty payment rows this function created
   */
  function addEmptyPaymentRows() : PaymentEntry[] {

    // Create an array to hold the set of empty payment rows we create
    var numberOfEmptyRowsToAdd = 15;
    var emptyRows = new PaymentEntry[numberOfEmptyRowsToAdd];

    // Create the empty payment rows.  Add them to this NewMultiPayment instance and also
    // add them to the array of empty payment rows because we will return that array.
    for (i in 0..|numberOfEmptyRowsToAdd) {
      var multiPaymentEntry = new PaymentEntry();
      multiPaymentEntry.PaymentInstrument = PaymentInstrumentFactory.getCheckPaymentInstrument()
      this.addToPayments(multiPaymentEntry);
      emptyRows[i] = multiPaymentEntry;
    }
    
    // Return an array that holds all the empty rows we created
    return emptyRows; 
  }
}
