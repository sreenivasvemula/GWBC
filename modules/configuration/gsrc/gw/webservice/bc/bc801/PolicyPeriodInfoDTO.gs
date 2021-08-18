package gw.webservice.bc.bc801

uses gw.xml.ws.annotation.WsiExportable
uses gw.pl.currency.MonetaryAmount
uses java.util.Date

/**
 * Data Transfer Object ("DTO") to represent a summary of data from an {@link entity.PolicyPeriod} for use by a WS-I webservice.
 * <p>The specific mappings for {@link PolicyPeriodInfoDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>AccountPublicID</td><td>PolicyPeriod.Account.PublicID</td></tr><tr><td>AmountBilled</td><td>PolicyPeriod.BilledAmount</td></tr><tr><td>AmountDue</td><td>PolicyPeriod.DueAmount</td></tr><tr><td>AmountInUnappliedFund</td><td>The balance in the designated unapplied fund of the policy period</td></tr><tr><td>AmountPaid</td><td>PolicyPeriod.PaidAmount</td></tr><tr><td>AmountUnbilled</td><td>PolicyPeriod.UnbilledAmount</td></tr><tr><td>Delinquent</td><td>PolicyPeriod.Delinquent</td></tr><tr><td>EffectiveDate</td><td>PolicyPeriod.EffectiveDate</td></tr><tr><td>ExpirationDate</td><td>PolicyPeriod.ExpirationDate</td></tr><tr><td>InfoDate</td><td>Date and Time this DTO was last updated</td></tr><tr><td>LastInvoiceAmount</td><td>Amount on the last billed/due invoice</td></tr><tr><td>LastInvoiceDueDate</td><td>Due date of the last billed/due invoice</td></tr><tr><td>LastPaymentAmount</td><td>Amount of the last payment applied to this policy period</td></tr><tr><td>LastPaymentReceivedDate</td><td>Date the last payment applied to this policy period was received</td></tr><tr><td>NextInvoiceAmount</td><td>Amount on the next planned invoice</td></tr><tr><td>NextInvoiceDueDate</td><td>Due date of the next planned invoice</td></tr><tr><td>PrimaryInsuredName</td><td>Name of the primary insured on the policy period</td></tr><tr><td>PublicID</td><td>PublicID of the policy period</td></tr></table></p>
 * Customer configuration: modify this file by adding a property that should be displayed in the summary.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/PolicyPeriodInfoDTO")
final class PolicyPeriodInfoDTO {
  var _accountPublicID          : String                  as AccountPublicID
  var _amountBilled             : MonetaryAmount          as AmountBilled
  var _amountDue                : MonetaryAmount          as AmountDue
  var _amountInUnappliedFund    : MonetaryAmount          as AmountInUnappliedFund
  var _amountPaid               : MonetaryAmount          as AmountPaid
  var _amountUnbilled           : MonetaryAmount          as AmountUnbilled
  var _delinquent               : boolean                 as Delinquent
  var _effectiveDate            : DateTime                as EffectiveDate
  var _expirationDate           : DateTime                as ExpirationDate
  var _infoDate                 : DateTime                as InfoDate
  var _lastInvoiceAmount        : MonetaryAmount          as LastInvoiceAmount
  var _lastInvoiceDueDate       : DateTime                as LastInvoiceDueDate
  var _lastPaymentAmount        : MonetaryAmount          as LastPaymentAmount
  var _lastPaymentReceivedDate  : DateTime                as LastPaymentReceivedDate
  var _nextInvoiceDueDate       : DateTime                as NextInvoiceDueDate
  var _nextInvoiceAmount        : MonetaryAmount          as NextInvoiceAmount
  var _primaryInsuredName       : String                  as PrimaryInsuredName
  var _publicID                 : String                  as PublicID



  /**
   * Creates a new PolicyPeriodInfoDTO that represents the current snapshot state of the supplied PolicyPeriod.
   * @param that The PolicyPeriod to be represented.
   */
  static function valueOf(that : PolicyPeriod) : PolicyPeriodInfoDTO {
    return new PolicyPeriodInfoDTO().readFrom(that)
  }

  /**
   * Set the fields in this DTO using the supplied PolicyPeriod
   * @param that The PolicyPeriod to copy from.
   */
  final function readFrom(that : PolicyPeriod) : PolicyPeriodInfoDTO {
    var lastInvoice         = that.CompletedInvoicesSortedByEventDate.last()
    var nextPlannedInvoice  = that.NextPlannedInvoice
    var lastMoneyReceived   = that.LastPayment.BaseDist.BaseMoneyReceived

    AccountPublicID         = that.Account.PublicID
    AmountBilled            = that.BilledAmount
    AmountDue               = that.DueAmount
    AmountInUnappliedFund   = that.Policy.getDesignatedUnappliedFund(that.Account).Balance
    AmountPaid              = that.PaidAmount
    AmountUnbilled          = that.UnbilledAmount
    Delinquent              = that.Delinquent
    EffectiveDate           = that.EffectiveDate
    ExpirationDate          = that.ExpirationDate
    InfoDate                = Date.CurrentDate
    LastInvoiceDueDate      = lastInvoice.PaymentDueDate
    LastInvoiceAmount       = lastInvoice.Amount
    LastPaymentAmount       = lastMoneyReceived.Amount
    LastPaymentReceivedDate = lastMoneyReceived.ReceivedDate
    NextInvoiceDueDate      = nextPlannedInvoice.PaymentDueDate
    NextInvoiceAmount       = nextPlannedInvoice.Amount
    PrimaryInsuredName      = that.PrimaryInsured.Contact.DisplayName
    PublicID                = that.PublicID
    return this
  }

}