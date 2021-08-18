package gw.plugin.charge

@Export
public class ChargeInitializer implements IChargeInitializer {

  public override function customizeChargeInitializer(initializer : gw.api.domain.charge.ChargeInitializer) {
    //Insert Code here to modify the ChargeInitializer's Entries that will be used for creation and placement of InvoiceItems.
  }
}