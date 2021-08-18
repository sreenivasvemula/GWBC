package gw.webservice.bc.bc700
uses gw.xml.ws.annotation.WsiWebService
uses gw.pl.persistence.core.Bundle
uses java.lang.Exception
uses gw.api.util.Logger
uses com.guidewire.pl.system.dependency.PLDependencies
uses java.util.Date

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc700/TroubleTicketAPI")
@Export
class TroubleTicketAPI extends APITestBase {

  private static final var SHOULD_IGNORE_CASE = true
  
  construct() {
  }

  public function createDisasterTroubleTicketsOnAccountsAndPoliciesWithPostalCodes(postalCodes : List<String>) {
    var exceptionWasThrown = false
    try {
      createTroubleTicketsOnAccountsAndPolicyPeriodsWithPostalCodes(postalCodes)
    } catch (ex : Exception) {
      exceptionWasThrown = true
      Logger.logError("An exception occurred while creating disaster trouble tickets", ex)
    }

    if (exceptionWasThrown) {
      createActivityWhenExceptionOccurs(postalCodes)
    }
  }

  public function createDisasterTroubleTicketsOnPoliciesWithPostalCodes(postalCodes : List<String>) {
    var exceptionWasThrown = false
    try {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        createTroubleTicketsOnPolicyPeriodsWithPostalCodes(postalCodes)
      })
    } catch (ex : Exception) {
      exceptionWasThrown = true
      Logger.logError("An exception occurred while creating disaster trouble tickets", ex)        
    }

    if (exceptionWasThrown) {
      createActivityWhenExceptionOccurs(postalCodes)
    }
  }

  private function createTroubleTicketsOnAccountsAndPolicyPeriodsWithPostalCodes(postalCodes : List<String>) {
    for (postalCode in postalCodes) {
      var accounts = findAccountsInPostalCode(postalCode)
      for (account in accounts) {
        gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          account = bundle.add(account)
          createTroubleTicketOnOneAccountAndItsPolicies(account)
        })
      }
    }
}
  
  private function createTroubleTicketsOnPolicyPeriodsWithPostalCodes(postalCodes : List<String>) {
    for (postalCode in postalCodes) {
      var policyPeriods = findPolicyPeriodsInPostalCode(postalCode)
      for (policyPeriod in policyPeriods) {
        gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          policyPeriod = bundle.add(policyPeriod)
          createTroubleTicketOnPolicyPeriod(policyPeriod)
        })
      }
    }
  }
  
  protected function createTroubleTicketOnOneAccountAndItsPolicies(account : Account) : TroubleTicket {
    var troubleTicket = createBaseTroubleTicket(account.Bundle)
    var troubleTicketHelper = new CreateTroubleTicketHelper(account.Bundle)
    troubleTicketHelper.linkTroubleTicketWithAccount(troubleTicket, account)
    var policyPeriods = account.OpenPolicyPeriods
    if (policyPeriods.HasElements) {
      troubleTicketHelper.linkTroubleTicketWithPolicyPeriods(troubleTicket, policyPeriods)
    }
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_DELINQUENCY, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_INVOICESENDING, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_PAYMENTDISTRIBUTION, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_DISBURSEMENTS, true)
    troubleTicket.Hold.checkForHoldAdditions()
    return troubleTicket
  }

  protected function createTroubleTicketOnPolicyPeriod(policyPeriod : PolicyPeriod) : TroubleTicket {
    var troubleTicket = createBaseTroubleTicket(policyPeriod.Bundle)
    var troubleTicketHelper = new CreateTroubleTicketHelper(policyPeriod.Bundle)
    troubleTicketHelper.linkTroubleTicketWithPolicyPeriods(troubleTicket, {policyPeriod})
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_DELINQUENCY, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_INVOICESENDING, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_COMMISSIONPOLICYEARN, true)
    troubleTicket.Hold.checkForHoldAdditions()
    return troubleTicket
  }
  
  private function createBaseTroubleTicket(bundle : Bundle) : TroubleTicket {
    var troubleTicket = new TroubleTicket(bundle)
    troubleTicket.Priority = Priority.TC_HIGH
    troubleTicket.TicketType = TroubleTicketType.TC_DISASTERHOLD    
    troubleTicket.Title = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Title
    troubleTicket.DetailedDescription = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Description
    return troubleTicket
  }
  
  private function findAccountsInPostalCode(postalCode : String) : gw.api.database.IQueryBeanResult<Account> {
    var accountQuery = gw.api.database.Query.make(Account)
    return accountQuery.subselect("ID", CompareIn, AccountContact, "Account")
                .join("Contact")
                .join("PrimaryAddress")
                .startsWith("PostalCode", postalCode, SHOULD_IGNORE_CASE)
                .select()
  }

  private function findPolicyPeriodsInPostalCode(postalCode : String) : gw.api.database.IQueryBeanResult<PolicyPeriod> {
    var policyPeriodQuery = gw.api.database.Query.make(PolicyPeriod)
    return policyPeriodQuery.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod")
                .join("Contact")
                .join("PrimaryAddress")
                .startsWith("PostalCode", postalCode, SHOULD_IGNORE_CASE)
                .select()
  }

  private function createActivityWhenExceptionOccurs(postalCodes : List<String>) {
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var activity = new Activity(bundle)
      activity.Priority = Priority.TC_NORMAL
      activity.Subject = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Error.Activity.Subject
      activity.Description = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Error.Activity.Description(postalCodes.toString(), Date.CurrentDate)
      var userToWhomActivityWillBeAssigned = PLDependencies.getUserFinder().findByCredentialName("admin")
      activity.assign( userToWhomActivityWillBeAssigned.RootGroup, userToWhomActivityWillBeAssigned )
    })
  }    
}
