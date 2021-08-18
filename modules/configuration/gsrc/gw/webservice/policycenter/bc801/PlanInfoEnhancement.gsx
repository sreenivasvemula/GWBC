package gw.webservice.policycenter.bc801

uses gw.webservice.policycenter.bc801.entity.types.complex.PlanInfo

@Export
enhancement PlanInfoEnhancement : PlanInfo {
  function copyPlanInfo(plan : Plan) {
    this.Name = plan.Name
    this.PublicID = plan.PublicID
  }
}
