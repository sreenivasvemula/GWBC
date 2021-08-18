package gw.webservice.bc.bc700
uses com.google.common.base.Preconditions
uses gw.api.webservice.exception.DataConversionException
uses gw.api.web.accounting.WriteOffFactory
uses gw.api.web.accounting.UIWriteOffCreation
uses gw.pl.currency.MonetaryAmount
uses java.math.BigDecimal

@RpcWebService
@Export
class IPaymentAPI extends APITestBase {
  construct() {
  }
  
  /**
   * Make payment to producer unapplied
   * @param moneyDetails: details of the payment
   * @param producerID: public ID of an existing producer
   * @return the new unapplied amount of the producer
   */
  @Throws(DataConversionException, "Amount cannot be negative")
  function payToProducerUnapplied(producerID : String, moneyDetails : NewAgencyMoneyDetails) : BigDecimal{
    require(producerID, "producerID")
    require(moneyDetails.PaymentInstrument, "PaymentInstrument")
    require(moneyDetails.Amount, "Amount")
    require(moneyDetails.Producer, "Producer")
    Preconditions.checkState(moneyDetails.Producer.PublicID == producerID)
    if (!moneyDetails.Amount.IsPositive) {
      throw new DataConversionException("Amount " + moneyDetails.Amount + " not accepted.  Amount must be positive");
    }
    var newUnappliedAmount = BigDecimal.ZERO
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var producer = loadProducer( producerID )
      moneyDetails.Producer = producer
      var moneySetup = moneyDetails.createMoneySetupFromMoneyDetails(bundle)
      moneySetup.Money.execute()
      newUnappliedAmount = moneySetup.Producer.UnappliedAmount.Amount
    })

    return newUnappliedAmount
  }
  
  /**
   * Make payment to producer unapplied
   * @param producerID: public ID of an existing producer
   * @return producer unapplied
   */
  function getProducerUnapplied(producerID : String) : BigDecimal{
    require(producerID, "producerID")
    var producer = gw.api.database.Query.make(Producer).compare("PublicID", Equals, producerID).select().getAtMostOneRow()
    return producer.UnappliedAmount.Amount
  }

  /**
   * Create an agency cycle payment with an Agency Money Received
   * @param moneyDetails: details of the payment
   * @return new agency cycle payment
   */
  function createAgencyPayment(moneyDetails : NewAgencyMoneyDetails, statementID : String,
      grossAmounts : BigDecimal[], commissionAmounts : BigDecimal[]) {
    require(statementID, "StatementID")
    require(moneyDetails.PaymentInstrument, "PaymentInstrument")
    require(moneyDetails.Amount, "Amount")
    require(moneyDetails.Producer, "Producer")

    if (!moneyDetails.Amount.IsPositive) {
      throw new DataConversionException("Amount " + moneyDetails.Amount 
        + " not accepted.  Amount must be positive");
    }

    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var statement = gw.api.database.Query.make(StatementInvoice).compare("PublicID", Equals, statementID).select().getAtMostOneRow()
      statement = bundle.add(statement)
      Preconditions.checkState(moneyDetails.Producer.PublicID == statement.AgencyBillCycle.Producer.PublicID)

      var producerID = moneyDetails.Producer.PublicID
      var producer = loadProducer(producerID)
      moneyDetails.Producer = producer
      var moneySetup = moneyDetails.createMoneySetupFromMoneyDetails(bundle)
      moneySetup.addDistributeToStatements({statement})

      var payment = moneySetup.prepareDistribution()

      // fill in payment items
      if(payment.DistItems.length != grossAmounts.length){
        throw new DataConversionException("Number of gross amounts: " + grossAmounts.length 
          + " must be equals to number of invoice items: " + payment.DistItems.length);
      }
      if(payment.DistItems.length != commissionAmounts.length){
        throw new DataConversionException("Number of commission amounts: " + commissionAmounts.length 
          + " must be equals to number of invoice items: " + payment.DistItems.length);
      }
      var currency = moneyDetails.Amount.Currency
      for(paymentItem in payment.DistItems index i){
        paymentItem.GrossAmountToApply = grossAmounts[i].ofCurrency(currency)
        paymentItem.CommissionAmountToApply = commissionAmounts[i].ofCurrency(currency)
      }
      payment.execute()
    })
  }

  /**
   * Make producer writeoff
   * @param producerID: public ID of an existing producer
   * @param writeoffAmount: amount to writeoff
   * @return producer writeoff expense
   */
  function writeoffProducer(producerID : String, writeoffAmount : BigDecimal) : BigDecimal{
    require(producerID, "producerID")
    var newWriteoffExpense = BigDecimal.ZERO
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var producer = bundle.add(loadProducer( producerID ))
      var prodWriteoffContainer = new WriteOffFactory(bundle).createProducerWriteOff(producer)
      var uiWriteoffCreation = new UIWriteOffCreation(prodWriteoffContainer)
      uiWriteoffCreation.Amount = writeoffAmount.ofCurrency(producer.Currency)
      uiWriteoffCreation.doWriteOff()
      newWriteoffExpense = producer.WriteoffExpenseBalance.Amount
    })
    return newWriteoffExpense
  }
  
  /**
   * Make payment to producer unapplied and look for the first billed statement which has
   * the net owned amount match the amount paid. If there is a match, will distribute the amount
   * to that statement. The amount is considered matched if it within the producer writeoff
   * threshold, and the different amount will be writeoff
   *
   * @param moneyDetails: details of the payment
   * @param producerID: public ID of an existing producer
   * @return invoice statement paid
   */
  @Throws(DataConversionException, "Amount cannot be negative")
  function payToFirstOpenStatement(producerID : String, moneyDetails : NewAgencyMoneyDetails) : String {
    require(producerID, "producerID")
    require(moneyDetails.PaymentInstrument, "PaymentInstrument")
    require(moneyDetails.Amount, "Amount")
    require(moneyDetails.Producer, "Producer")
    Preconditions.checkState(moneyDetails.Producer.PublicID == producerID)
    if (!moneyDetails.Amount.IsPositive) {
      throw new DataConversionException("Amount " + moneyDetails.Amount + " not accepted.  Amount must be positive");
    }
    var producer = loadProducer( producerID )
    moneyDetails.Producer = producer
    var amountPaying = moneyDetails.Amount.Amount
    var threshold = producer.AgencyBillPlan.ProducerWriteoffThreshold.Amount
    var max = amountPaying.add( threshold )
    var min = amountPaying.subtract( threshold )
    var cycle = producer.AgencyBillCyclesSortedByStatementDate
      .firstWhere( \ a -> (a.StatementInvoice.Status == InvoiceStatus.TC_BILLED
        or a.StatementInvoice.Status == InvoiceStatus.TC_DUE)
        and a.StatementInvoice.NetAmountDue.Amount < max
        and a.StatementInvoice.NetAmountDue.Amount > min )

    var statementNumber = "";
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var moneySetup = moneyDetails.createMoneySetupFromMoneyDetails(bundle)
      moneySetup.setPrefill(typekey.AgencyCycleDistPrefill.TC_UNPAID)

      if(cycle != null){
        moneySetup.addDistributeToStatements({cycle.StatementInvoice})
        var payment = moneySetup.prepareDistribution()
        payment.WriteOffAmount = cycle.StatementInvoice.NetAmountDue - moneySetup.Money.Amount
        statementNumber = cycle.StatementInvoice.InvoiceNumber
        payment.execute()
      }else{
        moneySetup.Money.execute()
      }
    })
    return statementNumber
  }
  
  private function getNetDueAmount(payment : AgencyCyclePayment, statementInvoice : StatementInvoice) : MonetaryAmount {
    var netAmountUnpaid = statementInvoice.NetAmountDue
    if (payment.Modifying) {
      var paymentToModify = payment.DistBeingModified as AgencyCyclePayment
      netAmountUnpaid = netAmountUnpaid + paymentToModify.NetDistributedAmountForSavedOrExecuted
      for (paymentItem in paymentToModify.DistItems) {
        netAmountUnpaid = netAmountUnpaid + paymentItem.GrossAmountWrittenOff - paymentItem.CommissionAmountWrittenOff
      }
    }

    return netAmountUnpaid
  }
}
