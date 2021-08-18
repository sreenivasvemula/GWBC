package gw.plugin.contact.impl

@Export
enhancement AccountContactEnhancement : entity.AccountContact {
  
  /**
   * Creates a new activity on the account associated to this account contact.
   * It also sets the AccountContact foreignkey for the activity.
   */
  function newActivity() : Activity {
    var activity = new Activity(this.Account.Bundle)
    activity.AccountContact = this
    activity.Account = this.Account
    activity.Priority = Priority.TC_NORMAL 
    return activity
  }
}
