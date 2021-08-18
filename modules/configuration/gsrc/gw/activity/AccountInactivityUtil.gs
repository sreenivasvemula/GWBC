package gw.activity

uses gw.api.util.DateUtil

@Export

class AccountInactivityUtil
{
  // ===================================================================== maybeCreateAcctInactiveActivity method
  /**
   * This method is called by AccountInactivityBatchProcess.processItem.
   *
   * NOTE: DO NOT CHANGE METHOD NAME AS IT IS CALLED FROM INTERNAL CODE.
   */
  public static function maybeCreateAcctInactiveActivity ( account : Account, daysBeforeAccountIsConsideredInactive : int ) {
    var acctInactiveActivity = new AcctInactiveActivity(account)
    acctInactiveActivity.Account = account
    acctInactiveActivity.Priority = Priority.TC_NORMAL
    acctInactiveActivity.TargetDate = DateUtil.currentDate().addDays( 7 )
    acctInactiveActivity.Subject = displaykey.Java.AcctInactiveActivity.Subject( account )
    acctInactiveActivity.Description = displaykey.Java.AcctInactiveActivity.Description( account, daysBeforeAccountIsConsideredInactive )
    acctInactiveActivity.autoAssign()
  }
}