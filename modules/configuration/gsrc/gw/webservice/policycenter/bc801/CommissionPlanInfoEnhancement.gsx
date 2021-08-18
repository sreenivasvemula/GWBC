package gw.webservice.policycenter.bc801

uses gw.webservice.policycenter.bc801.entity.types.complex.CommissionPlanInfo

@Export
enhancement CommissionPlanInfoEnhancement : CommissionPlanInfo {
  function copyCommissionPlanInfo(plan : CommissionPlan) {
    this.copyPlanCurrencyInfo(plan)
    this.AllowedTiers = getAllowedTiers(plan)
  }
  
  private function getAllowedTiers(plan : CommissionPlan) : List<String> {
    return ProducerTier.getTypeKeys( false )
      .where( \ p -> plan.isAllowedTier( p ) )*.Code.toList()
  }
}
