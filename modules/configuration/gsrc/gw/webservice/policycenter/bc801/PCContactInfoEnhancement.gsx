package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.system.BCLoggerCategory
uses gw.api.webservice.exception.FieldFormatException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.PCContactInfo_Addresses
uses gw.webservice.policycenter.bc801.entity.types.complex.AddressInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCContactInfo

@Export
enhancement PCContactInfoEnhancement : PCContactInfo {
  private function createContact(bundle : Bundle) : Contact {
    if (this.ContactType.toLowerCase() == "company") {
      return new Company(bundle)
    } else if (this.ContactType.toLowerCase() == "person") {
      return new Person(bundle)
    } else {
      throw new FieldFormatException(displaykey.Webservice.Error.InvalidContactType(this.ContactType))
    }
  }

  private function fill(contact : Contact) {
    if (this.AddressBookUID == null) {
      throw new RequiredFieldException(displaykey.Webservice.Error.ContactABUIDCannotBeNull(this))
    }
    if (contact typeis Company) {
      contact.Name = this.Name
      contact.NameKanji = this.NameKanji
    } else if (contact typeis Person) {
      contact.FirstName = this.FirstName
      contact.FirstNameKanji = this.FirstNameKanji
      contact.LastName = this.LastName
      contact.LastNameKanji = this.LastNameKanji
      contact.Particle = this.Particle
    } else {
      throw new FieldFormatException(displaykey.Webservice.Error.InvalidContactType(this.ContactType))
    }
    contact.ExternalID = this.PublicID
    contact.AddressBookUID = this.AddressBookUID
    contact.WorkPhone = this.WorkPhone
    contact.WorkPhoneCountry = this.WorkPhoneCountry
    contact.WorkPhoneExtension = this.WorkPhoneExtension
    contact.EmailAddress1 = this.EmailAddress1
    for (a in this.Addresses) {
      var address = a.$TypeInstance.toAddress()
      if (a.Primary) {
        contact.PrimaryAddress = address
      } else {
        // TODO
        // this will not work for updating a secondary addresses (add and remove still work)
        // but currently BC does not support secondary addresses so we will live with this bug for now
        contact.addAddress(address)
      }
    }
  }

  protected function findContact(bundle : Bundle) : Contact {
    if (this.AddressBookUID == null) {
        throw new RequiredFieldException(displaykey.Webservice.Error.ContactABUIDCannotBeNull(this))
    }
    final var addressBookUID = this.AddressBookUID
    var result : Contact
    var beansInBundle = bundle.getBeansByRootType(Contact)
        .where(\ cont -> (cont as Contact).AddressBookUID == addressBookUID)
    if (beansInBundle.Count > 1) {
      BCLoggerCategory.BILLING_API.info("ERROR: There are ${beansInBundle.Count} contacts with AddressBookUID of ${addressBookUID}, expect at most one")
    }
    result = beansInBundle.first() as Contact
    if (result == null) {
      final var results = Query.make(entity.Contact)
          .compare("AddressBookUID", Equals, addressBookUID)
          .select()
      if (results.Count > 1) {
        BCLoggerCategory.BILLING_API.info("ERROR: There are ${results.Count} contacts with AddressBookUID of ${this.AddressBookUID}, expect at most one")
      }
      result = results.AtMostOneRow
    }
    return result
  }

  function toContact(bundle : Bundle) : Contact {
    var contact = findContact(bundle)
    if (contact == null) {
      // print("Could not find contact with ExternalID='${PublicID}' to update")
      // race condition may case update contact to happen before create contact,
      // so in this case, we go ahead and create contact and the create contact come
      // later will be ignored.
      contact = createContact(bundle)
    } else {
      contact = bundle.add(contact)
    }
    fill(contact)
    contact = contact.syncWithContactManager()
    return contact
  }

  function toPolicyPeriodContact(period: PolicyPeriod): PolicyPeriodContact {
    var periodContact = new PolicyPeriodContact(period.Bundle)
    var contact = findContact(period.Bundle)
    if (contact == null) {
      periodContact.Contact = createAndSyncContact(period.Bundle)
    } else {
      periodContact.Contact = contact
    }
    periodContact.PolicyPeriod = period
    var contactRole = new PolPeriodContactRole(period.Bundle)
    contactRole.Role = PolicyPeriodRole.TC_PRIMARYINSURED
    periodContact.addToRoles(contactRole)
    return periodContact
  }

  function toAccountContact(account: Account, roles: AccountRole[]): AccountContact {
    var accountContact = new AccountContact(account.Bundle)
    var contact = findContact(account.Bundle)
    if (contact == null) {
      accountContact.Contact = createAndSyncContact(account.Bundle)
    } else {
      accountContact.Contact = contact
    }
    accountContact.Account = account
    for (role in roles) {
      var contactRole = new AccountContactRole(account.Bundle)
      contactRole.Role = role
      contactRole.AccountContact = accountContact
      accountContact.addToRoles(contactRole)
    }
    return accountContact
  }

  function toProducerContact(producer : Producer) : ProducerContact {
    var contact = findContact(producer.Bundle)
    if (contact == null) {
      contact = createAndSyncContact(producer.Bundle)
    }
    return createPrimaryProducerContactFor(producer.Bundle, contact)
  }

  internal static function createPrimaryProducerContactFor(bundle: Bundle, primaryContact: Contact) : ProducerContact {
    final var producerContact = new ProducerContact(bundle)
    producerContact.Contact = primaryContact
    final var contactRole = new ProducerContactRole(bundle)
    contactRole.Role = TC_PRIMARY
    producerContact.addToRoles(contactRole)
    return producerContact
  }

  function addAddress(addressInfo: AddressInfo) {
    var address = new PCContactInfo_Addresses()
    address.$TypeInstance = addressInfo
    this.Addresses.add(address)
  }

  private function createAndSyncContact(bundle : Bundle) : Contact {
    var newContact = createContact(bundle)
    fill(newContact)
    newContact = newContact.syncWithContactManager()

    return newContact
  }
}