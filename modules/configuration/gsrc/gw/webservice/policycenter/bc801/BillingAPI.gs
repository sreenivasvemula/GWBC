package gw.webservice.policycenter.bc801

uses com.google.common.base.Preconditions
uses com.google.common.collect.Lists
uses com.google.common.collect.Sets
uses com.guidewire.pl.system.exception.DBDuplicateKeyException
uses com.guidewire.pl.system.transaction.CommitOptions
uses gw.api.contact.ContactTokenThreadLocal
uses gw.api.database.PropertyResolver
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.system.BCLoggerCategory
uses gw.api.util.CurrencyUtil
uses gw.api.web.payment.PaymentInstrumentFactory
uses gw.api.webservice.exception.AlreadyExecutedException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.EntityStateException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPServerException
uses gw.api.webservice.exception.ServerStateException
uses gw.pl.persistence.core.Bundle
uses gw.transaction.Transaction
uses gw.webservice.bc.bc801.InvoiceItemPreview
uses gw.webservice.bc.bc801.PaymentInstrumentRecord
uses gw.webservice.bc.bc801.PaymentInstruments
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.ChargeInfo_ChargeCommissionRateOverrideInfos
uses gw.webservice.policycenter.bc801.entity.types.complex.AccountGeneralInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.AgencyBillPlanInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.CancelPolicyInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ChargeInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.CollateralInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.CommissionPlanInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.FinalAuditInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.IssuePolicyInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.NewProducerCodeInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCAccountInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCContactInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCNewProducerInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCPolicyPeriodInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCProducerInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PaymentAllocationPlanInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PaymentPlanInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PolicyChangeInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PolicyPeriodGeneralInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PremiumReportInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ProducerCodeInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ReinstatementInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.RenewalInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.RewriteInfo

uses java.lang.Exception
uses java.lang.Integer
uses java.lang.Iterable
uses java.util.Collection
uses java.util.Date
uses java.util.HashSet
uses java.util.Map
uses java.util.Set

/**
 * The custom API that supports integration with Policy Center 8, and which may
 * be maintained by Policy Center.
 */
@gw.xml.ws.annotation.WsiWebService("http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/BillingAPI")
@Export
class BillingAPI extends AbstractBillingAPI {
  /**
   * Search for billing center account given the search criteria
   *
   * @param searchCriteria the search criteria
   * @return the list of account numbers
   */
  @Throws(BadIdentifierException, "If there are too many results")
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function searchForAccounts(searchCriteria: BCAccountSearchCriteria,
                             limit: Integer): BCAccountSearchResult[] {
    final var results = searchCriteria.searchForAccountNumbers()
    if (limit == null){
      limit = 50
    }
    final var resultsCount = results.getCountLimitedBy(limit + 1)
    if (resultsCount > limit) {
      throw new BadIdentifierException(displaykey.Java.Search.TooManyResults(limit))
    } else if (resultsCount == 1 and searchCriteria.AccountNumber != null) {
      return {
          new BCAccountSearchResult(searchCriteria.matchAccountNumber())}
    }
    return results.map(\a -> new BCAccountSearchResult(a)).toTypedArray()
  }

  /**
   * Retrieves {@link InvoiceStreamInfo information} for all {@link
   *    InvoiceStream}s associated with the identified {@link Account account}
   *    for the (optional) {@link Currency currency} or an empty list if the
   *    {@code account} does not exist.
   *
   * @param accountNumber the account number of the {@code account}
   * @param currency the (optional) currency for which the streams should apply;
   *                 if {@code null}, then this defaults to the identified
   *                 {@code account}
   * @return A list of invoice streams for the {@code account}
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getAccountInvoiceStreams(accountNumber : String, currency : Currency = null)
      : InvoiceStreamInfo[] {
    final var account = findCurrencyAccount(accountNumber, currency)
    if (account == null) {
      return {} // this may be called for a newly created account in policy system
    }
    return account.InvoiceStreams.map(\i -> new InvoiceStreamInfo(i))
  }

  /**
   * Looks up an returns {@link BCAccountSearchResult account search result}s
   *    for all sub-accounts of the {@link Account} identified by the specified
   *    account number.
   *
   * The search is recursive and  will return all the sub-accounts under the tree.
   *
   * @param accountNumber the account number for the {@link Account}
   * @return an array of {@link BCAccountSearchResult account search results}s.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getAllSubAccounts(accountNumber : String) : BCAccountSearchResult[] {
    require(accountNumber, "accountNumber")

    final var account = BCAccountSearchCriteria.findByAccountNumber(accountNumber)
    if (account == null) {
      // this may be called before issuance for a policy system account
      // that will be created when the policy is issued...
      return {}
    }

    final var results: Map<Key, BCAccountSearchResult> = {}
    var parents = Sets.newHashSet({account.ID})
    while (not parents.isEmpty()) {
      parents.addAll(findAllSplinterIdsFor(parents))
      var query = BCAccountSearchCriteria.makePrimaryAccountQuery(
          \ query ->
              query.subselect("ID", CompareIn, ParentAcct, "Owner")
                  .compareIn("ForeignEntity", parents.toArray())
      )
      var children = query.select().toTypedArray()

      // extract parents at this level...
      parents = Sets.newHashSet(children.map(\child -> child.ID))
      // remove circular references...
      parents.removeAll(results.Keys)

      children.each(\s -> results.put(s.ID, new BCAccountSearchResult(s)))
    }
    return results.Values.toTypedArray()
  }

  /**
   * Transfer policy period to another account.
   * @param policyPeriodInfo information to identify the policy period to be transferred
   * @param targetAccountNumber the target account number
   * @param transactionId the unique id to make this call idempotent
   */
  @Throws(BadIdentifierException, "If cannot find the policy period of account specified")
  @Throws(RequiredFieldException, "If required field is missing ")
  @Throws(AlreadyExecutedException, "If this call is already executed")
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function transferPolicyPeriods(policyPeriodInfos: PCPolicyPeriodInfo[],
                                 targetAccountNumber: String, transactionId: String) {
    require(policyPeriodInfos, "policyPeriodInfos")
    require(targetAccountNumber, "targetAccountNumber")

    if (policyPeriodInfos.IsEmpty) {
      throw new RequiredFieldException(displaykey.Webservice.Error.PolicyPeriodInfoIsRequired)
    }
    runWithNewBundle(\bundle -> {

      var currencyTransfers = policyPeriodInfos
          .partition(\i -> i.findPolicyPeriod().Currency)
          .values()
          .map(\infos -> {
            var transfer = new AccountTransfer(bundle)
            transfer.ToAccount = findAccountOrSiblingForCurrency(targetAccountNumber, infos.get(0).findPolicyPeriod().Currency, bundle)
            var transfers = infos.map(\info -> {
              var period = info.findPolicyPeriodForUpdate()
              var periodHolder = new AccountTransferPolicyPeriod(bundle)
              periodHolder.AccountTransfer = transfer
              periodHolder.PolicyPeriod = period
              periodHolder.Transfer = true
              return periodHolder
            })
            transfer.setFieldValue(PropertyResolver.getProperty(AccountTransfer.Type, "PolicyPeriods"), transfers.toTypedArray())
            transfer.doTransfer()
            return transfer
          })
      return null;
    },
        transactionId)
  }

  /**
   * Check if account with the given account number already exist in the system
   * @param accountNumber the account number to search for
   * @return true if account exists
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function isAccountExist(accountNumber: String): boolean {
    require(accountNumber, "accountNumber")
    var p = findAccountResult(accountNumber).Count
    if (p > 1) {
      throw new EntityStateException(displaykey.Webservice.Error.FoundMoreThanOneAccount(p, accountNumber))
    }
    return p > 0
  }

  private function findAccountResult(accountNumber: String): AccountQuery {
    return Query.make(Account)
        .compare("AccountNumber", Relop.Equals, accountNumber)
        .select()
  }

  private function findAccountOrSiblingForCurrency(
      accountNumber: String, currency: Currency, bundle: Bundle): Account {
    final var result = findAccountResult(accountNumber)
    if (result.Empty) {
      throwAccountNotFound(accountNumber)
    }
    final var account = bundle.add(result.AtMostOneRow)
    if (account.Currency == currency) {
      return account
    }
    if (account.AccountCurrencyGroup != null) {
      final var splinterAccount =
          findExistingAccountForCurrency(account.AccountCurrencyGroup, currency)
      if (splinterAccount != null) {
        return splinterAccount
      }
    }
    return createAccountForCurrency(account, currency)
  }

  /**
   * Return an information list of all available {@link PaymentAllocationPlan}s
   *    in BillingCenter.
   *
   * @return An {@code Array} of information records for all available
   *         {@link PaymentAllocationPlan}s.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function findAllPaymentAllocationPlans() : PaymentAllocationPlanInfo[] {
    return PaymentAllocationPlan.finder.findAllAvailablePlans<PaymentAllocationPlan>(PaymentAllocationPlan)
        .map(\  plan -> {
          var planInfo = new PaymentAllocationPlanInfo()
          planInfo.copyPlanInfo(plan)
          return planInfo
        })
        .toTypedArray()
  }

  /**
   * Create a new account
   * @param accountInfo the account information
   * @return the new account's AccountNumber (useful if BC is being used to generate the AccountNumber instead of using a provided one)
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(DBDuplicateKeyException, "if the account number is duplicated")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function createAccount(accountInfo: PCAccountInfo, currency: Currency, transactionId: String): String {
    require(accountInfo, "accountInfo")
    require(currency, "currency")
    // no need to check for account number uniqueness and let the db check for it as well as
    // checking if the transaction id is the same which means this request is duplicated
    // (may be by a retry) and ignore the call.
    var id = runWithNewBundle(\bundle -> {
      var account = accountInfo.toNewAccount(currency, bundle)
      return account.AccountNumber
    }, transactionId)
    return id
  }

  /**
   * Update an existing account
   *
   * @param accountInfo the account information
   * @param transactionId the transaction id to make this call idempotent
   * @return the account public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateAccount(accountInfo: PCAccountInfo, transactionId: String): String {
    require(accountInfo, "accountInfo")
    var publicID = runWithNewBundle(\bundle -> {
      var account: Account
      account = accountInfo.toAccount(bundle)
      return account.PublicID
    }, transactionId)
    return publicID
  }

  /**
   * Return all the billing method that the given producer support for the given currency
   *
   * @param producerCodeId the id of the producer
   * @param currency the currency we are looking at on the producer
   * @return the list of billing methods that the producer support
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no producer exists with the given producer code")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getAvailableBillingMethods(producerCodeId: String, currency: Currency): String[] {
    require(producerCodeId, "producerCodeId")
    require(currency, "currency")
    var qp = Query.make(ProducerCode).compare("PublicID", Equals, producerCodeId).select()
    if (qp.Empty) {
      throw BadIdentifierException.badPublicId(ProducerCode, producerCodeId)
    } else if (qp.Count > 1) {
      throw new ServerStateException(displaykey.Webservice.Error.FoundMoreThanOneProducerCode(qp.Count, producerCodeId))
    }
    if (qp.AtMostOneRow.Currency == currency){
      return (qp.AtMostOneRow.Producer.AgencyBillPlan == null)
          ? new String[] {PolicyPeriodBillingMethod.TC_DIRECTBILL.Code}
          : new String[] {PolicyPeriodBillingMethod.TC_DIRECTBILL.Code, PolicyPeriodBillingMethod.TC_AGENCYBILL.Code}
    }
    var producers = qp.AtMostOneRow.Producer.ProducerCurrencyGroup.findProducers()
    if (producers != null){
      for (producer in producers) {
        if (producer.Currency == currency){
          for (producerCode in producer.ProducerCodes)
            if (producerCode.Code == qp.AtMostOneRow.Code) {
              return (producerCode.Producer.AgencyBillPlan == null)
                  ? new String[] {PolicyPeriodBillingMethod.TC_DIRECTBILL.Code}
                  : new String[] {PolicyPeriodBillingMethod.TC_DIRECTBILL.Code, PolicyPeriodBillingMethod.TC_AGENCYBILL.Code}
            }
        }
      }
    }
    return null
  }

  /**
   * Issue a policy period.
   *
   * @param information necessary for issue a policy period
   * @return the new policy period public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If a policy already exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function issuePolicyPeriod(issuePolicyInfo: IssuePolicyInfo, transactionId: String): String {
    require(issuePolicyInfo, "issuePolicyInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return issuePolicyInfo.executeIssuanceBI()
    }, transactionId)
    return publicID
  }

  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function previewInstallmentPlanInvoices(policyChangeInfo: PolicyChangeInfo): InvoiceItemPreview[] {
    require(policyChangeInfo, "policyChangeInfo")
    var policyChange: PolicyChange
    runWithNonPersistentBundle(\ bundle -> {
      policyChange = policyChangeInfo.toPolicyChangeForPreview()
      policyChange.execute()
      var account = policyChange.PolicyPeriod.Account
      // normally installment fees, if any, are added when the invoice is billed. Since this preview needs to "pretend"
      // that all of the invoices have been billed, we need to add the invoice/installment fees explicitly only for the
      // planned invoices (since the billed ones will already have the appropriate fees).
      for (var invoice in account.InvoicesSortedByDate) {
        if (invoice.Planned) {
          invoice.addFees()
        }
      }
    })
    return policyChangeInfo.createInvoicesSummary(policyChange)
  }

  /**
   * Generates a preview of the installment schedule that would be created for the given new policy.  The new policy is
   * encapsulated in an Issuance billing instruction, so that there is enough context to properly simulate the invoice
   * generation.
   * @param issuePolicyInfo the information to issue a policy period
   * @return the preview invoices
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function previewInstallmentsPlanInvoices(issuePolicyInfo: IssuePolicyInfo)
      : InvoiceItemPreview[] {
    require(issuePolicyInfo, "issuePolicyInfo")
    var issuance: Issuance
    runWithNonPersistentBundle(\ bundle -> {
      issuance = issuePolicyInfo.toIssuanceForPreview()
      issuance.execute()
      var account = issuance.IssuanceAccount
      // normally installment fees, if any, are added when the invoice is billed. Since this preview needs to "pretend"
      // that all of the invoices have been billed, we need to add the invoice/installment fees explicitly.
      for (var invoice in account.InvoicesSortedByDate) {
        invoice.addFees()
      }
    })
    final var invoiceItemPreviews = issuePolicyInfo.createInvoicesSummary(issuance)
    changeEarliestItemPreviewToDownPayment(invoiceItemPreviews)
    return invoiceItemPreviews
  }

  /**
   * Updates the written date on the given charge
   *
   * @param charge              The charge for which the written date should be updated
   * @param writtenDate         The new written date
   */
  @Throws(RequiredFieldException, "if the charge or writtenDate variable is null")
  function updateChargeWrittenDate(chargeID: String, writtenDate: Date) {
    require(chargeID, "charge")
    require(writtenDate, "writtenDate")
    var charge = Query.make(Charge).compare("PublicID", Equals, chargeID).select().FirstResult
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      charge = bundle.add(charge)
      charge.WrittenDate = writtenDate
    })
  }

  /**
   * Updates the TermConfirmed field on the given policy period
   *
   * @param policyNumber      The policy number for which the term confirmed field should be updated
   * @param termNumber        The term number for this policy
   * @param isConfirmed       The new value
   */
  @Throws(RequiredFieldException, "if the policyNumber or termNumber or isConfirmed variable is null")
  function updatePolicyPeriodTermConfirmed(policyNumber: String, termNumber: int,
                                           isConfirmed: Boolean) {
    require(policyNumber, "policy number")
    require(termNumber, "policy period term number")
    require(isConfirmed, "isConfirmed")
    var policyPeriod = PolicyPeriod.finder.findByPolicyNumberAndTerm(policyNumber, termNumber)
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.TermConfirmed = isConfirmed
    })
  }

  private function changeEarliestItemPreviewToDownPayment(invoicePreviews: InvoiceItemPreview[]) {
    var assumedDownPaymentInvoice = invoicePreviews.minBy(\invoicePreview -> invoicePreview.InvoiceDueDate)
    if (assumedDownPaymentInvoice != null) {
      assumedDownPaymentInvoice.Type = TC_DEPOSIT
    }
  }

  private function runWithNewBundle<T>(call: block(bundle: Bundle): T, tid: String): T {
    // check the uniqueness of the transaction id
    // this is just one way of getting what we need (by let pl commit to transactionid table)
    // we can just commit the transactionid as key to any table and throw AlreadyExecuteException
    // when appropriate
    if (!Query.make(TransactionId).compare("tid", Equals, tid).select().Empty) {
      throw new AlreadyExecutedException(displaykey.Webservice.Error.TransactionAlreadyExecuted(tid))
    }
    var result: T
    var insertedAndUpdatedContacts: Collection<Contact>

    try {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        try {
          setTransactionIDForBundle(bundle, tid)
          result = call(bundle)

          insertedAndUpdatedContacts = setThreadLocalForInsertedAndUpdatedContacts(bundle)
        } catch (e: com.guidewire.pl.system.exception.DBAlreadyExecutedException) {
          // this can still happen after the checked above because of race condition
          throw new AlreadyExecutedException(displaykey.Webservice.Error.TransactionAlreadyExecuted(tid))
        } catch (e: Exception) {
          BCLoggerCategory.BILLING_API.error(e)
          throw e
        }
      })
    } finally {
      clearThreadLocalsForInsertedAndUpdatedContacts(insertedAndUpdatedContacts)
    }
    return result
  }

  /**
   * This token is set so we can make sure that after creating any Contacts, we don't let messaging initiate creation
   * in CM since they came from PC, and PC will message CM about the Contacts on its own.
   */
  private function setThreadLocalForInsertedAndUpdatedContacts(bundle: Bundle): Collection<Contact> {
    var insertedAndUpdatedContacts = new HashSet<Contact>()
    insertedAndUpdatedContacts.addAll(bundle.InsertedBeans.where(\contact -> {return contact typeis Contact && contact.AddressBookUID != null }) as Collection<Contact>)
    insertedAndUpdatedContacts.addAll(bundle.UpdatedBeans.where(\contact -> {return contact typeis Contact && contact.AddressBookUID != null }) as Collection<Contact>)

    if (insertedAndUpdatedContacts.HasElements) {
      insertedAndUpdatedContacts.each(\contact -> { ContactTokenThreadLocal.setToken("pc", contact.AddressBookUID, "Contact") })
    }

    return insertedAndUpdatedContacts
  }

  private function clearThreadLocalsForInsertedAndUpdatedContacts(insertedAndUpdatedContacts: Collection<Contact>) {
    if (insertedAndUpdatedContacts.HasElements) {
      insertedAndUpdatedContacts.each(\contact -> { ContactTokenThreadLocal.removeToken("pc", contact.AddressBookUID, "Contact") })
    }
  }

  private function setTransactionIDForBundle(bundle: Bundle, transactionID: String) {
    var entityBundle = gw.pl.persistence.core.Bundle.Type.TypeInfo.getMethod("getBundle", {}).CallHandler.handleCall(bundle, {})
    var options = entityBundle.Class.getMethod("getCommitOptions", {}).invoke(entityBundle, {}) as CommitOptions
    options.TransactionId = transactionID
  }

  /**
   * Cancel a policy period.
   *
   * @param cancelInfo information necessary for cancellation
   * @return the cancellation billing instruction public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function cancelPolicyPeriod(cancelInfo: CancelPolicyInfo, transactionId: String): String {
    require(cancelInfo, "cancelInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return cancelInfo.execute()
    }, transactionId)
    return publicID
  }

  /**
   * Change a policy period.
   *
   * @param changeInfo information necessary for policy change
   * @return the cancellation billing instruction public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function changePolicyPeriod(changeInfo: PolicyChangeInfo, transactionId: String): String {
    require(changeInfo, "changeInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return changeInfo.executePolicyChangeBI()
    }, transactionId)
    return publicID
  }

  /**
   * Reinstate a policy period.
   *
   * @param reinstatementInfo information necessary for reinstatement of the policy period
   * @return the cancellation billing instruction public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function reinstatePolicyPeriod(reinstatementInfo: ReinstatementInfo, transactionId: String): String {
    require(reinstatementInfo, "reinstatementInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return reinstatementInfo.execute()
    }, transactionId)
    return publicID
  }

  /**
   * Issue Final Audit for a policy period.
   *
   * @param finalAuditInfo information necessary for Final Audit
   * @return the Audit billing instruction public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function issueFinalAudit(finalAuditInfo: FinalAuditInfo, transactionId: String): String {
    require(finalAuditInfo, "finalAuditInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return finalAuditInfo.execute()
    }, transactionId)
    return publicID
  }

  /**
   * Issue Premium Report for a policy period.
   *
   * @param premiumReportInfo information necessary for Premium Report
   * @return the Premium Reporting billing instruction public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function issuePremiumReport(premiumReportInfo: PremiumReportInfo, transactionId: String): String {
    require(premiumReportInfo, "premiumReportInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return premiumReportInfo.execute()
    }, transactionId)
    return publicID
  }

  /**
   * Renew a policy period if it is already exist or issue a NewRenewal BI if the period
   * does not exist in BC yet.
   *
   * @param renewalInfo information necessary for renewing a policy period
   * @return the Renewal or NewRenewal billing instruction's public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function renewPolicyPeriod(renewalInfo: RenewalInfo, transactionId: String): String {
    require(renewalInfo, "renewalInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return renewalInfo.executeRenewalBI()
    }, transactionId)
    return publicID
  }

  /**
   * Rewrite an existing policy period.
   *
   * @param rewriteInfo information to rewrite the policy period
   * @return the Rewrite billing instruction's public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function rewritePolicyPeriod(rewriteInfo: RewriteInfo, transactionId: String): String {
    require(rewriteInfo, "rewriteInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return rewriteInfo.executeRewriteBI()
    }, transactionId)
    return publicID
  }

  /**
   * Add charges like fees to a PolicyPeriod.
   *
   * @param policyPeriodGeneralInfo information for creating the General BI on an existing policy period
   * @param transactionId the unique id to make this call idempotent
   * @return the General billing instruction's public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(SOAPException, "If the charge category is not Fee or General.")
  @Throws(AlreadyExecutedException, "If the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy period exists with the given PCPolicyPublicID and TermNUmber or PolicyNumber and TermNumber")
  @Throws(RequiredFieldException, "If policyPeriodGeneralInfo is null")
  function addPolicyPeriodGeneralCharges(policyPeriodGeneralInfo: PolicyPeriodGeneralInfo, transactionId: String): String {
    require(policyPeriodGeneralInfo, "policyPeriodGeneralInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return policyPeriodGeneralInfo.executeGeneralBI()
    }, transactionId)
    return publicID
  }

  /**
   * Add charges like fees/subrogation to an Account.
   *
   * @param accountGeneralInfo information for creating the General BI on an existing account
   * @param transactionId the unique id to make this call idempotent
   * @return the AccountGeneral billing instruction's public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(SOAPException, "If the charge category is not Fee or General.")
  @Throws(AlreadyExecutedException, "If the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no account exists with the given number")
  @Throws(RequiredFieldException, "If accountGeneralInfo is null")
  function addAccountGeneralCharges(accountGeneralInfo: AccountGeneralInfo, transactionId: String): String {
    require(accountGeneralInfo, "accountGeneralInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return accountGeneralInfo.executeGeneralBI()
    }, transactionId)
    return publicID
  }

  /**
   * Add Collateral charges to a Collateral or unsegregated CollateralRequirement
   *
   * @param collateralInfo information for creating Collateral BI on existing Collateral or CollateralRequirement
   * @param transactionId the unique id to make this call idempotent
   * @return the CollateralBI public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no account exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function addCollateralCharges(collateralInfo: CollateralInfo, transactionId: String): String {
    require(collateralInfo, "collateralInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return collateralInfo.executeCollateralBI()
    }, transactionId)
    return publicID
  }

  /**
   * Add Collateral charges to a segregated CollateralRequirement
   *
   * @param collateralInfo information for creating SegregatedCollReqBI on existing CollateralRequirement
   * @param transactionId the unique id to make this call idempotent
   * @return the SegregatedCollReqBI public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no account exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function addSegregatedCollateralCharges(collateralInfo: CollateralInfo, transactionId: String): String {
    require(collateralInfo, "collateralInfo")
    var publicID = runWithNewBundle(\bundle -> {
      return collateralInfo.executeSegregatedCollateralBI()
    }, transactionId)
    return publicID
  }

  /**
   * Return an array of all agency bill plans in BC
   *
   * @return array of agency bill plan info objects
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getAllAgencyBillPlans() : AgencyBillPlanInfo[] {
    return AgencyBillPlan.finder.findAllAvailablePlans<AgencyBillPlan>(AgencyBillPlan)
        .map(\ plan -> {
          var planInfo = new AgencyBillPlanInfo()
          planInfo.copyPlanCurrencyInfo(plan)
          return planInfo
        })
        .toTypedArray()
  }

  /**
   * Return an array of all Commission Plans in BC
   * @return array of commission plan info objects
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getAllCommissionPlans() : CommissionPlanInfo[] {
    return CommissionPlan.finder.findAllAvailablePlans<CommissionPlan>(CommissionPlan)
        .map(\ plan -> {
          var planInfo = new CommissionPlanInfo()
          planInfo.copyCommissionPlanInfo(plan)
          return planInfo
        })
        .toTypedArray()
  }

  /**
   * Returns the CommissionSubPlan that is the best match for the given (new) policy period using the given producer
   * code.  Does not persist anything - this method should be used to preview what the eventual commission a producer
   * could expect to get.
   *
   * @param policyPeriod   a new policy period.  If the policy period already exists, then a BadIdentifierException is
   *                       thrown.
   * @param producerCodeID the publicID of a producer code
   * @return CommissionSubPlanInfo  that has info. about the about the best match
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If issuePolicyInfo or producerCodePublicID is null.")
  @Throws(BadIdentifierException, "If a policy period  with the given PCPolicyPublicID and TermNumber already exists, or producerCodePublicID is invalid.")
  function previewApplicableCommissionSubPlan(issuePolicyInfo: IssuePolicyInfo, producerCodePublicID: String): CommissionSubPlanInfo {
    require(issuePolicyInfo, "issuePolicyInfo")
    var producerCode = WebserviceEntityLoader.loadByPublicID<ProducerCode>(producerCodePublicID, "producerCodePublicID")
    var commissionSubPlanInfo: CommissionSubPlanInfo
    runWithNonPersistentBundle(\ bundle -> {
      var commissionSubPlan = producerCode.CommissionPlan.getApplicableSubPlan(issuePolicyInfo.toIssuanceForPreview().PolicyPeriod)
      commissionSubPlanInfo = new CommissionSubPlanInfo(commissionSubPlan)
    })
    return commissionSubPlanInfo
  }

  /**
   * Populates CommissionRateOverrides on an array of {@link ChargeInfos} by getting the commission rate for each charge
   * on the given {@link IssuePolicyInfo}. This method, combined with {@link #previewApplicableCommissionSubPlan(IssuePolicyInfo, String)}
   * can be used to preview the expected commission rates that a new policy will generate.
   * <em>Note: In the default configuration, only {@link PolicyRole.TC_PRIMARY} is supported.</em>
   *
   * @param issuePolicyInfo     The policy period issuance info to be previewed
   * @param policyRoleCode      The policy role to be previewed
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(BadIdentifierException, "If there is no existing CommissionSubPlan with the given PublicID, or policy role exists with the given code.")
  function previewCommissionRates(issuePolicyInfo: IssuePolicyInfo, policyRoleCode: String): ChargeInfo[] {
    require(issuePolicyInfo, "issuePolicyInfo")
    require(policyRoleCode, "policyRoleCode")

    var chargeInfos = Lists.newArrayList<ChargeInfo>()
    var policyRole = PolicyRole.get(policyRoleCode)
    if (policyRole == null) {
      throw new BadIdentifierException(displaykey.BillingAPI.Error.PolicyRoleNotFound(policyRoleCode))
    }
    runWithNonPersistentBundle(\ bundle -> {
      var issuance = issuePolicyInfo.toIssuanceForPreview()
      issuance.execute()
      var policyPeriod = issuance.PolicyPeriod
      var policyCommission = policyPeriod.getDefaultPolicyCommissionForRole(policyRole)

      for (var charge in policyPeriod.Charges) {
        var chargeInfo = new ChargeInfo()
        chargeInfo.copyChargeInfo(charge)
        if (policyCommission != null) {
          var commissionRate = policyCommission.getCommissionRateAsBigDecimal(charge)
          if (commissionRate != null) {
            chargeInfo.ChargeCommissionRateOverrideInfos.add(new ChargeInfo_ChargeCommissionRateOverrideInfos() {
                : Role = policyRoleCode,
                : Rate = commissionRate
            })
          }
        }
        chargeInfos.add(chargeInfo)
      }
    })
    return chargeInfos.toTypedArray()
  }

  /**
   * Create a new {@link Producer producer} as specified in the
   *    {@link PCNewProducerInfo}.
   *
   * The {@code Producer} attributes that will be set are the {@link
   * Producer#PublicID PublicID}, {@link Producer#Name Name}, {@link
   * Producer#Tier Tier} (defaulted if not specified), {@link
   * Producer#PrimaryContact PrimaryContact}, and {@link Producer#AgencyBillPlan
   * AgencyBillPlan} (<code>null</code> if not specified).
   *<p/>
   * In a multi-currency installation, this will also create corresponding
   * splinter {@code Producer}s for the specified {@code Currencies}. {@link
   * AgencyBillPlan}s are optionally specified.
   *
   * @param newProducerInfo The information with which to create the {@link
   *                        Producer}:
   *                        <blockquote><dl>
   *                            <dt>PreferredCurrency <dd>The {@link Currency}
   *                                 in which the {@code Producer} prefers to do
   *                                 business. (This will be the {@code
   *                                 Currency} of the main {@code Producer} in a
   *                                 multi-currency producer group.)
   *                            <dt>PublicID <dd>The unique public identifier
   *                                 that identifies the {@code Producer} (which
   *                                 will be the main one when multiple
   *                                 currencies are specified).
   *                             <dt>ProducerName <dd>The name string to be
   *                                 associated with the {@code Producer} (and
   *                                 any multi-currency splinters}.
   *                             <dt>Tier <dd>The {@link ProducerTier} for the
   *                                 {@code Producer} (and any multi-currency
   *                                 splinters).
   *                             <dt>PrimaryContact <dd>The primary {@link
   *                                 ProducerContact} for the {@code Producer}
   *                                 (and any multi-currency splinters).
   *                             <dt>AgencyBillPlanIDs <dd>(Optional) A list of
   *                                 {@link AgencyBillPlan} {@code PublicID}s,
   *                                 one (or none) per each {@link Currency} to
   *                                 be supported.
   *                             <dt>Currencies<dd>(Single currency optional) A
   *                                 list of {@code Currency} codes that the
   *                                 {@code Producer} should support.
   *                          </dl>
   *                        (The AgencyBillPlanInfos is not needed and will be
   *                        ignored.)
   *                        </blockquote>
   * @param transactionId the transaction id to make this call idempotent
   * @return The {@code PublicID} identifying string of the {@code Producer}
   *         that was created.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(BadIdentifierException, "If no AgencyBill Plan exists with a given PublicID")
  @Throws(DataConversionException, "If more than one AgencyBill Plan is specified with a given Currency")
  function createProducer(newProducerInfo: PCNewProducerInfo, transactionId: String): String {
    require(newProducerInfo, "newProducerInfo")
    var producer = runWithNewBundle(\bundle -> {
      var producer = newProducerInfo.toNewProducer(bundle)
      return producer
    }, transactionId)
    return producer.PublicID
  }

  /**
   * Update an existing {@link Producer producer} as specified in the
   *    {@link PCProducerInfo}.
   *
   * The {@code Producer} attributes that will be updated are the {@link
   * Producer#Name Name}, {@link Producer#Tier Tier} (defaulted if not
   * specified), {@link Producer#PrimaryContact PrimaryContact}, and {@link
   * Producer#AgencyBillPlan AgencyBillPlan} (<code>null</code> if not
   * specified).
   *<p/>
   * In a multi-currency installation, this will also update the corresponding
   * splinter {@code Producer}s belonging to the main {@code Producer}'s
   * currency group. {@link AgencyBillPlan}s are optionally specified.
   *
   * @param producerInfo The information with which to update the {@link
   *                     Producer}:
   *                     <blockquote><dl>
   *                         <dt>PublicID <dd>The public identifier that
   *                             identifies the {@code Producer} (or the main
   *                             one when multiple currencies are specified).
   *                         <dt>ProducerName <dd>The name string to be
   *                             associated with the {@code Producer} (and any
   *                             multi-currency splinters}.
   *                         <dt>Tier <dd>The {@link ProducerTier} for the
   *                             {@code Producer} (and any multi-currency
   *                             splinters).
   *                         <dt>PrimaryContact <dd>The primary {@link
   *                             ProducerContact} for the {@code Producer}
   *                             (and any multi-currency splinters).
   *                         <dt>AgencyBillPlanIDs <dd>(Optional) A list of
   *                             {@link AgencyBillPlan} {@code PublicID}s, one
   *                             per each {@link Currency} to be updated on the
   *                             existing {@code Producer} for that {@code
   *                             Currency}, or specified on any new {@code
   *                             Producer}s to be added for new currencies to be
   *                             supported.
   *                         <dt>Currencies <dd>(Optional) A list of {@code
   *                             Currency} codes that the {@code Producer}
   *                             should now support.
   *                       </dl>
   *                     (The AgencyBillPlanInfos is not needed and will be
   *                     ignored.)
   *                     </blockquote>
   * @param transactionId the transaction id to make this call idempotent
   * @return The {@code PublicID} identifying string of the {@code Producer}
   *         that was updated.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(BadIdentifierException, "If no producer exists with the given public id")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateProducer(producerInfo: PCProducerInfo, transactionId: String): String {
    require(producerInfo, "producerInfo")
    var publicID = runWithNewBundle(\bundle -> {
      var producer: Producer
      producer = producerInfo.toProducer(bundle)
      return producer.PublicID
    }, transactionId)
    return publicID
  }

  /**
   * Return true if the producer with the same name exist
   * @param producerId the public id of the producer to check
   * @return true if the producer exists, otherwise false
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function isProducerExist(producerId: String): boolean {
    require(producerId, "producerId")
    return !Query.make(Producer).compare("PublicID", Equals, producerId).select().Empty
  }

  /**
   * @param producerId the {@code PublicID} of the {@link ProducerCode} for which
   *                   information is to be returned
   * @return The {@link PCProducerInfo} containing values set from the
   *         identified {@link Producer}.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(BadIdentifierException, "If no producer exists with the given public identifier")
  function getProducerInfo(producerId : String) : PCProducerInfo {
    require(producerId, "producerId")
    final var producerInfo = new PCProducerInfo() {
        : PublicID = producerId
    }
    producerInfo.loadInformation()
    return producerInfo
  }

  /**
   * Create a new {@link ProducerCode producer code} with the values and parent
   *    {@link Producer} as specified in the {@link NewProducerCodeInfo}.
   *
   * This will do nothing if the identified {@code ProducerCode} already exists.
   *
   * The {@code ProducerCode} attributes that will be set are the {@link
   * ProducerCode#PublicID PublicID}, {@link ProducerCode#Code Code}, {@link
   * Producer#Active Active} flag, and {@link ProducerCode#CommissionPlan
   * CommissionPlan} (defaulted if not specified).
   *<p/>
   * In a multi-currency installation, this will also create corresponding
   * {@code ProducerCode}s for the specified {@code Currencies} on the owning
   * {@link ProducerCode#Producer Producer} parent's currency splinter
   * producers. {@link CommissionPlan}s are optionally specified but will be
   * assigned by default if not (which will be an error if it does not exist).
   *
   * @param producerCodeInfo The information with which to create the {@link
   *                         ProducerCode}:
   *                         <blockquote><dl>
   *                             <dt>ProducerPublicID <dd>The unique public
   *                                 identifier that identifies the parent
   *                                 {@link Producer} of the code.
   *                             <dt>PublicID <dd>The unique public identifier
   *                                 that identifies the {@code ProducerCode}
   *                                 (which will be the main one when multiple
   *                                 currencies are specified).
   *                             <dt>Code <dd>The code string to be associated
   *                                 with the {@code ProducerCode} (and any
   *                                 multi-currency splinters}.
   *                             <dt>Active <dd>Whether the {@code
   *                                 ProducerCode} (and any multi-currency
   *                                splinters) is to be active.
   *                             <dt>CommissionPlanIDs <dd>(Optional) A list of
   *                                 {@link CommissionPlan} {@code PublicID}s,
   *                                 one per each {@link Currency} to be
   *                                 supported.
   *                             <dt>Currencies<dd>(Optional, single currency) A
   *                                 list of {@code Currency} codes that the
   *                                 {@code ProducerCode} should support.
   *                           </dl>
   *                       (The CommissionPlanInfos is not needed and will be
   *                       ignored.)
   *                       </blockquote>
   * @param transactionId the transaction id to make this call idempotent
   * @return The {@code PublicID} identifying string of the {@code ProducerCode}
   *         that was created.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function createProducerCode(producerCodeInfo: NewProducerCodeInfo, transactionId: String): String {
    require(producerCodeInfo, "producerCodeInfo")
    if (!Query.make(ProducerCode).compare("PublicID", Equals, producerCodeInfo.PublicID).select().Empty) {
      return producerCodeInfo.PublicID
    }
    var producerCode = runWithNewBundle(\bundle -> {
      var producerCode = producerCodeInfo.toNewProducerCode(bundle)
      return producerCode
    }, transactionId)
    return producerCode.PublicID
  }

  /**
   * Update an existing {@link ProducerCode producer code} as specified in the
   *    {@link ProducerCodeInfo}.
   *
   * The {@code ProducerCode} attributes that can be updated are the {@link
   * ProducerCode#Code Code}, {@link Producer#Active Active} flag, and {@link
   * ProducerCode#CommissionPlan CommissionPlan} (optional if not specified).
   *<p/>
   * In a multi-currency installation, this will also update the attributes of
   * the corresponding {@code ProducerCode}s found on the owning {@link
   * ProducerCode#Producer Producer} parent's currency splinter producers.
   * {@link CommissionPlan}s are optionally specified but will be assigned by
   * default if not (which will be an error if it does not exist).
   *
   * @param producerCodeInfo The information with which to update the {@link
   *                         ProducerCode} as well as which identifies it:
   *                         <blockquote><dl>
   *                             <dt>PublicID <dd>The public identifier that
   *                                 identifies the {@code ProducerCode} (or
   *                                 main one when multiple currencies are
   *                                 supported).
   *                             <dt>Code <dd>The code string to be associated
   *                                 with the {@code ProducerCode} (and any
   *                                 multi-currency splinters}.
   *                             <dt>Active <dd>Whether the {@code
   *                                 ProducerCode} (and any multi-currency
   *                                splinters) is to be active.
   *                             <dt>CommissionPlanIDs <dd>(Optional) A list of
   *                                 {@link CommissionPlan} {@code PublicID}s,
   *                                 one per each {@link Currency} to be updated
   *                                 on the existing {@code ProducerCode} for
   *                                 that {@code Currency}, or specified on any
   *                                 new {@code ProducerCode}s to be added for
   *                                 new currencies to be supported.
   *                             <dt>Currencies <dd>(Optional) A list of {@code
   *                                 Currency} codes that the {@code
   *                                 ProducerCode} should now support.
   *                         </dl>
   *                       (The CommissionPlanInfos is not needed and will be
   *                       ignored.)
   *                       </blockquote>
   * @param transactionId the transaction id to make this call idempotent
   * @return The {@code PublicID} identifying string of the {@code ProducerCode}
   *         that was updated.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no producer code exists with the given public identifier")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateProducerCode(producerCodeInfo: ProducerCodeInfo, transactionId: String): String {
    require(producerCodeInfo, "producerCodeInfo")
    var publicID = runWithNewBundle(\bundle -> {
      var producerCode = producerCodeInfo.toProducerCode(bundle)
      return producerCode.PublicID
    }, transactionId)
    return publicID
  }

  /**
   * Return true if the producer code with the given code exists.
   *
   * @param code the code of the producer code
   * @return true if the producer code exist
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function isProducerCodeExist(producerId: String, code: String): boolean {
    require(producerId, "producerId")
    var q = Query.make(Producer)
    q.compare("PublicID", Equals, producerId)
    var producerCodeTable = q.join(ProducerCode, "Producer")
    producerCodeTable.compare("Code", Equals, code)
    return !q.select().Empty
  }

  /**
   * @param publicID the {@code PublicID} of the {@link ProducerCode} for which
   *                 information is to be returned
   * @return The {@link ProducerCodeInfo} containing values set from the
   *         identified {@link ProducerCode}.
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(BadIdentifierException, "If no producer code exists with the given public identifier")
  function getProducerCodeInfo(publicID : String) : ProducerCodeInfo {
    require(publicID, "publicID")
    final var producerCodeInfo = new ProducerCodeInfo() {
      : PublicID = publicID
    }
    producerCodeInfo.loadInformation()
    return producerCodeInfo
  }

  /**
   * Update a contact with the given contact's public id
   * @param contactInfo information necessary for updating the contact
   * @@param transactionId the transaction id to make this call idempotent
   * @return an array of public ids of all the contacts that were updated
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateContact(contactInfo: PCContactInfo, transactionId: String): String[] {
    require(contactInfo, "contactInfo")
    var publicIDs = runWithNewBundle(\bundle -> {
      var contact = contactInfo.toContact(bundle)
      setAccountNamesOfContactFrom(contactInfo, bundle)
      return new String[] {contact.PublicID}
    }, transactionId)
    return publicIDs
  }

  private function setAccountNamesOfContactFrom(contactInfo: PCContactInfo, bundle: Bundle) {
    for (accountNumber in contactInfo.AccountNumbers) {
      var account = findAccountResult(accountNumber).AtMostOneRow
      if (account != null) {
        var currencyGroup = account.AccountCurrencyGroup
        if (currencyGroup != null) {
          for (splinterAccount in currencyGroup.findAccounts()) {
            splinterAccount = bundle.add(splinterAccount)
            splinterAccount.AccountName = contactInfo.AccountName
            splinterAccount.AccountNameKanji = contactInfo.AccountNameKanji
          }
        } else {
          account = bundle.add(account)
          account.AccountName = contactInfo.AccountName
          account.AccountNameKanji = contactInfo.AccountNameKanji
        }
      }
    }
  }

  /**
   * Gets all of the available payment plans in the system.  Only plans which are effective (ie effectiveDate &lt=
   * current date &lt= expiration date) are returned.
   *
   * @return the available payment plans
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getAllPaymentPlans(): PaymentPlanInfo[] {
    return findPaymentPlansFor(null)
  }

  /**
   * Gets all of the available payment plans for an account filtered by the given currency
   * If currency is null, all payment plans for the account will be returned
   *
   * @param accountNumber information to identify the account
   * @param currency the currency to filter on
   * @return the payment plans associated with an account
   */
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getPaymentPlansForAccount(accountNumber: String, currency: Currency): PaymentPlanInfo[] {
    final var acct = findAccountIdentifiedBy(accountNumber)

    if (acct.ListBill && acct.Currency != currency) {
      throw new ServerStateException(
          displaykey.Webservice.Error.CurrencyMustMatchListBillAccount(currency, accountNumber))
    }

    // For all non-list bill accounts, return all available pay plans with Currency
    final var currentDate = Date.CurrentDate
    return not acct.ListBill
        ? findPaymentPlansFor(currency)
        : convertPaymentPlansToDTO(acct.PaymentPlans
            .where(\plan -> plan.EffectiveDate <= currentDate
                and (plan.ExpirationDate == null
                    or plan.ExpirationDate > currentDate)
                and plan.UserVisible))
  }

  /**
   * Waive a final audit in BC. This function will set the policy period's closure status from
   * OPEN_LOCK to OPEN and make the policy period do not require final audit anymore.
   *
   * @param policyPeriodInfo information to identify the policy period
   * @return the public id of the policy period
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function waiveFinalAudit(policyPeriodInfo: PCPolicyPeriodInfo, transactionId: String): String {
    require(policyPeriodInfo, "policyPeriodInfo")
    var publicID = runWithNewBundle(\bundle -> {
      var period = policyPeriodInfo.findPolicyPeriodForUpdate()
      period = bundle.add(period)
      period.waiveFinalAudit()
      return period.PublicID
    }, transactionId)
    return publicID
  }

  /**
   * Schedule a final audit in BC. This function will set the policy period's closure status from
   * OPEN or CLOSE to OPEN_LOCK and make the policy period require final audit.
   *
   * @param policyPeriodInfo information to identify the policy period
   * @return the public id of the policy period
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function scheduleFinalAudit(policyPeriodInfo: PCPolicyPeriodInfo, transactionId: String): String {
    require(policyPeriodInfo, "policyPeriodInfo")
    var publicID = runWithNewBundle(\bundle -> {
        var period = policyPeriodInfo.findPolicyPeriodForUpdate()
        period = bundle.add(period)
        period.scheduleFinalAudit()
        return period.PublicID
      }, transactionId)
    return publicID
  }

  /**
   * Retrieve the information about the policy period including the current payment plan and
   * billing method
   *
   * @param policyPeriodInfo information to identify the policy period
   * @return the information about the policy period
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getPolicyPeriod(policyPeriodInfo: PCPolicyPeriodInfo): IssuePolicyInfo {
    require(policyPeriodInfo, "policyPeriodInfo")
    var period = policyPeriodInfo.findByPolicyPublicIDOrPolicyNumber(policyPeriodInfo.PCPolicyPublicID, policyPeriodInfo.TermNumber, policyPeriodInfo.PolicyNumber)
    if (period == null) {
      return null
    }
    var accountNumber: String
    if (period.OverridingPayerAccount != null) {
      accountNumber = period.OverridingPayerAccount.AccountCurrencyGroup != null
          ? period.OverridingPayerAccount.AccountCurrencyGroup.MainAccount.AccountNumber
          : period.OverridingPayerAccount.AccountNumber
    }
    return new IssuePolicyInfo() {
        : PaymentPlanPublicId = period.PaymentPlan.PublicID,
        : BillingMethodCode = period.BillingMethod.Code,
        : AltBillingAccountNumber = accountNumber,
        : InvoiceStreamId = period.OverridingInvoiceStream.PublicID,
        : Currency = period.Currency.Code
    }
  }

  /**
   * Retrieves {@link UnappliedFund}s {@link PCUnappliedInfo information} for
   *    those associated with the identified {@link Account account}.
   *
   * Delete this method if you are running Multi-Currency mode!
   *
   * @param accountNumber the account number of the {@code account}
   * @return An array of information on the unapplied funds for the
   *         {@code account}
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getUnapplieds(accountNumber: String): PCUnappliedInfo[] {
    return getUnappliedFunds(accountNumber, null)
  }

  /**
   * Retrieves {@link UnappliedFund}s {@link PCUnappliedInfo information} for
   *    those associated with the identified {@link Account account} for the
   *    {@link Currency currency} or an empty list if the {@code account} does
   *    not exist.
   *
   * @param accountNumber the account number of the {@code account}
   * @param currency the currency for which the {@code UnappliedFunds} should
   *                 apply; if {@code null}, then this defaults to the
   *                 identified {@code account}
   * @return An array of information on the unapplied funds for the
   *         {@code account} and {@code currency}
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  function getUnappliedFunds(
      accountNumber : String, currency : Currency = null) : PCUnappliedInfo[] {
    final var acct = findCurrencyAccount(accountNumber, currency)
    if (acct == null) {
      return {} // no account or splinter so no unapplieds...
    }
    return acct.UnappliedFunds
        .map(\ unappliedFund -> new PCUnappliedInfo(unappliedFund))
  }

  /**
   * Retrieves {@link PaymentInstrumentRecord} data for all {@link
   *    PaymentInstrument}s associated with the identified {@link Account
   *    account} for the {@link Currency currency} or a list of the default
   *    immutable instruments if the {@code account} does not exist.
   *
   * @param accountNumber the account number of the {@code account}
   * @param currency the currency for which the instruments should apply;
   *                 if {@code null}, then this defaults to the identified
   *                 {@code account}
   * @return An array of information on payment instruments for the
   *         {@code account}
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  function getAccountPaymentInstruments(accountNumber : String,
      currency : Currency = null) : PaymentInstrumentRecord[] {
    final var account = findCurrencyAccount(accountNumber, currency)
    // if account or splinter does not (yet) exist, return default...
    final var instruments = (account == null)
        // of the immutables, responsive only...
        ? {PaymentInstrumentFactory.ResponsivePaymentInstrument}
        // only owned or of the immutables, responsive...
        : account.PaymentInstruments.where(\ instr -> instr.Account == account
            or instr == PaymentInstrumentFactory.ResponsivePaymentInstrument)
    return instruments
        .map(\ instrument -> PaymentInstruments.toPCRecord(instrument))
        .toTypedArray()
  }

  /**
   * Creates a {@link PaymentInstrument} as described by the {@link
   *    PaymentInstrumentRecord} for the {@link Account} identified by the
   *    {@code AccountNumber} and {@link Currency}.
   *
   * @param accountNumber the account number of the {@code account}
   * @param currency the currency for which the instrument applies relative to
   *                 the identified {@code account}
   * @param paymentInstrumentRecord the data that describes the {@link
   *                                PaymentInstrument} to be created
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  @Throws(DataConversionException, "The PaymentInstrument identified by the non-null PublicID already exists in the system)")
  @Throws(DataConversionException, "If paymentInstrumentRecord.OneTime is true")
  function createPaymentInstrumentOnAccount(accountNumber : String, currency : Currency,
      paymentInstrumentRecord : PaymentInstrumentRecord) : PaymentInstrumentRecord {
    if (CurrencyUtil.isMultiCurrencyMode()) {
      require(currency, "Currency")
    }
    PaymentInstruments.validateForCreation(paymentInstrumentRecord)

    var newInstrument : PaymentInstrument
    Transaction.runWithNewBundle(\ bundle -> {
        final var account =
            findAccountOrSiblingForCurrency(accountNumber, currency, bundle)
        newInstrument = PaymentInstruments.toEntity(paymentInstrumentRecord)
        newInstrument.Account = account
      })
    return PaymentInstruments.toPCRecord(newInstrument)
  }

  /**
   * Look-up and return an {@link Account} identified by its account number
   *    and the specified currency if any.
   *
   * This looks up an account identified by the account number. If it matches
   * the specified currency (or the currency is not specified [{@code null}],
   * then it is returned. Otherwise, the splinter account for the currency
   * is looked up and returned.
   *
   * @param accountNumber the account number of the {@code account}
   * @param currency the (optional) currency that identifies the specific
   *                 {@code account}
   * @return The main or splinter {@link Account} for the {@code currency} and
   *         identified by the account number, if it exists.
   */
  private function findCurrencyAccount(
      accountNumber : String, currency : Currency = null) : Account {
    require(accountNumber, "accountNumber")
    if (CurrencyUtil.isMultiCurrencyMode()) {
      require(currency, "Currency")
    }
    var account = findAccountResult(accountNumber).AtMostOneRow
    if (account != null && currency != null && account.Currency != currency) {
      /* get associated splinter account for different currency... */
      account = (account.AccountCurrencyGroup == null)
          ? null : findExistingAccountForCurrency(
              account.AccountCurrencyGroup, currency)
    }
    return account
  }

  internal static function findExistingAccountForCurrency(
      accountGroup : MixedCurrencyAccountGroup, currency : Currency) : Account {
    // might've already splintered but not yet committed...
    final var currentBundle = gw.transaction.Transaction.Current
    final var createdSplinter = (currentBundle == null)
        ? null
        : currentBundle.getBeansByRootType(Account)
            .firstWhere(\ b -> b typeis Account
                && b.AccountCurrencyGroup == accountGroup && b.Currency == currency) as Account

    return createdSplinter ?: Query.make(Account)
        .compare("Currency", Equals, currency)
        .subselect("ID", CompareIn,
            Query.make(AccountCurrencyGroup)
                .compare("ForeignEntity", Equals, accountGroup), "Owner")
        .select().AtMostOneRow
  }

  private function convertPaymentPlansToDTO(plans: Iterable<PaymentPlan>)
      : PaymentPlanInfo[] {
    return plans
        .map(\paymentPlan -> {
          var paymentPlanInfo = new PaymentPlanInfo()
          paymentPlanInfo.copyPaymentPlanInfo(paymentPlan)
          return paymentPlanInfo
        })
        .toTypedArray()
  }

  private function findPaymentPlansFor(currency : Currency) : PaymentPlanInfo[] {
    return convertPaymentPlansToDTO(PaymentPlan.finder
        .findAllAvailablePlans<PaymentPlan>(PaymentPlan, currency,
            \ query -> query.compare("UserVisible", Equals, true)))
  }

  private function findAllSplinterIdsFor(ids: Set<Key>): Set<Key> {
    final var groupsQuery = Query.make(AccountCurrencyGroup)
    groupsQuery.compareIn("Owner", ids.toArray())
    final var resultsQuery = Query.make(AccountCurrencyGroup).withDistinct(true)
    resultsQuery.subselect("ForeignEntity", CompareIn, groupsQuery, "ForeignEntity")

    return resultsQuery.select().map(\currencyGroup -> currencyGroup.Owner.ID).toSet()
  }

  static internal function createAccountForCurrency(parentAccount: Account, currency: Currency): Account {
    Preconditions.checkState(!parentAccount.ListBill,
        displaykey.Java.Error.Account.ListBill.SplinterAccount)

    parentAccount = gw.transaction.Transaction.Current.add(parentAccount)// ensure writable...

    var account = parentAccount.createSplinterAccountForCurrency(currency)
    account.AccountNameKanji = parentAccount.AccountNameKanji
    account.InvoiceDayOfMonth = parentAccount.InvoiceDayOfMonth
    account.InvoiceDeliveryType = parentAccount.InvoiceDeliveryType
    account.BillingPlan =
        BillingPlan.finder.findFirstActivePlan(BillingPlan, account.Currency)
    account.DelinquencyPlan =
        DelinquencyPlan.finder.findFirstActivePlan(DelinquencyPlan, account.Currency)
    account.BillingLevel = parentAccount.BillingLevel
    account.ServiceTier = parentAccount.ServiceTier

    for (var contact in parentAccount.Contacts) {
      var newContact = new AccountContact(account.Bundle)
      newContact.Account = account
      newContact.Contact = contact.Contact
      newContact.PrimaryPayer = contact.PrimaryPayer
      for (var contactRole in contact.Roles) {
        var copiedContactRole = new AccountContactRole(account.Bundle)
        copiedContactRole.Role = contactRole.Role
        newContact.addToRoles(copiedContactRole)
      }
      account.addToContacts(newContact)
    }
    return account
  }
}
