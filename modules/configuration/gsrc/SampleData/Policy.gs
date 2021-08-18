package SampleData

uses gw.api.databuilder.PolicyBuilder
uses gw.api.databuilder.PolicyPeriodBuilder

@Export
class Policy {
  function create(account : Account,
                  number: String
                  ): Policy {
    var existing = gw.api.database.Query.make(PolicyPeriod).compare("PolicyNumber", Equals, number).select()
    if (existing.Empty) {
      var policyPeriodBuilder = new PolicyPeriodBuilder()
        .withCurrency(account.Currency)
        .withPolicyNumber(number)
        .withEffectiveDate(com.guidewire.pl.system.dependency.PLDependencies.getSystemClock().getDateTime())
      var policy = new PolicyBuilder()
        .onAccount(account)
        .withPolicyPeriod(policyPeriodBuilder)
        .createAndCommit()
      return policy
    }
    else {
      return existing.AtMostOneRow.Policy
    }
  }
}
