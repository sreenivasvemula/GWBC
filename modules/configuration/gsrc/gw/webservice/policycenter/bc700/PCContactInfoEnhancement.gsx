package gw.webservice.policycenter.bc700
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc700.entity.types.complex.PCContactInfo
uses gw.webservice.policycenter.bc700.entity.types.complex.AddressInfo
uses gw.webservice.policycenter.bc700.entity.anonymous.elements.PCContactInfo_Addresses
uses gw.api.webservice.exception.FieldFormatException
uses gw.api.util.phone.GWPhoneNumber
uses gw.plugin.phone.IPhoneNormalizerPlugin
uses com.guidewire.pl.system.dependency.PLDependencies
uses gw.api.system.BCLoggerCategory

@Export
enhancement PCContactInfoEnhancement : PCContactInfo {
  
  private function createContact(bundle : Bundle) : Contact {
    if (this.ContactType.toLowerCase() == ContactType.TC_COMPANY.Code) {
      return new Company(bundle)
    } else if (this.ContactType.toLowerCase() == ContactType.TC_PERSON.Code) {
      return new Person(bundle)
    } else {
      throw new FieldFormatException("Invalid contact type: ${this.ContactType}")
    }
  }

  private function createContact() : Contact {
    if (this.ContactType.toLowerCase() == ContactType.TC_COMPANY.Code) {
      return new Company()
    } else if (this.ContactType.toLowerCase() == ContactType.TC_PERSON.Code) {
      return new Person()
    } else {
      throw new FieldFormatException("Invalid contact type: ${this.ContactType}")
    }
  }
    
  protected function fill(contact : Contact){
    if (this.PublicID == null) {
      throw new BadIdentifierException("Contact public id cannot be null, ${contact}")
    }
    
    if (contact typeis Company) {
      contact.Name = this.Name      
    } else if (contact typeis Person) {
        contact.FirstName = this.FirstName
        contact.LastName = this.LastName
    } else {
        throw new FieldFormatException("Invalid contact type: ${this.ContactType}")
    }
    
    contact.ExternalID = this.PublicID
    contact.AddressBookUID = this.AddressBookUID
    contact.GWWorkPhone = toGuidewire8PhoneNumber(this.WorkPhone)
    contact.EmailAddress1 = this.EmailAddress1
    
    for (a in this.Addresses){
      var address = a.$TypeInstance.toAddress()
      if (a.Primary){
        contact.PrimaryAddress = address
      } else {
        // TODO
        // this will not work for updating a secondary addresses (add and remove still work)
        // but currently BC does not support secondary addresses so we will live with this bug for now
        contact.addAddress( address )
      }
    }
  }

  private function toGuidewire8PhoneNumber(guidewire7PhoneNumber : String) : GWPhoneNumber {
    var plugin = PLDependencies.getPluginConfig().getPlugin(IPhoneNormalizerPlugin)
    return plugin.parsePhoneNumber(guidewire7PhoneNumber)
  }
  
  protected function findContact() : Contact {
    var query = gw.api.database.Query.make(Contact).compare("ExternalID", Equals, this.PublicID).select()
    if(query.Count > 1){
      BCLoggerCategory.BILLING_API.error("ERROR: There are ${query.Count} contacts with ExternalID of ${this.PublicID}, expect at most one")
    }
    return query.FirstResult
  }

  function toContact(bundle : Bundle) : Contact {
    var contact = findContact()
    if (contact == null) {
      // print("Could not find contact with ExternalID='${PublicID}' to update") 
      // race condition may case update contact to happen before create contact,
      // so in this case, we go ahead and create contact and the create contact come
      // later will be ignored.
      contact = createContact(bundle)
    } else {
      contact = bundle.add( contact )
    }
    fill(contact)
    contact = contact.syncWithContactManager()
    return contact
  }
  
  function toPolicyPeriodContact(period : PolicyPeriod) : PolicyPeriodContact {
    var periodContact = new PolicyPeriodContact(period.Bundle)
    var contact = findContact()
    if (contact == null) {
      periodContact.Contact = createContact()
      fill(periodContact.Contact)
      periodContact.Contact = periodContact.Contact.syncWithContactManager()
    } else {
      periodContact.Contact = contact
    }
    periodContact.PolicyPeriod = period
    var contactRole = new PolPeriodContactRole(period.Bundle)
    contactRole.Role = PolicyPeriodRole.TC_PRIMARYINSURED
    periodContact.addToRoles( contactRole )
    return periodContact
  }
  
  function toAccountContact(account : Account, roles : AccountRole[]) : AccountContact {
    
    var accountContact = new AccountContact(account.Bundle)
    var contact = findContact()
    if (contact == null) {
      accountContact.Contact = createContact()
      fill(accountContact.Contact)
      accountContact.Contact = accountContact.Contact.syncWithContactManager()
    } else {
      accountContact.Contact = contact
    }
    accountContact.Account = account
    for (role in roles){
      var contactRole = new AccountContactRole(account.Bundle)
      contactRole.Role = role
      contactRole.AccountContact = accountContact
      accountContact.addToRoles(contactRole)
    }
    return accountContact
  }
  
  function toProducerContact(producer : Producer) : ProducerContact {
    var producerContact = new ProducerContact(producer.Bundle)
    var contact = findContact()
    if (contact == null) {
      producerContact.Contact = createContact()
      fill(producerContact.Contact)
    } else {
      producerContact.Contact = contact
    }
    producerContact.Producer = producer
    var contactRole = new ProducerContactRole(producer.Bundle)
    contactRole.Role = ProducerRole.TC_PRIMARY
    producerContact.addToRoles( contactRole )
    return producerContact
  }
  
  function addAddress(addressInfo : AddressInfo) {
    var address = new PCContactInfo_Addresses()
    address.$TypeInstance = addressInfo
    this.Addresses.add(address)
  }
}
