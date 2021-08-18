package gw.webservice.policycenter.bc700

uses gw.api.database.Query
uses gw.api.web.account.AccountBalancesView
uses gw.api.web.account.Policies
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException

@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/BillingSummaryAPI" )
@Export
class BillingSummaryAPI {
  /**
   * Returns the account-level billing summary for the specified account number.  If no such account exists,
   * a BadIdentifierException will be thrown.
   * 
   * @param accountNumber the number of the account
   * @return a billing summary for that account suitable for display in the PolicyCenter UI
   */
  @Throws(SOAPException, "If communication error or any other problem occurs.") 
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.")   
  public function retrieveAccountBillingSummary(accountNumber : String) : BCPCAccountBillingSummary {
    require(accountNumber, "accountNumber")
    var account = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
    if (account == null) {
      throw new BadIdentifierException(accountNumber)
    }

    var accountBalances = new AccountBalancesView(account)

    var summary = new BCPCAccountBillingSummary()
    
    summary.AccountName = account.AccountName
    summary.BilledOutstandingTotal = accountBalances.AdjustedOutstandingAmount
    summary.BilledOutstandingCurrent = accountBalances.AdjustedBilledAmount
    summary.BilledOutstandingPastDue = account.DelinquentAmount
    summary.UnbilledTotal = accountBalances.AdjustedUnbilledAmount
    summary.UnappliedFundsTotal = account.UnappliedAmount
    
    summary.CollateralRequirement = account.Collateral.TotalRequirementValue
    summary.CollateralHeld = account.Collateral.TotalCollateralValue
    summary.CollateralChargesUnbilled = account.Collateral.UnbilledAmount
    summary.CollateralChargesBilled = account.Collateral.BilledAmount
    summary.CollateralChargesPastDue = account.Collateral.DueAmount
    
    summary.Delinquent = (account).hasActiveDelinquenciesOutOfGracePeriod()
    
    var primaryPayer = account.PrimaryPayer.Contact
    summary.PrimaryPayer = new ContactSummary() {
      :Name = primaryPayer.DisplayName,
      :Address = primaryPayer.PrimaryAddress.DisplayName,
      :Phone = primaryPayer.PrimaryPhoneValue
    }

    summary.BillingSettings = new AccountBillingSettings(account)
    return summary
  }
  
  /**
   * Returns the policy-level billing summary for a specific policy period.
   * 
   * @param policyNumber the number of the policy
   * @param termNumber the term number of the policy
   * @return a billing summary for that policy suitable for display in the PolicyCenter UI
   */
  @Throws(SOAPException, "If communication error or any other problem occurs.") 
  @Throws(BadIdentifierException, "If no policy exists with the given policy number & term number")
  @Throws(RequiredFieldException, "If required parameter is missing.") 
  public function retrievePolicyBillingSummary(policyNumber : String, termNumber : int) : PolicyBillingSummary {
    require(policyNumber, "policyNumber")
    var q = Query.make(PolicyPeriod)
    q.compare("PolicyNumber", Equals, policyNumber)
    q.compare("TermNumber", Equals, termNumber)
    var policyPeriod = q.select().FirstResult
    if (policyPeriod == null) {
      throw new BadIdentifierException("Cannot find policy period with policy number of ${policyNumber} and term number of ${termNumber}")
    }
    return new PolicyBillingSummary(policyPeriod)
  }
  
  /**
   * Returns the open policy periods that the given account pays but does not own
   *
   * @param accountNumber the number of the account
   * @return the DisplayablePolicyPeriods for the open policy periods that the given account pays but does not own
   */
  @Throws(SOAPException, "If communication error or any other problem occurs.") 
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.") 
  public function retrievePeriodsBilledToAccount(accountNumber : String) : DisplayablePolicyPeriod[] {
    require(accountNumber, "accountNumber")
    var account = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
    if (account == null) {
      throw new BadIdentifierException(accountNumber)
    }
    return Policies.findAllOpenPolicyPeriodsWhereAccountIsOverridingPayer(account, null)
      .map( \ policyPeriod -> new DisplayablePolicyPeriod(policyPeriod) )
      .toTypedArray()
  }

  /**
   * Returns the open policy periods owned by the given account
   * 
   * @param accountNumber the number of the account
   * @return an array policy period info
   */
  @Throws(SOAPException, "If communication error or any other problem occurs.") 
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.") 
  public function retrievePeriodsForAccount(accountNumber : String) 
    : DisplayablePolicyPeriod[] {
    require(accountNumber, "accountNumber")
    var account = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
    if (account == null) {
      throw new BadIdentifierException(accountNumber)
    }
    return account.OpenPolicyPeriods
      .map( \ p -> new DisplayablePolicyPeriod(p) )
  }
  
  /**
   * Returns the invoices of the given account
   * 
   * @param accountNumber the number of the account
   * @return an array of PCInvoiceInfo
   */
  @Throws(SOAPException, "If communication error or any other problem occurs.") 
  @Throws(BadIdentifierException, "If no account exists with the given account number")
  @Throws(RequiredFieldException, "If required parameter is missing.") 
  public function retrieveInvoicesForAccount(accountNumber : String) 
    : PCInvoiceInfo[] {
    require(accountNumber, "accountNumber")
    var account = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, accountNumber).select().AtMostOneRow
    if (account == null) {
      throw new BadIdentifierException(accountNumber)
    }
    return account.Invoices.map( \ p -> new PCInvoiceInfo(p) )
  }
    
  private function require(element : Object, parameterName : String) {
    if (element == null) {
      throw new RequiredFieldException(displaykey.Webservice.Error.MissingRequiredField(parameterName))  
    }
  }
}
