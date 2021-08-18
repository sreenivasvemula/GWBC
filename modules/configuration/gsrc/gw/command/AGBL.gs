package gw.command

uses gw.api.database.Query
uses gw.api.databuilder.AgencyCyclePaymentBuilder
uses gw.api.databuilder.AgencyCyclePromiseBuilder
uses gw.api.databuilder.AgencyMoneyReceivedBuilder
uses gw.api.databuilder.AgencyPaymentDirector
uses gw.api.databuilder.AgencyPromiseItemBuilder
uses gw.api.databuilder.AgencySuspPmntItemBuilder
uses gw.api.databuilder.AgencySuspPromiseItemBuilder
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.PromisedMoneyBuilder

uses java.util.Random

@Export
class AGBL extends BCBaseCommand {

  function createAgencySuspPmntItems(){
    var producer = new gw.command.Producer().withAgencyBill()
    producer.AccountRep = User.util.CurrentUser
    var agencyBillCycle = producer.AgencyBillCyclesSortedByStatementDate.get( 0 )
    var payment = new AgencyCyclePaymentBuilder()
            .withAgencyBillMoneyReceived(
              new AgencyMoneyReceivedBuilder()
                .onProducer(agencyBillCycle.getProducer())
                .withAmount(200bd.ofCurrency(agencyBillCycle.Currency)))
            .create()
    new AgencySuspPmntItemBuilder()
            .withPolicyNumber("11111")
            .withGrossAmountToApply(250bd.ofCurrency(agencyBillCycle.Currency))
            .withCommissionAmountToApply(50bd.ofCurrency(agencyBillCycle.Currency))
            .onDist(payment)
            .createAndCommit()
    payment.execute()
    payment.Bundle.commit()
    pcf.DesktopAgencyItems.go()
  }

  function withSavedSuspensePromiseItems(){
    var producer = getCurrentProducer()
    // set the current user as AccountRep so that the promise items appear on the Desktop>My Agency Items page
    producer.AccountRep = User.util.CurrentUser
    var statementInvoice = producer.AgencyBillCyclesSortedByStatementDate.first().StatementInvoice
    var promise = new AgencyCyclePromiseBuilder()
            .withCurrency(producer.Currency)
            .withPromisedMoneyReceived(
              new PromisedMoneyBuilder()
                .withCurrency(producer.Currency)
                .onProducer(producer)
                .withAmount(237bd.ofCurrency(producer.Currency)))
            .create()
    var firstInvoiceItem = statementInvoice.InvoiceItemsWithoutCommissionRemainder[0]
    new AgencyPromiseItemBuilder()
      .withCurrency(producer.Currency)
      .onAgencyPromise(promise)
      .onInvoiceItem(firstInvoiceItem)
      .grossAmount(firstInvoiceItem.getAmount())
      .commissionAmount(firstInvoiceItem.PrimaryCommissionAmount)
      .create()
    new AgencySuspPromiseItemBuilder()
            .withCurrency(producer.Currency)
            .withPolicyNumber("Policy-" + BCDataBuilder.createRandomWordPair())
            .withGrossAmountToApply((243bd + new Random().nextInt(100)).ofCurrency(producer.Currency))
            .withCommissionAmountToApply((36bd + new Random().nextInt(40)).ofCurrency(producer.Currency))
            .onDist(promise)
            .create()
    promise.Bundle.commit()
    pcf.ProducerDetail.go(producer)
  }

  function toAgencyProducer() {
    var producer = getLastAGBLProducer()
    pcf.ProducerDetail.go(producer)
  }

  function toAgencyBillCycles() {
    var producer = getLastAGBLProducer()
    pcf.ProducerAgencyBillCycles.go(producer)
  }

  function toAgencyBillPolicyDetails(){
    var producer = getLastAGBLProducer()
    var firstPolicyPeriod = producer.ProducerCodes[0].PolicyCommissions.FirstResult.PolicyPeriod
    pcf.AgencyBillPolicyDetailsPopup.push(firstPolicyPeriod)
  }

  function toItemHistory(){
    var producer = getLastAGBLProducer()
    var firstInvoiceItem = producer.AgencyBillCycles.sortBy(\ a -> a.StatementInvoice.EventDate)[0]
      .StatementInvoice.InvoiceItems.sortBy(\ i -> i.EventDate)[0]
    pcf.InvoiceItemHistoryPopup.push(firstInvoiceItem)
  }

  function toCurrentAgencyPaymentWizard() {
    var producer = getCurrentProducer()

    pcf.AgencyDistributionWizard.go(producer, gw.agencybill.AgencyDistributionWizardHelper.DistributionTypeEnum.PAYMENT)
  }
  
  function toStatementDetails(){
    var producer = getLastAGBLProducer()
    var cycle = producer.AgencyBillCyclesSortedByStatementDate.first()
    pcf.AgencyBillStatementDetail.go( cycle )
  }


  function makeStatementBilledAndDue() : String {
    addMonths(1)
    runBatchProcess(BatchProcessType.TC_STATEMENTBILLED)
    runBatchProcess(BatchProcessType.TC_STATEMENTDUE)
    return "Today is : " + currentDate()
  }

  function payWithException() {
    var invoiceNumber : int = Arguments[0].asInt()
    var producer = getCurrentProducer()
    var agencyBillCycles = producer.AgencyBillCycles.sortBy(\ a -> a.StatementInvoice.EventDate)
    var statementInvoice = agencyBillCycles[invoiceNumber].StatementInvoice
    var agencyPayment = AgencyPaymentDirector.createAgencyPaymentWithOneException(
      statementInvoice, 100bd.ofCurrency(producer.Currency), 0bd.ofCurrency(producer.Currency))
    agencyPayment.execute()
    agencyPayment.getBundle().commit()
    pcf.AgencyBillExceptions.go(producer)
  }
  
  function makeOneStatementBilled() : String {
    var producer = getCurrentProducer()
    var cycles = producer.AgencyBillCycles
    if (cycles.IsEmpty) {
      return "This Producer (" + producer.DisplayName + ") has no Agency Bill Cycles."
    }
    var firstPlannedInvoice = cycles
      .sortBy(\ a -> a.StatementInvoice.EventDate)
      .firstWhere(\ a -> a.StatementInvoice.Status == InvoiceStatus.TC_PLANNED).StatementInvoice
    var nextInvoiceDate = firstPlannedInvoice.EventDate
    var newDate = nextInvoiceDate.addDays(1)
    setDate(newDate)
    runBatchProcess(BatchProcessType.TC_STATEMENTBILLED)
    pcf.ProducerAgencyBillCycles.go(producer)
    return "Clock was advanced to " + newDate + " and StatementBilled batch process has been run."
  }
  
  function gotoAgencyPaymentWizard() {
    var producer = getCurrentProducer()
    pcf.AgencyDistributionWizard.go(producer, gw.agencybill.AgencyDistributionWizardHelper.DistributionTypeEnum.PAYMENT)
  }

  protected function getLastAGBLProducer() : Producer {
    var producers =  Query.make(Producer).select()
    var producer = producers.iterator().toList()
      .sortByDescending(\ t -> t.CreateTime)
      .firstWhere(\ t -> t.AgencyBillCycles.length > 0)
    return producer
  }
  
}
