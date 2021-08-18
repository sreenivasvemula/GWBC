package libraries;

uses com.guidewire.pl.web.controller.UserDisplayableException;

@Export
enhancement ActivityExt : Activity {
  /**
   * Assigns the ActivityCreatedByAppr upon its initial creation
   */
  public static function assignActivityCreatedByAppr( arg : Activity ) {
    var currentUser = User.util.CurrentUser;

    if (currentUser.GroupUsers.length == 0) {
      throw new UserDisplayableException(displaykey.Java.Approval.Required.NoSupervisor)
    }
    
    var supervisorGroup = currentUser.GroupUsers[0].Group;
    var supervisor = supervisorGroup.Supervisor;
    arg.assign( supervisorGroup, supervisor );
  }

  /**
   * Reassigns the ActivityCreatedByAppr. Useful if the prior assignee of the Activity lacked sufficient authority to approve it. 
   * In the base product, this method is called in AutomaticDisbursementBatchProcess.
   */
  public static function reassignActivityCreatedByApprToUserWithSufficientAuthority( arg : Activity) {
    arg.assign( arg.AssignedGroup, arg.AssignedGroup.Supervisor )
  }

  property get DocumentContainer(): DocumentContainer {
    if (this.Account != null) {
      return this.Account
    } else if (this.PolicyPeriod.Policy != null) {
      return this.PolicyPeriod.Policy
    }
    return null
  }
}