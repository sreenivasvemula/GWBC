package gw.producer
uses gw.pl.currency.MonetaryAmount
uses com.google.common.collect.Lists

@Export
class CommissionReceivableReductionHelper {
  
  private var _producer : Producer as Producer
  private var _producerCode : ProducerCode as ProducerCode
  private var _policyCommission : PolicyCommission as PolicyCommission
  private var _amount : MonetaryAmount as Amount
  private var _policyLevel : Boolean as BooleanLevelToWriteoff
  
  construct(producerToWriteoff : Producer) {
    _policyLevel = false
    Producer = producerToWriteoff
  }
  
  property get WriteoffAtThePolicy() : Boolean {
    return _policyLevel
  }
  
  property get WriteoffAtTheProducerCode() : Boolean {
    return !_policyLevel
  }
  
  property get CommissionPayable() : MonetaryAmount {
    if (WriteoffAtThePolicy) {
      return PolicyCommission.CommissionPayableBalance
    } else {
      return ProducerCode.TotalCommissionPayable
    }
  }
  
  property get OptionsToWriteoff() : List<TAccountOwner> {
    if (WriteoffAtThePolicy) {
      return Lists.newArrayList(Producer.PolicyCommissions)
    } else {
      return Producer.ProducerCodes.toList()
    }
  }
  
  property get EntityToWriteoff() : TAccountOwner {
    if (WriteoffAtThePolicy) {
      return PolicyCommission
    } else {
      return ProducerCode
    }
  }
  
  property set EntityToWriteoff(entity : TAccountOwner) {
    if (WriteoffAtThePolicy) {
      PolicyCommission = entity as PolicyCommission
    } else {
      ProducerCode = entity as ProducerCode
    }
  }
  
  function doWriteoff() {
    if (WriteoffAtThePolicy) {
      PolicyCommission = Producer.Bundle.add( PolicyCommission )
      PolicyCommission.writeOffCommissionRecovery( Amount )
    } else {
      ProducerCode.writeoffCommissionRecovery( Amount )
    }
  }
  
  property get LevelToWriteoff() : String {
    if (WriteoffAtThePolicy) {
      return displaykey.Web.CommissionReceivableReductionWizardTargetsStepScreen.WriteoffPolicyPeriod
    } else {
      return displaykey.Web.CommissionReceivableReductionWizardTargetsStepScreen.WriteoffProducerCode
    }
  }
  
  property get EntityToWriteoffLabel() : String {
    if (WriteoffAtThePolicy) {
      return displaykey.Web.CommissionReceivableReductionWizardConfirmationStepScreen.PolicyProducerCode
    } else {
      return displaykey.Web.CommissionReceivableReductionWizardConfirmationStepScreen.ProducerCode
    }
  }
}
