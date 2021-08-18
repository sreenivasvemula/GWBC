package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.policycenter.bc801.entity.anonymous.elements.ProducerCodeInfo_CommissionPlanInfos
uses gw.webservice.policycenter.bc801.entity.types.complex.CommissionPlanInfo
uses gw.webservice.policycenter.bc801.entity.types.complex.ProducerCodeInfo

uses java.util.Arrays
uses java.lang.IllegalStateException
uses java.lang.Iterable
uses java.util.Map
uses java.util.Set

@Export
enhancement ProducerCodeInfoEnhancement : ProducerCodeInfo {
  /**
   * Load the information from the {@link ProducerCode} identified
   *    by the {@code PublicID} value of this info'.
   */
  function loadInformation() {
    toRecord(ProducerCode)
  }

  /**
   * Set the information from the values of the specified {@link ProducerCode}.
   */
  function toRecord(producerCode : ProducerCode) {
    this.PublicID = producerCode.PublicID
    this.Code = producerCode.Code
    this.Active = producerCode.Active

    final var codes = findProducerCodesInCurrencyGroup(producerCode)
    this.Currencies = Arrays.asList(codes*.Currency*.Code)
    this.CommissionPlanIDs = Arrays.asList(codes*.CommissionPlan*.PublicID)
    this.CommissionPlanInfos = Arrays.asList(
        codes*.CommissionPlan.map(\ plan -> {
            final var planInfo = new CommissionPlanInfo()
            planInfo.copyCommissionPlanInfo(plan)
            return new ProducerCodeInfo_CommissionPlanInfos(planInfo)
        })
      )
  }

  function toProducerCode(bundle : Bundle) : ProducerCode {
    final var mainProducerCode = bundle.add(ProducerCode)
    final var commissionPlansMap = this.CommissionPlans

    final var producerCodesInCurrencyGroup =
        findProducerCodesInCurrencyGroup(mainProducerCode)
    for (producerCode in producerCodesInCurrencyGroup) {
      producerCode = bundle.add(producerCode)
      producerCode.Code = this.Code
      producerCode.Active = this.Active
      final var updateCommissionPlan =
          commissionPlansMap.get(producerCode.Currency)
      if (updateCommissionPlan != null
          && producerCode.CommissionPlan != updateCommissionPlan) {
        // update CommissionPlan...
        producerCode.CommissionPlan = updateCommissionPlan
      }
    }

    if (!this.Currencies.Empty) {
      // look for new currencies...
      final var existingCurrencies = producerCodesInCurrencyGroup
          .map(\ producerCode -> producerCode.Currency)
      for (currency in this.CurrenciesSet) {
        if (! existingCurrencies.contains(currency)) {
          // new currency
          createNewProducerCode(mainProducerCode.Producer, currency,
              commissionPlansMap, bundle)
        }
      }
    }
    return mainProducerCode
  }

  /**
   * A map of the {@link CommissionPlan}s by {@link Currency} as identified
   * by the {@link #CommissionPlanIDs} for this {@link ProducerCodeInfo}.
   */
  property get CommissionPlans() : Map<Currency, CommissionPlan> {
    if (not this.CommissionPlanIDs.Empty) {
      final var planQuery = Query.make(CommissionPlan)
      planQuery.compareIn("PublicID", this.CommissionPlanIDs.toTypedArray())
      try {
        final var results =
            planQuery.select().partitionUniquely(\ plan -> plan.Currency)
        if (results.Count == this.CommissionPlanIDs.Count) {
          return results
        }
        // check for missing plans (bad PublicID)
        final var missingPlanIDs = this.CommissionPlanIDs.copy()
        missingPlanIDs.removeAll(results.Values.map(\ p -> p.PublicID))
        if (missingPlanIDs.Empty) {
          // duplicate ID in CommissionPlanIDs; ignore...
          return results
        }
        throw BadIdentifierException
            .badPublicId(CommissionPlan, missingPlanIDs.first())
      } catch (ex : IllegalStateException) {
        // more than one plan for a currency...
        throw new DataConversionException(
            displaykey.Webservice.Error.OneCommissionPlanPerCurrency)
      }
    }
    return {} // none specified
  }

  /**
   * A set of the {@link Currency}s as identified by the codes in the
   * {@link #Currencies} list for this {@link ProducerCodeInfo}.
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

  /**
   * Create a new {@link ProducerCode} for the specified {@link Currency} belonging
   * to the associated {@link Producer} in a multi-currency producer group with
   * attributes corresponding to those on this {@link ProducerCodeInfo}.
   *
   * @param mainProducer the main {@link Producer} of a producer group
   * @param currency the {@link Currency} for which to create the
   *                 {@code ProducerCode}
   * @param commissionPlansMap a map of optional {@link CommissionPlan}s by
   *                           {@code Currency} from which to assign the
   *                           @{code CommissionPlan}
   * @param bundle the {@link Bundle} in which to create the new
    *              {@code ProducerCode}
   * @return The new {@link ProducerCode}
   */
  function createNewProducerCode(mainProducer : Producer, currency : Currency,
      commissionPlansMap : Map<Currency, CommissionPlan>, bundle : Bundle)
          : ProducerCode {
    final var targetProducer = (currency == mainProducer.Currency)
        ? mainProducer
        : findOrCreateSplinterCurrencyProducer(mainProducer, currency)
    return makeProducerCode(targetProducer,
        getCommissionPlanForCurrency(currency, commissionPlansMap),
        bundle)
  }

  /**
   * Returns the {@link ProducerCode} identified by the {@link
   *    ProducerCodeInfo#PublicID PublicID} of this {@link ProducerCodeInfo}.
   *    This is a single {@code ProducerCode} or the main one within a multi-
   *    currency {@link MixedCurrencyProducerGroup}.
   */
  private property get ProducerCode() : ProducerCode {
    return WebserviceEntityLoader
        .loadByPublicID<ProducerCode>(this.PublicID, "PublicID")
  }

  private function findProducerCodesInCurrencyGroup(
      mainProducerCode : ProducerCode) : Iterable<ProducerCode> {
    final var producerCurrencyGroup =
        mainProducerCode.Producer.ProducerCurrencyGroup
    if (producerCurrencyGroup == null) {
      return {mainProducerCode}
    }

    // look in splinter Producers for all Currency ProducerCodes...
    return Query.make(entity.ProducerCode)
        .compare("Code", Equals, mainProducerCode.Code)
        .subselect("Producer", CompareIn, Query.make(ProducerCurrencyGroup)
              .compare("ForeignEntity", Equals, producerCurrencyGroup),
            "Owner")
        .select()
  }

  private function makeProducerCode(
      producer : Producer, commissionPlan : CommissionPlan, bundle : Bundle)
          : ProducerCode {
    final var producerCode = new ProducerCode(producer.Currency, bundle)
    producerCode.Code = this.Code
    producerCode.Active = this.Active
    producerCode.CommissionPlan = commissionPlan
    producer.addToProducerCodes( producerCode )
    return producerCode
  }

  /**
   * @param currency the {@link Currency}
   * @param commissionPlansMap the map of specified {@link CommissionPlan}s
   *                           by {@link Currency}
   * @return The {@link CommissionPlan} for the {@link Currency} either from the
   *         map or the first active one for the {@link Currency}, if any.
   * @throws RequiredFieldException if no {@link CommissionPlan} found
   */
  private function getCommissionPlanForCurrency(
      currency: Currency, commissionPlansMap: Map<Currency, CommissionPlan>)
      : CommissionPlan {
    assert currency != null : java.lang.NullPointerException
    var commissionPlan = commissionPlansMap.get(currency)
    if (commissionPlan == null) {
      commissionPlan = CommissionPlan.finder
          .findFirstActivePlanByPlanOrder(CommissionPlan, currency)
      if (commissionPlan == null) {
        throw new RequiredFieldException(
            displaykey.Webservice.Error.ProducerCode.MissingCommissionPlan(currency))
      }
    }
    return commissionPlan
  }

  /**
   * Look up or create a splinter currency producer  for the specified
   *    main producer.
   *
   * The currency for the producer is that specified on this {@link
   * NewProducerCodeInfo}.
   *
   * @param mainProducer the {@link Producer} whose {@link Currency} is
   *                     different than that of the ProducerCode to be created
   *                     by this {@code NewProducerCodeInfo}.
   * @return The splinter currency {@code Producer}.
   */
  private static function findOrCreateSplinterCurrencyProducer(
      mainProducer : Producer, currency : Currency) : Producer {
    var splinterProducer : Producer
    if (mainProducer.ProducerCurrencyGroup == null) {
      splinterProducer = createProducerForCurrency(mainProducer, currency)
    } else {
      splinterProducer = findExistingProducerForCurrency(
          mainProducer.ProducerCurrencyGroup, currency)
      if (splinterProducer == null) {
        splinterProducer = createProducerForCurrency(mainProducer, currency)
      }
    }
    return splinterProducer
  }

  private static function createProducerForCurrency(
      mainProducer : Producer, currency : Currency) : Producer {
    return PCProducerInfoEnhancement
        .createProducerForCurrency(mainProducer, currency)
  }

  private static function findExistingProducerForCurrency(
      producerGroup : MixedCurrencyProducerGroup, currency : Currency)
      : Producer {
    return Query.make(Producer)
        .compare("Currency", Equals, currency)
        .subselect("ID", CompareIn,
            Query.make(ProducerCurrencyGroup)
                .compare("ForeignEntity", Equals, producerGroup), "Owner")
        .select().AtMostOneRow
  }
}
