package gw.webservice.policycenter.bc700

uses gw.api.database.Query
uses gw.api.util.CurrencyUtil
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc700.entity.types.complex.PCAccountInfo

@Export
enhancement PCAccountInfoEnhancement : PCAccountInfo {
  function toAccount(bundle : Bundle) : Account {
    var account = Query.make(Account).compare("AccountNumber", Equals, this.AccountNumber).select().first()
    if (account == null){
      return null
      // throw new BadIdentifierException("Cannot find account to update with number: " + AccountNumber)
    }
    account = bundle.add( account )
    account.AccountName = this.AccountName
    
    for (contact in this.BillingContacts){
      var current = account.Contacts.firstWhere( \ a -> a.Contact.ExternalID == contact.PublicID)
      if (current == null ) {
        var billingContact = contact.$TypeInstance.toAccountContact(account, {TC_ACCOUNTSPAYABLE})
        account.addToContacts( billingContact )
      } else {
        current = bundle.add( current )
        addContactRole(current, TC_ACCOUNTSPAYABLE)
      }
    }
    
    var existingContact = account.Contacts
      .firstWhere( \ a -> a.Contact.ExternalID == this.InsuredContact.PublicID)
    if (existingContact == null) {
      var insured = this.InsuredContact.$TypeInstance.toAccountContact(account, AccountHolderRoles)
      account.addToContacts( insured )
    } else {
      existingContact = bundle.add( existingContact )
      addContactRole(existingContact, TC_INSURED)
      if (this.InsuredIsBilling) {
        addContactRole(existingContact, TC_ACCOUNTSPAYABLE)
      }
    }
    
    return account
  }
  
  private function addContactRole(contact : AccountContact, accountRole : AccountRole) {
    if (not contact.Roles.hasMatch( \ r -> r.Role == accountRole)) {
      var contactRole = new AccountContactRole(contact.Bundle)
      contactRole.Role = accountRole
      contactRole.AccountContact = contact
      contact.addToRoles( contactRole )
    }
  }
  
  function toNewAccount(bundle : Bundle) : Account {
    var account = new Account(CurrencyUtil.getDefaultCurrency(), bundle)
    account.AccountNumber = this.AccountNumber
    account.AccountName = this.AccountName
    account.InvoiceDayOfMonth = 15
    account.InvoiceDeliveryType = InvoiceDeliveryMethod.TC_MAIL
    
    account.BillingPlan =
        BillingPlan.finder.findFirstActivePlan(BillingPlan, account.Currency)
    account.DelinquencyPlan =
        DelinquencyPlan.finder.findFirstActivePlan(DelinquencyPlan, account.Currency)

    for (contact in this.BillingContacts){
      var billingContact = contact.$TypeInstance.toAccountContact(account, {TC_ACCOUNTSPAYABLE})
      account.addToContacts( billingContact )
    }
    var insured = this.InsuredContact.$TypeInstance.toAccountContact(account, AccountHolderRoles)

    // init primary payer
    if (this.BillingContacts.Count > 0) {
      account.Contacts[0].PrimaryPayer = true
    } else {
      insured.PrimaryPayer = true
    }
    account.addToContacts( insured )
    return account
  }
  
  private property get AccountHolderRoles() : AccountRole[] {
    return this.InsuredIsBilling ? {TC_INSURED, TC_ACCOUNTSPAYABLE} : {TC_INSURED}
  }
}
