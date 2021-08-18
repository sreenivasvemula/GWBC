package gw.activity

uses gw.api.util.DateUtil

uses java.util.Date

/**
 * Defines {@link Activity} related utility methods in the user interface.
 */
@Export
class ActivityMethods {

  static function viewActivityDetails(activity : Activity) {
    // go to the relevant page for the activity
    if (activity.TroubleTicket != null) {
        pcf.TroubleTicketDetailsPopup.push(activity.TroubleTicket)
    } else if (activity.DelinquencyProcess != null) {
        pcf.AccountDetailDelinquencies.go(activity.DelinquencyProcess.Account, activity.DelinquencyProcess)
    }
    // open the activity worksheet
    pcf.ActivityDetailForward.goInWorkspace(activity)
  }

  static function validateEscalationDate(activity : Activity) : String {
    if (activity.EscalationDate == null) {
      return null
    } else if (activity.New and invalidateDateEarlierThanNow(activity.EscalationDate)) {
      // A brand new activity should not have an escalation date that occurs in the past
      return displaykey.Web.ActivityError.EscalationDateOnNewActivityIsBeforeToday
    } else if (activity.TargetDate != null
          and invalidateDateEarlierThan(activity.EscalationDate, activity.TargetDate)) {
      // An activity date should never have an escalation date that is earlier than the target due date
      return displaykey.Web.ActivityError.EscalationDateBeforeTargetDate
    }
    return null
  }

  static function validateTargetDate(activity : Activity) : String {
    if (activity.TargetDate == null) {
      return null
    } else if (activity.New and invalidateDateEarlierThanNow(activity.TargetDate)) {
      // A brand new activity should not have an escalation date that occurs in the past
      return displaykey.Web.ActivityError.TargetDateOnNewActivityIsBeforeToday
    } else {
      return null
    }
  }

  private static function invalidateDateEarlierThanNow(date : Date) : boolean {
    return invalidateDateEarlierThan(date, Date.Now)
  }

  private static function invalidateDateEarlierThan(date : Date, referenceDate : Date) : boolean {
    return DateUtil.compareIgnoreTime(date, referenceDate) < 0
  }
}