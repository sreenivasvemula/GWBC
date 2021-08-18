package libraries

uses gw.api.database.DBFunction
uses gw.api.database.Query
uses gw.api.database.QueryBeanResultWithSummary
uses gw.pl.currency.MonetaryAmount
uses gw.pl.persistence.core.Key
uses gw.util.Pair

uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.List
uses java.util.Map

@Export
enhancement ProducerStatementExt : entity.ProducerStatement {

  function getItemEventsWithAggregation(aggregation : PolicyActivityAggType, policyNumber : String)
      : List<Map<String, Object>> {
    return (aggregation == TC_CHARGE)
        ? getItemEventsGroupedByCharge(policyNumber)
        : getItemEventsUngrouped(policyNumber)
  }

  property get NumberOfReversalTransactionsWithoutItemEvents() : int {
    return TransactionsWithoutItemEventsQuery
      .compare("ReversedTransaction", NotEquals, null)
      .select()
      .Count
  }

  property get NumberOfItemEvents() : int {
    return OldItemEventsQuery.select().Count
  }

  property get TransactionsWithoutItemEvents() : QueryBeanResultWithSummary<PolicyCmsnPayable, Map<String, BigDecimal>> {
    var q = TransactionsWithoutItemEventsQuery
    final var sumQ = TransactionsWithoutItemEventsQuery
    final var sumRes = sumQ.select(\ row -> ({
        "producerTransaction.PayableAmount" -> DBFunction.Sum(row.Amount_amt)
    }))
    final var valueMapper = new QueryBeanResultWithSummary.ValueMapper<Map<String, BigDecimal>>() {
      override
      function extractValue(summaryResult : Map<String, BigDecimal>, path : String) : java.lang.Number {
        return summaryResult.get(path)
      }

      override
      function extractCurrency(summaryResult : Map<String, BigDecimal>, valuePath : String): Currency {
        return null
      }
    }

    return new QueryBeanResultWithSummary<PolicyCmsnPayable, Map<String, BigDecimal>>(
        q.select(), sumRes, valueMapper)
  }

  function getItemEventsUngrouped(policyNumber : String)
      : List<Map<String, Object>> {
    final var query = getItemEventsQuery(policyNumber, false, false)

    final var transactionEarningTypes = lookupTransactionPayableCriteria(query)
    final var accountNames = lookupAccountInvoiceAccountNames(query)
    final var results = query.select(\ row ->
        new HashMap<String, Object>() {

            "EventID" -> row.ID,

            "EarningType" -> getEarningType(
                transactionEarningTypes.get(row.Transaction.ID), row.EventType),

            "EventDate" -> row.EventDate,

            "RelatedAccount" ->
                accountNames.get(row.InvoiceItem.Invoice.ID)?.AccountDisplayName,

            "RelatedPolicyPeriod" -> policyNumber,

            "ChargeName" -> getChargeDisplayName(
                row.InvoiceItem.Charge.ChargePattern.ChargeName,
                row.InvoiceItem.Charge.ChargeGroup),

            "ItemType" -> row.InvoiceItem.Type == TC_INSTALLMENT
                ? InvoiceItemType.TC_INSTALLMENT.DisplayName + " "
                    + row.InvoiceItem.InstallmentNumber
                : row.InvoiceItem.Type,

            "Basis" -> row.InvoiceItem.Amount,

            "CommissionPercentage" -> row.InvoiceItem.Amount_amt == 0bd
                ? 0
                : calculateCommissionPercentage(
                    row.Transaction.Amount, row.InvoiceItem.Amount),
            "CommissionAmount" -> row.EventType == TC_COMMISSIONMOVEDTO
                ? -row.Transaction.Amount : row.Transaction.Amount
        })

    // See JIRA PL-10899
    return results.toList()
  }

  function getItemEventsGroupedByCharge(policyNumber : String)
      : List<Map<String, Object>> {
    final var query = getItemEventsQuery(policyNumber, false, true)

    final var accountNames = lookupPolTAcctAccountNames(query)
    final var results = query.select(\ row ->
        new HashMap<String, Object>() {

            "ChargeID" -> row.InvoiceItem.Charge.ID,

            "EventDate" -> row.InvoiceItem.Charge.ChargeDate,

            "RelatedAccount" ->
                accountNames.get(row.InvoiceItem.Charge.TAccountContainer.ID)
                    ?.AccountDisplayName,
            "RelatedPolicyPeriod" -> (row.InvoiceItem.Charge.TAccountContainer typeis PolTAcctContainer)
                ? policyNumber : null,

            "ChargeName" -> getChargeDisplayName(
                row.InvoiceItem.Charge.ChargePattern.ChargeName,
                row.InvoiceItem.Charge.ChargeGroup),

            "Basis" -> row.InvoiceItem.Charge.Amount,

            "CommissionAmount" ->
                DBFunction.Sum(row.Transaction.Amount_amt).ofCurrency(this.Currency),
            "CommissionPercentage" -> calculateCommissionPercentage(
                DBFunction.Sum(row.Transaction.Amount_amt).ofCurrency(this.Currency),
                row.InvoiceItem.Charge.Amount)
        })

    // See JIRA PL-10899
    return results.toList()
  }

  function resendStatement() {
    // no base implementation.
  }

  private property get TransactionsWithoutItemEventsQuery() : Query<PolicyCmsnPayable> {
    var transactions = Query.make(PolicyCmsnPayable)
    transactions.subselect("ID", CompareNotIn, Query.make(ItemEvent), "Transaction")
    transactions.join(ProducerContext.Type, "Transaction")
      .compare("Statement", Equals, this)
    return transactions
  }

  function getItemEvents(policyNumber : String, isPartialSearch : boolean)
      : List<Map<String, Object>> {
    var query = getItemEventsQuery(policyNumber, isPartialSearch, true)
    var results = query.select(\ row ->
        new HashMap<String, Object>() {
            "PolicyNumber" -> row.PolicyCommission.PolicyPeriod.PolicyNumberLong,

            "NumberEarned" -> DBFunction.Count(row.PolicyCommission.PolicyPeriod),

            "CommissionAmount" -> DBFunction.Sum(row.Transaction.Amount_amt)
        })

    // See JIRA PL-10899
    return results.toList()
  }

  private function getItemEventsQuery(
          policyNumber : String, isPartialSearch : boolean, grouped : boolean)
      : Query<ItemEvent> {
    var query = Query.make(ItemEvent)
    var itemEventTable = query
    var transactionTable = itemEventTable.join("Transaction")
    var producerTransactionTable = transactionTable.cast( ProducerTransaction)
    var producerContextTable = producerTransactionTable.join("ProducerContext")
    producerContextTable.compare("Statement", Equals, this)
    var policyCommissionTable = itemEventTable.join("PolicyCommission")
    var policyPeriodTable = policyCommissionTable.join("PolicyPeriod")
    if (grouped) {
      restrictByItemEventTypeForGrouping(query)
    } else {
      restrictByItemEventTypeForNoGrouping(query)
    }
    if (policyNumber != null) {
      if (!isPartialSearch) {
        policyPeriodTable.compare("PolicyNumberLong", Equals, policyNumber)
      } else {
        policyPeriodTable.startsWith("PolicyNumberLong", policyNumber, true)
      }
    }
    return query
  }

  // Ignoring ItemEventType.TC_COMMISSIONMOVEDFROM and ItemEventType.TC_COMMISSIONMOVEDTO here as they offset each other
  private function restrictByItemEventTypeForGrouping(itemEventQuery : Query<ItemEvent>) {
    itemEventQuery.compareIn("EventType",
        new ItemEventType[] {ItemEventType.TC_EARNED})
  }

  private function restrictByItemEventTypeForNoGrouping(itemEventQuery : Query<ItemEvent>) {
    itemEventQuery.compareIn("EventType",
        new ItemEventType[] {TC_EARNED, TC_COMMISSIONMOVEDFROM, TC_COMMISSIONMOVEDTO})
  }

  private property get OldItemEventsQuery() : Query<ItemEvent> {
    var query = Query.make( ItemEvent)
    var itemEventTable = query
    var transactionTable = itemEventTable.join("Transaction")
    var producerTransactionTable = transactionTable.cast( ProducerTransaction)
    var producerContextTable = producerTransactionTable.subselect("Id", CompareIn, ProducerContext, "Transaction")
    restrictByItemEventTypeForNoGrouping(itemEventTable)
    producerContextTable.compare( "Statement", Equals, this )
    return query
  }

  private function
  getEarningType(payableCriteria : PayableCriteria, eventType : ItemEventType)
      : String {
    return payableCriteria != null
        ? eventType.DisplayName + " (" + payableCriteria.DisplayName + ")"
        : eventType.DisplayName
  }

  /**
   * Look up the {@link ReserveCmsnEarned} transaction {@link PayableCriteria}
   *   value for those associated with the {@link ItemEvent}s identified by the
   *   specified query.
   *
   * @param itemEventQuery the {@link ItemEvent} query source.
   * @return A map of the {@link ReserveCmsnEarned} identifier keys to each
   *    associated {@link PayableCriteria}.
   */
  private function
  lookupTransactionPayableCriteria(itemEventQuery : Query<ItemEvent>)
      : Map<Key, PayableCriteria> {
    final var transactionQry = Query.make(ReserveCmsnEarned)
    transactionQry.subselect("ID", CompareIn, itemEventQuery, "Transaction")
    return transactionQry
      .select(\ row ->
        new Pair<Key, PayableCriteria>(row.ID, row.ProducerContext.PayableCriteria))
      .partitionUniquely(\ entryPair -> entryPair.First)
      .mapValues(\ pair -> pair.Second)
  }

  /**
   * Look up the {@link AccountInvoice} {@link Account} name values for those
   *   associated with the {@link ItemEvent}s identified by the specified query.
   *
   * @param itemEventQuery the {@link ItemEvent} query source.
   * @return A map of the {@link AccountInvoice} identifier keys to a map of
   *    each associated {@link Account} name values.
   */
  private function
  lookupAccountInvoiceAccountNames(itemEventQuery: Query<ItemEvent>)
      : Map<Key, AccountNames> {
    final var invoiceItemQry = Query.make(InvoiceItem)
    invoiceItemQry.subselect("ID", CompareIn, itemEventQuery, "InvoiceItem")
    final var invoiceQry = Query.make(AccountInvoice)
    invoiceQry.subselect("ID", CompareIn, invoiceItemQry, "Invoice")
    return invoiceQry
      .select(\ row -> new AccountNames(row.ID,
          row.Account.AccountNameKanji != null
              ? row.Account.AccountNameKanji : row.Account.AccountName,
          row.Account.AccountNumber))
      .partitionUniquely(\ accountNames -> accountNames.ContainerID)
  }

  /**
   * Look up the {@link PolTAcctContainer} {@link Account} name values for those
   *   associated with the {@link ItemEvent}s identified by the specified query.
   *
   * @param itemEventQuery the {@link ItemEvent} query source.
   * @return A map of the {@link PolTAcctContainer} identifier keys to a map of
   *    each associated {@link Account} name values.
   */
  private function lookupPolTAcctAccountNames(itemEventQuery : Query<ItemEvent>)
      : Map<Key, AccountNames> {
    final var invoiceItemQry = Query.make(InvoiceItem)
    invoiceItemQry.subselect("ID", CompareIn, itemEventQuery, "InvoiceItem")
    final var chargeQry = Query.make(Charge)
    chargeQry.subselect("ID", CompareIn, invoiceItemQry, "Charge")
    final var tAcctContainerQry = Query.make(PolTAcctContainer)
    tAcctContainerQry.subselect("ID", CompareIn, chargeQry, "TAccountContainer")
    return tAcctContainerQry
      .select(\ row -> new AccountNames(row.ID,
          row.PolicyPeriod.Policy.Account.AccountNameKanji != null
              ? row.PolicyPeriod.Policy.Account.AccountNameKanji
              : row.PolicyPeriod.Policy.Account.AccountName,
          row.PolicyPeriod.Policy.Account.AccountNumber))
      .partitionUniquely(\ accountNames -> accountNames.ContainerID)
  }

  private function
  getChargeDisplayName(chargeName : String, chargeGroup : String) : String {
    var displayName = chargeName
    if (chargeGroup != null) {
      displayName += " - " + chargeGroup
    }

    return displayName
  }

  private function
  calculateCommissionPercentage(commissionAmount : MonetaryAmount, basis : MonetaryAmount)
      : BigDecimal {
    return (commissionAmount * 100bd).divide(basis, HALF_UP)
  }
}
