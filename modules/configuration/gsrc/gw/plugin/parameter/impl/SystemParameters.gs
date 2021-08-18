package gw.plugin.parameter.impl;

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.parameter.ISystemParameters

@Export
class SystemParameters implements ISystemParameters {

  construct() {
  }

  /**
   * Gets the threshold for making automatic producer payments, or null if low producer payments should not be
   * suppressed. If non-null, this value represents the minimum automatic producer payment that will be made. If an
   * automatic producer payment would be made for less than this amount, the payment is canceled until the next
   * scheduled payment date.
   */
  public override function getProducerAutoPaymentThreshold(producer : Producer) : MonetaryAmount {
    return null;
  }

  /**
   * Gets the set of payment reversal reasons that are "pejorative," i.e., results in a fee and is considered
   * a negative for the purposes of account evaluation.
   */
  public override property get PejorativePaymentReversalReasons() : PaymentReversalReason[] {
    return new PaymentReversalReason[] {PaymentReversalReason.TC_RETURNEDCHECK};
  }
}