package gw.plugin.agencybill.impl
uses gw.plugin.agencybill.ICommissionOverride
uses java.math.BigDecimal

@Export
class CommissionOverride implements ICommissionOverride {

  construct() {
  }
  
  /**
   * DEFAULT IMPLEMENTATION: return true if item is not planned (e.g., Billed or Due) 
   * or is fully paid (e.g., a planned item that's been paid)
   */
  override function shouldCreateCommissionAdjustmentInvoiceItem(originalInvoiceItem : InvoiceItem,
                                                      originalCommissionRate: BigDecimal,
                                                      newCommissionRate : BigDecimal) : boolean {
    return originalInvoiceItem.AgencyBill && (originalInvoiceItem.Invoice.Status != InvoiceStatus.TC_PLANNED
              || originalInvoiceItem.Settled)
  }
}
