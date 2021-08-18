package libraries

uses com.guidewire.pl.web.controller.UserDisplayableException
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.lang.reflect.features.PropertyReference

@Export
enhancement PaymentEntryExt : PaymentEntry {

  static function findProducerFromName(prodName: String) : Producer {
    if (prodName == null) {
      return null
    }

    var producerQuery = Query.make(Producer.Type)
    producerQuery.compare(Producer#Name, Relop.Equals, prodName)
    var result = producerQuery.select()

    if (result.Count == 0) {
      throw new UserDisplayableException(displaykey.Web.PaymentEntry.Error.ProducerNotFound(prodName))
    }

    if (result.Count > 1) {
      throw new UserDisplayableException(displaykey.Java.ProducerSearchConverter.Error.MultiProducers( prodName ))
    }

    var foundProducer = result.getAtMostOneRow()

    return foundProducer
  }

  static function findInvoiceFromInvoiceNumber(invoiceNum : String) : Invoice {
    if (invoiceNum == null) {
      return null
    }

    var invoiceQuery = Query.make(Invoice.Type)
    invoiceQuery.compare(Invoice#InvoiceNumber, Relop.Equals, invoiceNum)
    var result = invoiceQuery.select()

    if (result.Count == 0) {
      throw new UserDisplayableException(displaykey.Web.PaymentEntry.Error.InvoiceNotFound)
    }

    if (result.Count > 1) {
      throw new UserDisplayableException(displaykey.Web.PaymentEntry.Error.MultiInvoice(invoiceNum))
    }

    var foundInvoice = result.getAtMostOneRow()

    if (foundInvoice.Payer typeis Producer) {
      throw new UserDisplayableException(displaykey.Web.PaymentEntry.Error.InvoiceIsAgencyBill )
    }

    return foundInvoice
  }

  property get IsSuspensePayment() : boolean {
    return MultiPaymentType.TC_SUSPENSE == this.SuspensePayment;
  }

  property get IsMoneyReceivedForProducer() : boolean {
    if (this.PolicyPeriod.DefaultPayer typeis Producer && this.Producer == null) {
      this.Producer = this.PolicyPeriod.DefaultPayer
    }

    return this.Producer != null;
  }

  /**
   * Verifies that there is no Invoice specified if we're making a Suspense Payment
   *
   * @returns an error string if the payment entry is for a suspense payment and Invoice is non-null.
   */
  function verifyInvoice() : String {
    if (this.Invoice != null && this.Amount != null && this.Invoice.Currency != this.Amount.Currency) {
      return displaykey.Web.NewMultiPaymentScreen.CurrenciesNotEqual(this.Amount.Currency, entity.Invoice, this.Invoice.Currency)
    }

    if (IsSuspensePayment){
      if (this.Invoice != null) {
        return displaykey.Web.PaymentEntry.Error.CantApplySuspenseToInvoice
      }
    } else {
      if (this.Invoice.Payer typeis Producer) {
        return displaykey.Web.PaymentEntry.Error.InvoiceIsAgencyBill
      }
    }
    return null
  }

  /**
   * Verifies that the amount is non null
   *
   * @returns an error string if the amount is null, otherwise just returns null
   */
  function verifyAmount() : String {
    if (this.Amount == null) {
      return displaykey.Web.NewMultiPaymentScreen.MustEnterAmount;
    }
    else if (this.Amount.IsZero) {
      return displaykey.Java.Error.AmountIsZero;
    }
    else {
      return null
    }
  }

  /**
   * Verifies that the account exists, if it's a regular payment, and doesn't exist, if it's a suspense payment.
   *
   * @return null if these conditions are true, an error string if they aren't.
   */
  function verifyAccount() : String {

    if (this.Account != null && this.Amount != null && this.Account.Currency != this.Amount.Currency) {
      return displaykey.Web.NewMultiPaymentScreen.CurrenciesNotEqual(this.Amount.Currency, entity.Account, this.Account.Currency)
    }

    if (IsSuspensePayment) {
      
      if (this.Account != null) {
        return displaykey.Web.PaymentEntry.Error.CantApplySuspenseToExistingAccount(this.AccountNumber);
      }

    } else {

      if ((this.Account == null) && !String.isEmpty(this.AccountNumber)) {
        return displaykey.Web.PaymentEntry.Error.AccountNotFound(this.AccountNumber);
      }
    }

    //without checking a recipient is specified there's no indication that one of these fields is required.
    var errorMessage = verifyRecipientSpecified()
    if (errorMessage != null) {
      return errorMessage
    }

    return null;
  }

  /**
   * Verifies that the policy exists, if it's a regular payment, and doesn't exist, if it's a suspense payment.
   *
   * @return null if these conditions are true, an error string if they aren't.
   */
  function verifyPolicy() : String {

    if (this.PolicyPeriod != null && this.Amount != null && this.PolicyPeriod.Currency != this.Amount.Currency) {
      return displaykey.Web.NewMultiPaymentScreen.CurrenciesNotEqual(this.Amount.Currency, entity.Policy, this.PolicyPeriod.Currency)
    }

    if (IsSuspensePayment) {
      
      if (this.PolicyPeriod != null) {
        return displaykey.Web.PaymentEntry.Error.CantApplySuspenseToExistingPolicy(this.PolicyNumber);
      }

    } else {
      if ((this.PolicyPeriod == null) && !String.isEmpty(this.PolicyNumber)) {
        return displaykey.Web.PaymentEntry.Error.PolicyNotFound(this.PolicyNumber);
      }
    }

    return null;
  }

  /**
   * Verifies that the producer exists, if it's an Agency Money Received payment.
   *
   * @return null if these conditions are true, an error string if they aren't.
   */
  function verifyProducer() : String {

    var errorMessage : String;
    
    if (this.Producer != null && this.Amount != null && this.Producer.Currency != this.Amount.Currency) {
      return displaykey.Web.NewMultiPaymentScreen.CurrenciesNotEqual(this.Amount.Currency, entity.Producer, this.Producer.Currency)
    }
    
    if (IsSuspensePayment) {
      if (this.Producer != null) {
        return displaykey.Web.PaymentEntry.Error.CantApplySuspenseToProducer
      }
    }
    return null;
  }
  
  /**
   * throw an exception if this multipayment entry is in a valid state
   */
  function validateEntry() {
    var msg = verifyRecipientSpecified()

    if ( msg == null ) {
      msg = verifyProducer()
    }

    if ( msg == null ) {
      msg = verifyInvoice()
    }

    if ( msg == null ) {
      msg = verifyPolicy()
    }

    if ( msg == null ) {
      msg = verifyAccount()
    }

    if ( msg != null ) {
      throw new UserDisplayableException(msg)
    }
  }

  /**
   * Creates an appropriate payment for this entry based on the information in the entry
   * <ul><li><i>PaymentType = Suspense:</i>     Direct Bill Suspense Payment</li>
   * <li><i>PaymentType = Payment:</i><ul>
   *   <li><i>Account not null:</i>                      Account Payment</li>
   *   <li><i>Account and Policy not null:</i>           Account Payment on Policy's parent Account</li>
   *   <li><i>Account null and Policy not null:</i>      Account Payment on Policy's parent Account</li>
   *   <li><i>Producer not null:</i>                     AgencyMoneyReceived for that Producer</li>
   * </ul></li></ul>
   *
   * @see gw.bc.entity.payment.NewMultiPayment#createPayments
   */
  function createEntryPayment() {
    if (IsSuspensePayment) {
      this.createSuspensePayment();
    } else if (IsMoneyReceivedForProducer) {
      this.createAgencyMoneyReceived();
    } else {
      this.createDirectBillMoneyReceived()
    }
  }

  private function verifyRecipientSpecified() : String {
    if (!IsSuspensePayment &&
            this.Account == null &&
            this.PolicyPeriod == null &&
            this.Producer == null &&
            this.Invoice == null) {
      return displaykey.Web.PaymentEntry.Error.NoPaymentRecipientSpecified
    } else {
      return null
    }
  }

  private property get PropertiesToValidateForPaymentType() : PropertyReference[] {
    return IsSuspensePayment ? { PaymentEntry#AccountNumber, PaymentEntry#PolicyPeriod }
                : { PaymentEntry#Account, PaymentEntry#PolicyPeriod, PaymentEntry#Invoice, PaymentEntry#Producer }
  }

}

