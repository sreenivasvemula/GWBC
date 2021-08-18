package libraries
uses gw.api.database.Query
uses gw.api.database.IQueryBeanResult

@Export
enhancement ProducerExt : Producer
{
  function getFutureStatementsSortedByDate() : StatementInvoice[] {
    return this.AgencyBillCycles
      .where( \ a -> a.StatementInvoice.Status == InvoiceStatus.TC_PLANNED )
      .sortBy( \ a -> a.StatementInvoice.EventDate )
      *.StatementInvoice
  }

  /**
   * @return All the promises made by this producer that have ever been executed (includes promises that have been
   * reversed.
   */
  public property get ExecutedPromises() : IQueryBeanResult<AgencyCyclePromise> {
    return Query<AgencyCyclePromise>.make(AgencyCyclePromise)
      .join("BaseMoneyReceived")
      .compare("AppliedDate", NotEquals, null) // executed
      .cast(PromisedMoney.Type)
      .compare("PromisingProducer", Equals, this)
      .select()
  }

  /**
   * @return All the promises made by this producer that have yet to be executed.
   */
  public property get SavedPromises() : IQueryBeanResult<AgencyCyclePromise> {
    return Query<AgencyCyclePromise>.make(AgencyCyclePromise)
      .compare("DistributedDate", Equals, null) // saved
      .compare("ReversalDate", Equals, null) // not reversed
      .join("BaseMoneyReceived")
      .cast(PromisedMoney.Type)
      .compare("PromisingProducer", Equals, this)
      .select()
  }

  /**
   * @return All the credit distributions made by this producer that have ever been executed (includes credit
   * distributions that have been reversed.
   */
  public property get ExecutedCreditDistributions() : IQueryBeanResult<AgencyCyclePayment> {
    return Query<AgencyCyclePayment>.make(AgencyCyclePayment)
      .join("BaseMoneyReceived")
      .compare("AppliedDate", NotEquals, null) // executed
      .cast(ZeroDollarAMR.Type)
      .compare("Producer", Equals, this)
      .select()
  }

  /**
   * @return All the payments made by this producer that have yet to be executed.
   */
  public property get SavedPayments() : IQueryBeanResult<AgencyCyclePayment> {
    return Query<AgencyCyclePromise>.make(AgencyCyclePayment)
      .compare("DistributedDate", Equals, null) // saved
      .compare("ReversalDate", Equals, null) // not reversed
      .join("BaseMoneyReceived")
      .cast(AgencyBillMoneyRcvd.Type)
      .compare("Producer", Equals, this)
      .select()
  }
}
