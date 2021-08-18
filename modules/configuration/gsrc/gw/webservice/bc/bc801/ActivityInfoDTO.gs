package gw.webservice.bc.bc801

uses gw.api.util.StringUtil
uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date
uses java.util.List

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.Activity} for use by the WS-I layer.
 * <p>The specific mappings for {@link ActivityDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>ApprovalRationale</td><td>Activity.ApprovalRationale</td></tr><tr><td>Approved</td><td>Activity.Approved</td></tr><tr><td>AssignedUserPublicID</td><td>Activity.AssignedUser.PublicID</td></tr><tr><td>CloseUserPublicID</td><td>Activity.CloseUser.PublicID</td></tr><tr><td>CreateTime</td><td>Activity.CreateTime</td></tr><tr><td>Description</td><td>Activity.Description</td></tr><tr><td>EndDate</td><td>Activity.EndDate</td></tr><tr><td>Escalated</td><td>Activity.Escalated</td></tr><tr><td>EscalationDate</td><td>Activity.EscalationDate</td></tr><tr><td>Mandatory</td><td>Activity.Mandatory</td></tr><tr><td>Priority</td><td>Activity.Priority</td></tr><tr><td>PublicID</td><td>Activity.PublicID</td></tr><tr><td>Status</td><td>Activity.Status</td></tr><tr><td>Subject</td><td>Activity.Subject</td></tr><tr><td>TargetDate</td><td>Activity.TargetDate</td></tr><tr><td>Type</td><td>Activity.Type</td></tr></table></p>
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the Activity entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/ActivityInfoDTO")
final class ActivityInfoDTO {
  var _approvalRationale   : String           as ApprovalRationale
  var _approved            : Boolean          as Approved
  var _assignedUserPublicID: String           as AssignedUserPublicID
  var _closeUserPublicID   : String           as CloseUserPublicID
  var _createTime          : Date             as CreateTime
  var _description         : String           as Description
  var _endDate             : Date             as EndDate
  var _escalated           : Boolean          as Escalated
  var _escalationDate      : Date             as EscalationDate
  var _mandatory           : Boolean          as Mandatory
  var _priority            : Priority         as Priority
  var _publicID            : String           as PublicID
  var _status              : ActivityStatus   as Status
  var _subject             : String           as Subject
  var _targetDate          : Date             as TargetDate
  var _type                : ActivityType     as Type

  /**
   * Create a new ActivityInfoDTO that represents the current state of the supplied Activity.
   * @param that The Activity to be represented.
   */
  static function valueOf(that : Activity) : ActivityInfoDTO {
    return new ActivityInfoDTO ().readFrom(that)
  }

  construct() { }

  /**
   * Set the fields in this DTO using the supplied Activity
   * @param that The Activity to copy from.
   */
  final function readFrom(that : Activity) : ActivityInfoDTO {

    // if field is on base class
      ApprovalRationale    = that.ApprovalRationale
      Approved             = that.Approved
      AssignedUserPublicID = that.AssignedUser.PublicID
      CloseUserPublicID    = that.CloseUser.PublicID
      CreateTime           = that.CreateTime
      Description          = that.Description
      EndDate              = that.EndDate
      Escalated            = that.Escalated
      EscalationDate       = that.EscalationDate
      Mandatory            = that.Mandatory
      Priority             = that.Priority
      PublicID             = that.PublicID
      Status               = that.Status
      Subject              = that.Subject
      TargetDate           = that.TargetDate
      Type                 = that.Type
    //
    return this
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only  useful for debugging purposes.
   */
  override final function toString() : String {
    var fields = {} as List<String>

    if (ApprovalRationale   .HasContent) fields.add(':ApprovalRationale    = ' + StringUtil.enquote(ApprovalRationale))
    if (Approved              != null  ) fields.add(':Approved             = ' + Approved)
    if (AssignedUserPublicID.HasContent) fields.add(':AssignedUserPublicID = ' + StringUtil.enquote(AssignedUserPublicID))
    if (CloseUserPublicID   .HasContent) fields.add(':CloseUserPublicID    = ' + StringUtil.enquote(CloseUserPublicID))
    if (CreateTime            != null  ) fields.add(':CreateTime           = ' + StringUtil.enquote(CreateTime.toString()) + ' as Date')
    if (Description         .HasContent) fields.add(':Description          = ' + StringUtil.enquote(Description))
    if (EndDate               != null  ) fields.add(':EndDate              = ' + StringUtil.enquote(EndDate.toString()) + ' as Date')
    if (Escalated             != null  ) fields.add(':Escalated            = ' + Escalated)
    if (EscalationDate        != null  ) fields.add(':EscalationDate       = ' + StringUtil.enquote(EscalationDate.toString()) + ' as Date')
    if (Mandatory             != null  ) fields.add(':Mandatory            = ' + Mandatory)
    if (Priority              != null  ) fields.add(':Priority             = Priority.get("' + Priority.Code + '")')
    if (PublicID            .HasContent) fields.add(':PublicID             = ' + StringUtil.enquote(PublicID))
    if (Status                != null  ) fields.add(':Status               = ActivityStatus.get("' + Status.Code + '")')
    if (Subject             .HasContent) fields.add(':Subject              = ' + StringUtil.enquote(Subject))
    if (TargetDate            != null  ) fields.add(':TargetDate           = ' + StringUtil.enquote(TargetDate.toString()) + ' as Date')
    if (Type                  != null  ) fields.add(':Type                 = ActivityType.get("' + Type.Code + '")')

    return "new ActivityDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

}
