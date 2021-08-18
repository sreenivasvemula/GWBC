package gw.command

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.web.payment.DirectBillPaymentFactory

@Export
class Transactions extends BaseCommand {

  construct() {
    super()
  }

  // PAUL
  // do a DirectBillMoneyReceivedTxn on the current Account, so money ends up in Default unapplied
  //   LIMITATION: until I figure out how to do ExecuteWithoutDistribution,  make
  //      the current account have nothing payable, so $ ends up in DefaultUnapplied
  //   Function to do the transaction is in the superclass, BaseCommand.gs
  //   todo: allow account to be specified.
  function doDirectBillMoneyReceivedTxn() {
     print("**** in doDirectBillMoneyReceivedTxn() ****")
      // TODO: take amount as parm, but have a default.
      // TODO: account parameter
           //1) use supplied account (name or number? --> name, i think) if any.
           //2) allows for selecting an account (ie, with  "?")
           //3) else use currentAccount, if any,
           //4) else create a new account. 
      // var account = getCurrentAccount()
      
      var acctNum = "Block-74-Cappuccino"
     
      // because I did a find, I can't do that in a read-only bundle (which I'm in by default?), so
      // need to create a new (r/w?) bundle at then do everything for this transaction while inside the block.
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> 
          {var account = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, acctNum).select().getFirstResult()
          bundle.add(account)
          print("****** 1 *******")
          var payment = DirectBillPaymentFactory.pay(account, 10bd.ofCurrency(account.Currency))
          print("****** 2 *******")
          //payment.Bundle.commit()   <-- unneeded while i'm in a transaction.
          print("pay 10 to " + account.AccountNumber + "\n")
          
          // VARs declared in this block will *not* be available once the block is done.
      })  // curly brace to enclose assignemnt statements, and paren to enclose the block.
  }
}