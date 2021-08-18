package gw.command

uses com.guidewire.pl.quickjump.BaseCommand

uses java.lang.Exception

/**
 * Methods on this class are exposed via "Run . methodName"
 */
@Export
class GlobalCommand extends BaseCommand {

  construct() {
    super()
  }
    
  function switchUser() : String{
    try {
      new com.guidewire.pl.web.auth.LoginHelper().login(Arguments[0].asString(), "gw")
    } catch (e : Exception) {
      new com.guidewire.pl.web.auth.LoginHelper().login("su", "gw")
      return "Cannot login as " + Arguments[0] + ", error: " + e.Message
    }
    return "Current User: " + Arguments[0]
  }

  function toAgencyProducer() {
    new AGBL().toAgencyProducer()
  }
 
 
  function toCurrentAgencyPaymentWizard() 
  {
    new AGBL().toCurrentAgencyPaymentWizard()
  }
  
  function toStatementDetails(){
    new AGBL().toStatementDetails()
  }
  
  function makeOneStatementBilled()
  {
    new AGBL().makeOneStatementBilled()
  }
}