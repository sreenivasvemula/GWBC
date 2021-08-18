package gw.plugin.premiumreporting.impl

uses gw.api.database.Query
uses gw.plugin.premiumreporting.IPremiumReport

@Export
class PremiumReport implements IPremiumReport {
  construct() {}
  
  /**
   * This method matches a PremiumReportBI to a PremiumReportDueDate.  It is called at the top of the PremiumReportBI's
   * execute() method.  It is used to create the bi-directional link between the PremiumReportBI and its PremiumReprortDueDate
   * that is used in internal logic.
   */
  override function findMatchingPremiumReportDueDate(newPremiumReportBI : PremiumReportBI) : PremiumReportDueDate {
    var q = Query.make(PremiumReportDueDate)
    q.compare("PremiumReportDDPolicyPeriod", Equals, newPremiumReportBI.AssociatedPolicyPeriod)
    q.compare("PeriodStartDate", Equals, newPremiumReportBI.PeriodStartDate)
    q.compare("PeriodEndDate", Equals, newPremiumReportBI.PeriodEndDate)
    return q.select().AtMostOneRow
  }
  
  /*
   *  This function is called by the PremiumReportDueDateBatchProcess.  When the batch process detects that a PremiumReportDueDate's
   *  'due date' has passed, it will pass it to this method, and then kick off delinquency if it receives a 'true' response.
   */
  override function shouldStartFailureToReportDelinquency(premiumReportDueDate : PremiumReportDueDate) : boolean {
    return premiumReportDueDate.PremiumReportBIs.length == 0
  }

  /*
   *  This function is called whenever a PremiumReportBI comes in on a policy that has an active Failure to Report delinquency process.
   *  If this function returns true, that delinquency process will be exited.
   */
  override function shouldStopFailureToReportDelinquency(latePremiumReportBI : PremiumReportBI) : boolean {
    return true
  } 

}


