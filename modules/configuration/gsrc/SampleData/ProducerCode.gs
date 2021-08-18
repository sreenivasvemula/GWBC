package SampleData

uses gw.api.database.Query
uses gw.api.databuilder.ProducerCodeBuilder

@Export
class ProducerCode {
  function create(currency : Currency,
                  producer : Producer,
                  code : String,
                  commissionPlan : CommissionPlan
  ): ProducerCode {
    var existing = Query.make(ProducerCode).compare("Producer", Equals, producer).compare("Code", Equals, code).select()
    if (existing.Empty) {
      var producerCode = new ProducerCodeBuilder()
          .withCurrency(currency)
          .withCode(code)
          .withCommissionPlan(commissionPlan)
          .onProducer(producer)
      return producerCode.createAndCommit()
    } else {
      return existing.AtMostOneRow
    }
  }
}
