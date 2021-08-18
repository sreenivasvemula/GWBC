package gw.webservice.policycenter.bc801

uses gw.webservice.policycenter.bc801.entity.types.complex.PlanCurrencyInfo

/**
 * Defines the {@link PlanCurrencyInfo} copy currency info' method.
 */
@Export
enhancement PlanCurrencyInfoEnhancement : PlanCurrencyInfo {
  function copyPlanCurrencyInfo(plan : Plan) {
    this.copyPlanInfo(plan)
    if (plan typeis InCurrencySilo) {
      this.Currency = plan.Currency.Code
    }
  }
}
