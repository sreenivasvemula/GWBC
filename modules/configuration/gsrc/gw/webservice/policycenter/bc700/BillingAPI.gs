package gw.webservice.policycenter.bc700

uses com.guidewire.pl.system.exception.DBDuplicateKeyException
uses com.guidewire.pl.system.transaction.CommitOptions
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.webservice.exception.AlreadyExecutedException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.EntityStateException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.ServerStateException
uses gw.api.webservice.exception.SOAPServerException
uses gw.api.system.BCLoggerCategory
uses gw.invoice.InvoiceItemPreview
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc700.entity.types.complex.AgencyBillPlanInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.CancelPolicyInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.CommissionPlanInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.FinalAuditInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.IssuePolicyInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.NewProducerCodeInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PCAccountInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PCContactInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PCPolicyPeriodInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PCProducerInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PaymentPlanInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PolicyChangeInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.PremiumReportInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.ProducerCodeInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.ReinstatementInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.RenewalInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.RewriteInfo

uses java.lang.Exception
uses java.lang.Integer
uses java.lang.Iterable
uses java.util.Date

/**
 * The custom API that supports integration with Policy Center 7, and which may
 * be maintained by Policy Center.
*/
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/BillingAPI" )
@Export
class BillingAPI {
  /**
   * Search for billing center account given the search criteria
   *
   * @param searchCriteria the search criteria
   * @return the list of account numbers
   */
  @Throws(BadIdentifierException, "If there are too many results")
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function searchForAccounts(searchCriteria : BCAccountSearchCriteria, limit : Integer) : BCAccountSearchResult[]{
    var results = searchCriteria.searchForAccountNumbers()
    if (limit == null) {
      limit = 50
    }
    if (results.getCountLimitedBy(limit + 1) > limit) {
      throw new BadIdentifierException(displaykey.Java.Search.TooManyResults(limit))
    }
    return results.map(\ a -> new BCAccountSearchResult(a)).toTypedArray()
  }

  /**
   * Retrieves all invoice streams associated with the given account or empty list if account
   * does not exist.
   *
   * @param accountNumber the account number
   * @return the list of invoice streams
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getAccountInvoiceStreams(accountNumber : String) : InvoiceStreamInfo[]{
    require(accountNumber, "accountNumber")
    var account = findAccountResult(accountNumber).AtMostOneRow
    if (account == null) {
      return {} // this may be called for a newly created account in policy system
    }
    return account.InvoiceStreams.map(\ i -> new InvoiceStreamInfo(i))
  }

  /**
   * Searches and Returns all the sub-accounts of the given account. The search is recursive and
   * will returns all the sub-accounts under the tree.
   *
   * @param accountNumber the account number
   * @return an array of account number
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(BadIdentifierException, "If cannot find the policy period of account specified")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getAllSubAccounts(accountNumber : String) : BCAccountSearchResult[]{
    final var account = findAccountIdentifiedBy(accountNumber)
    // TODO mvu: we should handle the case when accounts are circular referenced
    var result : List<BCAccountSearchResult> = {}
    var parents = new Account[]{account}
    while(parents.HasElements) {
      var query = new Query<ParentAcct>(ParentAcct)
      query.compareIn("ForeignEntity", parents)
      query.join("Owner").compare("CloseDate", Relop.Equals, null)
      var children = query.select<Account>(\ p -> p.Owner).toTypedArray()
      children.each(\ s -> result.add(new BCAccountSearchResult(s)))
      parents = children
    }
    return result.toTypedArray()
  }

  /*** ALL FUNCTIONS BELOW EXIST IN BC 300 ***/
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
  function transferPolicyPeriods(policyPeriodInfos : PCPolicyPeriodInfo[],
    targetAccountNumber : String,transactionId : String) {
      require(policyPeriodInfos, "policyPeriodInfos")
      require(targetAccountNumber, "targetAccountNumber")

      var result = findAccountResult(targetAccountNumber)
      if (result.Count != 1) {
        throw new BadIdentifierException("Found ${result.Count} account associated with account number ${targetAccountNumber}")
      }
      if (policyPeriodInfos.IsEmpty) {
        throw new RequiredFieldException("policyPeriodInfos cannot be empty")
      }
      tryCatch(\ bundle -> {
        var transfer = new AccountTransfer(bundle)
        transfer.ToAccount = result.AtMostOneRow
        var transfers = policyPeriodInfos.map(\ info -> {
          var period = info.findPolicyPeriod()
          var periodHolder = new AccountTransferPolicyPeriod(bundle)
          periodHolder.AccountTransfer = transfer
          periodHolder.PolicyPeriod = period
          periodHolder.Transfer = true
            return periodHolder
          })
        transfer.setFieldValue("PolicyPeriods", transfers)
        transfer.doTransfer()
        return null // doesn't matter
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
  function isAccountExist(accountNumber : String) : boolean {
    require(accountNumber, "accountNumber")
    var p = findAccountResult(accountNumber).Count
    if (p > 1) {
      throw new EntityStateException("Found more than 1 account with number: " + accountNumber)
    }
    return p > 0
  }

  private function findAccountResult(accountNumber: String) : AccountQuery {
    var query = Query.make(Account)
    query.compare("AccountNumber", Relop.Equals, accountNumber)
    return query.select()
  }

  /**
   * Create a new account
   * @param accountInfo the account information
   * @return the new account public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(DBDuplicateKeyException, "if the account number is duplicated")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function createAccount(accountInfo : PCAccountInfo, transactionId : String) : String {
    require(accountInfo, "accountInfo")
    // no need to check for account number uniqueness and let the db check for it as well as
    // checking if the transaction id is the same which means this request is duplicated
    // (may be by a retry) and ignore the call.
    var id = tryCatch( \ bundle -> {
      var account = accountInfo.toNewAccount(bundle)
      return account.AccountNumber
    }, transactionId)
    return id
  }

  /**
   * Update an existing account
   * @param accountInfo the account information
   * @return the account public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateAccount(accountInfo : PCAccountInfo, transactionId : String) : String {
    require(accountInfo, "accountInfo")
    var publicID = tryCatch( \ bundle -> {
      var account : Account
      account = accountInfo.toAccount(bundle)
      return account.PublicID
    }, transactionId)
    return publicID
  }

  /**
   * Return all the billing method that the given producer support
   *
   * @param producerName the name of the producer
   * @return the list of billing methods that the producer support
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no producer exists with the given producer code")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function getAvailableBillingMethods(producerCodeId : String) : String[] {
    require(producerCodeId, "producerCodeId")
    var qp = Query.make(ProducerCode).compare("PublicID", Equals, producerCodeId).select()
    if (qp.Empty) {
      throw new BadIdentifierException("No producer code found with public id: " + producerCodeId)
    } else if (qp.Count > 1) {
      throw new ServerStateException("Found ${qp.Count} producer codes with public id: ${producerCodeId}")
    }

    return (qp.AtMostOneRow.Producer.AgencyBillPlan == null)
        ? new String[] {"DirectBill"}
        : new String[] {"DirectBill", "AgencyBill"}
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
  function issuePolicyPeriod(issuePolicyInfo : IssuePolicyInfo, transactionId : String) : String {
    require(issuePolicyInfo, "issuePolicyInfo")
    var publicID = tryCatch( \ bundle -> {
      return issuePolicyInfo.executeIssuanceBI()
    }, transactionId)
    return publicID
  }
  
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function previewInstallmentPlanInvoices(policyChangeInfo : PolicyChangeInfo) : InvoiceItemPreview[] {
    require(policyChangeInfo, "policyChangeInfo")
    var policyChange : PolicyChange
    com.guidewire.bc.util.BCBundleUtil.runWithNonPersistentBundle(\ bundle -> {
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
    return createInvoiceItemsPreview(policyChange.PolicyPeriod.InvoiceItems)
  }

  /**
   * Generates a preview of the installment schedule that'd be created for the given new policy.  The new policy is
   * encapsulated in an Issuance billing instruction, so that there is enough context to properly simulate the invoice
   * generation.
   * @param issuePolicyInfo the information to issue a policy period
   * @return the preview invoices
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function previewInstallmentsPlanInvoices(issuePolicyInfo : IssuePolicyInfo)
          : InvoiceItemPreview[] {
    require(issuePolicyInfo, "issuePolicyInfo")
    var issuance : Issuance
    com.guidewire.bc.util.BCBundleUtil.runWithNonPersistentBundle(\ bundle -> {
      issuance = issuePolicyInfo.toIssuanceForPreview()
      issuance.execute()
      var account = issuance.IssuanceAccount
      // normally installment fees, if any, are added when the invoice is billed. Since this preview needs to "pretend"
      // that all of the invoices have been billed, we need to add the invoice/installment fees explicitly.
      for (var invoice in account.InvoicesSortedByDate) {
        invoice.addFees()
      }
    })
    var invoiceItemPreviews = createInvoiceItemsPreview(issuance.NewPolicyPeriod.InvoiceItems)
    changeEarliestItemPreviewToDownPayment(invoiceItemPreviews)
    return invoiceItemPreviews
  }

  /**
   * Updates the written date on the given charge
   *
   * @param charge              The charge for which the written date should be updated
   * @param writtenDate         The new written date
   */
  @Throws(DataConversionException, "if the charge or writtenDate variable is null")
  function updateChargeWrittenDate(chargeID : String, writtenDate : Date) {
    require(chargeID, "charge")
    require(writtenDate, "writtenDate")
    var charge = Query.make(Charge).compare("PublicID", Equals, chargeID).select().FirstResult
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
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
  @Throws(DataConversionException, "if the policyNumber or termNumber or isConfirmed variable is null")
  function updatePolicyPeriodTermConfirmed(policyNumber : String, termNumber : int,
                                           isConfirmed : Boolean) {
    require(policyNumber, "policy number")
    require(termNumber, "policy period term number")
    require(isConfirmed, "isConfirmed")
    var policyPeriod = PolicyPeriod.finder.findByPolicyNumberAndTerm(policyNumber, termNumber)
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.TermConfirmed = isConfirmed
    })
  }

  private function createInvoiceItemsPreview(invoiceItems : InvoiceItem[])
        : InvoiceItemPreview[] {
    var itemDateByAmountMap = invoiceItems
        .partition(\ item -> item.InvoiceDueDate)
        .mapValues(\ amtItems -> amtItems.sum(\ item -> item.Amount))

    return itemDateByAmountMap.Keys.map(\ dueDate ->
        new InvoiceItemPreview(
            null, dueDate, null, itemDateByAmountMap[dueDate], TC_INSTALLMENT)
      ).toTypedArray()
  }

  private function changeEarliestItemPreviewToDownPayment(invoicePreviews : InvoiceItemPreview[]) {
    var assumedDownPaymentInvoice = invoicePreviews.minBy(\ invoicePreview -> invoicePreview.InvoiceDueDate)
    if (assumedDownPaymentInvoice != null) {
      assumedDownPaymentInvoice.Type = TC_DEPOSIT
    }
  }

  private function tryCatch<T>(call : block(bundle : Bundle) : T, tid : String) : T {
    // check the uniqueness of the transaction id
    // this is just one way of getting what we need (by let pl commit to transactionid table)
    // we can just commit the transactionid as key to any table and throw AlreadyExecuteException
    // when appropriate
    if (!Query.make(entity.TransactionId).compare("tid", Equals, tid).select().Empty) {
      throw new AlreadyExecutedException("Transaction ${tid} is already executed")
    }
    var result : T
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      try {
        setTransactionIDForBundle(bundle, tid)
        result = call(bundle)
      } catch(e : com.guidewire.pl.system.exception.DBAlreadyExecutedException) {
        // this can still happen after the checked above because of race condition
        e.printStackTrace()
        throw new AlreadyExecutedException("Transaction ${tid} is already executed")
      } catch(e : Exception) {
        BCLoggerCategory.BILLING_API.error(e)
        throw e
      }
    })
    return result
  }

  private function setTransactionIDForBundle(bundle : Bundle, transactionID : String) {
    var entityBundle = gw.pl.persistence.core.Bundle.Type.TypeInfo.getMethod("getBundle", {})
      .CallHandler.handleCall(bundle, {})
    var options = entityBundle.Class.getMethod("getCommitOptions", {})
      .invoke(entityBundle, {}) as CommitOptions
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
  function cancelPolicyPeriod(cancelInfo : CancelPolicyInfo, transactionId : String) : String {
    require(cancelInfo, "cancelInfo")
    var publicID = tryCatch( \ bundle -> {
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
  function changePolicyPeriod(changeInfo : PolicyChangeInfo, transactionId : String) : String {
    require(changeInfo, "changeInfo")
    var publicID = tryCatch( \ bundle -> {
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
  function reinstatePolicyPeriod(reinstatementInfo : ReinstatementInfo, transactionId : String) : String {
    require(reinstatementInfo, "reinstatementInfo")
    var publicID = tryCatch( \ bundle -> {
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
  function issueFinalAudit(finalAuditInfo : FinalAuditInfo, transactionId : String) : String {
    require(finalAuditInfo, "finalAuditInfo")
    var publicID = tryCatch( \ bundle -> {
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
  function issuePremiumReport(premiumReportInfo : PremiumReportInfo, transactionId : String) : String {
    require(premiumReportInfo, "premiumReportInfo")
    var publicID = tryCatch( \ bundle -> {
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
  function renewPolicyPeriod(renewalInfo : RenewalInfo, transactionId : String) : String {
    require(renewalInfo, "renewalInfo")
    var publicID = tryCatch( \ bundle -> {
      return renewalInfo.executeRenewalBI()
    }, transactionId)
    return publicID
  }

  /**
   * Rewrite an existing policy period.
   *
   * @param renewalInfo information to rewrite the policy period
   * @return the Rewrite billing instruction's public id
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no policy exists with the given number")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function rewritePolicyPeriod(rewriteInfo : RewriteInfo, transactionId : String) : String {
    require(rewriteInfo, "rewriteInfo")
    var publicID = tryCatch( \ bundle -> {
      return rewriteInfo.executeRewriteBI()
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
    return AgencyBillPlan.finder
        .findAllAvailablePlans<AgencyBillPlan>(AgencyBillPlan, null)
        .map(\ plan -> {
          var planInfo = new AgencyBillPlanInfo()
          planInfo.copyPlanInfo(plan)
          return planInfo
        }).toTypedArray()
  }

  /**
   * Return an array of all Commission Plans in BC
   * @return array of commission plan info objects
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getAllCommissionPlans() : CommissionPlanInfo[] {
    return CommissionPlan.finder
        .findAllAvailablePlans<CommissionPlan>(CommissionPlan, null)
        .map(\ plan -> {
          var planInfo = new CommissionPlanInfo()
          planInfo.copyCommissionPlanInfo(plan)
          return planInfo
        }).toTypedArray()
    }

  /**
   * Create a producer in BC
   * @param producerInfo necessary information to create producer
   * @return the public id of the producer created
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function createProducer(producerInfo : PCProducerInfo, transactionId : String) : String {
    require(producerInfo, "producerInfo")
    var publicID = tryCatch( \ bundle -> {
      var producer = producerInfo.toProducer()
      producer.Bundle.commit()
      return producer.PublicID
    }, transactionId)
    return publicID
  }

  /**
   * Update an existing producer in BC
   * @param producerInfo necessary information to create producer
   * @return the public id of the producer created
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(BadIdentifierException, "If no producer exists with the given public id")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateProducer(producerInfo : PCProducerInfo, transactionId : String) : String {
    require(producerInfo, "producerInfo")
    var publicID = tryCatch( \ bundle -> {
      var producer : Producer
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
  function isProducerExist(producerId : String) : boolean {
    require(producerId, "producerId")
    return !Query.make(Producer).compare("PublicID", Equals, producerId).select().Empty
  }

  /**
   * Create a producer code in BC. Will not create a duplicate if the given Producer Code already exists.
   *
   * @param producerCodeInfo: necessary information to create producer code
   * @return the public id of the producer code created
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function createProducerCode(producerCodeInfo : NewProducerCodeInfo, transactionId : String) : String {
    require(producerCodeInfo, "producerCodeInfo")
    if (!Query.make(ProducerCode).compare("PublicID", Equals, producerCodeInfo.PublicID).select().Empty) {
      return producerCodeInfo.PublicID
    }
    return tryCatch( \ bundle -> {
      var producerCode = producerCodeInfo.toNewProducerCode(bundle)
      return producerCode.PublicID
    }, transactionId)
  }

  /**
   * Update an existing producer code in BC. The fields on producer code that can be updated via the
   * ProducerCodeInfo are Active and Code.
   *
   * @param producerCodeInfo necessary information to update producer code
   * @return the public id of the producer code created
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no producer code exists with the given public id")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateProducerCode(producerCodeInfo : ProducerCodeInfo, transactionId : String) : String {
    require(producerCodeInfo, "producerCodeInfo")
    var publicID = tryCatch( \ bundle -> {
      var producerCode : ProducerCode
      producerCodeInfo.toProducerCode( bundle )
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
  function isProducerCodeExist(producerId : String, code : String) : boolean {
    require(producerId, "producerId")
    var q = Query.make(Producer)
    q.compare("PublicID", Equals, producerId)
    var producerCodeTable = q.join(ProducerCode, "Producer")
    producerCodeTable.compare("Code", Equals, code)
    return !q.select().Empty
  }

  /**
   * Update a contact with the given contact's public id
   * @param contactInfo information necessary for updating the contact
   * @@param transactionId the transaction id to make this call idempotent
   * @return an array of public ids of all the contacts that were updated
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  @Throws(AlreadyExecutedException, "if the SOAP request is already executed")
  @Throws(BadIdentifierException, "If no contact exists with the given public id")
  @Throws(RequiredFieldException, "If required parameter is missing.")
  function updateContact(contactInfo : PCContactInfo, transactionId : String) : String[] {
    require(contactInfo, "contactInfo")
    var publicIDs = tryCatch( \ bundle -> {
      var contact = contactInfo.toContact( bundle )
      // if this contact is an account holder contact, update account name
      for (accountNumber in contactInfo.AccountNumbers) {
        var account = findAccountResult(accountNumber).FirstResult
        if (account != null) {
          bundle.add(account).AccountName = contactInfo.DisplayName
        }
      }
      return new String[]{contact.PublicID}
    }, transactionId)
    return publicIDs
  }

  /**
   * Gets all of the available payment plans in the system.  Only plans which are effective (ie effectiveDate &lt=
   * current date &lt= expiration date) are returned.
   *
   * @return the available payment plans
   */
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getAllPaymentPlans() : PaymentPlanInfo[] {
    return convertPaymentPlansToDTO(findAllPaymentPlans())
  }

  /**
   * Gets all of the available payment plans for an account
   *
   * @return the payment plans associated with an account
   */
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(SOAPServerException, "If communication error or any other problem occurs.")
  function getPaymentPlansForAccount( accountNumber : String ) : PaymentPlanInfo[]{
    final var acct = findAccountIdentifiedBy(accountNumber)

    // For all non-list bill accounts, return all available pay plans
    final var currentDate = Date.CurrentDate
    return !acct.ListBill
      ? getAllPaymentPlans()
      : convertPaymentPlansToDTO(acct.PaymentPlans
          .where(\ plan -> plan.EffectiveDate <= currentDate
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
  function waiveFinalAudit(policyPeriodInfo : PCPolicyPeriodInfo, transactionId : String) : String {
    require(policyPeriodInfo, "policyPeriodInfo")
    var publicID = tryCatch( \ bundle -> {
      var period = policyPeriodInfo.findPolicyPeriod()
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
  function scheduleFinalAudit(policyPeriodInfo : PCPolicyPeriodInfo, transactionId : String) : String {
    require(policyPeriodInfo, "policyPeriodInfo")
    var publicID = tryCatch( \ bundle -> {
      var period = policyPeriodInfo.findPolicyPeriod()
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
  function getPolicyPeriod(policyPeriodInfo : PCPolicyPeriodInfo) : IssuePolicyInfo {
    require(policyPeriodInfo, "policyPeriodInfo")
    var period = PolicyPeriod.finder.findByPolicyNumberAndTerm(policyPeriodInfo.PolicyNumber, policyPeriodInfo.TermNumber)
    if (period == null) {
      return null
    }
    var policyInfo = new IssuePolicyInfo()
    policyInfo.PaymentPlanPublicId = period.PaymentPlan.PublicID
    policyInfo.BillingMethodCode = period.BillingMethod.Code
    policyInfo.AltBillingAccountNumber = period.OverridingPayerAccount.AccountNumber
    policyInfo.InvoiceStreamId = period.OverridingInvoiceStream.PublicID
    return policyInfo
  }

  private function require(element : Object, parameterName : String) {
    if (element == null) {
      throw new RequiredFieldException(displaykey.Webservice.Error.MissingRequiredField(parameterName))
    }
  }

  @Throws(BadIdentifierException, "If no account exists with the given account number")
  private function findAccountIdentifiedBy(accountNumber : String) : Account {
    require(accountNumber, "accountNumber")

    final var account = findAccountResult(accountNumber).AtMostOneRow
    if (account == null) {
      throwAccountNotFound(accountNumber)
    }
    return account
  }

  private function throwAccountNotFound(accountNumber : String) {
    throw new BadIdentifierException(
        displaykey.BillingAPI.Error.AccountNotFound(accountNumber))
  }

  private function findAllPaymentPlans() : IQueryBeanResult<PaymentPlan> {
    final var planResult = PaymentPlan.finder
        .findAllAvailablePlans<PaymentPlan>(PaymentPlan, null,
            \ query -> query.compare("UserVisible", Equals, true))
    return planResult
  }

  private function convertPaymentPlansToDTO(plans : Iterable<PaymentPlan>)
        : PaymentPlanInfo[] {
    return plans
      .map(\ paymentPlan -> {
        var paymentPlanInfo = new PaymentPlanInfo()
        paymentPlanInfo.copyPaymentPlanInfo(paymentPlan)
        return paymentPlanInfo})
      .toTypedArray()
  }
}
