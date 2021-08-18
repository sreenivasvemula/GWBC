package gw.api.address

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.plugin.Plugins
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.ContactCreator
uses gw.plugin.contact.DuplicateContactResultContainer

uses java.lang.IllegalArgumentException

@Export
enhancement ContactEnhancement : entity.Contact {

  static function findFromAddressBookUID(abUID : String) : Contact {
    return Query.make(Contact).compare("AddressBookUID", Equals, abUID).select().AtMostOneRow
  }
  
  property get AddressOwner() : AddressOwner {
    return new ContactAddressOwner(this) 
  }

 /**
   * @return true if this contact is not linked to any external address book
   */
  property get IsLocalOnly() : boolean {
    return this.AddressBookUID == null
  }

  /**
   * Return true if the contact information should be set to the external contact system.
   */
  property get ShouldSendToContactSystem() : boolean {
    return this.AutoSync == AutoSync.TC_ALLOW
        and not this.New
        and (isOnAccount() or isOnPolicyPeriod())
  }

  /**
   * Override information on this contact with information from contact manager
   */
  function syncWithContactManager() : Contact {
    var plugin = Plugins.get(ContactSystemPlugin)
    if (!plugin.supportsExternalContactSystemIntegration() || this.AddressBookUID == null) {
      return this
    }

    var foundContact = plugin.retrieveContact(this.AddressBookUID, new ContactCreator(this.Bundle))

    return foundContact != null ? foundContact : this
  }

  /**
   * Returns a list of potential duplicates from the IContactSystem plugin.  
   * 
   * N.B. This method supersedes the Platform-supplied {@link #findPotentialDuplicates()} method.
   */
  function getPotentialDuplicates() : DuplicateContactResultContainer {
    var plugin = Plugins.get(ContactSystemPlugin)
    return plugin.findDuplicates(this)
  }
  
  /**
   * Merges the passed in contact into this Contact, eventually retiring the passed in contact once
   * the merge is complete.  This merge method takes care of all the merging that needs to be done on the Billing Center
   * side of the merge.  Other portions of the merge (merging contacts for example) are done in Contact Manager.
   */
  function mergeWithContact(contactBeingMergedIntoThisContact : Contact) {
    validate(contactBeingMergedIntoThisContact)
    mergeAccountContacts(contactBeingMergedIntoThisContact)
    mergePolicyPeriodContacts(contactBeingMergedIntoThisContact)
    mergeProducerContacts(contactBeingMergedIntoThisContact)
    contactBeingMergedIntoThisContact.remove()
  }

  /**
   * Find all AccountContact entities that point at this Contact
   */
  function findAccountContacts() : IQueryBeanResult<entity.AccountContact> {
    return Query.make(AccountContact).compare("Contact", Equals, this).select()
  }

  /**
   * Find all PolicyPeriodContact entities that point at this Contact
   */
  function findPolicyPeriodContacts() : IQueryBeanResult<entity.PolicyPeriodContact> {
    return Query.make(PolicyPeriodContact).compare("Contact", Equals, this).select()
  }

  /**
   * Find all ProducerContact entities that point at this contact
   */
  function findProducerContacts() : IQueryBeanResult<entity.ProducerContact> {
    return Query.make(ProducerContact).compare("Contact", Equals, this).select()
  }
  
  private function isOnAccount() : boolean {
    return findAccountContacts().HasElements
  }
  
  private function isOnPolicyPeriod() : boolean {
    return findPolicyPeriodContacts().HasElements
  }
  
  private function validate(contactBeingMergedIntoThisContact : Contact) {
    if (contactBeingMergedIntoThisContact == null) {
      throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.NullContactArgument)
    }
    
    if (contactBeingMergedIntoThisContact == this) {
      throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.SameContactArgument)
    }

    if (this.Subtype != contactBeingMergedIntoThisContact.Subtype) {
      throw new IllegalArgumentException(
          displaykey.Contact.MergeContacts.Error.DifferentContactSubTypeArgument(
              this.Subtype,
              contactBeingMergedIntoThisContact.Subtype
          )
      )
    }
  }
        
  private function mergeAccountContacts(contactBeingMergedIntoThisContact : Contact) {
    var accountContactsOnContactBeingMerged = contactBeingMergedIntoThisContact.findAccountContacts()
    for(accountContactOnContactBeingMerged in accountContactsOnContactBeingMerged) {
      var writeableBundle = this.Bundle
      accountContactOnContactBeingMerged = writeableBundle.add(accountContactOnContactBeingMerged)
      merge(accountContactOnContactBeingMerged)
    }
  }

  private function mergePolicyPeriodContacts(contactBeingMergedIntoThisContact : Contact) {
    var policyPeriodContactsOnContactBeingMerged = contactBeingMergedIntoThisContact.findPolicyPeriodContacts()
    for(policyPeriodContactOnContactBeingMerged in policyPeriodContactsOnContactBeingMerged) {
      var writeableBundle = this.Bundle
      policyPeriodContactOnContactBeingMerged = writeableBundle.add(policyPeriodContactOnContactBeingMerged)
      merge(policyPeriodContactOnContactBeingMerged)
    }
  }

  private function mergeProducerContacts(contactBeingMergedIntoThisContact : Contact) {
    var producerContactsOnContactBeingMerged = contactBeingMergedIntoThisContact.findProducerContacts()
    for(producerContactOnContactBeingMerged in producerContactsOnContactBeingMerged) {
      var writeableBundle = this.Bundle
      producerContactOnContactBeingMerged = writeableBundle.add(producerContactOnContactBeingMerged)
      merge(producerContactOnContactBeingMerged)
    }
  }
  
  private function thisContactHasAnAccountContactOn(account : Account) : boolean {
    return  account.Contacts.hasMatch(\ a -> a.Contact == this)
  }

  private function thisContactHasAPolicyPeriodContactOn(policyPeriod : PolicyPeriod) : boolean {
    return  policyPeriod.Contacts.hasMatch(\ pp -> pp.Contact == this)
  }
  
  private function thisContactHasAProducerContactOn(producer : Producer) : boolean {
    return  producer.Contacts.hasMatch(\ p -> p.Contact == this)
  }
  
  private function merge(accountContactOnContactBeingMerged : AccountContact) {
    if (thisContactHasAnAccountContactOn(accountContactOnContactBeingMerged.Account)) {
      mergeAccountContactRolesFrom(accountContactOnContactBeingMerged)
      accountContactOnContactBeingMerged.remove()
    } else {
      accountContactOnContactBeingMerged.Contact = this
    }
  }
  
  private function merge(policyPeriodContactOnContactBeingMerged : PolicyPeriodContact) {
    if (thisContactHasAPolicyPeriodContactOn(policyPeriodContactOnContactBeingMerged.PolicyPeriod)) {
      mergePolicyPeriodContactRolesFrom(policyPeriodContactOnContactBeingMerged)
      policyPeriodContactOnContactBeingMerged.remove()      
    } else {
      policyPeriodContactOnContactBeingMerged.Contact = this
    }
  }

  private function merge(producerContactOnContactBeingMerged : ProducerContact) {
    if (thisContactHasAProducerContactOn(producerContactOnContactBeingMerged.Producer)) {
      mergeProducerContactRolesFrom(producerContactOnContactBeingMerged)
      producerContactOnContactBeingMerged.remove()
    } else {
      producerContactOnContactBeingMerged.Contact = this
    }
  }
   
  private function mergeAccountContactRolesFrom(accountContactBeingMerged : AccountContact) {
    var survivingAccountContact = accountContactBeingMerged.Account.Contacts.firstWhere(\ a -> a.Contact == this)
    var accountRolesAlreadyOnSurvivingAccountContact = survivingAccountContact.Roles.map(\ role -> role.Role)
    var accountRolesOnAccountContactBeingMerged = accountContactBeingMerged.Roles.map(\ role -> role.Role)
    var accountRolesToBeMerged = accountRolesOnAccountContactBeingMerged.subtract(accountRolesAlreadyOnSurvivingAccountContact)
    
    var accountContactRolesToBeMerged = accountContactBeingMerged.Roles.partition(\ accountContactRole -> accountContactRole.Role)
    for (accountRole in accountRolesToBeMerged) {
      var accountContactRoleToBeMerged = accountContactRolesToBeMerged.get(accountRole).first()
      survivingAccountContact.addToRoles(accountContactRoleToBeMerged)      
    } 
  }

  private function mergePolicyPeriodContactRolesFrom(policyPeriodContactBeingMerged : PolicyPeriodContact) {
    var survivingPolicyPeriodContact = policyPeriodContactBeingMerged.PolicyPeriod.Contacts.firstWhere(\ a -> a.Contact == this)
    var policyPeriodRolesAlreadyOnSurvivingPolicyPeriodContact = survivingPolicyPeriodContact.Roles.map(\ role -> role.Role)
    var policyPeriodRolesOnPolicyPeriodContactBeingMerged = policyPeriodContactBeingMerged.Roles.map(\ role -> role.Role)
    var policyPeriodRolesToBeMerged = policyPeriodRolesOnPolicyPeriodContactBeingMerged.subtract(policyPeriodRolesAlreadyOnSurvivingPolicyPeriodContact)
    
    var policyPeriodContactRolesToBeMerged = policyPeriodContactBeingMerged.Roles.partition(\ policyPeriodContactRole -> policyPeriodContactRole.Role)
    for (policyPeriodRole in policyPeriodRolesToBeMerged) {
      var policyPeriodContactRoleToBeMerged = policyPeriodContactRolesToBeMerged.get(policyPeriodRole).first()
      survivingPolicyPeriodContact.addToRoles(policyPeriodContactRoleToBeMerged)      
    } 
  }
  
  private function mergeProducerContactRolesFrom(producerContactBeingMerged : ProducerContact) {
    var survivingProducerContact = producerContactBeingMerged.Producer.Contacts.firstWhere(\ a -> a.Contact == this)
    var producerRolesAlreadyOnSurvivingProducerContact = survivingProducerContact.Roles.map(\ role -> role.Role)
    var producerRolesOnProducerContactBeingMerged = producerContactBeingMerged.Roles.map(\ role -> role.Role)
    var producerRolesToBeMerged = producerRolesOnProducerContactBeingMerged.subtract(producerRolesAlreadyOnSurvivingProducerContact)
    
    var producerContactRolesToBeMerged = producerContactBeingMerged.Roles.partition(\ producerContactRole -> producerContactRole.Role)
    for (producerRole in producerRolesToBeMerged) {
      var producerContactRoleToBeMerged = producerContactRolesToBeMerged.get(producerRole).first()
      survivingProducerContact.addToRoles(producerContactRoleToBeMerged)      
    } 
  }

}
