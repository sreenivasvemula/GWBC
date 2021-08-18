package gw.webservice.bc.bc801

uses gw.api.util.StringUtil
uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date
uses java.util.List

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.DelinquencyProcess} for use by the WS-I layer.
 * <p>The specific mappings for {@link DelinquencyProcessDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>Activities</td><td>DelinquencyProcess.Activities*</td></tr><tr><td>Amount</td><td>DelinquencyProcess.Amount</td></tr><tr><td>CurrentEventCompleted</td><td>DelinquencyProcess.PreviousEvent.Completed</td></tr><tr><td>CurrentEventCompletionDate</td><td>DelinquencyProcess.PreviousEvent.CompletionDate</td></tr><tr><td>CurrentEventDescription</td><td>DelinquencyProcess.PreviousEvent.Description</td></tr><tr><td>CurrentEventTargetDate</td><td>DelinquencyProcess.PreviousEvent.TargetDate</td></tr><tr><td>DelinquencyPlanName</td><td>DelinquencyProcess.DelinquencyPlanName</td></tr><tr><td>GracePeriodEndDate</td><td>DelinquencyProcess.GracePeriodEndDate</td></tr><tr><td>NextEventDescription</td><td>DelinquencyProcess.NextEvent.Description</td></tr><tr><td>NextEventTargetDate</td><td>DelinquencyProcess.NextEvent.TargetDate</td></tr><tr><td>PublicID</td><td>DelinquencyProcess.PublicID</td></tr><tr><td>Reason</td><td>DelinquencyProcess.Reason</td></tr><tr><td>StartDate</td><td>DelinquencyProcess.StartDate</td></tr><tr><td>Status</td><td>DelinquencyProcess.Status</td></tr><tr><td>Subtype</td><td>DelinquencyProcess.Subtype</td></tr><tr><td>TargetAccountPublicID</td><td>TargetAccount.PublicID if on Account</td></tr><tr><td>TargetPolicyPeriodPublicID</td><td>TargetPolicyPeriod.PublicID if on PolicyPeriod</td></tr><tr><td>WorkflowState</td><td>DelinquencyProcess.WorkflowState</td></tr></table></p>
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the DelinquencyProcess entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/DelinquencyProcessDTO")
final class DelinquencyProcessDTO {
  var _activities                 : ActivityInfoDTO[]              as Activities = {}
  var _amount                     : gw.pl.currency.MonetaryAmount  as Amount
  var _currentEventCompleted      : Boolean                        as CurrentEventCompleted
  var _currentEventCompletionDate : Date                           as CurrentEventCompletionDate
  var _currentEventDescription    : String                         as CurrentEventDescription
  var _currentEventTargetDate     : Date                           as CurrentEventTargetDate
  var _delinquencyPlanName        : String                         as DelinquencyPlanName
  var _gracePeriodEndDate         : Date                           as GracePeriodEndDate
  var _nextEventDescription       : String                         as NextEventDescription
  var _nextEventTargetDate        : Date                           as NextEventTargetDate
  var _publicID                   : String                         as PublicID
  var _reason                     : DelinquencyReason              as Reason
  var _startDate                  : Date                           as StartDate
  var _status                     : DelinquencyProcessStatus       as Status
  var _targetAccountID            : String                         as TargetAccountPublicID
  var _targetPolicyPeriodID       : String                         as TargetPolicyPeriodPublicID
  var _workflowState              : WorkflowState                  as WorkflowState

  /**
   * Create a new DelinquencyProcessDTO that represents the current state of the supplied DelinquencyProcess.
   * @param that The DelinquencyProcess to be represented.
   */
  static function valueOf(that : DelinquencyProcess) : DelinquencyProcessDTO {
    return new DelinquencyProcessDTO().readFrom(that)
  }

  construct() { }

  /**
   * Set the fields in this DTO using the supplied DelinquencyProcess
   * @param that The DelinquencyProcess to copy from.
   */
  final function readFrom(that : DelinquencyProcess) : DelinquencyProcessDTO {

    var currentEvent = that.PreviousEvent
    var nextEvent = that.NextEvent
    var target = that.Target

    Activities                     = that.Activities.map( \ activity -> ActivityInfoDTO.valueOf(activity))
    Amount                         = that.Amount
    CurrentEventCompleted          = currentEvent.Completed
    CurrentEventCompletionDate     = currentEvent.CompletionTime
    CurrentEventDescription        = currentEvent.DisplayName
    CurrentEventTargetDate         = currentEvent.TargetDate
    DelinquencyPlanName            = that.DelinquencyPlan.Name
    GracePeriodEndDate             = that.GracePeriodEndDate
    NextEventDescription           = nextEvent.DisplayName
    NextEventTargetDate            = nextEvent.TargetDate
    PublicID                       = that.PublicID
    Reason                         = that.Reason
    StartDate                      = that.StartDate
    Status                         = that.Status
    if (target typeis Account) {
      TargetAccountPublicID        = target.PublicID
    } else if (target typeis PolicyPeriod) {
      TargetPolicyPeriodPublicID   = target.PublicID
    }
    WorkflowState                  = that.WorkflowState
    //
    return this
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only  useful for debugging purposes.
   */
  override final function toString() : String {
    var fields = {} as List<String>

    if (Amount                     != null) fields.add(':Amount                     = ' + Amount)
    if (CurrentEventCompleted      != null) fields.add(':CurrentEventCompleted      = ' + CurrentEventCompleted)
    if (CurrentEventCompletionDate != null) fields.add(':CurrentEventCompletionDate = ' + StringUtil.enquote(CurrentEventCompletionDate.toString()) + ' as Date')
    if (CurrentEventDescription    != null) fields.add(':CurrentEventDescription    = ' + CurrentEventDescription)
    if (CurrentEventTargetDate     != null) fields.add(':CurrentEventTargetDate     = ' + StringUtil.enquote(CurrentEventTargetDate.toString()) + ' as Date')
    if (DelinquencyPlanName.HasContent)     fields.add(':DelinquencyPlanName        = ' + StringUtil.enquote(DelinquencyPlanName))
    if (GracePeriodEndDate         != null) fields.add(':GracePeriodEndDate         = ' + StringUtil.enquote(GracePeriodEndDate.toString()) + ' as Date')
    if (NextEventDescription       != null) fields.add(':NextEventDescription       = ' + NextEventDescription)
    if (NextEventTargetDate        != null) fields.add(':NextEventTargetDate        = ' + StringUtil.enquote(NextEventTargetDate.toString()) + ' as Date')
    if (PublicID.HasContent)                fields.add(':PublicID                   = ' + StringUtil.enquote(PublicID))
    if (Reason                     != null) fields.add(':Reason                     = DelinquencyReason.get("' + Reason.Code + '")')
    if (StartDate                  != null) fields.add(':StartDate                  = ' + StringUtil.enquote(StartDate.toString()) + ' as Date')
    if (Status                     != null) fields.add(':Status                     = DelinquencyProcessStatus.get("' + Status.Code + '")')
    if (TargetAccountPublicID      != null) fields.add(':Target Account             = ' + TargetAccountPublicID)
    if (TargetPolicyPeriodPublicID != null) fields.add(':Target PolicyPeriod        = ' + TargetPolicyPeriodPublicID)
    if (WorkflowState              != null) fields.add(':WorkflowState              = WorkflowState.get("' + WorkflowState.Code + '")')
    if (Activities != null) {
      for (activity in Activities) {
        fields.add('  :Activity = ' + activity.toString())
      }
    }

    return "new DelinquencyProcessDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

}
