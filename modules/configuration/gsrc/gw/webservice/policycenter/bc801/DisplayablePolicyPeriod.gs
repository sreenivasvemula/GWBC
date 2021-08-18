package gw.webservice.policycenter.bc801

uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc801/DisplayablePolicyPeriod" )
@Export
final class DisplayablePolicyPeriod {
  var _policyNumber : String as PolicyNumber
  var _termNumber : int as TermNumber
  var _product : String as Product
  var _effDate : Date as EffectiveDate
  var _expDate : Date as ExpirationDate
  var _AltBillingAccount : String as AltBillingAccount
  var _InvoiceStream : String as InvoiceStream
  var _OwningAccount : String as OwningAccount
  var _billingStatus : DisplayableBillingStatus as BillingStatus
  var _pcpolicypublicid : String as PCPolicyPublicID

  construct() {
  }
  
  construct(period : PolicyPeriod) {
    BillingStatus = new DisplayableBillingStatus(period)
    PolicyNumber = period.PolicyNumber
    TermNumber = period.TermNumber
    Product = period.Policy.LOBCode.getDisplayName() // Deliberate use of DisplayName, not Code
    EffectiveDate = period.PolicyPerEffDate
    ExpirationDate = period.PolicyPerExpirDate

    var overridingPayerAccount : Account
    overridingPayerAccount = period.OverridingPayerAccount
    if (period.OverridingPayerAccount != null){
      overridingPayerAccount = period.OverridingPayerAccount.AccountCurrencyGroup != null
          ? period.OverridingPayerAccount.AccountCurrencyGroup.MainAccount
          : period.OverridingPayerAccount
    }
    AltBillingAccount = overridingPayerAccount.AccountNumber
    if (overridingPayerAccount.AccountName != null) AltBillingAccount += " (${overridingPayerAccount.AccountName})"

    InvoiceStream = period.OverridingInvoiceStream.PCDisplayName // Deliberate use of DisplayName, not Code

    OwningAccount = period.Policy.Account.AccountCurrencyGroup != null
        ? period.Policy.Account.AccountCurrencyGroup.MainAccount.AccountNumber
        : period.Policy.Account.AccountNumber

    PCPolicyPublicID = period.Policy.PCPublicID
  }
}
