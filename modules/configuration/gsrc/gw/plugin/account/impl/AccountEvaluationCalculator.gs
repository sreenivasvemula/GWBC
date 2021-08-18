package gw.plugin.account.impl

uses java.util.Date

@Export
class AccountEvaluationCalculator implements gw.plugin.account.IAccountEvaluationCalculator {
  // Time period in days over which system should run queries for various pieces of information we will use in
  // determining the account evaluation rating (for example: how many delinquencies on the account in the last 365 days)
  private static var NumberOfDaysForMetricsSearch = 365
  
  // Thresholds for number of delinquencies on the account
  private static var MaxDelinquenciesForExcellent = 1
  private static var MaxDelinquenciesForGood = 2
  private static var MaxDelinquenciesForAcceptable = 4
  private static var MaxDelinquenciesForMarginal = 6

  // Thresholds for number of occurrences of pejorative payment reversals on the account
  private static var MaxPaymentReversalsForExcellent = 0
  private static var MaxPaymentReversalsForGood = 0
  private static var MaxPaymentReversalsForAcceptable = 1
  private static var MaxPaymentReversalsForMarginal = 2
  
  // Thresholds for number of policy cancellations on the account  
  private static var MaxPolicyCancellationsForExcellent = 0
  private static var MaxPolicyCancellationsForGood = 1
  private static var MaxPolicyCancellationsForAcceptable = 2
  private static var MaxPolicyCancellationsForMarginal = 3
  
  // We will give an account an evaluation of New Account if it is less than a year old
  private static var MaxAgeOfNewAccountInMilliseconds : long = 31536000000 // 365 * 24 * 60 * 60 * 1000

  construct()
  {
  }

  override property get MetricsQueryTimePeriod() : int
  {
    return NumberOfDaysForMetricsSearch
  }

  override function calculateEvaluation( account: Account, currentTime : Date, numDelinquencies: int, numDelinquenciesPastGracePeriod: int, 
                                        numPaymentReversals: int, numPolicyCancellations: int ) : AccountEvaluation
  {       
    if (currentTime.getTime() - account.getCreateTime().getTime() <= MaxAgeOfNewAccountInMilliseconds) {
      return  AccountEvaluation.TC_NEWACCOUNT
    }
    else if (numDelinquencies <= MaxDelinquenciesForExcellent &&
             numPaymentReversals <= MaxPaymentReversalsForExcellent &&
             numPolicyCancellations <= MaxPolicyCancellationsForExcellent) {
      return AccountEvaluation.TC_EXCELLENT
    }
    else if (numDelinquencies <= MaxDelinquenciesForGood &&
             numPaymentReversals <= MaxPaymentReversalsForGood &&
             numPolicyCancellations <= MaxPolicyCancellationsForGood) {
      return AccountEvaluation.TC_GOOD
    }
    else if (numDelinquencies <= MaxDelinquenciesForAcceptable &&
             numPaymentReversals <= MaxPaymentReversalsForAcceptable &&
             numPolicyCancellations <= MaxPolicyCancellationsForAcceptable) {
      return AccountEvaluation.TC_ACCEPTABLE
    }
    else if (numDelinquencies <= MaxDelinquenciesForMarginal &&
             numPaymentReversals <= MaxPaymentReversalsForMarginal &&
             numPolicyCancellations <= MaxPolicyCancellationsForMarginal) {
      return AccountEvaluation.TC_MARGINAL
    }
    else {
      return AccountEvaluation.TC_POOR
    }
  }

  override function countUniqueDelinquenciesAndCancellationsOnly() : boolean
  {
    return true
  }

}
