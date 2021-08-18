package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.PCProducerInfo_AgencyBillPlanInfos
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.PCProducerInfo_PrimaryContact
uses gw.webservice.policycenter.bc801.entity.types.complex.AgencyBillPlanInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCContactInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.PCProducerInfo

uses java.lang.IllegalStateException
uses java.util.Arrays
uses java.util.Map
uses java.util.Date
uses java.util.Set

@Export
enhancement PCProducerInfoEnhancement : PCProducerInfo {
  /**
   * Load the information from the {@link Producer} identified
   *    by the {@code PublicID} value of this info'.
   */
  function loadInformation() {
    toRecord(Producer)
  }

  /**
   * Set the information from the values of the specified {@link Producer}.
   */
  function toRecord(producer : Producer) {
    this.PublicID = producer.PublicID
    this.ProducerName = producer.Name
    this.ProducerNameKanji = producer.NameKanji
    this.Tier = producer.Tier.Code

    this.PrimaryContact = toContactInfo(producer.PrimaryContact.Contact)

    final var producersInCurrencyGroup = (producer.ProducerCurrencyGroup != null)
        ? producer.ProducerCurrencyGroup.findProducers()
        : { producer }
    this.Currencies = Arrays.asList(producersInCurrencyGroup*.Currency*.Code)
    final var agencyBillPlans = producersInCurrencyGroup*.AgencyBillPlan
        .where(\ plan -> plan != null) // filter out unspecified...
    this.AgencyBillPlanIDs = Arrays.asList(agencyBillPlans*.PublicID)
    this.AgencyBillPlanInfos = Arrays.asList(
        agencyBillPlans.map(\ plan -> {
          final var planInfo = new AgencyBillPlanInfo()
          planInfo.copyPlanCurrencyInfo(plan)
          return new PCProducerInfo_AgencyBillPlanInfos(planInfo)
        })
    )
  }

  function toProducer(bundle : Bundle) : Producer {
    final var mainProducer = bundle.add(Producer)

    final var agencyBillPlansByCurrency = this.AgencyBillPlans
    final var producersInCurrencyGroup = (mainProducer.ProducerCurrencyGroup != null)
        ? mainProducer.ProducerCurrencyGroup.findProducers()
        : { mainProducer }

    for (producer in producersInCurrencyGroup) {
      producer = bundle.add( producer )
      producer.Name = this.ProducerName
      producer.NameKanji = this.ProducerNameKanji
      producer.Tier = this.Tier == null
          ? ProducerTier.TC_BRONZE : ProducerTier.get(this.Tier)

      if (producer.AgencyBillPlan == null
          && agencyBillPlansByCurrency.containsKey(producer.Currency)) {
        producer.AgencyBillPlan = agencyBillPlansByCurrency.get(producer.Currency)
      }
      if (producer.PrimaryContact.Contact.AddressBookUID != this.PrimaryContact.AddressBookUID) {
        if (producer.PrimaryContact != null) {
          producer.PrimaryContact.Roles[0].Role = TC_SECONDARY
        }
        // sending a new contact
        var existing = producer.Contacts
            .firstWhere(\ p -> p.Contact.AddressBookUID == this.PrimaryContact.AddressBookUID )
        if (existing == null) {
          producer.addToContacts(
              this.PrimaryContact.$TypeInstance.toProducerContact( producer ) )
        } else {
          existing.Roles[0].Role = TC_PRIMARY
        }
      }
    }

    if (!this.Currencies.Empty) {
      final var existingCurrencies =
          producersInCurrencyGroup.map(\ producer -> producer.Currency)
      for (var currency in this.CurrenciesSet) {   //we only care about unique currencies
        if (!existingCurrencies.contains(currency)) {
          // new currency, splinter for it...
          createProducerForCurrency(mainProducer, currency,
              agencyBillPlansByCurrency.get(currency))
        }
      }
    }
    return mainProducer
  }

  private property get Producer() : Producer {
    return WebserviceEntityLoader
        .loadByPublicID<Producer>(this.PublicID, "PublicID")
  }

  /**
   * A map of the {@link AgencyBillPlan}s by {@link Currency} as identified
   * by the {@link #AgencyBillPlanIDs} for this {@link PCProducerInfo}.
   */
  property get AgencyBillPlans() : Map<Currency, AgencyBillPlan> {
    if (not this.AgencyBillPlanIDs.isEmpty()) {
      final var planQuery = Query.make(AgencyBillPlan)
      planQuery.compareIn("PublicID", this.AgencyBillPlanIDs.toTypedArray())
      try {
        final var results =
        planQuery.select().partitionUniquely(\ plan -> plan.Currency)
        if (results.Count == this.AgencyBillPlanIDs.Count) {
          return results
        }
        // check for missing plans (bad PublicID)
        final var missingPlanIDs = this.AgencyBillPlanIDs.copy()
        missingPlanIDs.removeAll(results.Values.map(\ p -> p.PublicID))
        if (missingPlanIDs.Empty) {
          // duplicate ID in AgencyBillPlanIDs; ignore...
          return results
        }
        throw BadIdentifierException
            .badPublicId(AgencyBillPlan, missingPlanIDs.first())
      } catch (ex : IllegalStateException) {
        // more than one plan for a currency...
        throw new DataConversionException(
            displaykey.Webservice.Error.OneAgencyBillPlanPlanPerCurrency)
        }
    }
    return {} // none specified
  }

  /**
   * A set of the {@link Currency}s as identified by the codes in the
   * {@link #Currencies} list for this {@link PCProducerInfo}.
   */
  property get CurrenciesSet() : Set<Currency> {
    return this.Currencies.map(\ code -> {
      final var currency = Currency.get(code)
      if (currency == null) {
        throw new BadIdentifierException(
            displaykey.Webservice.Error.Currency.Unknown(code))
      }
      return currency
    }).toSet()
  }

  private function toContactInfo(contact : Contact) : PCProducerInfo_PrimaryContact {
    if (contact == null) {
      return null
    }
    var contactInfo = new PCContactInfo()
    contactInfo.ContactType = contact.Subtype.Code
    contactInfo.PublicID = contact.ExternalID
    contactInfo.AddressBookUID = contact.AddressBookUID
    return new PCProducerInfo_PrimaryContact(contactInfo)
  }

  private function
  createProducerForCurrency(mainProducer : Producer, currency : Currency,
      agencyBillPlan : AgencyBillPlan) {
    final var newProducer = createProducerForCurrency(mainProducer, currency)
    newProducer.AgencyBillPlan = agencyBillPlan
  }

  /**
   * Create a new {@link Producer} for the specified {@link Currency} belonging
   * to a multi-currency producer group with the specified main
   * {@code Producer}.
   *<p/>
   * Note that a {@code Producer} in a {@link MixedCurrencyProducerGroup} must
   * be unique per {@code Currency}.
   *
   * @param mainProducer the main {@link Producer} of a producer group
   * @param currency the {@link Currency} for which to create the
   *                 {@code Producer}
   * @return The new {@link Producer}.
   */
  static function createProducerForCurrency(
      mainProducer : Producer, currency : Currency) : Producer {
    if (mainProducer.Bundle.ReadOnly) {
      mainProducer = gw.transaction.Transaction.Current.add(mainProducer) // ensure writable...
    }

    var newProducer = mainProducer.createSplinterProducerForCurrency(currency)
    newProducer.NameKanji = mainProducer.NameKanji
    setProducerAttributes(newProducer,
        createPrimaryContactFor(newProducer.Bundle, mainProducer.PrimaryContact.Contact))
    return newProducer
  }

  static function
  setProducerAttributes(newProducer : Producer, primaryContact : ProducerContact) {
    if (primaryContact != null) {
      newProducer.addToContacts(primaryContact)
    }
    // Default these fields because PC does not care about them
    initializeDefaultsForFieldsPCDoesNotCareAbout(newProducer)
  }

  private static
  function initializeDefaultsForFieldsPCDoesNotCareAbout(producer: Producer) {
    producer.SuspendNegativeAmounts = false
    var ppr = producer.getProducerPaymentRecurrable()
    ppr.InitialDate = Date.CurrentDate.nextDayOfMonth( 1 )
    ppr.DayOfMonth = 1
    ppr.Periodicity = TC_MONTHLY
    ppr.Producer = producer
  }

  private static function
  createPrimaryContactFor(bundle : Bundle, primaryContact : Contact) : ProducerContact {
    return primaryContact == null
        ? null : PCContactInfoEnhancement
            .createPrimaryProducerContactFor(bundle, primaryContact)
  }
}
