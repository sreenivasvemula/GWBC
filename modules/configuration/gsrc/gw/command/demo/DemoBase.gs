package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand

@Export
class DemoBase extends BaseCommand {
  construct() {
    super()
  }

  /**
    This returns the last statement with matching InvoiceStatus for the given producer
  **/
  protected function getLastStatementWithStatus (producer : Producer, status: InvoiceStatus): StatementInvoice {
    var agblCycleList = producer.AgencyBillCyclesSortedByStatementDate
    var firstPlannedStatement = agblCycleList.where( \ a -> a.StatementInvoice.Status == status).last().StatementInvoice
    return firstPlannedStatement
  }

  /**
    This returns the last statement with matching InvoiceStatus for the given producer
  **/
  protected function getFirstStatementWithStatus (producer : Producer, status: InvoiceStatus): StatementInvoice {
    var agblCycleList = producer.AgencyBillCyclesSortedByStatementDate
    var firstPlannedStatement = agblCycleList.firstWhere( \ a -> a.StatementInvoice.Status == status).StatementInvoice
    return firstPlannedStatement
  }

}
