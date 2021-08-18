package gw.plugin.invoice.impl;

uses gw.api.domain.accounting.ChargePatternKey
uses gw.api.domain.accounting.ChargeReturnObject
uses gw.api.domain.delinquency.DelinquencyTarget
uses gw.api.financials.MonetaryAmounts
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.invoice.IInvoice

uses java.lang.Iterable
uses gw.api.database.Query
uses gw.api.database.Relop

@Export
class Invoice implements IInvoice {

  construct() {  }

  public override function getInvoiceFeeAmount(invoice : AccountInvoice) : MonetaryAmount {
   return invoice.Account.BillingPlan.InvoiceFee;
  }

  override function getPaymentReversalFeeChargeInfo(directBillMoneyRcvd: DirectBillMoneyRcvd) : ChargeReturnObject {
    var chargeData : ChargeReturnObject

    if (directBillMoneyRcvd.PolicyPeriod == null) {
      chargeData = new ChargeReturnObject(ChargePatternKey.PAYMENTREVERSALFEE.get(), getPaymentReversalFeeAmount(directBillMoneyRcvd.Account))
    } else {
      var overridingPayer = (directBillMoneyRcvd.PolicyPeriod.DefaultPayer typeis Account)
              ? directBillMoneyRcvd.PolicyPeriod.DefaultPayer
              : directBillMoneyRcvd.Account
      chargeData = new ChargeReturnObject(ChargePatternKey.POLICYPAYMENTREVERSALFEE.get(),
          getPaymentReversalFeeAmount(directBillMoneyRcvd.Account),
          directBillMoneyRcvd.PolicyPeriod,
          overridingPayer)
    }
    return chargeData
  }

  public override function getLateFeeAmount(acct : Account) : MonetaryAmount {
   return acct.DelinquencyPlan.LateFeeAmount;
  }

  public override function getLateFeeCharge(delinquencyTarget : DelinquencyTarget) : ChargeReturnObject {
    var isPolicyPeriod = (typeof delinquencyTarget).isAssignableFrom(PolicyPeriod)
    return new ChargeReturnObject((isPolicyPeriod) ? ChargePatternKey.POLICYLATEFEE.get() : ChargePatternKey.ACCOUNTLATEFEE.get(),
        delinquencyTarget.DelinquencyPlan.LateFeeAmount,
        null,
        null)
  }

  public override function getReinstatementFeeAmount(plan: DelinquencyPlan, target : DelinquencyTarget) : MonetaryAmount {
   return plan.ReinstatementFeeAmount;
  }  

  public override function getInstallmentFeeAmount(policy : PolicyPeriod, invoice : Invoice) : MonetaryAmount {
    return policy.PaymentPlan.InstallmentFee;
  }

  /**
   * This method is called during the Invoice batch process, and is used to determine if an invoice item should be held.

   * The default implementation returns true if
   * (a) the invoice item is positive and isn't fully paid, or if the invoice item is negative to start with.
   * and one of the following conditions is met:
   * (b1) the invoice item's charge is held
   * (b2) the invoice item's account is subject to an invoice sending hold
   * (b3) the invoice item's policy is subject to an invoice sending hold
   * (b4) the invoice item is held because of delinquency
   *
   * See CC-32138 and CC-33027 for some background.
   */
  public override function shouldHoldDirectBillInvoiceItem(invoiceItem : InvoiceItem) : Boolean {
    var invoiceDirectBill = invoiceItem.Invoice typeis AccountInvoice;
    var unpaid = invoiceItem.PaidAmount.IsZero;
    var chargeHeld = invoiceItem.Charge.isHeld();
    var accountTargetOfInvoiceSendingHold = invoiceDirectBill and (invoiceItem.Invoice as AccountInvoice).Account.isTargetOfHoldType("InvoiceSending");
    var policyPeriodTargetOfInvoiceSendingHold = invoiceItem.PolicyPeriod != null and invoiceItem.PolicyPeriod.isTargetOfHoldType("InvoiceSending");
    var policyTargetOfInvoiceSendingHold = invoiceItem.PolicyPeriod != null and invoiceItem.PolicyPeriod.Policy.isTargetOfHoldType("InvoiceSending");
    var invoiceItemHeldBecauseOfDelinquency = invoiceItem.isHeldBecauseOfDelinquency();

    return unpaid and
           (chargeHeld or accountTargetOfInvoiceSendingHold
                       or policyPeriodTargetOfInvoiceSendingHold
                       or policyTargetOfInvoiceSendingHold
                       or invoiceItemHeldBecauseOfDelinquency);
  }

  /**
   * This method is called during the Invoice batch process, and is used to determine if an invoice should be carried
   * forward.
   * The default implementation returns true if the following conditions are met:
   * (a) the invoice's account's billing plan's SuppressLowBalInvoices flag is set to true
   * (b) the invoice's amount due is greater than 0
   * (c) either the invoice's amount or its amount due is less than the billing plan's low balance threshold
   * (d) the billing plan's low balance method is "carry forward"
   *
   * See CC-33838 for some background.
   */
  public override function shouldCarryForwardInvoice(invoice : AccountInvoice) : Boolean {
    var billingPlan = invoice.Account.BillingPlan;
    return billingPlan.SuppressLowBalInvoices &&
           invoice.AmountDue.IsPositive &&
           (invoice.Amount < billingPlan.LowBalanceThreshold || invoice.AmountDue < billingPlan.LowBalanceThreshold) &&
           billingPlan.LowBalanceMethod == LowBalanceMethod.TC_CARRYFORWARD
  }

  public override function shouldAccountUnappliedFundsPayChargesOnPolicies() : Boolean {
    return false
  }

  /**
   * Populates the Invoice.OutstandingAmount field at the point that the invoice is billed.  This field is immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   *
   * The default implementation returns invoice.Account.OutstandingAmount
   */
  public override function getOutstandingAmount(invoice : AccountInvoice) : MonetaryAmount {
    return invoice.Account.OutstandingAmount
  }

  /**
   * Populates the Invoice.RemainingBalance field at the point that the invoice is billed.  This field is immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   */
  public override function getRemainingBalance(invoice : AccountInvoice) : MonetaryAmount {
    return invoice.Account.RemainingBalance
  }

  /**
   * Populates the Invoice.UnappliedAmount field at the point that the invoice is billed.  This field is immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   */
  public override function getUnappliedAmount(invoice : AccountInvoice) : MonetaryAmount {
    return invoice.Account.UnappliedAmount
  }

  /**
   * Populates the Invoice.ColOutstandingAmount field at the point that the invoice is billed.  This field is immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   */
  public override function getCollateralOutstandingAmount(invoice : AccountInvoice) : MonetaryAmount {
    return invoice.Account.Collateral.OutstandingAmount
  }

  /**
   * Populates the Invoice.ColRemainingBalance field at the point that the invoice is billed.  This field is immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   */
  public override function getCollateralRemainingBalance(invoice : AccountInvoice) : MonetaryAmount {
    return invoice.Account.Collateral.RemainingBalance
  }

  /**
   * Populates the Invoice.ColUnappliedAmount field at the point that the invoice is billed.  This field is immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   */
  public override function getCollateralUnappliedAmount(invoice : AccountInvoice) : MonetaryAmount {
    return (invoice.Account.Collateral as TAccountOwner).UnappliedAmount
  }

  /**
   * Populates the invoice's policies' snapshot fields at the point that the invoice is billed.  This fields are immutable,
   * and is only populated via this plugin method.  This method is called after
   * Invoice.payChargesOnAssociatedTAccountOwners() is called, so all balance data takes into account charges
   * paid right before the invoice is sent.
   */
  public override function setPolicyPeriodInvoiceSnapshot(snapshot : AccountInvoicePolicyPeriodSnapshot) {
    snapshot.OutstandingAmount = snapshot.PolicyPeriod.OutstandingAmount
    snapshot.RemainingBalance = snapshot.PolicyPeriod.RemainingBalance
  }

  override function shouldCreatePaymentRequest(invoice : AccountInvoice) : boolean {
    var paymentMethodForInvoice = invoice.InvoiceStream.PaymentInstrument.PaymentMethod
    var isPaymentInstrumentBillable = paymentMethodForInvoice == PaymentMethod.TC_CREDITCARD
      || paymentMethodForInvoice == PaymentMethod.TC_ACH
      || paymentMethodForInvoice == PaymentMethod.TC_WIRE
    return isPaymentInstrumentBillable and invoice.getAmount().IsPositive
  }

  /**
   * Plugin call to determine whether or not we should push the invoice items being paid through to "Due"
   * before paying it.  Invoice Items returned from this plugin (if they are not already due) will be removed
   * from the Invoice they are currently on, and place on a new ad hoc Invoice (Bill and Due date today), and then
   * immediately made billed and due.
   * NOTE: we will *not* move any Agency Bill invoice items.
   * @param paymentItems The payment items about to be executed
   * @return A list of all Invoice Items that we should make billed and due before completing the execution of this
   * payment
   */
  override function shouldMakeInvoiceItemsDueBeforePaying(paymentItems : Iterable<BaseDistItem>) : List<InvoiceItem> {
    return {}
  }

  function  getPaidStatus(invoice : Invoice) : InvoicePaidStatus {
    var invoiceItems = invoice.InvoiceItems

    if (invoiceItems.length == 0) {
      return InvoicePaidStatus.TC_FULLYPAID
    }

    var isFullyPaid = true
    for (var invoiceItem in invoiceItems) {
      if (!invoiceItem.GrossUnsettledAmount.IsZero) {
        isFullyPaid = false
        break
      }
    }
    if (isFullyPaid) {
      return InvoicePaidStatus.TC_FULLYPAID
    } else {
      var query = Query.make<BaseDistItem>(BaseDistItem)
      query.compare("ExecutedDate", Relop.NotEquals, null)
      query.compare("ReversedDate", Relop.Equals, null)
      query.compareIn("InvoiceItem", invoiceItems.map(\ ii -> ii.ID))
      var hasPaymentApplied = !query.select().Empty

      return hasPaymentApplied ? InvoicePaidStatus.TC_PARTIALLYPAID : InvoicePaidStatus.TC_UNPAID
    }
  }

  private function getPaymentReversalFeeAmount(acct : Account) : MonetaryAmount {
    return MonetaryAmounts.zeroIfNull(acct.BillingPlan.PaymentReversalFee, acct.Currency)
  }
}
