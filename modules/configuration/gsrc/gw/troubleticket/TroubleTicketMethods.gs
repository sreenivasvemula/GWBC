package gw.troubleticket;

uses gw.api.util.DateUtil

/**
 * The Gosu class for TroubleTicket related functions.
 */
@Export
class TroubleTicketMethods {

  public static function validateEscalationDate(troubleTicket : TroubleTicket) : String {
    if (troubleTicket.EscalationDate == null) {
      return null;
    }
    else if (troubleTicket.New && DateUtil.compareIgnoreTime(troubleTicket.EscalationDate, DateUtil.currentDate()) < 0) {
      // A brand new trouble ticket should not have an escalation date that occurs in the past
      return displaykey.Web.TroubleTicketError.EscalationDateOnNewTroubleTicketIsBeforeToday;
    }
    else if (troubleTicket.TargetDate != null && DateUtil.compareIgnoreTime(troubleTicket.EscalationDate, troubleTicket.TargetDate) < 0) {
      // A trouble ticket date should never have an escalation date that is earlier than the target due date
      return displaykey.Web.TroubleTicketError.EscalationDateBeforeTargetDate;
    }
    else {
      return null;
    }
  }

  public static function validateTargetDate(troubleTicket : TroubleTicket) : String {
    if (troubleTicket.TargetDate == null) {
      return null;
    }
    else if (troubleTicket.New && DateUtil.compareIgnoreTime(troubleTicket.TargetDate, DateUtil.currentDate()) < 0) {
      // A brand new trouble ticket should not have an escalation date that occurs in the past
      return displaykey.Web.TroubleTicketError.TargetDateOnNewTroubleTicketIsBeforeToday;
    }
    else {
      return null;
    }
  }
}