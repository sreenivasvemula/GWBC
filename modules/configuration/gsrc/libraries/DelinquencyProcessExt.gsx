package libraries

uses gw.api.util.Logger;

uses gw.pl.util.ArgCheck
uses java.util.Date
uses java.lang.Exception

@Export
enhancement DelinquencyProcessExt : entity.DelinquencyProcess
{
  // === API for workflow steps ========================================

  function onInception() {
    this.inception()
    var eventDate = Date.CurrentDate
    var account = this.getAccount()
    // create an entry for the Account
    // since we are at inception and not creation, there is one Account-
    // level notice for each delinquency which enters inception.
    account.addHistoryFromGosu(
        eventDate,
        HistoryEventType.TC_ACCOUNTDELINQUENT,
        displaykey.Web.DelinquencyProcess.EntityDelinquent( (typeof account).DisplayName ),
        null, null, false )

    // create an entry for the target if this is a not an account-
    // level delinquency
    if ( ! ( this.Target typeis Account ) ) {
      var typeName = (typeof this.Target).DisplayName
      if ( this.Target typeis PolicyPeriod ) {
        typeName = (typeof this.Target.Policy).DisplayName
      }
      this.Target.addHistoryEvent(
          eventDate,
          typekey.HistoryEventType.TC_POLICYDELINQUENT,
          displaykey.Web.DelinquencyProcess.EntityDelinquent( typeName ) ) 
    }
  }

  function sendDunningLetterFromTarget() {
    this.Target.sendDunningLetter()
  }

  function cancelTarget() {
    this.Target.cancel(this)
    // cancel all policies if DelinquencyPlan says to
    if ( this.DelinquencyPlan.CancellationTarget == typekey.CancellationTarget.TC_ALLPOLICIESINACCOUNT ) {
      for ( plcyPeriod in this.Account.Policies*.PolicyPeriods.where(\ p -> p != this.Target)) {
        plcyPeriod.cancel(this)
      }
    }
  }
  
  function resetStagingDelinquencyPlanIfPossible() {
    // Reset account back to standard delinquency plan, as long as there aren't any loaded, 
    // active delinquencies that haven't had their workflows started yet.
    var hasActiveNonStartedDelinquency = this.Account.DelinquencyProcesses.hasMatch( \ d ->
        d.RawStatus == DelinquencyProcessStatus.TC_OPEN and d.Workflows.IsEmpty )
    if ( ! hasActiveNonStartedDelinquency ) {
      var stdDelinquencyPlanName = ScriptParameters.StandardDelinquencyPlan
      var stdPlanFinder =  gw.api.database.Query.make(DelinquencyPlan).compare("Name", Equals, stdDelinquencyPlanName).select()
      var stdPlan = stdPlanFinder.getFirstResult()
      this.Account.DelinquencyPlan = stdPlan
    }
  }

  function rescindOrReinstateTarget() {
    this.Target.rescindOrReinstate()
  }
  // === API called from workflow triggers =============================

  function exitDelinquency() {
    this.ExitDate = Date.CurrentDate;
    this.Phase = typekey.DelinquencyProcessPhase.TC_EXITDELINQUENCY;
    this.invokeTrigger( typekey.WorkflowTriggerKey.TC_EXITDELINQUENCY );
  }

  // === API called from entity ========================================

  function onChargesPaid(chargesPaid : List<Charge>) {
    // NOTE: Collateral Delinquency Processes do not yet exist.  If you have choosen to start either
    // a policy or account level delinquency process for a collateral, you should provide
    // some kind of additional check either here or in DelinquencyTarget extension to
    // recognize if this delinquency is due to past due collateral, and to check the
    // Collateral due amount.  See Account.discoverDelinquencyProcesses()

    var delinquentAmount = this.Target.DelinquentAmount

    // If the current delinquency amount is below the threshold to exit,
    // then trigger the process to stop.
    // This is only valid for Past Due delinquencies; configure exit for 
    // configured delinquency types in a similar manner.
    if ( ( this.Reason == typekey.DelinquencyReason.TC_PASTDUE ) and
         ( delinquentAmount.IsZero or delinquentAmount < this.DelinquencyPlan.ExitDelinquencyThreshold ) ) {
      exitDelinquency();
    }
  }

  // === other helpers =================================================

  function pushForwardHeldEvents(heldSince : java.util.Date) {
    var numDaysHeld = heldSince.differenceInDays( Date.CurrentDate );
    for (event in this.OrderedEvents as DelinquencyProcessEvent[]) {
      if (not event.Completed and event.ExactTargetDate == null) {
        if ( event.OffsetDays == null ) {
          event.OffsetDays = numDaysHeld
        } else {
          event.OffsetDays = event.OffsetDays + numDaysHeld
        }
      }
    }
  }

  function flagEventCompleted(eventName : typekey.DelinquencyEventName) {
    var event : DelinquencyProcessEvent;
    try {
      event = this.getProcessEventById(eventName);
      ArgCheck.nonNull(event, "DelinquencyProcessEvent \"" + eventName.Description + "\"");
    } catch ( e : Exception ) {
      this.Status = DelinquencyProcessStatus.TC_ERROR;
      Logger.logError( "Error attempting to locate DelinquencyProcessEvent for eventId==\"" + eventName + "\" : " + e );
      throw e;
    }
    event.flagCompleted();
  }

  function getApprovalDate(eventName : typekey.DelinquencyEventName) : Date {
    var event = this.getProcessEventById( eventName );
    return event.getTargetDate().addDays( -7 );
  }

  function createApprovalActivity(eventName : typekey.DelinquencyEventName, subject : String) : Activity {
    var event = this.getProcessEventById(eventName);

    if (event.ApprovalActivity == null) {
      var activityPattern = gw.api.web.admin.ActivityPatternsUtil.getActivityPattern("approval");
      var activity = new Activity(this.Bundle)
      activity.ActivityPattern = activityPattern
      activity.Subject = subject
      activity.Description = subject
      activity.TargetDate = event.TargetDate
      activity.EscalationDate = event.TargetDate
      activity.Priority = typekey.Priority.TC_NORMAL
      activity.Mandatory = true
      this.addToActivities(activity)
      event.ApprovalActivity = activity;
    }

    return event.ApprovalActivity;
  }

  function createAssignCAActivity(eventName : typekey.DelinquencyEventName, subject : String, desc : String) : Activity {
    var event = this.getProcessEventById(eventName);

    if (this.AssignCAActivity == null) {
        var activityPattern = gw.api.web.admin.ActivityPatternsUtil.getActivityPattern("notification");
        var activity = new Activity(this.Bundle)
        activity.ActivityPattern = activityPattern
        activity.Subject = subject
        activity.Description = desc
        activity.TargetDate = event.TargetDate
        activity.EscalationDate = event.TargetDate
        activity.Priority = "normal"
        activity.Mandatory = true
        this.addToActivities(activity)
        this.AssignCAActivity = activity;
    }

    return this.AssignCAActivity;
  }

  function getTargetDate(eventName : typekey.DelinquencyEventName) : java.util.Date {
    var event = this.getProcessEventById(eventName);
    return event.TargetDate;
  }

}
