package gw.plugin.eventhandler.impl;

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.eventhandler.IEventHandler
uses gw.api.domain.delinquency.DelinquencyTarget
uses gw.api.util.DateUtil

@Export
class EventHandler implements IEventHandler {

  private var _logger = com.guidewire.bc.system.logging.BCLoggerCategory.DELINQUENCY_PROCESS;

  construct() {
  }

  public override function beforeStartDelinquencyProcessing(delinquencies : DelinquencyTarget[])  {
    if (_logger.DebugEnabled ) _logger.debug(
          "EVENT HANDLED: Delinquency processing about to begin on entities [" +delinquencies + "]");
  }

  public override function policyClosureConditionNotMet(policyPeriod : PolicyPeriod, type : PolicyClosureCondition)  {
    if (_logger.DebugEnabled ) _logger.debug(
          "EVENT HANDLED: Closure condition not met [" + type + "] for PolicyPeriod [" + policyPeriod.PolicyNumber + "]");
  }

  public override function beforePolicyPeriodClosed(policyPeriod : PolicyPeriod) : Boolean {
    if (_logger.DebugEnabled ) _logger.debug(
          "EVENT HANDLED: PolicyPeriod [" + policyPeriod.PolicyNumber + "] about to be closed");
    return true;
  }

  public override function canStartDelinquencyProcess(target : DelinquencyTarget) : Boolean {
    if (_logger.DebugEnabled ) _logger.debug(
          "EVENT HANDLED: canStartDelinquencyProcess on [" + target.DisplayName + "] ");
    return true;
  }

  public override function calculateAccountDelinquentAmountOverrideValue(account : Account) : MonetaryAmount {
    return null;
  }

  public override function calculateAccountPoliciesDelinquentAmountOverrideValue(account : Account) : MonetaryAmount {
    return null;
  }

  public override function calculateAccountRawDelinquentAmountOverrideValue(account : Account) : MonetaryAmount {
    return null;
  }

  public override function calculatePolicyPeriodDelinquentAmountOverrideValue(policyPeriod : PolicyPeriod) : MonetaryAmount {
    return null;
  }

  public override function calculateCollateralDelinquentAmountOverrideValue(collateral : Collateral) : MonetaryAmount {
    return null;
  }

  public override function policyPeriodTransferredToNewProducer(policyPeriod : PolicyPeriod,
                                                       oldProducerCode : ProducerCode,
                                                       newProducerCode : ProducerCode) {
    if (_logger.DebugEnabled ) _logger.debug(
          "EVENT HANDLED: PolicyPeriod [" + policyPeriod.DisplayName + "] transferred from [" +
          oldProducerCode.Code + "] producer code to [" + newProducerCode.Code + "] producer code");
  }

  public override function validateManualDisbursementAmount(amount : MonetaryAmount, unapplied : MonetaryAmount,
                                pendingDisbursement : MonetaryAmount, disbursement : Disbursement) : Boolean {
    if (_logger.DebugEnabled ) _logger.debug(
          "EVENT HANDLED: validateManualDisbursementAmount  [" + disbursement + "]");
    return amount <= (unapplied - pendingDisbursement);
  }

  public override function rejectDisbursementBehavior(disbursementToReject : Disbursement): Boolean {
    return true;
  }

  public override function updateDisbursementStatusAndAmount(disbursement : Disbursement,
                                                    isAboutToExecuteDisbursement : boolean) {

    if (_logger.DebugEnabled ) {
      _logger.debug("EVENT HANDLED: updateDisbursementStatusAndAmountAsNecessary  [" + disbursement + "]");
    }
    
    // Update status and amount only if we are dealing with an AccountDisbursement or an AgencyDisbursement
    if (!(disbursement typeis AccountDisbursement || disbursement typeis AgencyDisbursement)) {
      return
    }

    if(not (disbursement.Status == TC_APPROVED or disbursement.Status == TC_AWAITINGAPPROVAL)) {
      return
    }
         
    var availableForDisbursement = disbursement typeis AccountDisbursement ? disbursement.UnappliedFund.Balance
                                                                           : disbursement.DisbursementTarget.UnappliedAmount

    // If amount in unapplied fund is enough to cover the full disbursement amount, no need to update anything
    if (availableForDisbursement.IsPositive and availableForDisbursement >= disbursement.Amount) {
      return
    }

    // Disbursement is larger than available funds, so we will adjust disbursement and post an explanatory note. 
    // Get the formatted values that will be put into strings that go into note subject and body.
    var formattedDisbursementAmount = disbursement.Amount.render()
    var formattedAvailableFunds = availableForDisbursement.render()
    var formattedDate = DateUtil.currentDate().format("short")
    var entityTypeDisplayName = (disbursement typeis AccountDisbursement) ? Account.Type.TypeInfo.Name : Producer.Type.TypeInfo.Name
          
    // Create new Note and hook it to the entity targeted by this disbursement
    var note = new Note(disbursement.Bundle);
    (disbursement.DisbursementTarget as NoteContainer).addNote(note);

    // Based on whether there were some funds in the unapplied fund but not quite enough to cover the disbursement, or whether
    // there were simply no money available at all, create an appropriate Note subject and body and adjust the disbursement
    if (availableForDisbursement.IsPositive) {
      
      // Some funds were available for disbursement, but not enough to cover the full disbursement amount.
      // Post note that says disbursement was altered due to not enough funds and new amount was posted.
      note.Subject = displaykey.Java.DisbursementManualNote.AmountChanged.Subject;
      note.Body = displaykey.Java.DisbursementManualNote.AmountChanged.Body(formattedDisbursementAmount,
                      formattedAvailableFunds, entityTypeDisplayName, formattedDate);

      // Adjust disbursement amount downward to be equal to the amount actually available to disburse
      disbursement.Amount = availableForDisbursement;

    } else {
      
      // No funds at all were available for disbursement. Post note that says disbursement was canceled due to 
      // no available unapplied fund amount to disburse
      note.Subject = displaykey.Java.DisbursementManualNote.Canceled.Subject;
      note.Body = displaykey.Java.DisbursementManualNote.Canceled.Body(formattedDisbursementAmount,
                      formattedDate, entityTypeDisplayName);

      // Mark the disbursement as closed
      disbursement.Status = DisbursementStatus.TC_REAPPLIED;
      disbursement.CloseDate = DateUtil.currentDate();           
    }
    
  }

  public override function matchAgencyBillSuspensePolicyPeriod(agencySuspDistItem : BaseSuspDistItem): PolicyPeriod {
    // if there's no PolicyNumber specified, then just return null.
    if (agencySuspDistItem.PolicyNumber == null) {
      return null
    }
    // Query for a policy period that matches the string policy period field on the passed-in AgencySuspDistItem
    var matchingPolicyPeriods = 
      gw.api.database.Query.make(PolicyPeriod).compare("PolicyNumber", Equals, agencySuspDistItem.PolicyNumber).select();

    // Return the policy period that was found (if the query did not find one, we will return null)
    return matchingPolicyPeriods.getFirstResult()
  }

  public override function processAgencyBillSuspenseItemAfterPolicyMatch(agencySuspDistItem : BaseSuspDistItem) {
    // Out of the box, do nothing
  }
}
