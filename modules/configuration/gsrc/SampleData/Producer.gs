package SampleData

uses gw.api.databuilder.PersonBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.databuilder.ProducerContactBuilder

uses java.util.Date

@Export
class Producer {
  function create(  currency : Currency,
                    publicID : String,
                    name : String,
                    address : Address,
                    tier : ProducerTier,
                    periodicity : Periodicity,
                    suspend : Boolean,
                    nextPaymentDate : DateTime): Producer {
    var existing = gw.api.database.Query.make(Producer).compare("Name", Equals, name).select()
    if (existing.Empty) {
      var primaryContact = new ProducerContactBuilder()
          .withContact(new PersonBuilder()
              .withAddress(address)
              .withFirstName("Bill")
              .withLastName("Baker")
              .withWorkPhone("650-357-9100")
              .withEmailAddress1("producer@guidewire.com")
              .create())
          .asPrimary()
          .createWithNullsAllowed()
      var producer = new ProducerBuilder()
          .withCurrency(currency)
          .withName(name)
          .withSuspendNegativeAmounts(suspend)
          .withTier(tier)
          .withRecurringProducerPayment(periodicity, 15)
          .withContact(primaryContact)
          .withPublicId(publicID)
          .createAndCommit()

      return producer
    }
    else {
      return existing.FirstResult
    }
  }
}
