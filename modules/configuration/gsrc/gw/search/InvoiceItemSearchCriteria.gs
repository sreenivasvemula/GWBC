package gw.search
uses java.io.Serializable
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.util.DisplayableException
uses gw.api.database.DBFunction
uses gw.api.database.Restriction
uses gw.api.database.GroupingQuery
uses com.google.common.base.Preconditions
uses gw.api.domain.invoice.InvoicePayer
uses gw.api.database.Relop
uses java.util.ArrayList
uses gw.api.database.BooleanExpression

/**
 * Search criteria for invoice items
 */
@Export
class InvoiceItemSearchCriteria implements Serializable {
  
  // If this is an Agency Bill payment, this is the Producer that is doing the paying
  var _payingProducer : Producer as PayingProducer
  // Optional field to specify that we should restrict the results of the query to Invoice Items paid for by this payer
  var _payerProducerName : String as PayerProducerName
  // In the case of an DirectBill payment, the Account that is making the payment
  var _payingAccount : Account as PayingAccount
  // Optional field to specify that we should restrict the results of the query to Invoice Items paid for by this payer
  var _payerAccountNumber : String as PayerAccountNumber
  // True if searching for InvoiceItems with an Account as the payer, false if searching for InvoiceItems with a Producer as the payer
  var _payerIsAnAccount : boolean as PayerIsAnAccount = true
  // Optional field to specify that we should restrict the results of the query to Invoice Items owned by the Account represented by this AccountNumber
  var _ownerAccount : String as OwnerAccount
  // Optional field to specify that we should restrict the results of the query to Invoice Items associated with the policy period represented by this PolicyPeriodNumber
  var _policyPeriod : String as PolicyPeriod
  // Optional field to specify that we should restrict the results of the query to Invoice Items with a Charge having this ChargeGroup
  var _chargeGroup : String as ChargeGroup
  // Optional field to specify that we should restrict the results of the query to Invoice Items with a Charge having this ChargePattern
  var _chargePattern : ChargePattern as ChargePattern
  // Optional field to specify that we should restrict the results of the query to Invoice Items on Invoices with this InvoiceStatus.
  var _billedStatus : InvoiceStatus as BilledStatus
  // Optional field to restrict the results of the query to Invoice Items paid for by this payer, with the name in kanji
  var _payerProducerNameKanji : String as PayerProducerNameKanji
  // True if we should allow items that are fully settled in the results set.  False if we should filter out anything that is fully or oversettled.
  var _includeFullySettledItems : boolean as IncludeFullySettledItems = false
  // True if we should only include items that are on billed or due invoices.
  var _includeOnlyBilledAndDueItems : boolean as IncludeOnlyBilledAndDueItems = false
  // True if the search is for InvoiceItems to be promised as opposed to paid.
  // This is necessary for determining what invoice items are fully settled, as for promise distributions, we will count promised amounts as well as paid amounts towards settled values, but for payment distributions we should only count paid amounts.
  var _distributionTypeIsPromise : boolean as DistributionTypeIsPromise = false

  private var _policyPeriods : PolicyPeriod[]

  /**
   * @param distForItems The Distribution that we intend to add the returned invoice items to.
   *                     Passed in for the purpose of filtering out items that are already on the dist
   * @return An IQueryBeanResult of InvoiceItem beans.
   */
  function performSearch(distForItems : BaseDist) : IQueryBeanResult<InvoiceItem> {
    Preconditions.checkArgument((PayingAccount == null and PayingProducer != null) or (PayingAccount != null and PayingProducer == null))
    var query = populateQueryFromCriteria(distForItems)
    if (OwnerAccount == null) {
      return query.select()
    }
    var unionQuery = filterForOwner(\ -> populateQueryFromCriteria(distForItems))
    return unionQuery.select()
                  .orderBy(\ row -> row.PolicyPeriod.PolicyNumberLong)
                  .thenBy( \ row -> row.Invoice.EventDate)as IQueryBeanResult<InvoiceItem>
  }

  /**
   * @param policyPeriods An optional collection of PolicyPeriods that InvoiceItems must be on in order to be
   *                      included in the results.
   */
  function restrictToInvoiceItemsOnPolicyPeriods(policyPeriods : PolicyPeriod[]) {
    _policyPeriods = policyPeriods
  }

  private function populateQueryFromCriteria(distForItems : BaseDist) : Query<InvoiceItem>{
    var query = new Query<InvoiceItem>(InvoiceItem.Type)
    filterOutItemsNotEarningPrimaryOnThePayingProducer(query)
    filterOutReversedAndReversals(query)
    filterOutNotFullySettledItems(query)
    filterOutItemsAlreadyOnDist(distForItems, query)
    filterOutCommissionRemainderItems(query)
    filterForPayer(query)
    filterForPolicyPeriod(query)
    filterForChargeGroup(query)
    filterForChargePattern(query)
    filterForBilledStatus(query)
    return query
  }
  
  private function filterOutItemsNotEarningPrimaryOnThePayingProducer(query : Query) {
    if (PayingProducer != null) {
      // the items must either have no primary active commission or be earning primary commission on the paying producer
      var noPrimaryActiveItemCommissionSubselect = new Query<ItemCommission>(ItemCommission)
      noPrimaryActiveItemCommissionSubselect.compare(ItemCommission#Active, Equals, true)
            .join(ItemCommission#PolicyCommission)
            .compare(PolicyCommission#Role, Equals, PolicyRole.TC_PRIMARY)
      var activePrimaryItemCommissionEarnsOnPayerProducerSubselect = new Query<ItemCommission>(ItemCommission)
      activePrimaryItemCommissionEarnsOnPayerProducerSubselect.compare(ItemCommission#Active, Equals, true)
            .join(ItemCommission#PolicyCommission)
            .compare(PolicyCommission#Role, Equals, PolicyRole.TC_PRIMARY)
            .join(PolicyCommission#ProducerCode)
            .compare(ProducerCode#Producer, Equals, PayingPayer as Producer)

      query.and(new BooleanExpression<InvoiceItem>() {
        override function execute(andRestriction : Restriction<InvoiceItem>) {
          andRestriction.or(\ orRestriction : Restriction<InvoiceItem> -> {
            // there is either no active primary item commission on the invoice item/
            orRestriction.subselect(InvoiceItem#ID, CompareNotIn, noPrimaryActiveItemCommissionSubselect, ItemCommission#InvoiceItem)
            // or the primary active item commission belongs to the paying producer
            orRestriction.subselect(InvoiceItem#ID, CompareIn, activePrimaryItemCommissionEarnsOnPayerProducerSubselect, ItemCommission#InvoiceItem)
          })
        }
      })
    }
  }

  private function filterForBilledStatus(query : Query) {
    if (PayingProducer != null and IncludeOnlyBilledAndDueItems) {
      query.join(InvoiceItem#Invoice)
           .compareIn(Invoice#Status, {InvoiceStatus.TC_BILLED, InvoiceStatus.TC_DUE} as InvoiceStatus[])
    } else if (BilledStatus != null) {
      query.join(InvoiceItem#Invoice)
           .compare(Invoice#Status, Equals, BilledStatus)
    }
  }

  private function filterForChargePattern(query : Query) {
    if (ChargePattern != null) {
      var chargeTable = query.join(InvoiceItem#Charge)
      chargeTable.compare(Charge#ChargePattern, Equals, ChargePattern)
    }
  }

  private function filterForChargeGroup(query : Query) {
    if (ChargeGroup != null) {
      var chargeTable = query.join(InvoiceItem#Charge)
      chargeTable.startsWith(Charge#ChargeGroup, ChargeGroup, true)
    }
  }

  private function filterForPolicyPeriod(query : Query) {
    if (PayingProducer != null and _policyPeriods != null) {
      query.compareIn(InvoiceItem#PolicyPeriod, _policyPeriods)
    } else if (PolicyPeriod != null) {
      var policyPeriodTable = query.join(InvoiceItem#PolicyPeriod)
      policyPeriodTable.startsWith(entity.PolicyPeriod#PolicyNumberLong, PolicyPeriod, true)
    }
  }

  private function filterForPayer(query : Query<InvoiceItem>) {
    if (PayerIsAnAccount) {
      filterForAccountPayer(query)
    } else {
      filterForProducerPayer(query)
    }
  }

  private property get PayingPayer() : InvoicePayer {
    Preconditions.checkArgument((PayingAccount == null and PayingProducer != null) or (PayingAccount != null and PayingProducer == null))
    return PayingAccount != null ? PayingAccount : PayingProducer
  }

  private property get IsForAgencyBill() : boolean {
    return PayingPayer typeis Producer
  }

  private function filterForProducerPayer(query : Query<InvoiceItem>) {
    if (PayerProducerName == null and PayerProducerNameKanji == null) return
    var invoiceTable = query.join(InvoiceItem#Invoice).cast(StatementInvoice)
    var agencyBillCycleTable = invoiceTable.join(StatementInvoice#AgencyBillCycle)
    var producerTable = agencyBillCycleTable.join(AgencyBillCycle#Producer)
    if (PayerProducerName != null) {
      producerTable.startsWith(Producer#Name, PayerProducerName, true)
    }
    if (PayerProducerNameKanji != null) {
      producerTable.startsWith(Producer#NameKanji, PayerProducerNameKanji, false)
    }
  }

  private function filterForAccountPayer(query : Query<InvoiceItem>) {
    if (PayerAccountNumber == null) return
    var invoiceTable = query.join(InvoiceItem#Invoice).cast(AccountInvoice)
    var accountTable = invoiceTable.join(AccountInvoice#Account)
    accountTable.startsWith(Account#AccountNumber, PayerAccountNumber, true)
  }

  private function filterOutItemsAlreadyOnDist(distForItems : BaseDist, query : Query<InvoiceItem>) {  
    if (distForItems != null ) {
      var itemsAlreadyOnDist = distForItems.DistItems.map(\ distItem -> distItem.InvoiceItem)
      if (distForItems.DistItems.HasElements and distForItems.DistItems.length <= 2000) {
        // filter out items that are already on this payment
        query.compareNotIn(InvoiceItem#ID, itemsAlreadyOnDist.map( \ item -> item.ID))
      } else if (distForItems.DistItems.HasElements) {
        if (PolicyPeriod == null) {
          throw new DisplayableException(displaykey.Java.InvoiceItem.SearchValidation)
        } else {
          var itemsOnDistAndPolicyPeriod = new ArrayList<InvoiceItem>() {}
          for (invoiceItem in itemsAlreadyOnDist) {
            if (invoiceItem.PolicyPeriod.PolicyNumberLong == PolicyPeriod) {
              itemsOnDistAndPolicyPeriod.add(invoiceItem)
            }
          }
          query.compareNotIn(InvoiceItem#ID, itemsOnDistAndPolicyPeriod.map( \ item -> item.ID) as Key[])
        }
      }
    } 
  }

  private function filterOutCommissionRemainderItems(query : Query<InvoiceItem>) {
    query.compare(InvoiceItem#Type, NotEquals, InvoiceItemType.TC_COMMISSIONREMAINDER)
  }

  protected function filterOutNotFullySettledItems(query : Query<InvoiceItem>) {
    if (not IncludeFullySettledItems) {
      if (IsForAgencyBill) {
        if (DistributionTypeIsPromise) {
          query.compare(InvoiceItem#CanBePromisedMoreByAgencyBill, Relop.Equals, Boolean.TRUE)
        } else {
          query.compare(InvoiceItem#CanBePaidMoreByAgencyBill, Relop.Equals, Boolean.TRUE)
        }
      } else {
        query.and(\ andRestriction : Restriction<InvoiceItem> -> {
          andRestriction.or(\ restriction : Restriction<InvoiceItem> -> {
            filterOutNotFullySettledGrossItemsBySignum(restriction, InvoiceItemAmountSignum.POSITIVE)
            filterOutNotFullySettledGrossItemsBySignum(restriction, InvoiceItemAmountSignum.NEGATIVE)
          })
        })
      }
    }
  }

  private function filterOutNotFullySettledGrossItemsBySignum(restriction : Restriction<InvoiceItem>, signum : InvoiceItemAmountSignum) {
    restriction.and(\ grossIsUnsettledRestriction : Restriction<InvoiceItem> -> {
      grossIsUnsettledRestriction.compare(InvoiceItem#Amount_amt, signum.OperatorToUseForFiltering, 0bd.ofCurrency(PayingPayer.Currency))
      grossIsUnsettledRestriction.compare("Amount_amt", signum.OperatorToUseForFiltering, getGrossSettledAmountExpression(restriction))
    })
  }

  private function getGrossSettledAmountExpression(restriction : Restriction) : DBFunction {
      if (DistributionTypeIsPromise) {
        return DBFunction.Expr({restriction.getColumnRef("PromisedAndPaidAmount_amt"),
                                " + ", restriction.getColumnRef("GrossAmountWrittenOff_amt")})
      } else {
        return DBFunction.Expr({restriction.getColumnRef("PaidAmount_amt"),
                                " + ", restriction.getColumnRef("GrossAmountWrittenOff_amt")})
      }
    }

  private function getCommissionSettledAmountExpression(restriction: Restriction) : DBFunction {
    var arguments = {restriction.getColumnRef("PrimaryPaidCommission_amt"),
                    " + ", restriction.getColumnRef("PrimaryCmsnPayableAmount_amt"),
                    " + ", restriction.getColumnRef("PrimaryWrittenOffCommission_amt")}
    if (DistributionTypeIsPromise) {
      arguments.add(" + ")
      arguments.add("PromisedCommission")
    }
    return DBFunction.Expr(arguments.toArray())
  }

  private enum InvoiceItemAmountSignum  {
    POSITIVE,
    NEGATIVE

    property get OperatorToUseForFiltering() : Relop {
      switch (this) {
        case POSITIVE:
            return Relop.GreaterThan
        case NEGATIVE:
            return Relop.LessThan
      }
      return null
    }
  }

  private function filterOutReversedAndReversals(query : Query<InvoiceItem>) {
    // filter out invoice items that have been reversed or are reversals
    query.compare(InvoiceItem#Reversed, Equals, Boolean.FALSE)
    query.compare(InvoiceItem#ReversedInvoiceItem, Equals, null)
  }

  private function filterForOwner(createFilteredQuery : block() : Query<InvoiceItem>) : GroupingQuery<InvoiceItem> {
    var invoiceItemsOnOwnerAccount = filterToOwnerAccountDirectly(createFilteredQuery())
    var invoiceItemsOnPolicyPeriodsOnOwnerAccount = filterToOwnerAccountThroughPolicyPeriod(createFilteredQuery())
    var invoiceItemsOnCollateralOnOwnerAccount = filterToOwnerAccountThroughCollateral(createFilteredQuery())
    var invoiceItemsOnCollateralRequirementOnOwnerAccount = filterToOwnerAccountThroughCollateralRequirement(createFilteredQuery())

    var unionQuery = invoiceItemsOnOwnerAccount.union(invoiceItemsOnPolicyPeriodsOnOwnerAccount)
    unionQuery = unionQuery.union(invoiceItemsOnCollateralOnOwnerAccount)
    unionQuery = unionQuery.union(invoiceItemsOnCollateralRequirementOnOwnerAccount)

    return unionQuery
  }

  private function filterToOwnerAccountDirectly(query : Query<InvoiceItem>) : Query<InvoiceItem> {
    var chargeTable = query.join(InvoiceItem#Charge)
    var tAccountContainerTable = chargeTable.join(Charge#TAccountContainer)
    var accountTable = tAccountContainerTable.join(Account, "HiddenTAccountContainer")
    accountTable.startsWith(Account#AccountNumber, OwnerAccount, true)
    return query
  }

  private function filterToOwnerAccountThroughPolicyPeriod(query : Query<InvoiceItem>) : Query<InvoiceItem>{
    var chargeTable = query.join(InvoiceItem#Charge)
    var tAccountContainerTable = chargeTable.join(Charge#TAccountContainer)
    var policyPeriodTable = tAccountContainerTable.join(entity.PolicyPeriod, "HiddenTAccountContainer")
    var policyTable = policyPeriodTable.join(entity.PolicyPeriod#Policy)
    var accountTable = policyTable.join(Policy#Account)
    accountTable.startsWith(Account#AccountNumber, OwnerAccount, true)
    return query
  }

  private function filterToOwnerAccountThroughCollateral(query : Query<InvoiceItem>) : Query<InvoiceItem> {
    var chargeTable = query.join(InvoiceItem#Charge)
    var tAccountContainerTable = chargeTable.join(Charge#TAccountContainer)
    var collateralTable = tAccountContainerTable.join(Collateral, "HiddenTAccountContainer")
    var accountTable = collateralTable.join(Collateral#Account)
    accountTable.startsWith(Account#AccountNumber, OwnerAccount, true)
    return query
  }

  private function filterToOwnerAccountThroughCollateralRequirement(query : Query<InvoiceItem>) : Query<InvoiceItem>{
    var chargeTable = query.join(InvoiceItem#Charge)
    var tAccountContainerTable = chargeTable.join(Charge#TAccountContainer)
    var collateralRequirementTable = tAccountContainerTable.join(CollateralRequirement, "HiddenTAccountContainer")
    var collateralTable = collateralRequirementTable.join(CollateralRequirement#Collateral)
    var accountTable = collateralTable.join(Collateral#Account)
    accountTable.startsWith(Account#AccountNumber, OwnerAccount, true)
    return query
  }

}
