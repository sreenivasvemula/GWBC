package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc801.entity.types.complex.NewProducerCodeInfo

@Export
enhancement NewProducerCodeInfoEnhancement : NewProducerCodeInfo {
  
  function toNewProducerCode(bundle : Bundle) : ProducerCode {
    final var commissionPlansMap = this.CommissionPlans
    final var mainProducer = bundle.add(Producer)

    var returnProducerCode = ProducerCode
    if (this.Currencies.Empty
        or this.Currencies.contains(mainProducer.Currency.Code)) {
      // create ProducerCode for (main) Producer...
      returnProducerCode = this.createNewProducerCode(mainProducer,
          mainProducer.Currency, commissionPlansMap, bundle)
      returnProducerCode.PublicID = this.PublicID
    }

    for (var currency in this.CurrenciesSet) { // unique currencies only
      if (currency == mainProducer.Currency) {
        continue // already created for main Producer...
      }
      final var producerCode = this.createNewProducerCode(mainProducer,
              currency, commissionPlansMap, bundle)

      if (returnProducerCode == null) {
        // by default, 1st (and possibly only)...
        producerCode.PublicID = this.PublicID
        returnProducerCode = producerCode
      }
    }
    return returnProducerCode
  }
  
  function getCommissionPlan(publicId : String) : CommissionPlan {
    var cmsnPlan = Query.make(CommissionPlan)
        .compare("PublicID", Equals, publicId).select().AtMostOneRow
    if (cmsnPlan == null){
      throw BadIdentifierException.badPublicId(CommissionPlan, publicId)
    }
    return cmsnPlan
  }
  
  function sync(producerCode : ProducerCode) {
    producerCode.Code = this.Code
    producerCode.Active = this.Active
    producerCode.CommissionPlan = this.CommissionPlans.get(producerCode.Currency)
  }

  private property get Producer() : Producer {
    final var producer = Query.make(entity.Producer)
        .compare("PublicID", Equals, this.ProducerPublicID)
        .select().AtMostOneRow

    if (producer == null) {
      throw BadIdentifierException.badPublicId(entity.Producer, this.ProducerPublicID)
    }
    return producer
  }

  /**
   * Returns the {@link ProducerCode} identified by the {@link
   *    ProducerCodeInfo#PublicID PublicID} of this {@link ProducerCodeInfo}.
   *    This is a single {@code ProducerCode} or the main one within a multi-
   *    currency {@link MixedCurrencyProducerGroup}.
   */
  private property get ProducerCode() : ProducerCode {
    return Query.make(entity.ProducerCode)
        .compare("PublicID", Equals, this.PublicID)
        .select().AtMostOneRow
  }
}
