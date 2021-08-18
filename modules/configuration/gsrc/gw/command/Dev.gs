package gw.command

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.database.Query
uses gw.transaction.Transaction

@Export
class Dev extends BaseCommand{

  construct() {

  }
  
  function retireAll(){
    retireAllPolicies()
    retireAllAccounts()
  }
  
  function retireAllPolicies(){
    var query = Query.make(PolicyPeriod).select()
    for (p in query) {
      Transaction.runWithNewBundle(\ bundle -> {
        bundle.loadByKey(p.ID).remove()
      })
    }
  }
  
  function retireAllAccounts(){
    var query = Query.make(Account).select()
    for (p in query) {
      Transaction.runWithNewBundle(\ bundle -> {
        bundle.loadByKey(p.ID).remove()
      })
    }
  }
}
