package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.FinalAuditInfo
uses gw.api.util.CurrencyUtil

@Export
enhancement FinalAuditInfoEnhancement : FinalAuditInfo {
  
  function execute() : String {
    var bi = new Audit(CurrencyUtil.getDefaultCurrency())
    bi.FinalAudit = true
    bi.TotalPremium = false
    return this.execute(bi)
  }
}
