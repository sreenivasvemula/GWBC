package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.CommissionPlanInfo

@Export
enhancement CommissionPlanInfoEnhancement : CommissionPlanInfo {
  
  function copyCommissionPlanInfo(plan : CommissionPlan) {
    this.copyPlanInfo(plan)
    this.AllowedTiers = getAllowedTiers(plan)
  }
  
  private function getAllowedTiers(plan : CommissionPlan) : List<String> {
    return ProducerTier.getTypeKeys( false )
      .where( \ p -> plan.isAllowedTier( p ) )*.Code.toList()
  }
}
