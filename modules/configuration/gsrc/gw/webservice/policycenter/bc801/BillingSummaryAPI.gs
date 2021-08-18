package gw.webservice.policycenter.bc801

uses gw.api.web.account.Policies
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException

uses java.util.ArrayList

@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/BillingSummaryAPI" )
@Export
class BillingSummaryAPI extends AbstractBillingAPI {
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
  public function retrieveAccountBillingSummary(accountNumber : String) : BCPCAccountBillingSummary[] {
    final var baseAccount = findAccountIdentifiedBy(accountNumber)

    if (baseAccount.AccountCurrencyGroup == null) {
      return {new BCPCAccountBillingSummary(baseAccount)}
    }
    return baseAccount.AccountCurrencyGroup.findAccounts()
        .map(\ account -> new BCPCAccountBillingSummary(account))
        .toTypedArray()
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
    var policyPeriod = PolicyPeriod.finder.findByPolicyNumberAndTerm(policyNumber, termNumber)
    if (policyPeriod == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindMatchingPolicyPeriod(policyNumber, termNumber))
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
    final var account = findAccountIdentifiedBy(accountNumber)

    var openPeriods = new ArrayList<PolicyPeriod>()
    if (account.AccountCurrencyGroup != null){
      for (sibling in account.AccountCurrencyGroup.findAccounts()){
        openPeriods.addAll(Policies.findAllOpenPolicyPeriodsWhereAccountIsOverridingPayer(sibling, null).toList())
      }
    } else {
      openPeriods.addAll(Policies.findAllOpenPolicyPeriodsWhereAccountIsOverridingPayer(account, null).toList())
    }

    return openPeriods
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
  public function retrievePeriodsForAccount(accountNumber : String) : DisplayablePolicyPeriod[] {
    final var account = findAccountIdentifiedBy(accountNumber)

    var periods = new ArrayList<PolicyPeriod>()
    if (account.AccountCurrencyGroup != null ) {
      for (sibling in account.AccountCurrencyGroup.findAccounts()) {
        periods.addAll(sibling.OpenPolicyPeriods.toList())
      }
    } else {
      periods.addAll(account.OpenPolicyPeriods.toList())
    }

    return periods
      .toTypedArray()
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
  public function retrieveInvoicesForAccount(accountNumber : String) : PCInvoiceInfo[] {
    final var account = findAccountIdentifiedBy(accountNumber)

    var invoices = new ArrayList<Invoice>()
    if (account.AccountCurrencyGroup != null ) {
      for (sibling in account.AccountCurrencyGroup.findAccounts()){
        invoices.addAll(sibling.Invoices.toList())
      }
    } else {
      invoices.addAll(account.Invoices.toList())
    }

    return invoices.map(\ p -> new PCInvoiceInfo(p)).toTypedArray()
  }
}
