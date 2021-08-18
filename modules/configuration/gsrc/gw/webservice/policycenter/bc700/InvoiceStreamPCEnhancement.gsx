package gw.webservice.policycenter.bc700

@Export
enhancement InvoiceStreamPCEnhancement : entity.InvoiceStream {
  
  property get PCDisplayName_bc700() : String {
    if (this.PaymentInstrument.PaymentMethod == TC_Responsive) {
  return this.Periodicity.DisplayName + ", " + displaykey.PaymentInstrument.API.Responsive.PCDisplayName
    } else {
      return this.Periodicity.DisplayName + ", " + this.PaymentInstrument.DisplayName
    }
  }
}
