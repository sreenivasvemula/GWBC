package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.web.invoice.InvoicingOverrider
uses gw.api.web.policy.NewPolicyUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.policycenter.bc801.entity.types.complex.IssuePolicyInfo

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
   *<p/>
   * Setting of the {@link NewPlcPeriodBI#setPolicyPaymentPlan PolicyPaymentPlan}
   * must be invoked <em>before</em> {@link #populateIssuanceInfo()} when prior
   * {@link PolicyPeriod} exists but not otherwise because of invoicing override
   * (ListBill) validation that occurs.
   */
  function initPolicyPeriodBIInternal(final bi: NewPlcyPeriodBI) {
    bi.PrimaryProducerCodeRoleEntry.ProducerCode = this.ProducerCode
    bi.PolicyPaymentPlan = this.PaymentPlan
    bi.OfferNumber = this.OfferNumber
  }

  private function createNewPolicyBIInternal() : NewPlcyPeriodBI {
    return NewPolicyUtil.createIssuance(
        findOwnerAccount(), createPolicyPeriod(false))
  }

  /**
   * @deprecated since 8.0.1; use {@link #findOwnerAccount()} instead
   */
  @java.lang.Deprecated
  function findExistingAccount() : Account {
    return findOwnerAccount()
  }

  /**
   * Look-up existing owner {@link Account account} for this
   *    {@link IssuePolicyInfo issue}.
   *
   * If the currency of the {@code Account} is not the same as for the {@code
   * IssuePolicyInfo}, then find one or create a new one in the same {@link
   * MixedCurrencyAccountGroup} for the existing owner {@code account}.
   */
  function findOwnerAccount() : Account {
    var account = findExistingAccount(this.AccountNumber)
    if (account.Currency != CurrencyValue) {
      /* Get associated splinter account for different currency... */
      account = findOrCreateSplinterCurrencyAccount(account)
    }
    return account
  }

  private function findExistingAccount(accountNumber : String) : Account {
    var account = findAccount(accountNumber)
    if (account == null) {
      throw new BadIdentifierException(displaykey.BillingAPI.Error.AccountNotFound(accountNumber))
    }
    return account
  }

  private function findAccount(accountNumber : String) : Account {
    // The only time there's a new account in the bundle is when it was made by getOrCreateAccountForPreview()
    var tempAccountForPreview = gw.transaction.Transaction.getCurrent().getBeansByRootType(Account)
      .firstWhere(\ b -> b typeis Account && b.AccountNumber == accountNumber) as Account

    return tempAccountForPreview
        ?: Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
  }

  /**
   * Try to find a match using the publicID (assuming publicID is not null).
   * If a match is found, the Policy Period already exists. Otherwise, create the new Policy Period
   */
  function createPolicyPeriod(isForPreview : Boolean) : PolicyPeriod {
    if (this.PCPolicyPublicID != null
        and this.findByPolicyPublicIDAndTerm(this.PCPolicyPublicID, this.TermNumber) != null) {
      throw new BadIdentifierException(
          displaykey.Webservice.Error.PolicyPeriodExists(this.PCPolicyPublicID))
    }
    var policy = new Policy(CurrencyValue)
    var period = new PolicyPeriod(policy.Currency)
    policy.addToPolicyPeriods( period )
    period = populateIssuanceInfo(isForPreview, period)
    return period
  }

  private function findOrCreateOwnerAccountForPreview() : Account {
     var account = findOrCreateAccountForPreview(this.AccountNumber)
    if (account.Currency != this.Currency) {
      account = findOrCreateSplinterCurrencyAccount(account)
    }
    return account
  }

  private function findOrCreateAccountForPreview(accountNumber : String) : Account {
    var account = findAccount(accountNumber)
    if (account == null) {
      account = new Account(this.Currency)
      account.AccountNumber = this.AccountNumber
      PCAccountInfoEnhancement.initializeAccountDefaults(account)
    }
    return account
  }

  function toIssuanceForPreview() : Issuance {
    final var account = findOrCreateOwnerAccountForPreview()
    final var period = createPolicyPeriod(true)

    var issuance = new Issuance(period.Currency)
    issuance.IssuanceAccount = account
    issuance.initializeIssuancePolicyPeriod(period)
    issuance.PrimaryProducerCodeRoleEntry.ProducerCode = getProducerCode()
    issuance.PolicyPaymentPlan = PaymentPlan
    this.createCharges(issuance)
    return issuance
  }

  property get ProducerCode() : ProducerCode {
    if (this.ProducerCodeOfRecordId == null) {
      return null
    }
    var mainProducerCode = WebserviceEntityLoader
        .loadByPublicID<ProducerCode>(this.ProducerCodeOfRecordId, "ProducerCodeOfRecordId")
    if (mainProducerCode.Currency == this.CurrencyValue) {
      return mainProducerCode
    }
    final var producerCurrencyGroup = mainProducerCode.Producer.ProducerCurrencyGroup
    if (producerCurrencyGroup != null) {
      // look in splinter Producer for Currency ProducerCodes...
      final var splinterCode = Query.make(entity.ProducerCode)
          .compare("Code", Equals, mainProducerCode.Code)
          .subselect("Producer", CompareIn, Query.make(ProducerCurrencyGroup)
              .compare("CurrencyInGroup", Equals, this.CurrencyValue)
              .compare("ForeignEntity", Equals, producerCurrencyGroup),
            "Owner")
        .select().AtMostOneRow
      if (splinterCode != null) {
        return splinterCode
      }
    }
    throw new BadIdentifierException(
        displaykey.BillingAPI.Error.ProducerCodeForCurrencyDoesNotExist(
            this.ProducerCodeOfRecordId, this.CurrencyValue))
  }

  function populateIssuanceInfo(isForPreview : Boolean, policyPeriod : PolicyPeriod) : PolicyPeriod {
    this.populateChangeInfo( policyPeriod )
    policyPeriod.BillingMethod = isForPreview
        ? TC_DIRECTBILL : PolicyPeriodBillingMethod.get(this.BillingMethodCode)
    final var overridingPayerAccount = findOverridingPayerAccount(isForPreview)
    if (overridingPayerAccount != policyPeriod.OverridingPayerAccount) {
      policyPeriod.updateWith(
          new InvoicingOverrider().withOverridingPayerAccount(overridingPayerAccount))
    }

    final var overridingInvoiceStream =
        policyPeriod.AgencyBill
            ? null
            : getOverridingInvoiceStream(policyPeriod.Bundle, overridingPayerAccount)
    if (overridingInvoiceStream != policyPeriod.OverridingInvoiceStream) {
      policyPeriod.updateWith(
          new InvoicingOverrider().withOverridingInvoiceStream(overridingInvoiceStream))
    }
    policyPeriod.PolicyNumber = this.PolicyNumber
    policyPeriod.Policy.PCPublicID = this.PCPolicyPublicID
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

  property get CurrencyValue() : Currency {
    return Currency.get(this.Currency)
  }

  property get PaymentPlan() : PaymentPlan {
    var paymentPlan = WebserviceEntityLoader
        .loadByPublicID<PaymentPlan>(this.PaymentPlanPublicId, "PaymentPlanPublicId")
    if (paymentPlan.Currency != CurrencyValue) {
      throw new BadIdentifierException(
          displaykey.Webservice.Error.PaymentPlanBadCurrency(
              this.PaymentPlanPublicId, paymentPlan.Currency, CurrencyValue))
    }
    return paymentPlan
  }

  /**
   * @deprecated since 8.0.2; use {@link #PaymentPlan} instead
   */
  @gw.lang.Deprecated("Use PaymentPlan property", "8.0.2")
  function findExistingPaymentPlan() : PaymentPlan {
    return PaymentPlan
  }

  private function findOverridingPayerAccount(isForPreview : boolean) : Account {
    if (this.AltBillingAccountNumber == null) {
       return null
    }
    var payerAccount = isForPreview
        ? findOrCreateAccountForPreview(this.AltBillingAccountNumber)
        : findExistingAccount(this.AltBillingAccountNumber)
    if (payerAccount.Currency != CurrencyValue) {
      /* Get associated splinter account for different currency... */
      payerAccount = findOrCreateSplinterCurrencyAccount(payerAccount)
    }
    return payerAccount
  }

  private function getOverridingInvoiceStream(bundle : Bundle, overridingPayer : Account) : InvoiceStream {
    if (this.InvoiceStreamId != null) {
      return findInvoiceStreamWithPublicId(this.InvoiceStreamId)
    }
    if (this.NewInvoiceStream != null) {
      final var payer = overridingPayer ?: findOwnerAccount()
      return this.NewInvoiceStream.$TypeInstance.createInvoiceStreamFor(payer, bundle)
    }
    return null
  }

  private function findInvoiceStreamWithPublicId(publicID : String) : InvoiceStream {
    var invoiceStream = Query.make(InvoiceStream).compare("PublicID", Equals, publicID).select().AtMostOneRow
    if (invoiceStream == null) {
      throw BadIdentifierException.badPublicId(InvoiceStream, publicID)
    }
    return invoiceStream
  }

  /**
   * Look up or create a splinter currency account for the specified account.
   *
   * The currency for the account is that specified on this {@link IssuePolicyInfo}.
   *
   * @param account the {@link Account} whose {@link Currency} is different than that
   *                of the policy to be issued by this {@code IssuePolicyInfo}.
   * @return The splinter currency {@code Account}.
   */
  private function findOrCreateSplinterCurrencyAccount(final account : Account) : Account {
    var splinterAccount : Account
    if (account.AccountCurrencyGroup == null) {
      splinterAccount = BillingAPI.createAccountForCurrency(account, CurrencyValue)
    } else {
      splinterAccount = findExistingAccountForCurrency(account.AccountCurrencyGroup)
      if (splinterAccount == null) {
        splinterAccount = BillingAPI.createAccountForCurrency(account, CurrencyValue)
      }
    }
    return splinterAccount
  }

  /**
   * Find and return existing sibling account for the specified account group
   *    with the currency value for this info'.
   */
  private function findExistingAccountForCurrency(accountGroup : MixedCurrencyAccountGroup) : Account {
    return BillingAPI.findExistingAccountForCurrency(accountGroup, CurrencyValue)
  }
}