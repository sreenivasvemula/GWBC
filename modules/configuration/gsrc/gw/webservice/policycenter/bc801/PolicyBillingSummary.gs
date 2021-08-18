package gw.webservice.policycenter.bc801

uses gw.api.database.Query
uses gw.api.web.policy.PolicyPeriodBalancesView
uses gw.pl.currency.MonetaryAmount
uses gw.xml.ws.annotation.WsiExportable

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/PolicyBillingSummary" )
@Export
final class PolicyBillingSummary {
  var _policyTermInfos: PolicyTermInfo[] as PolicyTermInfos
  /**
   * @deprecated 8.0.2 use PolicyTermInfos properties and format as desired
   */
  @Deprecated("Use PolicyTermInfos instead", "8.0.2")
  var _periods : String[] as Periods
  var _currentOutstanding : MonetaryAmount as CurrentOutstanding
  var _paid : MonetaryAmount as Paid
  var _depositRequirement : MonetaryAmount as DepositRequirement
  var _totalCharges : MonetaryAmount as TotalCharges
  var _paymentPlanName : String as PaymentPlanName
  var _altBillingAccount : String as AltBillingAccount
  var _invoiceStream : String as InvoiceStream
  var _invoices : PCInvoiceInfo[] as Invoices
  var _billingStatus : DisplayableBillingStatus as BillingStatus

  construct() {}

  construct(policyPeriod : PolicyPeriod) {
    _billingStatus = new DisplayableBillingStatus(policyPeriod)

    _policyTermInfos = findAllPolicyPeriods(policyPeriod.Policy)
        .sortBy(\ p -> p.PolicyPerEffDate)
        .map(\ p -> new PolicyTermInfo(p))
    _periods = PolicyTermInfos
        .map( \ p -> "${p.EffectiveDate.AsUIStyle} - ${p.ExpirationDate.AsUIStyle}" )
    var policyPeriodBalances = new PolicyPeriodBalancesView(policyPeriod)
    _currentOutstanding = policyPeriodBalances.AdjustedOutstandingAmount
    _paid = policyPeriod.PaidAmount.add(policyPeriod.ChargeRevenueRollupSum)
    _totalCharges = policyPeriod.TotalValue
    _paymentPlanName = policyPeriod.PaymentPlan.Name

    var overridingPayerAccount : Account
    overridingPayerAccount = policyPeriod.OverridingPayerAccount
    if (policyPeriod.OverridingPayerAccount != null){
      overridingPayerAccount = policyPeriod.OverridingPayerAccount.AccountCurrencyGroup != null
          ? policyPeriod.OverridingPayerAccount.AccountCurrencyGroup.MainAccount
          : policyPeriod.OverridingPayerAccount
    }
    _altBillingAccount = overridingPayerAccount.AccountNumber
    if (overridingPayerAccount.AccountName != null) {
      _altBillingAccount += " (${overridingPayerAccount.AccountName})"
    }

    _invoiceStream = policyPeriod.OverridingInvoiceStream.PCDisplayName
    // TODO: _depositRequirement = policyPeriod.DepositRequirement
    _invoices = policyPeriod.InvoiceItems
        .partition(\ item -> item.Invoice)
        .values()
        .map(\ items -> new PCInvoiceInfo(items))
        .toTypedArray()
  }

  private function findAllPolicyPeriods(policy : Policy) : PolicyPeriod[] {
    if (policy.Account.AccountCurrencyGroup == null) {
      // single currency...
      return policy.PolicyPeriods
    }
    // retrieve all "splinter" PolicyPeriods across currencies...
    final var policyQuery = Query.make(Policy)
    policyQuery.compare("PCPublicID", Equals, policy.PCPublicID)
    return Query.make(PolicyPeriod)
      .subselect("Policy", CompareIn, policyQuery, "ID")
      .select()
      .toTypedArray()
  }
}
