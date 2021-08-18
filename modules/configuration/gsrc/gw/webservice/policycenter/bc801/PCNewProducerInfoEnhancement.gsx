package gw.webservice.policycenter.bc801

uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc801.entity.types.complex.PCNewProducerInfo

@Export
enhancement PCNewProducerInfoEnhancement : PCNewProducerInfo {
  function toNewProducer(bundle : Bundle) : Producer {
    final var mainProducerCurrency = Currency.get(this.PreferredCurrency)
    if (mainProducerCurrency == null) {
      throw new BadIdentifierException(
          displaykey.Webservice.Error.Currency.Unknown(this.PreferredCurrency)
      )
    }
    final var agencyBillPlansByCurrency = this.AgencyBillPlans

    final var mainProducer = new Producer(mainProducerCurrency, bundle)
    mainProducer.PublicID = this.PublicID
    mainProducer.Name = this.ProducerName
    mainProducer.NameKanji = this.ProducerNameKanji
    mainProducer.Tier = this.Tier == null ? TC_BRONZE : ProducerTier.get(this.Tier)

    setProducerAttributes(mainProducer,
        agencyBillPlansByCurrency.get(mainProducerCurrency))

    //Create sibling producers as necessary for each supported Currency
    for (var currency in this.CurrenciesSet) {   //we only care about unique currencies
      if (currency != mainProducerCurrency) {
        createProducerForCurrency(mainProducer, currency,
            agencyBillPlansByCurrency.get(currency))
      }
    }
    return mainProducer
  }

  private function
  createProducerForCurrency(mainProducer : Producer, currency : Currency,
      agencyBillPlan : AgencyBillPlan) {
    final var newProducer =
        this.createProducerForCurrency(mainProducer, currency)
    newProducer.AgencyBillPlan = agencyBillPlan
  }

  private function setProducerAttributes(
      mainProducer : Producer, agencyBillPlan : AgencyBillPlan) {
    final var producerContact = this.PrimaryContact == null
        ? null
        : this.PrimaryContact.$TypeInstance.toProducerContact(mainProducer)
    this.setProducerAttributes(mainProducer, producerContact)
    mainProducer.AgencyBillPlan = agencyBillPlan
  }
}
