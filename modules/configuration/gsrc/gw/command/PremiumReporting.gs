package gw.command

uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.AuditBuilder
uses gw.api.databuilder.CancellationBuilder
uses gw.api.databuilder.ChargeBuilder
uses gw.api.databuilder.PaymentPlanBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.PremiumReportBIBuilder
uses gw.api.databuilder.PremiumReportDirector
uses gw.api.databuilder.PremiumReportDueDateBuilder
uses gw.api.util.DateUtil
uses gw.pl.currency.MonetaryAmount

@Export
class PremiumReporting extends BaseCommand {
  
  construct() {
    super()
  }

  //========================================================================================================================== POLICY CREATION
  
  /*
   * Create an Agency Bill Premium Reporting Policy
   */
  function withAgencyBillPolicy() {
    createPremiumReportingPolicy(true)
  }

  /*
   * Create a Direct Bill Premium Reporting Policy
   */
  function withDirectBillPolicy() {
    createPremiumReportingPolicy(false)
  }
  
  function withPaymentReceivedPremiumReportBI() {
    var paymentPlan = new PaymentPlanBuilder()
                          .asReporting()
                          .createAndCommit()
    //Create an account
    var account = new AccountBuilder()
                      .createAndCommit()
                      
    //Add a direct bill policy
    var directBillPolicyPeriod = new PolicyPeriodBuilder()
                                     .onAccount(account)
                                     .asDirectBill()
                                     .withPaymentPlan( paymentPlan )
                                     .withOneYearPeriodStartingToday()
                                     .createAndCommit()
                                     
    //Receive a Billing Instruction marked as "Payment Received"
    var directBillCharge = new ChargeBuilder()
                .onPolicyPeriod(directBillPolicyPeriod)
                .withAmount(500bd.ofCurrency(account.Currency))
                .asPremium()

    var directBillPremiumReportBI : BillingInstruction = new PremiumReportBIBuilder()
                .withPolicyPeriod(directBillPolicyPeriod)
                .withChargeBuilder(directBillCharge)
                .paymentWasReceived()
                .create()
    
    //Send the Billing Instruction
    directBillPremiumReportBI.execute()
    directBillPremiumReportBI.Bundle.commit()
    pcf.AccountDetailInvoices.go(account)
  }
  //========================================================================================================================== PREMIUM REPORT
  
  /**
   * Send a Premium Report billing instruction to the given policy 
   */
  @Argument("PolicyPeriodNumber", "") 
  function sendPremiumReportBIToPolicy() {
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    executePremiumReportBI( 500bd.ofCurrency(policyPeriod.Currency), policyPeriod, false )
  //  displayMessageAndExit( "Sent Premium Report BI to " + policyNumber )
  }

  /**
   * Send a Premium Report billing instruction to the given policy, marking it as "Payment Received"
   */ 
  @Argument("PolicyPeriodNumber", "") 
  function sendPremiumReportBIToPolicyWithPaymentReceived() {
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    executePremiumReportBI( 500bd.ofCurrency(policyPeriod.Currency), policyPeriod, true )
   // displayMessageAndExit( "Sent Premium Report BI to " + policyNumber + ", marked as \"Payment Received\"")
  }

  /**
   * Send a Premium Report Due Date billing instruction to the given policy 
   */
  @Argument("PolicyPeriodNumber", "")  
  function sendPremiumReportDueDateBIToPolicy(){    
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    executePremiumReportDueDate( policyPeriod )
  }
  
  //========================================================================================================================== CANCELLATION
  
  /**
   * Send a Premium Report Cancellation billing instruction to the given policy 
   */
   
  @Argument("PolicyPeriodNumber", "")  
  function sendCancellationBIToPolicyWithTodayAsCancellationDate(){
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    var cancellation = new CancellationBuilder()
            .withCancellationDate(DateUtil.currentDate())
            .onPolicyPeriod(policyPeriod)
            .create()
    cancellation.execute()
    cancellation.Bundle.commit()
//    displayMessageAndExit( "Sent Premium Report Cancellation BI to " + policyNumber + " with today as Cancellation Date" )
  }
  
  //========================================================================================================================== FINAL AUDIT
  
  /*
    The three functions below all send a Final Audit Billing Instruction to the specified policy, just for different amounts
  */
  
  @Argument("PolicyPeriodNumber", "") 
  function sendFinalAuditBIToPolicyWith1200Charge(){
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    sendFinalAuditBI( policyPeriod, 1200bd.ofCurrency(policyPeriod.Currency) )
  }
  
  @Argument("PolicyPeriodNumber", "") 
  function sendFinalAuditBIToPolicyWith1000Charge(){
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    sendFinalAuditBI( policyPeriod, 1000bd.ofCurrency(policyPeriod.Currency) )
  }  
  @Argument("PolicyPeriodNumber", "")  
  function sendFinalAuditBIToPolicyWith800Charge(){
    var policyPeriod = findPolicy(getArgumentAsString("PolicyPeriodNumber"))
    sendFinalAuditBI( policyPeriod, 800bd.ofCurrency(policyPeriod.Currency) )
  }
  
  //========================================================================================================================== HELPER METHODS

  private function sendFinalAuditBI(policyPeriod : PolicyPeriod, amount : MonetaryAmount){
    var chargeBuilder = new ChargeBuilder()
      .onPolicyPeriod(policyPeriod)
      .withAmount(amount)
      .asPremium()
    var finalAuditBI = new AuditBuilder()
      .finalAudit()
      .totalPremium()
      .withAuditPolicyPeriod(policyPeriod)
      .withAuditDate(DateUtil.addMonths(DateUtil.currentDate(), 1))
      .withChargeBuilder(chargeBuilder)
      .create()

    finalAuditBI.execute()
    finalAuditBI.Bundle.commit()
 //   displayMessageAndExit( "Sent Premium Report Final Audit BI to " + policyNumber + " with $" + amount + " Final Audit Charge" )
  }

  private function createPremiumReportingPolicy( agencyBill : boolean ) {
    var policyPeriod : PolicyPeriod
    var amount = 1000bd.ofDefaultCurrency()
    if (agencyBill) {
      policyPeriod = PremiumReportDirector.createPremiumReportingPolicyAgencyBill(amount, null, 10, 20, 100)
    } else {
      policyPeriod = PremiumReportDirector.createPremiumReportingPolicyDirectBill(amount, null, 10, 20, 100)
    }
    
    policyPeriod.Bundle.commit()

    //If the policy is Agency Bill, drop the person off at the parent Primary Producer, otherwise drop them at the parent Account
    if(agencyBill){
      pcf.ProducerAgencyBillCycles.go(policyPeriod.PrimaryPolicyCommission.ProducerCode.Producer)
    } else {
      pcf.AccountDetailInvoices.go(policyPeriod.Account)
    }
   // displayMessageAndExit( "Created Premium Reporting Policy " + policyPeriod.PolicyNumber + " copy this number!")
  }
  
  private static function executePremiumReportBI(amount : MonetaryAmount, policyPeriod: PolicyPeriod , isPaymentReceived : boolean) {
    var charge = new ChargeBuilder()
            .onPolicyPeriod(policyPeriod)
            .withAmount(amount)
            .asPremium()
    var premiumReportBIBuilder = new PremiumReportBIBuilder()
            .withPolicyPeriod(policyPeriod)
            .withPaymentDueDate(DateUtil.currentDate())
            .withChargeBuilder(charge)
    if (isPaymentReceived) {
      premiumReportBIBuilder = premiumReportBIBuilder.paymentWasReceived()
    }
    var premiumReportBI = premiumReportBIBuilder.create()

    premiumReportBI.execute()
    premiumReportBI.Bundle.commit()
  }

  private static function executePremiumReportDueDate(policyPeriod : PolicyPeriod) {
    var premiumReportDueDate = new PremiumReportDueDateBuilder()
            .withDueDate(DateUtil.currentDate())
            .withPremiumReportDDPolicyPeriod(policyPeriod)
            .createAndCommit()

    premiumReportDueDate.execute()
    premiumReportDueDate.Bundle.commit()
  }

  private static function findPolicy(policyNumber : String) : PolicyPeriod {
    return gw.api.database.Query.make(PolicyPeriod).compare("PolicyNumber", Equals, policyNumber).select().getAtMostOneRow()
  }
}
