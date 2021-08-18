package gw.command

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.database.Query
uses gw.api.databuilder.AccountBuilder
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.DisplayableException
uses gw.workqueue.WorkQueueTestUtil

uses java.lang.NullPointerException
uses java.lang.Exception
uses java.util.Date

@Export
class BCBaseCommand extends BaseCommand{
  
  protected var randomNumber : String

  construct() {
    randomNumber = currentDate().Time as String
  }

  // END - additional parameters

  final function currentDate() : Date {
    return Date.CurrentDate
  }

  function getArgumentAsMonetaryAmount(argName : String, currency : Currency) : MonetaryAmount {
    return getArgumentAsBigDecimal(argName).ofCurrency(currency)
  }

  protected function nextID() : String {
    return currentDate().Time as java.lang.String
  }

  protected function displayMessageAndExit(message : String) {
    throw new DisplayableException(message, null)
  }

  function addMonths(count : Number) {
    Date.CurrentDate.addMonths(count as int).setClock()
  }

  function addDays(count : Number) {
    Date.CurrentDate.addDays(count as int).setClock()
  }

  function addWeeks(count : Number) {
    Date.CurrentDate.addWeeks(count as int).setClock()
  }

  function setDate(newDate : Date) {
    newDate.setClock()
  }

  function gotoEndOfMonth() {
    var lastDay = new org.joda.time.DateTime().dayOfMonth().MaximumValue
    if (currentDate().DayOfMonth != lastDay) {
      var fromDate = new org.joda.time.DateTime(currentDate())
      var fromDay = fromDate.getDayOfMonth()
      if (fromDay >= lastDay) {
        fromDate = fromDate.plusMonths(1)
      }
      var maxDay = fromDate.dayOfMonth().getMaximumValue()
      fromDate = fromDate.withDayOfMonth(maxDay > lastDay ? lastDay : maxDay)
      setDate(fromDate.toDate())
    }
  }  

  function runBatchProcess(batchProcessType : BatchProcessType) {
    WorkQueueTestUtil.startWriterViaBatchProcessManagerThenWorkersAndWaitUntilWorkFinishedThenStop(batchProcessType, {})
  }

  /**
  * This method is called by the runcommand to clean up the bundle after db exception.
  * Each command should implement this method to clean up its own bundles.
  */
  public function resetBundles() {
    AccountBuilder.resetEntityBundle()
  }
  
  protected function getCurrentProducer() : Producer {
    try {
      var currentProducer = getVariableOfType(Producer)
      if (currentProducer == null) {
        throw new NullPointerException("Current Producer is null.")
      }
      return currentProducer
    } catch(e : Exception) {
      displayMessageAndExit("There is no Producer in the scope of the current page. [" + e.Message + "]")
      return null
    }
  }
  
  protected function getCurrentAccount() : Account {
    try {
      var currentAccount = getVariableOfType(Account)
      if (currentAccount == null) {
        throw new NullPointerException("Current Account is null.")
      }
      return currentAccount
    } catch(e : Exception) {
      displayMessageAndExit("There is no Account in the scope of the current page. [" + e.Message + "]")
      return null
    }
  }
  
  protected function getCurrentPolicyPeriod() : PolicyPeriod {
    try {
      var currentPolicyPeriod = getVariableOfType(PolicyPeriod)
      if (currentPolicyPeriod == null) {
        throw new NullPointerException("Current Policy Period is null.")
      }
      return currentPolicyPeriod
    } catch(e : Exception) {
      displayMessageAndExit("There is no Policy Period in the scope of the current page [" + e.Message + "]")
      return null
    }
  }

  public static function findUser( userName : String ) : User {
    var userQuery = Query.make(User)
    userQuery.join("Credential").compare("UserName", Equals, userName)
    return userQuery.select().AtMostOneRow
  }
}

