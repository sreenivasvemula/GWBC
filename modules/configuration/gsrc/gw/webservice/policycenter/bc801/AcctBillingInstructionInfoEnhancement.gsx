package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.domain.accounting.BillingInstructionUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.AcctBillingInstructionInfo_ChargeInfos
uses gw.webservice.policycenter.bc801.entity.types.complex.AcctBillingInstructionInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ChargeInfo

@Export
enhancement AcctBillingInstructionInfoEnhancement: AcctBillingInstructionInfo {


  function execute(bi : AcctBillingInstruction) : String {
    initializeBillingInstruction(bi)
    return BillingInstructionUtil.executeAndCommit(bi).PublicID
  }

  function initializeBillingInstruction(bi : AcctBillingInstruction) {
    if (bi.Account == null) {
      bi.Account = findOwnerAccount()
    }
    bi.Description = this.Description
    createCharges(bi)
  }



  property get CurrencyValue() : Currency {
    return Currency.get(this.Currency)
  }

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
    var tempAccountForPreview = gw.transaction.Transaction.getCurrent().InsertedBeans
        .firstWhere(\ b -> b typeis Account && b.AccountNumber == accountNumber) as Account

    if (tempAccountForPreview != null){
      return tempAccountForPreview
    }

    return Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
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
  private function findOrCreateSplinterCurrencyAccount(final mainAccount : Account) : Account {
    var splinterAccount : Account
    if (mainAccount.AccountCurrencyGroup == null) {
      splinterAccount = BillingAPI.createAccountForCurrency(mainAccount, CurrencyValue)
    } else {
      splinterAccount = findExistingAccountForCurrency(mainAccount.AccountCurrencyGroup)
      if (splinterAccount == null) {
        splinterAccount = BillingAPI.createAccountForCurrency(mainAccount, CurrencyValue)
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


  function addChargeInfo(chargeInfo : ChargeInfo){
    var elem = new AcctBillingInstructionInfo_ChargeInfos()
    elem.$TypeInstance = chargeInfo
    this.ChargeInfos.add(elem)
  }

  function createCharges(billingInstruction : BillingInstruction) {
    for (info in this.ChargeInfos) {
      info.$TypeInstance.toCharge(billingInstruction)
    }
  }

}
