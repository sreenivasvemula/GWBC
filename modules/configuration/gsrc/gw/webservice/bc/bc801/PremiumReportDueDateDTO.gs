package gw.webservice.bc.bc801

uses gw.api.database.Query
uses gw.api.util.StringUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle
uses gw.xml.ws.annotation.WsiExportable
uses java.util.Date
uses java.lang.IllegalStateException

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.PremiumReportDueDate} for use by certain WS-I Web Services in the base product.
 * <p>The specific mappings for {@link PremiumReportDueDateDTO} are as follows:
 * <table border="1"><tr><th>Field</th><th>Maps to</th></tr><tr><td>DelinquencyProcessPublicID</td><td>PremiumReportDueDate.DelinquencyProcess.PublicID</td></tr><tr><td>DueDate</td><td>PremiumReportDueDate.DueDate</td></tr><tr><td>PeriodEndDate</td><td>PremiumReportDueDate.PeriodEndDate</td></tr><tr><td>PeriodStartDate</td><td>PremiumReportDueDate.PeriodStartDate</td></tr><tr><td>PremiumReportBIPublicIDs</td><td>PremiumReportDueDate.PremiumReportBIs*.PublicID</td></tr><tr><td>PremiumReportDDPolicyPeriodPublicID</td><td>PremiumReportDueDate.PremiumReportDDPolicyPeriod.PublicID</td></tr><tr><td>PublicID</td><td>PremiumReportDueDate.PublicID</td></tr></table></p>
 * <br/>Customer configuration: modify this file by adding a property corresponding to each extension column that you add to PremiumReportDueDateDTO.<br/>
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/PremiumReportDueDateDTO")

final class PremiumReportDueDateDTO {
  var _delinquencyProcessPublicID          : String   as DelinquencyProcessPublicID // read-only
  var _dueDate                             : Date     as DueDate // required
  var _periodEndDate                       : Date     as PeriodEndDate
  var _periodStartDate                     : Date     as PeriodStartDate // required
  var _premiumReportBIPublicIDs            : String[] as PremiumReportBIPublicIDs = {} // read-only
  var _premiumReportDDPolicyPeriodPublicID : String   as PremiumReportDDPolicyPeriodPublicID // required
  var _publicID                            : String   as PublicID

  
  construct() { }

  /**
   * Copies the platform-managed fields from the supplied PremiumReportDueDate
   * @param that The PremiumReportDueDate to copy from.
   */
  
  protected function _copyReadOnlyFieldsFrom(that : PremiumReportDueDate) {
    // if field is on base class
      _delinquencyProcessPublicID          = that.DelinquencyProcess.PublicID
      _premiumReportBIPublicIDs            = that.PremiumReportBIs*.PublicID
    //
  }

  /**
   * Answer a new PremiumReportDueDateDTO that represents the current state of the supplied PremiumReportDueDate.
   * @param that The PremiumReportDueDate to be represented.
   */
  
  static function valueOf(that : PremiumReportDueDate) : PremiumReportDueDateDTO {
    return new PremiumReportDueDateDTO().readFrom(that)
  }

  /**
   * Set the fields in this DTO using the supplied PremiumReportDueDate
   * @param that The PremiumReportDueDate to copy from.
   */
  
  final function readFrom(that : PremiumReportDueDate) : PremiumReportDueDateDTO {
    _copyReadOnlyFieldsFrom(that)

    // if field is on base class
      DueDate                              = that.DueDate
      PeriodEndDate                        = that.PeriodEndDate
      PeriodStartDate                      = that.PeriodStartDate
      PremiumReportDDPolicyPeriodPublicID  = that.PremiumReportDDPolicyPeriod.PublicID
      PublicID                             = that.PublicID
    //
    return this
  }

  /**
   * Update the supplied PremiumReportDueDate using the field values stored in this DTO
   * @param that The PremiumReportDueDate to update. Fields DueDate, PeriodStartDate and PremiumReportDDPolicyPeriodPublicID are required when writing to a new PremiumReportDueDate entity.
   * @param (Optional) ignoreNullValues If {@code true}, only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified). If {@code false}, every DTO field will be used to update the PremiumReportDueDate, even those that are null. Usually you will want this to be {@code true}.
   */
  
  final function writeTo(that : PremiumReportDueDate, ignoreNullValues = true) : PremiumReportDueDate {
    _copyReadOnlyFieldsFrom(that)

    checkRequiredFields()

    // if field is on base class
      if (DueDate                             != null or !ignoreNullValues) that.DueDate                             = DueDate
      if (PeriodEndDate                       != null or !ignoreNullValues) that.PeriodEndDate                       = PeriodEndDate
      if (PeriodStartDate                     != null or !ignoreNullValues) that.PeriodStartDate                     = PeriodStartDate
      if (PremiumReportDDPolicyPeriodPublicID != null or !ignoreNullValues) that.PremiumReportDDPolicyPeriod         = PremiumReportDDPolicyPeriod
      if (PublicID                            != null or !ignoreNullValues) that.PublicID                            = PublicID
    //
    return that
  }

  /**
   * Uses the createNew block to create a new PremiumReportDueDate, adds it to the supplied bundle, then updates it using the field values stored in this DTO. The ignoreNullValues parameter controls how the fields that are null are treated.
   * @param bundle The bundle in which to create the new PremiumReportDueDate.
   * @param createNew (Optional) A block that returns a new instance of PremiumReportDueDate. If this is null, the default constructor will be used.
   * @param ignoreNullValues (Optional) If {@code true}, only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified). If {@code false}, every DTO field will be used to update the PremiumReportDueDate, even those that are null. Usually you will want this to be {@code true}.
   */
  
  final function writeToNewIn(bundle : Bundle, createNew : block() : PremiumReportDueDate = null, ignoreNullValues = true) : PremiumReportDueDate {
    var premiumReportDDPolicyPeriod = this.PremiumReportDDPolicyPeriod
    var currency = premiumReportDDPolicyPeriod.Currency
    if (createNew == null) {
      createNew = \ -> bundle == null ? new PremiumReportDueDate(currency) : new PremiumReportDueDate(currency, bundle)
    }
    var instance = createNew()

    if (bundle != null) {
      instance = bundle.add(instance)
    }
    instance.PremiumReportDDPolicyPeriod = premiumReportDDPolicyPeriod
    return writeTo(instance, ignoreNullValues)
  }

  final function checkRequiredFields() {
    var missingRequiredFields = {} as List<String>

    if (DueDate                              == null  ) missingRequiredFields.add(':DueDate')
    if (PeriodStartDate                      == null  ) missingRequiredFields.add(':PeriodStartDate')
    if (PremiumReportDDPolicyPeriodPublicID  == null  ) missingRequiredFields.add(':PremiumReportDDPolicyPeriodPublicID')

    if (missingRequiredFields.HasElements) {
      throw new IllegalStateException("Not legal to write from the DTO when there are missing required fields:" + missingRequiredFields.join(", "))
    }
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only  useful for debugging purposes.
   */
  
  override final function toString() : String {
    var fields = {} as List<String>

    if (DelinquencyProcessPublicID         .HasContent) fields.add(':DelinquencyProcessPublicID          = ' + StringUtil.enquote(DelinquencyProcessPublicID))
    if (DueDate                              != null  ) fields.add(':DueDate                             = ' + StringUtil.enquote(DueDate.toString()) + ' as Date')
    if (PeriodEndDate                        != null  ) fields.add(':PeriodEndDate                       = ' + StringUtil.enquote(PeriodEndDate.toString()) + ' as Date')
    if (PeriodStartDate                      != null  ) fields.add(':PeriodStartDate                     = ' + StringUtil.enquote(PeriodStartDate.toString()) + ' as Date')
    if (PremiumReportBIPublicIDs          .HasElements) fields.add(':PremiumReportBIPublicIDs            = ' + StringUtil.enquote(PremiumReportBIPublicIDs.join(", ")))
    if (PremiumReportDDPolicyPeriodPublicID.HasContent) fields.add(':PremiumReportDDPolicyPeriodPublicID = ' + StringUtil.enquote(PremiumReportDDPolicyPeriodPublicID))
    if (PublicID                           .HasContent) fields.add(':PublicID                            = ' + StringUtil.enquote(PublicID))

    return "new PremiumReportDueDateDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

  
  /** Convenience property that answers the {@link DelinquencyProcess} whose PublicID is {@code DelinquencyProcessPublicID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  
  property get DelinquencyProcess()               : DelinquencyProcess{ return fetchByID(DelinquencyProcessPublicID) }
  
  /** Convenience property that answers a {@link PremiumReportBI[]} of the objects whose PublicIDs are in {@code PremiumReportBIPublicIDs}. This property is only available on the server--it is not exposed through the WS-I layer. */
  
  property get PremiumReportBIs()                 : PremiumReportBI[]{ return fetchByID(PremiumReportBIPublicIDs) }
  
  /** Convenience property that answers the {@link PolicyPeriod} whose PublicID is {@code PremiumReportDDPolicyPeriodPublicID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  
  property get PremiumReportDDPolicyPeriod()      : PolicyPeriod{ return fetchByID(PremiumReportDDPolicyPeriodPublicID) }


  /**
   * Answer whether the fields tracked by this DTO match the same fields in the other DTO
   * @param that The PremiumReportDueDateDTO to compare against.
   */
  
  override final function equals(that : Object) : boolean {
    if (that typeis PremiumReportDueDateDTO) {
      return DelinquencyProcessPublicID          == that.DelinquencyProcessPublicID
         and DueDate                             == that.DueDate
         and PeriodEndDate                       == that.PeriodEndDate
         and PeriodStartDate                     == that.PeriodStartDate
         and PremiumReportDDPolicyPeriodPublicID == that.PremiumReportDDPolicyPeriodPublicID
         and PublicID                            == that.PublicID
    }
    return super.equals(that)
  }

  /**
   * Answer the hash code of this object.
   */
  
  override final function hashCode() : int {
    return {
      DelinquencyProcessPublicID,
      DueDate,
      PeriodEndDate,
      PeriodStartDate,
      PremiumReportDDPolicyPeriodPublicID,
      PublicID
    }.reduce(17, \ hashCode, obj -> 31 * hashCode + obj?.hashCode())
  }

  /**
   * Answer all of the PremiumReportDueDate instances whose public IDs are in the supplied list, or an empty array if the supplied list is null or empty.
   * @param publicIDs A list of the PublicIDs.
   */
  
  private static function fetchByID<T extends KeyableBean>(publicIDs : String[]) : T[] {
    var results : T[] = {}
    if (publicIDs.HasElements) {
      results = Query.make(T)
          .compareIn(T#PublicID, publicIDs)
          .select()
          .toTypedArray()
      var badIDs = publicIDs.subtract(results*.PublicID)
      if (badIDs.HasElements) throw BadIdentifierException.badPublicId(T, "{" + badIDs.join(", ") + "}")
    }
    return results
  }

  /**
   * Answer the PremiumReportDueDate whose public ID is in the supplied list, or null if the publicID is null.
   * @param publicIDs A list of the PublicIDs.
   */
  
  private static function fetchByID<T extends KeyableBean>(publicID : String) : T {
    var result : T
    if (publicID != null) {
      result = Query.make(T)
          .compare(T#PublicID, Equals, publicID)
          .select()
          .AtMostOneRow
      if (result == null) throw BadIdentifierException.badPublicId(T, publicID)
    }
    return result
  }
}