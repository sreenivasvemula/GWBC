package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.PCProducerInfo
uses gw.pl.persistence.core.Bundle
uses gw.api.webservice.exception.BadIdentifierException
uses java.util.Date
uses gw.api.util.CurrencyUtil

@Export
enhancement PCProducerInfoEnhancement : PCProducerInfo {
  
  function toProducer(bundle : Bundle) : Producer {
    var producer = gw.api.database.Query.make(Producer).compare("PublicID", Equals, this.PublicID).select().getAtMostOneRow()
    if (producer == null) {
      throw new BadIdentifierException("Cannot find producer to update with publicId: " + this.PublicID)
    }
    producer = bundle.add( producer )
    producer.Name = this.ProducerName
    producer.Tier = this.Tier == null ? ProducerTier.TC_BRONZE : this.Tier as ProducerTier
    if (producer.PrimaryContact.Contact.AddressBookUID != this.PrimaryContact.PublicID) {
      // sending a new contact
      producer.PrimaryContact.Roles[0].Role = ProducerRole.TC_SECONDARY
      var existing = producer.Contacts
        .firstWhere( \ p -> p.Contact.ExternalID == this.PrimaryContact.PublicID )
      if (existing == null) {
        producer.addToContacts( this.PrimaryContact.$TypeInstance.toProducerContact( producer ) )
      } else {
        existing.Roles[0].Role = ProducerRole.TC_PRIMARY
      }
    }
    return producer
  }
  
  function toProducer() : Producer {
    var producer = new Producer(CurrencyUtil.getDefaultCurrency())

    producer.PublicID = this.PublicID
    producer.Name = this.ProducerName
    producer.Tier = this.Tier == null ? ProducerTier.TC_BRONZE : this.Tier as ProducerTier
    
    producer.addToContacts( this.PrimaryContact.$TypeInstance.toProducerContact(producer) )
    producer.AgencyBillPlan = findAgencyBillPlan()
    
    // Default these fields cause PC does not care about them
    producer.SuspendNegativeAmounts = false
    var ppr = producer.getProducerPaymentRecurrable()
    ppr.InitialDate = Date.CurrentDate.nextDayOfMonth( 1 )
    ppr.DayOfMonth = 1
    ppr.Periodicity = Periodicity.TC_MONTHLY
    ppr.Producer = producer
    return producer
  }
  
  function findAgencyBillPlan() : AgencyBillPlan {
    return gw.api.database.Query.make(AgencyBillPlan).compare("PublicID", Equals, this.AgencyBillPlanID).select().getFirstResult()
  }
}
