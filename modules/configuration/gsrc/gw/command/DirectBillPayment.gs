package gw.command

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.DirectBillPaymentFixtureBuilder

uses java.util.Date

@Export
class DirectBillPayment extends BaseCommand {

  public function accountWith2Charges1PaidThenReversed() {
    Date.CurrentDate.addDays(1).setClock()
    
    var accountNumber = BCDataBuilder.createRandomWordPair()

    var account = new AccountBuilder()
            .withNumber(accountNumber)
            .create()
    var accountLateFeeCharge = new ChargeBuilder()
            .asAccountLateFee()
            .withAmount(10bd.ofCurrency(account.Currency))
            .onAccountWithAccountGeneralBI(account)
            .createAndCommit()

    var accountPaymentReversalCharge = new ChargeBuilder()
            .asPaymentReversalFee()
            .withAmount(9bd.ofCurrency(account.Currency))
            .onAccountWithAccountGeneralBI(account)
            .createAndCommit()

    new DirectBillPaymentFixtureBuilder()
            .withFullPaymentForInvoiceItem(accountPaymentReversalCharge.getSingleInvoiceItem())
            .createFixture()
            .getDirectBillPayment()

    var bundle = gw.transaction.Transaction.getCurrent()

    var moneyReceiveds = account.findReceivedPaymentMoneysSortedByReceivedDate().toList()
    print(moneyReceiveds)
    for (paymentMoneyReceived in moneyReceiveds) {
      if (paymentMoneyReceived typeis DirectBillMoneyRcvd) {
        for (distItem in paymentMoneyReceived.BaseDist.DistItems) {
          bundle.add(distItem)
          distItem.reverse()
        }
      }
    }
    bundle.commit()

    pcf.AccountPayments.go(account)
  }
  
  function executeAndCommitBillingInstructionFrom(charge : Charge) {
    charge.BillingInstruction.execute()
    charge.BillingInstruction.Bundle.commit()
  }
}
