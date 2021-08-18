package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.PlanInfo

@Export
enhancement PlanInfoEnhancement : PlanInfo {
  
  function copyPlanInfo(plan : Plan) {
    this.Name = plan.Name
    this.PublicID = plan.PublicID
  }
}
