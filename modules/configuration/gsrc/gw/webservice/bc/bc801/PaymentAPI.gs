package gw.webservice.bc.bc801

uses gw.api.web.accounting.UIWriteOffCreation
uses gw.api.web.accounting.WriteOffFactory
uses gw.api.web.admin.ActivityPatternsUtil
uses gw.api.web.payment.DirectBillPaymentFactory
uses gw.api.web.producer.agencybill.AgencyBillMoneySetupFactory
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.pl.currency.MonetaryAmount
uses gw.pl.persistence.core.Bundle
uses gw.plugin.Plugins
uses gw.plugin.util.CurrentUserUtil
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.bc.bc801.util.WebservicePreconditions
uses gw.xml.ws.annotation.WsiWebService

uses java.util.Map

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/PaymentAPI")
@Export
class PaymentAPI {
  /**
   * Makes a payment to an Account
   * <p/>
   * @param directbillPaymentReceipt A PaymentReceiptRecord of subtype DirectBillMoneyDetails
   * @return payment The PublicID of the newly created DirectBillMoneyRcvd
   */
  @Throws(RequiredFieldException, "If the directbillPaymentReceipt fields AccountID, PaymentInstrumentRecord, or Amount is null")
  function makeDirectBillPayment(directbillPaymentReceipt: PaymentReceiptRecord): String {
    validateDirectBillPaymentReceipt(directbillPaymentReceipt)
    return makeDirectBillPaymentToPolicyPeriod(directbillPaymentReceipt, null)
  }

  /**
   * Makes a payment to an Account or to a specific Policy on an Account. If no policyPeriodID is passed in, the payment will be distributed
   * to the children policies of the Account using standard payment distribution.
   * <p/>
   * If a non-null policyPeriodID parameter is passed in, the payment will be targeted at that specific PolicyPeriod. If there is any extra money left in the payment
   * after paying the target PolicyPeriod, it will be dealt with based on the PolicyLevelPaymentOption of the Account.
   * <p/>
   * @param directbillPaymentReceipt A PaymentReceiptRecord of subtype DirectBillMoneyDetails
   * @param policyPeriodID The PolicyPeriod to make the payment to
   * @return directBillMoneyRcvdID The PublicID of the payment that is created
   */
  @Throws(RequiredFieldException, "If the directbillPaymentReceipt fields AccountID, PaymentInstrumentRecord, or Amount is null")
  function makeDirectBillPaymentToPolicyPeriod(directbillPaymentReceipt: PaymentReceiptRecord, policyPeriodID: String): String {
    validateDirectBillPaymentReceipt(directbillPaymentReceipt)
    var directBillMoneyRcvd: DirectBillMoneyRcvd
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var account = bundle.add(WebserviceEntityLoader.loadAccount(directbillPaymentReceipt.AccountID))
      var unappliedFund = account.DefaultUnappliedFund
      var policyPeriod = null as PolicyPeriod
      var isTargetedToPolicy = false
      if (policyPeriodID != null and account.PolicyLevelBillingWithDesignatedUnapplied) {
        isTargetedToPolicy = true
        policyPeriod = bundle.add(WebserviceEntityLoader.loadPolicyPeriod(policyPeriodID))
        unappliedFund = policyPeriod.Policy.getDesignatedUnappliedFund(account)
        if (unappliedFund == null) {
          // The designated UnappliedFund for this policy with the given account owner does not exist
          isTargetedToPolicy = false
          unappliedFund = account.DefaultUnappliedFund
        }
      }
      var directBillMoneyDetails = PaymentReceipts.toEntity(directbillPaymentReceipt, bundle)
      directBillMoneyRcvd = DirectBillPaymentFactory.createAndExecuteMoneyReceivedFromPaymentReceipt(unappliedFund, directBillMoneyDetails as DirectBillMoneyDetails, directbillPaymentReceipt.ReceivedDate, directbillPaymentReceipt.Description)
      if (isTargetedToPolicy) {
        directBillMoneyRcvd.PolicyPeriod = policyPeriod
      }
    })
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
    WebservicePreconditions.notNull(suspensePayment, "suspensePayment")
    validateSuspensePayment(suspensePayment)
    var suspensePaymentEntity: SuspensePayment
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      suspensePaymentEntity = PaymentReceipts.toEntity(suspensePayment, bundle) as SuspensePayment
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
    if (numNonNull > 1) {
      throw new DataConversionException(displaykey.PaymentAPI.Error.SuspensePaymentMoreThanOneNonNull)
    }
  }

  /**
   * If an account has excess funds to eliminate in part or in whole, the funds are an account adjustment. BillingCenter always records the
   * account adjustment as a BillingCenter transaction, not a charge. If the adjustment amount is greater than the designated/default unapplied fund balance of the
   * given account, only the unapplied balance adjusts. An account adjustment functions like a Negative Writeoff.
   *<P>
   * An example of how this method is used: A dummy account has been set up to temporarily hold mis-allocated funds that are being
   * stored in BillingCenter for the sole purpose of recording them in the General Ledger system.  In this case, funds will be
   * transferred to the dummy accounts, integration code will post the information to the General Ledger system, and
   * finally the funds will be adjusted using this API method.
   *<P>
   * @param accountPublicID  A publicID of an existing account
   * @param adjustment Adjustment amount (must be less than zero)
   * @param policyPeriodPublicID Optional, if non-null, BC tries to adjust the designated unapplied fund for this policy on this account.
   *                             <P>Throws an exception if this doesn't exist
   *                             <P>If this is null, then BC tries to adjust the default unapplied fund of the given account.
   * @return Actual adjustment made, which will be the lesser of the adjustment amount and the designated/default unapplied fund balance on the account.
   */
  @Throws(RequiredFieldException, "If accountPublicID is null")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountPublicID")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodPublicID")
  @Throws(SOAPException, "If the adjustment amount is non-negative, if an unappliedfund can't be found for the policyperiod's policy on the account, or if the unappliedfund balance is not greater than zero ")
  function makeAccountAdjustment(accountPublicID: String, adjustmentAmount: MonetaryAmount, policyPeriodPublicID: String): MonetaryAmount {
    if (!adjustmentAmount.IsNegative) {
      throw new SOAPException(displaykey.PaymentAPI.Error.AdjustmentAmountMustBeNegative(adjustmentAmount))
    }
    var account = WebserviceEntityLoader.loadAccount(accountPublicID)
    var unappliedFund = account.DefaultUnappliedFund
    if (policyPeriodPublicID != null) {
      unappliedFund = getUnappliedFundFor(policyPeriodPublicID, account)
    }
    if (!unappliedFund.Balance.IsPositive) {
      throw new SOAPException(displaykey.Webservice.Error.UnappliedFundBalanceMustBePositive(unappliedFund, unappliedFund.Balance))
    }
    var accountAdjustment: AccountAdjustment
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      unappliedFund = bundle.add(unappliedFund)
      accountAdjustment = unappliedFund.makeAdjustment(adjustmentAmount)
    })
    return accountAdjustment.Amount
  }

  /**
   * Reverses a Direct Bill payment
   *
   * @param directBillMoneyRcvdID The id of the DirectBillMoneyRcvd to be reversed
   * @param paymentReversalReason the reason for the reversal
   */
  @Throws(BadIdentifierException, "If directBillMoneyRcvdID does not correspond to a valid payment")
  function reverseDirectBillPayment(directBillMoneyRcvdID: String, paymentReversalReason: PaymentReversalReason) {
    WebservicePreconditions.notNull(directBillMoneyRcvdID, "directBillMoneyRcvdID")
    var dbmr = gw.api.database.Query.make(entity.DirectBillMoneyRcvd).compare("PublicID", Equals, directBillMoneyRcvdID).select().getAtMostOneRow()
    if (dbmr == null) {
      throw new BadIdentifierException(displaykey.PaymentAPI.Error.DirectBillPaymentNotFound(directBillMoneyRcvdID))
    }
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      dbmr = bundle.add(dbmr)
      if (dbmr.BaseDist != null) {
        dbmr.BaseDist.reverse(paymentReversalReason)
      } else {
        dbmr.reverse(paymentReversalReason)
      }
    }
    )
  }

  /**
   * Make payment to producer unapplied
   * @param agencyPaymentReceipt: details of the payment
   * @return the new unapplied amount of the producer
   */
  @Throws(RequiredFieldException, "if the agencyPaymentReceipt fields ProducerID, PaymentInstrumentRecord, or Amount is null")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer ID.")
  @Throws(DataConversionException, "if agencyPaymentReceipt.Amount is null")
  function payToProducerUnapplied(agencyPaymentReceipt: PaymentReceiptRecord): String {
    validateAgencyPaymentReceipt(agencyPaymentReceipt)
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var money = PaymentReceipts.toEntity(agencyPaymentReceipt, bundle) as AgencyBillMoneyRcvd
      money.execute()
    })
    var producer = WebserviceEntityLoader.loadProducer(agencyPaymentReceipt.ProducerID)
    return producer.UnappliedAmount as java.lang.String
  }

  /**
   * Return the Unapplied Balance of the specified Producer
   * @param producerID PublicID of the Producer who's Unapplied balance will be returned
   */
  @Throws(RequiredFieldException, "if the producerID is null")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer ID.")
  function getProducerUnapplied(producerID: String): MonetaryAmount {
    var producer = WebserviceEntityLoader.loadProducer(producerID)
    return producer.UnappliedAmount
  }

  /**
   * Writeoff the given amount to the Producer's Unapplied balance.
   * @param producerID PublicID of the Producer whose Unapplied Balance will be written off
   * @param amount Amount to be written off
   * @return the producer's writeoff expense balance after the writeoff.
   */
  @Throws(RequiredFieldException, "if the producerID is null")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer ID.")
  function writeoffProducerUnapplied(producerID: String, writeoffAmount: MonetaryAmount): MonetaryAmount {
    var newWriteoffExpense: MonetaryAmount
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var producer = bundle.add(WebserviceEntityLoader.loadProducer(producerID))
      var prodWriteoffContainer = new WriteOffFactory(bundle).createProducerWriteOff(producer)
      var uiWriteoffCreation = new UIWriteOffCreation(prodWriteoffContainer)
      uiWriteoffCreation.Amount = writeoffAmount
      uiWriteoffCreation.doWriteOff()
      newWriteoffExpense = producer.WriteoffExpenseBalance
    })
    return newWriteoffExpense
  }

  /**
   * Makes an Agency Payment and distributes it according to the DistributionItemRecords that are passed in. A DistributionItemRecord represents
   * the DistItem that will be created for a given InvoiceItem and how much gross and commission to allocate to it.  The Agency Payment will be
   * distributed and executed.
   * Optionally, a producer writeoff can be executed if the net amount of the payment does not match the amount distributed.  If the amount to write
   * off exceeds the producer's writeoff threshold, an activity is created to notify the account rep and the payment is allowed to go through without
   * the writeoff.
   *
   * @param agencyPaymentReceipt details of the payment
   * @param distributionItemRecord[] An array of DistributionItemRecords that represent the DistItems that are to be created, specifying how much
   * Gross and Commission to distribute to each InvoiceItem
   * @param attemptProducerWriteoff If this flag is true, the difference between the payment amount and the net distribution amount will attempt
   * to be written off.  If false, the difference will go into producer unapplied.
   */
  @Throws(RequiredFieldException, "If the agencyPaymentReceipt fields ProducerID, PaymentInstrumentRecord, or Amount is null")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer ID")
  @Throws(DataConversionException, "If agencyPaymentReceipt.Amount is null")
  function makeAgencyBillPayment(agencyPaymentReceipt: PaymentReceiptRecord, distributionRecords: DistributionItemRecord[], attemptProducerWriteoff: boolean): String {
    validateAgencyPaymentReceipt(agencyPaymentReceipt)
    var money: AgencyBillMoneyRcvd
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      money = PaymentReceipts.toEntity(agencyPaymentReceipt, bundle) as AgencyBillMoneyRcvd
      var moneySetup = AgencyBillMoneySetupFactory.createEditingPaymentMoney(money, bundle)
      moneySetup.setPrefill(AgencyCycleDistPrefill.TC_ZERO)
      var distribution = moneySetup.prepareDistribution()
      distributeAccordingToDistItemRecords(distribution, distributionRecords)
      if (attemptProducerWriteoff) {
        var amountToWriteOff = getAmountToWriteOff(distribution)
        var producerWriteoffThreshold = distribution.Producer.AgencyBillPlan.ProducerWriteoffThreshold
        if (amountToWriteOff.abs().compareTo(producerWriteoffThreshold) > 0) {
          createWriteoffActivity(distribution.Producer, amountToWriteOff, bundle)
        } else {
          distribution.WriteOffAmount = amountToWriteOff
        }
      }
      distribution.execute()
    })
    return money.PublicID
  }

  /**
   * Makes an Agency Payment and distributes to all Unsettled InvoiceItems belonging to the specified PolicyPeriod.  Money is distributed via the
   * IAgencyCycleDist plugin's implementation of distributeGrossAndCommission.
   * Optionally, a producer writeoff can be executed if the net amount of the payment does not match the amount distributed.  If the amount to write
   * off exceeds the producer's writeoff threshold, an activity is created to notify the account rep and the payment is allowed to go through without
   * the writeoff.
   *
   * @param agencyPaymentReceipt details of the payment
   * @param policyPeriodID PublicID of the PolicyPeriod for which we want to make the payment.
   * @param grossAmount the Gross Amount of money to be distributed among the PolicyPeriod's InvoiceItems
   * @param commissionAmount the CommissionAmount of money to be distributed among the PolicyPeriod's InvoiceItems
   * @param attemptProducerWriteoff If this flag is true, the difference between the payment amount and the net distribution amount will attempt
   * to be written off.  If false, the difference will go into producer unapplied.
   */
  function makeAgencyBillPaymentToPolicyPeriod(agencyPaymentReceipt: PaymentReceiptRecord, policyPeriodID: String, netAmountToDistribute: MonetaryAmount, attemptProducerWriteoff: boolean): String {
    validateAgencyPaymentReceipt(agencyPaymentReceipt)
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodID)
    var invoiceItems = policyPeriod.InvoiceItemsWithoutOffsetsOrCommissionRemainderSortedByEventDate.where(\item -> item.GrossUnsettledAmount.IsNotZero || item.UnsettledCommission.IsNotZero)
    var money: AgencyBillMoneyRcvd
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      money = PaymentReceipts.toEntity(agencyPaymentReceipt, bundle) as AgencyBillMoneyRcvd
      var moneySetup = AgencyBillMoneySetupFactory.createEditingPaymentMoney(money, bundle)
      moneySetup.setPrefill(AgencyCycleDistPrefill.TC_ZERO)
      var distribution = moneySetup.prepareDistribution()
      distribution.addInvoiceItems(invoiceItems)
      var agencyCycleDistPlugin = Plugins.get(gw.plugin.agencybill.IAgencyCycleDist)
      agencyCycleDistPlugin.distributeNetAmount(distribution.DistItemsList, netAmountToDistribute)
      if (attemptProducerWriteoff) {
        var amountToWriteOff = getAmountToWriteOff(distribution)
        var producerWriteoffThreshold = distribution.Producer.AgencyBillPlan.ProducerWriteoffThreshold
        if (amountToWriteOff.abs().compareTo(producerWriteoffThreshold) > 0) {
          createWriteoffActivity(distribution.Producer, amountToWriteOff, bundle)
        } else {
          distribution.WriteOffAmount = amountToWriteOff
        }
      }
      distribution.execute()
    })
    return money.PublicID
  }

  /**
   * Makes a payment to an Account or to a specific Invoice on an Account. If no invoiceID is passed in, the payment
   * will be distributed to the invoices of the Account using standard payment distribution.
   * <p/>
   * If a non-null invoiceID parameter is passed in, the payment will be targeted at that specific Invoice.
   * <p/>
   * @param directbillPaymentReceipt A PaymentReceiptRecord of subtype DirectBillMoneyDetails
   * @param invoiceID The Invoice to make the payment to
   * @return directBillMoneyRcvdID The PublicID of the payment that is created
   */
  @Throws(RequiredFieldException, "If the directbillPaymentReceipt fields AccountID, PaymentInstrumentRecord, or Amount is null")
  function makeDirectBillPaymentToInvoice(directbillPaymentReceipt: PaymentReceiptRecord, invoiceID: String): String {
    validateDirectBillPaymentReceipt(directbillPaymentReceipt)
    var directBillMoneyRcvd: DirectBillMoneyRcvd
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var account = bundle.add(WebserviceEntityLoader.loadAccount(directbillPaymentReceipt.AccountID))
      var unappliedFund = account.DefaultUnappliedFund
      var invoice = null as Invoice
      var isTargetedToInvoice = false
      if (invoiceID != null) {
        isTargetedToInvoice = true
        invoice = bundle.add(WebserviceEntityLoader.loadInvoice(invoiceID))
        unappliedFund = invoice.InvoiceStream.UnappliedFund
      }
      var directBillMoneyDetails = PaymentReceipts.toEntity(directbillPaymentReceipt, bundle)
      directBillMoneyRcvd =
          DirectBillPaymentFactory.createAndExecuteMoneyReceivedFromPaymentReceipt(unappliedFund,
              directBillMoneyDetails as DirectBillMoneyDetails,
              directbillPaymentReceipt.ReceivedDate,
              directbillPaymentReceipt.Description)
      if (isTargetedToInvoice) {
        directBillMoneyRcvd.Invoice = invoice
      }
    })
    return directBillMoneyRcvd.PublicID
  }

  //--------------------------- Private functions -----------------------

  private function distributeAccordingToDistItemRecords(distribution: AgencyCyclePayment, distributionRecords: DistributionItemRecord[]) {
    var invoiceItemIDs = distributionRecords.map(\d -> d.InvoiceItemID)
    var invoiceItems = WebserviceEntityLoader.loadInvoiceItems(invoiceItemIDs)
    distribution.addInvoiceItems(invoiceItems)
    var map = mapInvoiceItemPublicIDToDistItem(distribution.DistItems)
    distributionRecords.each(\record -> {
      var distItem = map.get(record.InvoiceItemID)
      distItem.GrossAmountToApply = record.GrossAmount
      distItem.CommissionAmountToApply = record.CommissionAmount
      distItem.Disposition = record.Disposition
    })
  }

  private function mapInvoiceItemPublicIDToDistItem(distItems: BaseDistItem[]): Map <String, BaseDistItem> {
    return distItems.partitionUniquely(\distItem -> distItem.InvoiceItem.PublicID)
  }

  private function validateAgencyPaymentReceipt(agencyPaymentReceipt: PaymentReceiptRecord) {
    WebservicePreconditions.notNull(agencyPaymentReceipt.ProducerID, "agencyPaymentReceipt.ProducerID")
    validatePaymentReceipt(agencyPaymentReceipt, "agencyPaymentReceipt")
  }

  private function validateDirectBillPaymentReceipt(directbillPaymentReceipt: PaymentReceiptRecord) {
    WebservicePreconditions.notNull(directbillPaymentReceipt.AccountID, "directbillPaymentReceipt.AccountID")
    validatePaymentReceipt(directbillPaymentReceipt, "directbillPaymentReceipt")
  }

  private function validatePaymentReceipt(paymentReceipt: PaymentReceiptRecord, fieldName: String) {
    WebservicePreconditions.notNull(paymentReceipt.PaymentInstrumentRecord, "${fieldName}.PaymentInstrumentRecord")
    WebservicePreconditions.notNull(paymentReceipt.MonetaryAmount, "${fieldName}.Amount")
  }

  private function createWriteoffActivity(producer: Producer, amountToWriteOff: MonetaryAmount, bundle: Bundle) {
    var activity = new Activity(bundle)
    activity.ActivityPattern = ActivityPatternsUtil.getActivityPattern("attemptedwriteoff")
    activity.Description = displaykey.Activity.AttemptedWriteoff.Description(producer.DisplayName, amountToWriteOff)
    if (producer.AccountRep != null) {
      activity.assignUserAndDefaultGroup(producer.AccountRep)
    } else {
      activity.assignUserByRoundRobin(true, CurrentUserUtil.getCurrentUser().User.RootGroup)
    }
  }

  // should be the same calculation as the UI uses

  private function getAmountToWriteOff(distribution: AgencyCyclePayment): MonetaryAmount {
    return distribution.Amount.subtract(distribution.DistributedAmountForUnexecutedDist.add(distribution.NetSuspenseAmountForSavedOrExecuted)).negate()
  }

  private function getUnappliedFundFor(policyPeriodPublicID: String, account: Account): UnappliedFund {
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var unappliedFund = policyPeriod.Policy.getDesignatedUnappliedFund(account)
    if (unappliedFund == null) {
      throw new SOAPException(displaykey.Webservice.Error.NoUnappliedFundOnPolicyForAccount(policyPeriod, account))
    }
    return unappliedFund
  }
}
