package gw.webservice.policycenter.bc700

uses gw.api.web.policy.PolicyPeriodBalancesView
uses gw.xml.ws.annotation.WsiExportable

uses java.math.BigDecimal

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/PolicyBillingSummary" )
@Export
final class PolicyBillingSummary {
  var _Periods : String[] as Periods
  var _CurrentOutstanding : BigDecimal as CurrentOutstanding
  var _Paid : BigDecimal as Paid
  var _DepositRequirement : BigDecimal as DepositRequirement
  var _TotalCharges : BigDecimal as TotalCharges
  var _PaymentPlan : String as PaymentPlanName
  var _AltBillingAccount : String as AltBillingAccount
  var _InvoiceStream : String as InvoiceStream
  var _Invoices : PCInvoiceInfo[] as Invoices
  var _BillingStatus : DisplayableBillingStatus as BillingStatus
  
  construct(){}
  
  construct(policyPeriod : PolicyPeriod) {
    BillingStatus = new DisplayableBillingStatus(policyPeriod)
    
    Periods = policyPeriod.Policy.PolicyPeriods
      .sortBy( \ p -> p.PolicyPerEffDate  )
      .map( \ p -> "${p.PolicyPerEffDate.AsUIStyle} - ${p.PolicyPerExpirDate.AsUIStyle}" )
    var policyPeriodBalances = new PolicyPeriodBalancesView(policyPeriod)
    CurrentOutstanding = policyPeriodBalances.AdjustedOutstandingAmount
    Paid = policyPeriod.PaidAmount.add(policyPeriod.getChargeRevenueRollupSum())
    TotalCharges = policyPeriod.TotalValue
    PaymentPlanName = policyPeriod.PaymentPlan.Name
    var overridingPayerAccount = policyPeriod.OverridingPayerAccount
    AltBillingAccount = overridingPayerAccount.AccountNumber
    if (overridingPayerAccount.AccountName != null) AltBillingAccount += " (${overridingPayerAccount.AccountName})"
    InvoiceStream = policyPeriod.OverridingInvoiceStream.PCDisplayName_bc700
    // TODO: DepositRequirement = policyPeriod.DepositRequirement

    Invoices = policyPeriod.InvoiceItems
      .partition(\ i -> i.Invoice )
      .values()
      .map(\ l -> new PCInvoiceInfo(l) )
      .toTypedArray()
  }
}
