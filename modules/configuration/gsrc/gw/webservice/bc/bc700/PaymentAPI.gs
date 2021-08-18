package gw.webservice.bc.bc700

uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.xml.ws.annotation.WsiWebService
uses gw.api.web.payment.DirectBillPaymentFactory
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses java.math.BigDecimal

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc700/PaymentAPI")
@Export
class PaymentAPI extends APITestBase {
  /**
   * Makes a payment to an Account
   * <p/>
   * @param accountID The Account to make the payment to
   * @param moneyDetails A PaymentReceiptRecord of subtype DirectBillMoneyDetails
   * @return payment The PublicID of the newly created DirectBillMoneyRcvd
   */
  @Throws(RequiredFieldException, "If accountID is null")
  function makeDirectBillPayment(accountID: String, moneyDetails: PaymentReceiptRecord): String {
    return makeDirectBillPaymentToPolicyPeriod(accountID, moneyDetails, null)
  }

  /**
   * Makes a payment to an Account or to a specific Policy on an Account. If no policyPeriodID is passed in, the payment will be distributed 
   * to the children policies of the Account using standard payment distribution.
   * <p/>
   * If a non-null policyPeriodID parameter is passed in, the payment will be targeted at that specific PolicyPeriod. If there is any extra money left in the payment 
   * after paying the target PolicyPeriod, it will be dealt with based on the PolicyLevelPaymentOption of the Account.
   * <p/>
   * @param accountID The Account to make the payment to
   * @param moneyDetails A PaymentReceiptRecord of subtype DirectBillMoneyDetails
   * @param policyPeriodID The PolicyPeriod to make the payment to
   * @return directBillMoneyRcvdID The PublicID of the payment that is created
   */
  @Throws(RequiredFieldException, "If accountID is null")
  function makeDirectBillPaymentToPolicyPeriod(accountID: String, moneyDetails: PaymentReceiptRecord, policyPeriodID: String): String {
    if (accountID == null) {
      throw new DataConversionException("The accountID must be non-null")
    }
    var directBillMoneyRcvd: DirectBillMoneyRcvd
    gw.transaction.Transaction.runWithNewBundle(\bundle ->
    {
      var account = bundle.add(loadAccount(accountID))
      var directBillMoneyDetails = PaymentReceipts.toEntity(moneyDetails)
      directBillMoneyRcvd = DirectBillPaymentFactory.createAndExecuteMoneyReceivedFromAccountAndDirectBillMoneyDetails(account, directBillMoneyDetails as DirectBillMoneyDetails)
      if (policyPeriodID != null){
        var policyPeriod = bundle.add(loadPolicyPeriod(policyPeriodID))
        directBillMoneyRcvd.PolicyPeriod = policyPeriod
      }
    }
    )
    return directBillMoneyRcvd.PublicID
  }

  /**
   * Makes a SuspensePayment to an Account or Policy. Exactly one of the AccountNumber, PolicyNumber, and OfferNumber fields on the passed-in SuspensePayment 
   * must be non-null.
   *
   * @param suspensePayment The SuspensePayment being made (a PaymentReceiptRecord of subtype SuspensePayment)
   * @return SuspensePaymentID The PublicID of the payment that is created
   */
  @Throws(DataConversionException, "If more than one of AccountNumber, PolicyNumber, and OfferNumber are all non-null")
  function makeSuspensePayment(suspensePayment: PaymentReceiptRecord): String {
    require(suspensePayment, "suspensePayment")
    validateSuspensePayment(suspensePayment)
    var suspensePaymentEntity: SuspensePayment
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      suspensePaymentEntity = PaymentReceipts.toEntity(suspensePayment) as SuspensePayment
      suspensePaymentEntity.createSuspensePayment()
    })
    return suspensePaymentEntity.PublicID;
  }

  private function validateSuspensePayment(suspensePayment: PaymentReceiptRecord) {
    var numNonNull = 0
    if (suspensePayment.AccountNumber != null) {
      numNonNull++
    }
    if (suspensePayment.PolicyNumber != null) {
      numNonNull++
    }
    if (suspensePayment.OfferNumber != null) {
      numNonNull++
    }
    if (numNonNull > 1){
      throw new DataConversionException("On the passed-in SuspensePayment, at most one of AccountNumber, PolicyNumber, and OfferNumber must be non-null ")
    }
  }

  /**
   *
   * If an account has excess funds to eliminate in part or in whole, the funds are an account adjustment. BillingCenter always records the 
   * account adjustment as a BillingCenter transaction, not a charge. If the adjustment amount is greater than the unapplied amount of the 
   * given account, only the unapplied amount adjusts. An account adjustment functions like a Negative Writeoff.
   *
   * An example of how this method is used: A dummy account has been set up to temporarily hold mis-allocated funds that are being 
   * stored in BillingCenter for the sole purpose of recording them in the General Ledger system.  In this case, funds will be
   * transferred to the dummy accounts, integration code will post the information to the General Ledger system, and
   * finally the funds will be adjusted using this API method.  
   *
   * @param accountID  A publicID of an existing account
   * @param adjustment Adjustment amount (must be less than zero)
   * @return Actual adjustment made, which will be the lesser of the adjustment amount and the unapplied amount on the
   *         account.
   */
  @Throws(SOAPException, "If the adjustment amount is non-negative")
  function makeAccountAdjustment(accountID: String, adjustmentAmount: Number): Number {
    if (adjustmentAmount >= 0) {
      throw new SOAPException("Account adjustments must be negative. Received adjustment amount of: " + adjustmentAmount);
    }
    var account = loadAccount(accountID)
    var accountAdjustment: AccountAdjustment
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      account = bundle.add(account)
      var adjustment = (adjustmentAmount as BigDecimal).ofCurrency(account.Currency)
      accountAdjustment = account.makeAdjustment(adjustment)
    })
    return accountAdjustment.Amount.Amount as java.lang.Double
  }

  /**
   * Reverses a Direct Bill payment 
   *
   * @param directBillMoneyRcvdID The id of the DirectBillMoneyRcvd to be reversed
   * @param paymentReversalReason the reason for the reversal
   */
  @Throws(BadIdentifierException, "If directBillMoneyRcvdID does not correspond to a valid payment")
  function reverseDirectBillPayment(directBillMoneyRcvdID: String, paymentReversalReason: PaymentReversalReason) {
    require(directBillMoneyRcvdID, "directBillMoneyRcvdID")
    var dbmr = gw.api.database.Query.make(DirectBillMoneyRcvd).compare("PublicID", Equals, directBillMoneyRcvdID).select().getAtMostOneRow()
    if (dbmr == null) {
      throw new BadIdentifierException("The ID " + directBillMoneyRcvdID + " does not correspond to a valid DirectBillMoneyRcvd payment")
    }
    gw.transaction.Transaction.runWithNewBundle(\bundle ->
    {
      dbmr = bundle.add(dbmr)
      if (dbmr.BaseDist != null) {
        dbmr.BaseDist.reverse(paymentReversalReason)
      } else {
        dbmr.reverse(paymentReversalReason)
      }
    }
    )
  }
}
