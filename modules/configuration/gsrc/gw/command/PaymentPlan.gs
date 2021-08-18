package gw.command

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.PaymentPlanBuilder


@Export
class PaymentPlan extends BaseCommand {

  function withUserVisibleFalse(): String{
    var paymentPlan =  new PaymentPlanBuilder().asNotUserVisible().createAndCommit()
    pcf.PaymentPlans.go()
    return paymentPlan + " was created invisible"
  }

  function withUserVisibleTrue(): String {
    var paymentPlan = new PaymentPlanBuilder().asUserVisible().createAndCommit()
    pcf.PaymentPlans.go()
    return paymentPlan + " was created visible"
  }
}
