package gw.plugin.policyperiod.impl;

uses gw.api.database.Query
uses gw.api.domain.invoice.InvoiceItemPayers
uses gw.api.system.BCLoggerCategory
uses gw.plugin.policyperiod.IPolicyPeriod

uses java.util.Date
uses java.util.List


@Export
class PolicyPeriod implements IPolicyPeriod {

  construct() {
  }

  public override function hasReceivedSufficientPaymentToConfirmPolicyPeriod(policyPeriod : PolicyPeriod) : boolean {
    return policyPeriod.PaidAmount.IsPositive
  }

  public override function updatePolicyPeriodInfo(policyPeriodInfo : PolicyPeriodInfo) {
  }

  public override function applyFullPayDiscount(policyPeriod : PolicyPeriod) {
    //WARNING: This is a sample Gosu Method that applies a basic discount.  It is unsupported and should not be used OOTB
    var logger = BCLoggerCategory.FULL_PAY_DISCOUNT_WORK_QUEUE
    var issuanceAmount = 0bd.ofCurrency(policyPeriod.Currency);
    var renewalAmount = 0bd.ofCurrency(policyPeriod.Currency);
    for (charge in policyPeriod.Charges ) {
      if (charge.BillingInstruction typeis Issuance){
        issuanceAmount = issuanceAmount + charge.Amount;
      }
      if (charge.BillingInstruction typeis Renewal){
        renewalAmount = renewalAmount + charge.Amount;
      }
    }
    var totalAmount = issuanceAmount + renewalAmount;
    if (logger.DebugEnabled) {    
      logger.debug( "paid amount is " + policyPeriod.getPaidAmount() );
      logger.debug("discount threshold is "  + policyPeriod.DiscountedPaymentThreshold);
      logger.debug("total amount is " + totalAmount);
    }
    if (policyPeriod.getPaidAmount() >= policyPeriod.DiscountedPaymentThreshold){
      var chargeAmount = policyPeriod.DiscountedPaymentThreshold - totalAmount;
      if (logger.DebugEnabled) {
        logger.debug("creating full pay discount charge for amount " + chargeAmount)
      }
      var chargePattern = Query.make(entity.ChargePattern).compare("ChargeCode", Equals, "Premium").select().getAtMostOneRow();
      var billingInstruction = new General(policyPeriod.Currency, policyPeriod)
      billingInstruction.AssociatedPolicyPeriod = policyPeriod
      billingInstruction.ModificationDate = policyPeriod.FullPayDiscountUntil;
      billingInstruction.buildCharge(chargeAmount, chargePattern)
      billingInstruction.execute();
    }
  }

  override function getItemsAffectedByBillingMethodChange(policyPeriod : PolicyPeriod) : List<InvoiceItem> {
    return policyPeriod.InvoiceItemsWithoutOffsetsSortedByEventDate
  }
  
  override function canTransferCommissionReceiverTo(newPolicyCommission : PolicyCommission, itemToEarn : InvoiceItem) : boolean {
    if (itemToEarn.PaidByAccount) {
      return true
    } else {
      var currentABPayer = itemToEarn.Payer as Producer
      return itemToEarn.PolicyPeriod.AgencyBill || !newPolicyCommission.Primary || currentABPayerIsSameAsNewCommissionReceiver(currentABPayer, newPolicyCommission)
    }
  }
  
  private function currentABPayerIsSameAsNewCommissionReceiver(currentABPayer : Producer, newPolicyCommission : PolicyCommission) : boolean {
    return currentABPayer == newPolicyCommission.ProducerCode.Producer
  }

  override function getCustomPayersForCancellationCollapsedInvoiceItems(defaultInvoiceItemPayers : InvoiceItemPayers) : InvoiceItemPayers {
    return defaultInvoiceItemPayers
  }

  override function updateCancellationCollapsedInvoiceItemsBeforePlacement(invoiceItems : List<InvoiceItem>, 
                                                                           cancellationCollapseDate : Date) {
    for (invoiceItem in invoiceItems) {
      // EventDate value we set into each InvoiceItem affects where the InvoiceAssembler ends up placing that item
      invoiceItem.EventDate = cancellationCollapseDate
    }
  }
}
