package gw.webservice.bc.bc801

uses gw.api.util.StringUtil
uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date
uses java.util.List

/**
 * Data Transfer Object ("DTO") to represent a summary of data from an {@link entity.Account} for use by the WS-I layer.
 * <p>The specific mappings for {@link AccountInfoDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>AccountName</td><td>Account.AccountName</td></tr><tr><td>AccountNameKanji</td><td>Account.AccountNameKanji</td></tr><tr><td>AmountBilled</td><td>Account.BilledAmount</td></tr><tr><td>AmountDue</td><td>Account.DueAmount</td></tr><tr><td>AmountInUnappliedFunds</td><td>Account.TotalUnappliedAmount</td></tr><tr><td>AmountPaid</td><td>Account.PaidOrWrittenOffAmount</td></tr><tr><td>AmountUnbilled</td><td>Account.UnbilledAmount</td></tr><tr><td>Delinquent</td><td>Account.Delinquent</td></tr><tr><td>HasOpenPolicies</td><td>not Account.OpenPolicyPeriods.IsEmpty</td></tr><tr><td>InfoDate</td><td>Date and Time this DTO was last updated.</td></tr><tr><td>LastInvoiceAmount</td><td>amount of the last invoice</td></tr><tr><td>LastInvoiceDueDate</td><td>DueDate of the last invoice</td></tr><tr><td>LastPaymentAmount</td><td>amount of the last payment</td></tr><tr><td>LastPaymentReceivedDate</td><td>ReceivedDate of the last payment</td></tr><tr><td>NextInvoiceAmount</td><td>amount of the next invoice</td></tr><tr><td>NextInvoiceDueDate</td><td>DueDate of the next invoice</td></tr><tr><td>PublicID</td><td>Account.PublicID</td></tr></table></p>
 *
 * Customer configuration: modify this file by adding a property that should be displayed in the summary.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/AccountInfoDTO")
final class AccountInfoDTO {
  var _accountName             : String                        as AccountName
  var _accountNameKanji        : String                        as AccountNameKanji
  var _amountBilled            : gw.pl.currency.MonetaryAmount as AmountBilled
  var _amountDue               : gw.pl.currency.MonetaryAmount as AmountDue
  var _amountPaid              : gw.pl.currency.MonetaryAmount as AmountPaid
  var _amountInUnappliedFunds  : gw.pl.currency.MonetaryAmount as AmountInUnappliedFunds
  var _amountUnbilled          : gw.pl.currency.MonetaryAmount as AmountUnbilled
  var _delinquent              : Boolean                       as Delinquent
  var _hasOpenPolicies         : Boolean                       as HasOpenPolicies
  var _infoDate                : Date                          as InfoDate
  var _lastInvoiceAmount       : gw.pl.currency.MonetaryAmount as LastInvoiceAmount
  var _lastInvoiceDueDate      : Date                          as LastInvoiceDueDate
  var _lastPaymentAmount       : gw.pl.currency.MonetaryAmount as LastPaymentAmount
  var _lastPaymentReceivedDate : Date                          as LastPaymentReceivedDate
  var _nextInvoiceAmount       : gw.pl.currency.MonetaryAmount as NextInvoiceAmount
  var _nextInvoiceDueDate      : Date                          as NextInvoiceDueDate
  var _publicID                : String                        as PublicID

  construct() {
    InfoDate = Date.Now
  }

  /**
   * Create a new AccountInfoDTO that represents a summary of data from an {@link entity.Account}.
   * @param that The Account to be represented.
   * @returns a new AccountInfoDTO that represents a summary of data from an {@link entity.Account}.
   */
  static function valueOf(that : Account) : AccountInfoDTO {
    return new AccountInfoDTO().readFrom(that)
  }

  /**
   * Set the fields in this DTO using the supplied {@link entity.Account}
   * @param that The Account to copy from.
   * @returns the AccountInfoDTO with fields set from the passed in {@link entity.Account}.
   */
  final function readFrom(that : Account) : AccountInfoDTO {
    var lastInvoice = that.CompletedInvoices.last()
    var nextInvoice = that.FutureInvoicesSortedByDate.first()
    var lastPayment = that.findReceivedPaymentMoneysSortedByReceivedDateDescending().FirstResult

    AccountName             = that.AccountName
    AccountNameKanji        = that.AccountNameKanji
    AmountBilled            = that.BilledAmount
    AmountDue               = that.DueAmount
    AmountInUnappliedFunds  = that.TotalUnappliedAmount
    AmountPaid              = that.PaidOrWrittenOffAmount
    AmountUnbilled          = that.UnbilledAmount
    Delinquent              = that.Delinquent
    HasOpenPolicies         = not that.OpenPolicyPeriods.IsEmpty
    InfoDate                = Date.Now
    LastInvoiceAmount       = lastInvoice.Amount
    LastInvoiceDueDate      = lastInvoice.DueDate
    LastPaymentAmount       = lastPayment.Amount
    LastPaymentReceivedDate = lastPayment.ReceivedDate
    NextInvoiceAmount       = nextInvoice.Amount
    NextInvoiceDueDate      = nextInvoice.DueDate
    PublicID                = that.PublicID

    return this
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only useful for debugging purposes.
   */
  override final function toString() : String {
    var fields = {} as List<String>

    if (AmountBilled            != null  ) fields.add(':AmountBilled            = ' + AmountBilled)
    if (AmountDue               != null  ) fields.add(':AmountDue               = ' + AmountDue)
    if (AmountInUnappliedFunds  != null  ) fields.add(':AmountInUnappliedFunds  = ' + AmountInUnappliedFunds)
    if (AmountPaid              != null  ) fields.add(':AmountPaid              = ' + AmountPaid)
    if (AmountUnbilled          != null  ) fields.add(':AmountUnbilled          = ' + AmountUnbilled)
    if (Delinquent              != null  ) fields.add(':Delinquent              = ' + Delinquent)
    if (HasOpenPolicies         != null  ) fields.add(':HasOpenPolicies         = ' + HasOpenPolicies)
    if (InfoDate                != null  ) fields.add(':InfoDate                = ' + StringUtil.enquote(InfoDate.toString()) + ' as Date')
    if (LastInvoiceAmount       != null  ) fields.add(':LastInvoiceAmount       = ' + LastInvoiceAmount)
    if (LastInvoiceDueDate      != null  ) fields.add(':LastInvoiceDueDate      = ' + StringUtil.enquote(LastInvoiceDueDate.toString()) + ' as Date')
    if (LastPaymentAmount       != null  ) fields.add(':LastPaymentAmount       = ' + LastPaymentAmount)
    if (LastPaymentReceivedDate != null  ) fields.add(':LastPaymentReceivedDate = ' + StringUtil.enquote(LastPaymentReceivedDate.toString()) + ' as Date')
    if (NextInvoiceAmount       != null  ) fields.add(':NextInvoiceAmount       = ' + NextInvoiceAmount)
    if (NextInvoiceDueDate      != null  ) fields.add(':NextInvoiceDueDate      = ' + StringUtil.enquote(NextInvoiceDueDate.toString()) + ' as Date')
    if (PublicID            .HasContent)   fields.add(':PublicID                = ' + StringUtil.enquote(PublicID))

    return "new AccountInfoDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

}