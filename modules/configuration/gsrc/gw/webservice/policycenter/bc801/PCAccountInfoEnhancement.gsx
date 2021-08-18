package gw.webservice.policycenter.bc801

uses com.google.common.collect.Lists
uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc801.entity.types.complex.PCAccountInfo

@Export
enhancement PCAccountInfoEnhancement: PCAccountInfo {
  function toAccount(bundle: Bundle): Account {
    var account = Query.make(entity.Account).compare("AccountNumber", Equals, this.AccountNumber).select().AtMostOneRow
    if (account == null){
      throw new BadIdentifierException(displaykey.BillingAPI.Error.AccountNotFound(this.AccountNumber))
    }
    var accounts = {account}
    //find siblings
    var group = account.AccountCurrencyGroup
    if (group != null) {
      accounts = Lists.newArrayList(group.findAccounts())
    }
    var parentAccount: Account
    for (sibling in accounts) {
      if (sibling.AccountNumber == account.AccountNumber) {
        parentAccount = sibling
      }
      sibling = bundle.add(sibling)
      sibling.AccountName = this.AccountName
      sibling.AccountNameKanji = this.AccountNameKanji
      sibling.ServiceTier = this.CustomerServiceTier
      for (contact in this.BillingContacts) {
        var current = sibling.Contacts.firstWhere(\a -> a.Contact.AddressBookUID == contact.AddressBookUID)
        if (current == null) {
          var billingContact = contact.$TypeInstance.toAccountContact(sibling, {AccountRole.TC_ACCOUNTSPAYABLE})
          sibling.addToContacts(billingContact)
        } else {
          current = bundle.add(current)
          addContactRole(current, AccountRole.TC_ACCOUNTSPAYABLE)
        }
      }
      if (this.InsuredContact == null) {
        continue
      }
      var existingContact = sibling.Contacts.firstWhere(\a -> a.Contact.AddressBookUID == this.InsuredContact.AddressBookUID)
      if (existingContact == null) {
        var insured = this.InsuredContact.$TypeInstance.toAccountContact(sibling, getAccountHolderRoles())
        sibling.addToContacts(insured)
      } else {
        existingContact = bundle.add(existingContact)
        addContactRole(existingContact, AccountRole.TC_INSURED)
        if (this.InsuredIsBilling) {
          addContactRole(existingContact, AccountRole.TC_ACCOUNTSPAYABLE)
        }
      }
    }
    return parentAccount
  }

  private function addContactRole(contact: AccountContact, accountRole: AccountRole) {
    if (not contact.Roles.hasMatch(\r -> r.Role == accountRole)) {
      var contactRole = new AccountContactRole(contact.Bundle)
      contactRole.Role = accountRole
      contactRole.AccountContact = contact
      contact.addToRoles(contactRole)
    }
  }

  function toNewAccount(currency: Currency, bundle: Bundle): Account {
    var account = new Account(currency, bundle)
    account.AccountNumber = this.AccountNumber
    account.AccountName = this.AccountName
    account.AccountNameKanji = this.AccountNameKanji
    account.ServiceTier = this.CustomerServiceTier
    initializeAccountDefaults(account)
    if (this.PaymentAllocationPlanPublicID != null) {
      final var planLookupResult = Query.make(PaymentAllocationPlan)
          .compare("PublicID", Equals, this.PaymentAllocationPlanPublicID).select()
      if (planLookupResult.Empty) {
        throw BadIdentifierException
            .badPublicId(PaymentAllocationPlan, this.PaymentAllocationPlanPublicID)
      }
      account.PaymentAllocationPlan = planLookupResult.AtMostOneRow
    }
    for (contact in this.BillingContacts) {
      var billingContact = contact.$TypeInstance.toAccountContact(account, {AccountRole.TC_ACCOUNTSPAYABLE})
      account.addToContacts(billingContact)
    }
    var insured = this.InsuredContact.$TypeInstance.toAccountContact(account, AccountHolderRoles)
    // init primary payer
    if (this.BillingContacts.Count > 0) {
      account.Contacts[0].PrimaryPayer = true
    } else {
      insured.PrimaryPayer = true
    }
    account.addToContacts(insured)
    return account
  }

  /**
   * Set the default {@link Account} attributes on creation.
   */
  static internal function initializeAccountDefaults(newAccount: Account) {
    newAccount.InvoiceDayOfMonth = 15
    newAccount.InvoiceDeliveryType = TC_MAIL
    newAccount.BillingPlan =
        BillingPlan.finder.findFirstActivePlan(BillingPlan, newAccount.Currency)
    newAccount.DelinquencyPlan =
        DelinquencyPlan.finder.findFirstActivePlan(DelinquencyPlan, newAccount.Currency)
    newAccount.BillingLevel = TC_POLICYDESIGNATEDUNAPPLIED
  }

  private property get AccountHolderRoles(): AccountRole[] {
    return this.InsuredIsBilling
        ? {AccountRole.TC_INSURED, AccountRole.TC_ACCOUNTSPAYABLE}
        : {AccountRole.TC_INSURED}
  }
}
