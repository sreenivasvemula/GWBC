package gw.plugin.invoice.impl

uses gw.api.domain.invoice.InvoiceItemPlacements;
uses gw.plugin.invoice.IInvoiceAssembler

@Export
class InvoiceAssembler implements IInvoiceAssembler {

  construct() {
  }

  /**
   * Returns the invoice item placements to use for placing the items in the defaultPlacements onto invoices.
   * Override this method to customize the invoice for each invoice item.
   *
   * @param defaultPlacements the default placement for each invoice item
   * @param context the context of the item placements; the reason the items are being placed on invoices.
   * @return the desired invoice item placements
   */
  override function getCustomInvoiceItemPlacements(
      defaultPlacements : InvoiceItemPlacements, context : InvoiceAssemblerContext) : InvoiceItemPlacements {
    return defaultPlacements
  }

}