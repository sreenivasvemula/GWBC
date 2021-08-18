package gw.command.demo

uses gw.api.databuilder.AgencyPaymentDirector
uses gw.api.workflow.WorkflowWorkQueueTestUtil
uses gw.command.BCBaseCommand
uses gw.transaction.Transaction

@Export
class Demo_AGBL extends BCBaseCommand {
  construct() {
  }

  /**
  * <b>AGBL Demo: Step 1</b><br>
  * Runs 1a, 1b and 1c
  * Creates a bunch of payment mismatch and late payment excpetions and MAI for aaplegate
  **/
  public function step01 () : String {
    return step01a() + step01b() + step01c()
  }

  /**
  * <b>AGBL Demo: Step 1a</b><br>
  * Creates a few AGBL exceptions (and hence My Agency Items).<br>
  * The exceptions are for producers Producer101, Producer102 and Producer103<br>
  * "My Agency Items" that comes out of the exceptions are assigned to user "<code><b>aapplegate</b></code>"<br>
  **/
  public function step01a () : String {

  // Ensure that the needed policies are present.
    var policyPeriod01 = PolicyPeriodEntity.getPolicyPeriod1001()
    PolicyPeriodEntity.getPolicyPeriod1002()
    PolicyPeriodEntity.getPolicyPeriod1003()
    PolicyPeriodEntity.getPolicyPeriod1004()
    PolicyPeriodEntity.getPolicyPeriod1005()
    PolicyPeriodEntity.getPolicyPeriod1006()

  // Get Producer for the first policy... and make the first planned statement billed
    var producer = policyPeriod01.getDefaultProducerCodeForRole("primary").Producer   // Should get Producer01
    new GeneralUtil().setClockToDate(getFirstStatementWithStatus(producer, InvoiceStatus.TC_PLANNED).Date)  // Set the clock to the first planned statement date
    runBatchProcess( BatchProcessType.TC_STATEMENTBILLED)  // Run the batch process
    pcf.ProducerAgencyBillCycles.go(producer);

    return "Step 01a Complete: "
  }

  /**
  * <b>AGBL Demo: Step 1b</b><br>
  * <p>Create AGBL Payments with Exceptions.<br>
  * These get assigned to Aapplegate
  **/
  public function step01b() : String {

  // Create Payment with Exceptions for Producer 101
    Transaction.runWithNewBundle( \ bundle -> 
      {
        var producer101 = PolicyPeriodEntity.getPolicyPeriod1001().getDefaultProducerCodeForRole("primary").Producer   // Should get Producer101
        print ("Producer-101 " + producer101)
        var statementInvoice = getLastStatementWithStatus(producer101, InvoiceStatus.TC_BILLED)
        if (statementInvoice != null) {
          var agencyCyclePayment = AgencyPaymentDirector.createAgencyPaymentWithPremiumInvoiceItemsAsCommissionMismatchExceptions( statementInvoice, 1, bundle)
          agencyCyclePayment.execute()
          agencyCyclePayment.Bundle.add( statementInvoice )
        }
        else {
          print ("OOPS! Demo_AGBL.gs > Step 01 > No Billed Invoice Found")
        }
        pcf.AgencyBillExceptions.go(producer101);
      }
    )

  // Want the next exception to have different date. So,
    addDays(12)

  // Create Payment with Exceptions for Producer 102
    Transaction.runWithNewBundle( \ bundle -> 
      {
        var producer102 = PolicyPeriodEntity.getPolicyPeriod1002().getDefaultProducerCodeForRole("primary").Producer   // Producer102
        print ("Producer-102 " + producer102)
        var statementInvoice = getLastStatementWithStatus(producer102, InvoiceStatus.TC_BILLED)
        if (statementInvoice != null) {
          var agencyCyclePayment = AgencyPaymentDirector.createAgencyPaymentWithAllInvoiceItemsAsMismatchExceptions( statementInvoice, 
            10bd.ofCurrency(statementInvoice.Currency), 1bd.ofCurrency(statementInvoice.Currency), bundle)
          agencyCyclePayment.execute()
//          var agencyCyclePayment = AgencyPaymentDirector.createExecutedAndCommittedAgencyPaymentWithCommissionMismatchExceptions( statementInvoice, 10, 1 )
          agencyCyclePayment.Bundle.add( statementInvoice )
        }
        else {
          print ("OOPS! Demo_AGBL.gs > Step 01 > No Billed Invoice Found")
        }
      }
    )

  // Want the next exception to have different date. So,
    addDays(10)

  // Create Payment with Exceptions for Producer 102
    Transaction.runWithNewBundle( \ bundle -> 
      {
        var producer103 = PolicyPeriodEntity.getPolicyPeriod1003().getDefaultProducerCodeForRole("primary").Producer   // Producer102
        print ("Producer-103 " + producer103)
        var statementInvoice = getLastStatementWithStatus(producer103, InvoiceStatus.TC_BILLED)
        if (statementInvoice != null) {
          var agencyCyclePayment = AgencyPaymentDirector.createAgencyPaymentWithAllInvoiceItemsAsMismatchExceptions( statementInvoice, 
          40bd.ofCurrency(statementInvoice.Currency), 1bd.ofCurrency(statementInvoice.Currency), bundle )
          agencyCyclePayment.execute()

//          var agencyCyclePayment = AgencyPaymentDirector.createExecutedAndCommittedAgencyPaymentWithCommissionMismatchExceptions( statementInvoice, 40, 0 )
          agencyCyclePayment.Bundle.add( statementInvoice)
        }
        else {
          print ("OOPS! Demo_AGBL.gs > Step 01 > No Billed Invoice Found")
        }
      }
    )

    return "Step 01b Complete: "
  }

  /**
   * <b>AGBL Demo: Step 1c</b><br>
   * Creates an AGBL Late Payment exception (and hence My Agency Items).<br>
   * The exception is for producer Producer104<br>
   * "My Agency Items" that comes out of the exception is assigned to user "<code><b>aapplegate</b></code>"<br>
  **/
  public function step01c () : String {

  // Ensure that the needed policies are present.
    var policyPeriod04 = PolicyPeriodEntity.getPolicyPeriod1004()

  // Get Producer for policy 1004... and make the first planned statement billed
    var producer = policyPeriod04.getDefaultProducerCodeForRole("primary").Producer   // Should get Producer04
    new GeneralUtil().setClockToDate(getFirstStatementWithStatus(producer, InvoiceStatus.TC_BILLED).DueDate.addDays(1))  // Set the clock to the first billed statement's due date.
    runBatchProcess( BatchProcessType.TC_STATEMENTDUE)  // Run the batch process
    WorkflowWorkQueueTestUtil.runWorkflowWorkQueue();
    pcf.ProducerAgencyBillCycles.go(producer);

    return "Step 01c Complete: "
  }

  /**
    This returns the last statement with matching InvoiceStatus for the given producer
  **/
  private static function getLastStatementWithStatus (producer : Producer, status: InvoiceStatus): StatementInvoice {
    var agblCycleList = producer.AgencyBillCyclesSortedByStatementDate
    var firstPlannedStatement = agblCycleList.where( \ a -> a.StatementInvoice.Status == status).last().StatementInvoice
    return firstPlannedStatement
  }

  /**
    This returns the last statement with matching InvoiceStatus for the given producer
  **/
  private static function getFirstStatementWithStatus (producer : Producer, status: InvoiceStatus): StatementInvoice {
    var agblCycleList = producer.AgencyBillCyclesSortedByStatementDate
    var firstPlannedStatement = agblCycleList.firstWhere( \ a -> a.StatementInvoice.Status == status).StatementInvoice
    return firstPlannedStatement
  }

}
