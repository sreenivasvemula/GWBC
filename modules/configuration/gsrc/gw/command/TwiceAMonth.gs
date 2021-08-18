package gw.command

uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.PaymentPlanBuilder
uses gw.api.databuilder.PolicyPeriodBuilder

uses java.util.Map

@Export
class TwiceAMonth extends BCBaseCommand {

  var twiceAMonthPaymentPlan : PaymentPlan
  var twiceAMonthPaymentPlans : Map<Currency, PaymentPlan>

  construct() {
    super()
    twiceAMonthPaymentPlans = {}
    Currency.getTypeKeys(false).each(\ currency -> {
      twiceAMonthPaymentPlans.put(currency, new PaymentPlanBuilder()
        .withName( "Twice A Month " + randomNumber + " " + currency)
        .withPeriodicity(Periodicity.TC_TWICEPERMONTH)
        .withMaximumNumberOfInstallments(24)
        .withCurrency(currency)
        .createAndCommit())
    })
  }

  function withInvoiceDayOfMonth_30()  {
    var account = new AccountBuilder()
      .withNumber("Account-" + randomNumber)
      .withInvoiceDayOfMonth( 30 )
      .createAndCommit()
    // var effectiveDate = DateUtil.currentDate()
    var policyPeriod = new PolicyPeriodBuilder()
      .onAccount( account )
      .withPaymentPlan( twiceAMonthPaymentPlan )
      .withPremiumWithDepositAndInstallments( 1000 )
      .createAndCommit()
    pcf.PolicyDetailPayments.go(policyPeriod)
  }

  function withFixedDueDay() {
    var account = new AccountBuilder()
      .withNumber("Account-" + randomNumber)
      .asDueDateBilling()
      .withInvoiceDayOfMonth( 31 )
      .createAndCommit()
    // var effectiveDate = DateUtil.currentDate()
    var policyPeriod = new PolicyPeriodBuilder()
      .onAccount( account )
      .withPaymentPlan( twiceAMonthPaymentPlan )
      .withPremiumAndTaxes( 1000, 0 )
      .createAndCommit()
    pcf.PolicyDetailPayments.go(policyPeriod)
  }

  function addTwiceAMonthPolicy() {
    var account = getCurrentAccount()
    var paymentPlan = twiceAMonthPaymentPlans.get(account.Currency)
    new PolicyPeriodBuilder()
      .withCurrency(account.Currency)
      .onAccount( account )
      .withPaymentPlan( paymentPlan )
      .withPremiumWithDepositAndInstallments( 1000 )
      .createAndCommit()
    pcf.AccountDetailSummary.go(account)
  }
}
