package gw.search

uses gw.agencybill.AgencyDistributionWizardHelper.StatusEnum
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.search.InvoiceItemQueryHelper.DistributionTypeEnum

uses java.io.Serializable

@Export
class StatementInvoiceSearchCriteria implements Serializable {

  var _query : Query<StatementInvoice>
  var _distributionType : DistributionTypeEnum

  var _producer : Producer as Producer
  var _statementNumber : String as StatementNumber
  var _status : StatusEnum as Status

  construct(distributionType : DistributionTypeEnum) {
    _distributionType = distributionType
  }
  
  function performSearch() : IQueryBeanResult<StatementInvoice> {
    _query = Query.make(StatementInvoice)
    buildQuery()
    return _query.select()
  }

  private function buildQuery() {  
    restrictQueryByProducer()
    restrictQueryByStatementNumber()
    restrictQueryByStatus()

    new InvoiceItemQueryHelper(_distributionType)
        .filterOutFullySettledInvoiceItems()
        .restrictInvoiceItemsByIsNotReversedOrReversal()
        .restrictInvoiceItemsByIsNotCommissionRemainder()
        .asSubselect(_query, "Invoice")

  }

  private function restrictQueryByProducer() {
    if (_producer != null) {
      _query
          .join("AgencyBillCycle")
          .compare("Producer", Equals, _producer)
      
    }
  }
  
  private function restrictQueryByStatementNumber() {
    if (StatementNumber.NotBlank) {
      _query.startsWith("InvoiceNumber", _statementNumber, true)
    }
  }
  
  private function restrictQueryByStatus() {
    if (_status == StatusEnum.OPEN) {
      _query.or(\ restriction -> {
        restriction.compare("Status", Equals, InvoiceStatus.TC_BILLED)
        restriction.compare("Status", Equals, InvoiceStatus.TC_DUE)
      })
    } else if (_status == StatusEnum.PLANNED) {
      _query.compare("Status", Equals, InvoiceStatus.TC_PLANNED)
    }
  }
}
