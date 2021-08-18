package gw.webservice.policycenter.bc700

uses gw.api.database.Query
uses gw.api.util.CurrencyUtil
uses gw.api.web.invoice.InvoicingOverrider
uses gw.api.web.policy.NewPolicyUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc700.entity.types.complex.IssuePolicyInfo

@Export
enhancement IssuePolicyInfoEnhancement : IssuePolicyInfo {

  function executeIssuanceBI() : String {
    final var bi = createNewPolicyBIInternal()
    initPolicyPeriodBIInternal(bi)
    return this.execute(bi)
  }

  /**
   * Local {@link NewPlcyPeriodBI new PolicyPeriod Billing Instruction}
   *    initialization. Base {@link PlcyBillingInstruction} initialization
   *    occurs in {@link BillingInstructionInfo#execute}.
   */
  function initPolicyPeriodBIInternal(final bi: NewPlcyPeriodBI) {
    bi.PrimaryProducerCodeRoleEntry.ProducerCode = this.getProducerCode()
    bi.PolicyPaymentPlan = findExistingPaymentPlan()
    bi.OfferNumber = this.OfferNumber
  }

  private function createNewPolicyBIInternal() : NewPlcyPeriodBI {
    return NewPolicyUtil.createIssuance(
        findExistingAccount(), createPolicyPeriod(false))
  }

  function findExistingAccount() : Account {
    return findExistingAccount(this.AccountNumber)
  }

  private function findOwningAccount() : Account {
    return findAccount(this.AccountNumber)
  }

  private function findExistingAccount(accountNumber : String) : Account {
    var account = findAccount(accountNumber)
    if (account == null) {
      throw new BadIdentifierException("Unknown account with number: " + accountNumber)
    }
    return account
  }

  private function findAccount(accountNumber : String) : Account {

    // The only time there's a new account in the bundle is when it was made by getOrCreateAccountForPreview()
    var tempAccountForPreview = gw.transaction.Transaction.getCurrent().InsertedBeans
      .firstWhere(\ b -> b typeis Account && b.AccountNumber == accountNumber) as Account

    if (tempAccountForPreview != null){
      return tempAccountForPreview
    }

    return Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
  }

  function createPolicyPeriod(isForPreview : Boolean) : PolicyPeriod {
    var q = Query.make(PolicyPeriod)
    q.compare("PolicyNumber", Equals, this.PolicyNumber)
    q.compare("TermNumber", Equals, this.TermNumber)
    if (!q.select().Empty) {
      throw new BadIdentifierException("Policy period ${this.PolicyNumber}-${this.TermNumber} already existed")
    }
    var policy = new Policy(CurrencyUtil.getDefaultCurrency())
    var period = new PolicyPeriod(policy.Currency)
    policy.addToPolicyPeriods( period )
    period = populateIssuanceInfo(isForPreview, period)
    return period
  }

  private function findOrCreateOwnerAccountForPreview() : Account {
    return findOrCreateAccountForPreview(this.AccountNumber)
  }

  private function findOrCreateAccountForPreview(accountNumber: String) : Account {
    var account = findOwningAccount()
    if (account == null) {
      account = new Account(CurrencyUtil.getDefaultCurrency())
      account.AccountNumber = this.AccountNumber
      account.BillingPlan =
          BillingPlan.finder.findFirstActivePlan(BillingPlan, account.Currency)
      account.InvoiceDayOfMonth = 15
    }
    return account
  }

  function toIssuanceForPreview() : Issuance {
    var account = findOrCreateOwnerAccountForPreview()
    var period = createPolicyPeriod(true)

    var issuance = new Issuance(period.Currency)
    issuance.IssuanceAccount = account
    issuance.initializeIssuancePolicyPeriod(period)
    issuance.PolicyPaymentPlan = findExistingPaymentPlan()
    this.createCharges(issuance)
    return issuance
  }

  function getProducerCode() : ProducerCode {
    if (this.ProducerCodeOfRecordId == null) {
      return null
    }
    var producerCode = Query.make(entity.ProducerCode)
        .compare("PublicID", Equals, this.ProducerCodeOfRecordId).select().AtMostOneRow
    if (producerCode == null) {
      throw new BadIdentifierException("Unknown producer code with public id: " + this.ProducerCodeOfRecordId)
    }
    return producerCode
  }

  /**
   * Populate the new {@link PolicyPeriod} with values from the {@link IssuanceInfo}.
   */
  function populateIssuanceInfo(isForPreview : Boolean, policyPeriod : PolicyPeriod) : PolicyPeriod {
    this.populateChangeInfo( policyPeriod )
    policyPeriod.BillingMethod =
        isForPreview ? TC_DIRECTBILL : PolicyPeriodBillingMethod.get(this.BillingMethodCode)
    var overridingPayerAccount = findOverridingPayerAccount(isForPreview)
    if (overridingPayerAccount != policyPeriod.OverridingPayerAccount) {
      policyPeriod.updateWith(
              new InvoicingOverrider().withOverridingPayerAccount(overridingPayerAccount))
    }
    var overridingInvoiceStream =
        policyPeriod.AgencyBill ? null : getOverridingInvoiceStream(policyPeriod.Bundle)
    if (overridingInvoiceStream != policyPeriod.OverridingInvoiceStream) {
      policyPeriod.updateWith(
              new InvoicingOverrider().withOverridingInvoiceStream(overridingInvoiceStream))
    }
    policyPeriod.PolicyNumber = this.PolicyNumber
    policyPeriod.Policy.LOBCode = this.ProductCode
    policyPeriod.BoundDate = this.ModelDate.toCalendar().Time
    policyPeriod.AssignedRisk = this.AssignedRisk
    policyPeriod.UWCompany = this.UWCompanyCode
    policyPeriod.EligibleForFullPayDiscount = false
    policyPeriod.HoldInvoicingWhenDelinquent = false
    policyPeriod.ConfirmationNotificationState = TC_NOTIFYUPONSUFFICIENTPAYMENT
    policyPeriod.TermConfirmed = this.TermConfirmed

    if (this.HasScheduledFinalAudit) {
      policyPeriod.scheduleFinalAudit()
    }
    return policyPeriod
  }

  function findExistingPaymentPlan() : PaymentPlan {
    var paymentPlan = Query.make(PaymentPlan)
        .compare("PublicID", Equals, this.PaymentPlanPublicId).select().AtMostOneRow
    if (paymentPlan == null) {
      throw new BadIdentifierException("Unknown payment plan with public id: " + this.PaymentPlanPublicId)
    }
    return paymentPlan
  }

  private function findOverridingPayerAccount(isForPreview : boolean) : Account {
    if (this.AltBillingAccountNumber == null) {
       return null
    }
    return isForPreview
        ? findOrCreateAccountForPreview(this.AltBillingAccountNumber)
        : findExistingAccount(this.AltBillingAccountNumber)
  }

  private function getOverridingInvoiceStream(bundle : Bundle) : InvoiceStream {
    if (this.InvoiceStreamId != null) {
      return findInvoiceStreamWithPublicId(this.InvoiceStreamId)
    }
    if (this.NewInvoiceStream != null) {
      return this.NewInvoiceStream.$TypeInstance.createInvoiceStreamFor(findPayingAccount(), bundle)
    }
    return null
  }

  private function findInvoiceStreamWithPublicId(publicID : String) : InvoiceStream {
    var invoiceStream = Query.make(InvoiceStream).compare("PublicID", Equals, publicID).select().AtMostOneRow
    if (invoiceStream == null) {
      throw new BadIdentifierException("Unknown invoice stream with public id: " + publicID)
    }
    return invoiceStream
  }

  private function findPayingAccount() : Account {
    var overridingPayerAccount = findOverridingPayerAccount(false)
    return overridingPayerAccount != null
      ? overridingPayerAccount
      : findOwningAccount()
  }
}
