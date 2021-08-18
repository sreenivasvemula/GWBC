package gw.webservice.policycenter.bc801

@Export
enhancement InvoiceStreamPCEnhancement : entity.InvoiceStream {
  
  property get PCDisplayName() : String {
    if (this.PaymentInstrument.PaymentMethod == TC_Responsive) {
      return this.Periodicity.DisplayName + ", " + displaykey.PaymentInstrument.API.Responsive.PCDisplayName
    } else {
      return this.Periodicity.DisplayName + ", " + this.PaymentInstrument.DisplayName
    }
  }
}
