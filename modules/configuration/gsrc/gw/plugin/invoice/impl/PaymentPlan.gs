package gw.plugin.invoice.impl

uses gw.api.domain.charge.ChargeInitializer
uses gw.api.domain.invoice.ChargeInstallmentChanger
uses gw.plugin.invoice.IPaymentPlan

uses java.util.Date
uses java.util.List

@Export
class PaymentPlan implements IPaymentPlan {

  construct() {
  }

  override function createFullSetOfInstallmentEventDates(
                        charge : Charge, defaultCreatedInstallmentEventDates : List<Date>) : List<Date> {
    return defaultCreatedInstallmentEventDates
  }

  override function createFullSetOfInvoiceItems(
                        charge: Charge, defaultCreatedInvoiceItems : List<InvoiceItem>) : List<InvoiceItem> {
    return defaultCreatedInvoiceItems;
  }

  override function recreatePlannedInstallmentEventDatesForPaymentPlanChange(
                        charge : Charge, defaultRecreatedPlannedInstallmentEventDates : List<Date>) : List<Date> {
    return defaultRecreatedPlannedInstallmentEventDates
  }

  override function recreatePlannedInvoiceItemsForPaymentPlanChange(
                        charge : Charge, defaultRecreatedPlannedInvoiceItems : List<InvoiceItem>) : List<InvoiceItem> {
    return defaultRecreatedPlannedInvoiceItems
  }

  override function recreateInvoiceItemsForPaymentPlanChange(changer: ChargeInstallmentChanger) {
    // make no changes by default.
  }

  override function createFullSetOfInstallmentEventDates(
                        initializer: ChargeInitializer, defaultCreatedInstallmentEventDates: List <Date>): List <Date> {
    return defaultCreatedInstallmentEventDates
  }
}