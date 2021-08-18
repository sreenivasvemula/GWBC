package gw.webservice.policycenter.bc700
uses gw.webservice.policycenter.bc700.entity.types.complex.ReinstatementInfo
uses gw.api.util.CurrencyUtil

@Export
enhancement ReinstatementInfoEnhancement : ReinstatementInfo {
  
  function execute() : String {
    var bi = new Reinstatement(CurrencyUtil.getDefaultCurrency())
    return this.execute(bi)
  }
}
