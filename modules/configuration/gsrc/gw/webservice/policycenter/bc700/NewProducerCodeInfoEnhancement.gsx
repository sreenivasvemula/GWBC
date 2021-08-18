package gw.webservice.policycenter.bc700

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.policycenter.bc700.entity.types.complex.NewProducerCodeInfo

@Export
enhancement NewProducerCodeInfoEnhancement : NewProducerCodeInfo {

  private property get Producer() : Producer {
    final var producer = Query.make(entity.Producer)
        .compare("PublicID", Equals, this.ProducerPublicID)
        .select().AtMostOneRow
    if (producer == null) {
      throw BadIdentifierException
          .badPublicId(entity.Producer, this.ProducerPublicID)
    }
    return producer
  }

  function toNewProducerCode(bundle : Bundle) : ProducerCode {
    var producer = Producer
    var producerCode = new ProducerCode(producer.Currency, bundle)
    producerCode.PublicID = this.PublicID
    producerCode.Code = this.Code
    producerCode.Active = this.Active
    producerCode.CommissionPlan = getCommissionPlan(producerCode.Currency)
    producerCode.Bundle.add( producer )
    producer.addToProducerCodes( producerCode )
    return producerCode
  }

  function getCommissionPlan() : CommissionPlan {
    return getCommissionPlan(Producer.Currency)
  }

  private function getCommissionPlan(currency : Currency) : CommissionPlan {
    if (this.CommissionPlanID == null) {
      return CommissionPlan.finder.findFirstActivePlan(CommissionPlan, currency)
    }
    var cmsnPlan = Query.make(CommissionPlan)
        .compare("PublicID", Equals, this.CommissionPlanID).select().AtMostOneRow
    if (cmsnPlan == null) {
      throw BadIdentifierException.badPublicId(CommissionPlan, this.CommissionPlanID)
    }
    return cmsnPlan
  }
  
  function sync(producerCode : ProducerCode) {
    producerCode.Code = this.Code
    producerCode.Active = this.Active
    producerCode.CommissionPlan = getCommissionPlan(producerCode.Currency)
  }
}
