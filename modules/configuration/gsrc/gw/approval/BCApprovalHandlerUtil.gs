package gw.approval

uses com.guidewire.bc.domain.approval.BCApprovalHandler

@Export

class BCApprovalHandlerUtil
{
  // ===================================================================== onRejected method

  /**
   * This method is called whenever an ActivityCreatedByAppr activity is rejected, ie whenever BCApprovalHandler.rejected() is called.
   * The OOTB implementation is to create a notification activity that the action had been rejected. The activity is assigned to the 
   * ApprovableBean's RequestingUser. (If RequestingUser cannot be assigned an activity, then this method does not run.)
   *
   * NOTE: DO NOT CHANGE METHOD NAME AS IT IS CALLED FROM INTERNAL CODE.
   */
  public static function onRejected( approvalHandler : BCApprovalHandler, reasonForRejection : String ) {
    approvalHandler.createNotificationActivity( reasonForRejection )
  }

  // ===================================================================== Disbursement-specific method
  
  /**
   * Disbursement-related AuthorityEvents are more complicated because the appropriate User might not be set.
   * The wrong user might be set because 1) the Disbursement was created by SystemUser, or 2) the user who attempts
   * to approve the Disbursement may not be the same user who created it. To ensure that the User is correctly set,
   * this method is called in Disbursement.approveDisbursement().
   *
   * NOTE: DO NOT CHANGE METHOD NAME AS IT IS CALLED FROM INTERNAL CODE.
   */
  public static function updateDisbursementAuthorityEvent( approvableBean : Disbursement ) {
    var authorityEvent = approvableBean.AuthorityEvent
    if ( authorityEvent != null ) {
      authorityEvent.User = User.util.CurrentUser
    }
  }

  // ===================================================================== isCanApprove... methods

  /**
   * These methods are called to determine whether the current user has sufficient approval power to either 1) execute an action 
   * or 2) approve an action. The isCurrentUserCanApproveAction parameter has already checked whether the current user is the
   * system user (who has all authority) or has sufficient authority limit, and the base implementation is to simly return this
   * parameter.
   * 
   * These configurable methods enable customers to adjust the determination of whether the current user can execute or approve
   * a certain action in addition to OR instead of the AuthorityLimit infrastructure. For example, some customers may want to 
   * approve all Automatic Disbursements (which are created by batch process and hence are not affected by these methods at time 
   * of creation), and they can do so by returning true for those Disbursements that are automatic.
   * 
   * Configuration note: Returning true without any restrictions turns off authority limit checking for that type of
   * action since it means that anyone can approve that action. The exception is Automatic Disbursements, whose creation
   * is determined by BillingPlan.CreateApprActForAutoDisb.
   * 
   * NOTE: DO NOT CHANGE METHOD NAMES AS THEY ARE CALLED FROM INTERNAL CODE.
   */
  public static function isCanApproveAdvanceCmsnPayment( advanceCmsnPayment : AdvanceCmsnPayment, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveBonusCmsnPayment( bonusCmsnPayment : BonusCmsnPayment, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveChargeReversal( chargeReversal : ChargeReversal, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveDisbursement( disbursement : Disbursement, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    /*
    if ( disbursement.Reason == Reason.TC_AUTOMATIC ) {
      return true
    }
    */
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveFundsTransfer( fundsTransfer : FundsTransfer, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveFundsTransferReversal( fundsTransferReversal : FundsTransferReversal, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveNegativeWriteoff( negativeWriteoff : NegativeWriteoff, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction
  }

  public static function isCanApproveWriteoff( writeoff : Writeoff, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction  
  }

  public static function isCanApproveWriteoffReversal( writeoffReversal : WriteoffReversal, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction  
  }

  public static function isCanApproveNegativeWriteoffRev( negativeWriteoffReversal : NegativeWriteoffRev, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction  
  }

  public static function isCanApproveCredit( credit : Credit, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction  
  }

  public static function isCanApproveCreditReversal( creditReversal : CreditReversal, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction  
  }

  public static function isCanApproveProducerPayableTransfer( transfer :  ProducerPayableTransfer, isCurrentUserCanApproveAction : Boolean ) : Boolean {
    return isCurrentUserCanApproveAction  
  }

}