package gw.webservice.bc.bc801

uses gw.xml.ws.annotation.WsiExportable
uses gw.pl.currency.MonetaryAmount
uses java.util.Date

/**
 * Data Transfer Object ("DTO") to represent a summary of data from an {@link entity.Producer} for use by a WS-I webservice.
 * <p>The specific mappings for {@link ProducerInfoDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>Name</td><td>Producer.Name</td></tr><tr><td>NameKanji</td><td>Producer.NameKanji</td></tr><tr><td>PublicID</td><td>Producer.PublicID</td></tr><tr><td>TotalGrossPremium</td><td>Charge amount total from charges of category Premium on PolicyPeriods</td></tr><tr><td>TotalPastDue</td><td>Total of the Due TAccount balance for all charges on PolicyPeriods</td></tr><tr><td>TotalOutstanding</td><td>Total of the Billed and Due TAccount balance for all charges on PolicyPeriods</td></tr><tr><td>PrimaryAddress</td><td>primary address of the primary producer contact</td></tr><tr><td>InfoDate</td><td>Date and Time this DTO was last updated</td></tr></table></p>
 * Customer configuration: modify this file by adding a property that should be displayed in the summary.
*/
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/ProducerInfoDTO")
final class ProducerInfoDTO {
  var _name               : String         as Name
  var _nameKanji          : String         as NameKanji
  var _publicID           : String         as PublicID
  var _totalGrossPremium  : MonetaryAmount as TotalGrossPremium
  var _totalPastDue       : MonetaryAmount as TotalPastDue
  var _totalOutstanding   : MonetaryAmount as TotalOutstanding
  var _primaryAddress     : AddressDTO     as PrimaryAddress
  var _infoDate           : DateTime       as  InfoDate

  /**
   * Creates a new ProducerInfoDTO that represents the current snapshot state of the supplied Producer.
   * @param that The Producer to be represented.
   */
  static function valueOf(that : Producer) : ProducerInfoDTO {
    return new ProducerInfoDTO().readFrom(that)
  }

  /**
   * Set the fields in this DTO using the supplied Producer
   * @param that The Producer to copy from.
   */
  final function readFrom(that :Producer) : ProducerInfoDTO {
    Name = that.Name
    NameKanji = that.NameKanji
    PublicID = that.PublicID
    TotalGrossPremium = that.TotalGrossPremiumOnPolicyPeriods
    TotalPastDue = that.getTAccountBalanceOnPolicyPeriods(TAccountPatternSuffix.TC_DUE, true)
    TotalOutstanding = that.getTAccountBalanceOnPolicyPeriods(TAccountPatternSuffix.TC_BILLED, true).add(TotalPastDue);
    InfoDate = Date.CurrentDate
    PrimaryAddress = AddressDTO.valueOf(that.PrimaryContact.Contact.PrimaryAddress)
    return this
  }
}