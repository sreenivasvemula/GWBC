package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.ProducerCodeInfo
uses gw.pl.persistence.core.Bundle
uses gw.api.webservice.exception.BadIdentifierException

@Export
enhancement ProducerCodeInfoEnhancement : ProducerCodeInfo {
  function toProducerCode(bundle : Bundle) : ProducerCode {
    var producerCode = gw.api.database.Query.make(ProducerCode).compare("PublicID", Equals, this.PublicID).select().getAtMostOneRow()
    if (producerCode == null) {
      throw new BadIdentifierException("Cannot find producer code with Public ID: \"" + this.PublicID + "\"")
    }
    producerCode = bundle.add(producerCode)
    producerCode.Code = this.Code
    producerCode.Active = this.Active
    return producerCode
  }
}
