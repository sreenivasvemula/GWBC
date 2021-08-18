package gw.payment

@Export
enhancement SuspensePaymentEnhancement : SuspensePayment {

  property get CurrentApplyTo() : SuspensePaymentApplyTo {
    if (this.PolicyNumber != null) {
      return TC_POLICY
    } else if (this.ProducerName != null) {
      return TC_PRODUCER
    }
    return TC_ACCOUNT
  }

  function setApplyToTarget(applyTo : SuspensePaymentApplyTo, accountNumber : String, policyNumber : String, producerName : String) : void {
    this.AccountNumber = null
    this.PolicyNumber = null
    this.ProducerName = null
    switch (applyTo) {
      case SuspensePaymentApplyTo.TC_ACCOUNT:
          this.AccountNumber = accountNumber
          break
      case SuspensePaymentApplyTo.TC_POLICY:
          this.PolicyNumber = policyNumber
          break
      case SuspensePaymentApplyTo.TC_PRODUCER:
          this.ProducerName = producerName
          break
    }
  }
}
