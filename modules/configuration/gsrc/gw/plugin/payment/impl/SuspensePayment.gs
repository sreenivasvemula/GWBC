package gw.plugin.payment.impl

uses gw.api.database.Query
uses gw.plugin.payment.ISuspensePayment


@Export
class SuspensePayment implements ISuspensePayment {

  construct() {
  }

  override function apply(suspPayment: SuspensePayment) {
    if (suspPayment.OfferNumber != null) {
      return
    }
    if (suspPayment.AccountNumber != null) {
      var account = findAccountToApply(suspPayment.AccountNumber)
      if (account != null) {
        account = suspPayment.Bundle.add(account)
        suspPayment.applyTo(account)
      }
    } else if (suspPayment.PolicyNumber != null) {
      var policyPeriod = findPolicyPeriodToApply(suspPayment.PolicyNumber)
      if (policyPeriod != null) {
        policyPeriod = suspPayment.Bundle.add(policyPeriod)
        suspPayment.applyTo(policyPeriod)
      }
    } else if (suspPayment.ProducerName != null) {
      var producer = findProducerToApply(suspPayment.ProducerName)
      if (producer != null) {
        producer = suspPayment.Bundle.add(producer)
        suspPayment.applyTo(producer)
      }
    }
  }

  override function findAccountToApply(accountNumber: String) : Account {
    // Returns the unique account or null if not found
    return Query.make(Account).compare(Account#AccountNumber, Equals, accountNumber).select().AtMostOneRow
  }

  override function findPolicyPeriodToApply(policyNumber: String) : PolicyPeriod {
    // Returns the latest PolicyPeriod or null if not found
    // Expecting a PolicyNumber (not a PolicyNumberLong)
    var policyPeriod : PolicyPeriod
    var policyPeriodQuery = Query.make(entity.PolicyPeriod).compare(entity.PolicyPeriod#PolicyNumber, Equals, policyNumber).select()
    var policyPeriodCount = policyPeriodQuery.Count
    if (policyPeriodCount == 1) {
      policyPeriod = policyPeriodQuery.FirstResult
    } else if (policyPeriodCount > 1) {
      policyPeriodQuery.orderByDescending(\p -> p.PolicyPerEffDate)
      policyPeriod = policyPeriodQuery.FirstResult
    }
    return policyPeriod
  }

  override function findProducerToApply(producerName: String) : Producer {
    // Returns a unique Producer. If there are multiple matches or no matches, returns null.
    var producer : Producer
    var producerMatches = Query.make(entity.Producer).compare(entity.Producer#Name, Equals, producerName).select()
    if (producerMatches.Count == 1) {
      producer = producerMatches.FirstResult
    }
    return producer
  }
}
