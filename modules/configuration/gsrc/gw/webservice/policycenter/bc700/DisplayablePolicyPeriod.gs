package gw.webservice.policycenter.bc700

uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date

@WsiExportable( "http://guidewire.com/bc/ws/gw/webservice/policycenter/bc700/DisplayablePolicyPeriod" )
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
  
  construct() {
  }
  
  construct(period : PolicyPeriod) {
    BillingStatus = new DisplayableBillingStatus(period)
    PolicyNumber = period.PolicyNumber
    TermNumber = period.TermNumber
    Product = period.Policy.LOBCode.getDisplayName()
    EffectiveDate = period.PolicyPerEffDate
    ExpirationDate = period.PolicyPerExpirDate
    var overridingPayerAccount = period.OverridingPayerAccount
    AltBillingAccount = overridingPayerAccount.AccountNumber
    if (overridingPayerAccount.AccountName != null) AltBillingAccount += " (${overridingPayerAccount.AccountName})"
    InvoiceStream = period.OverridingInvoiceStream.PCDisplayName_bc700
    OwningAccount = period.Policy.Account.AccountNumber
  }
}
