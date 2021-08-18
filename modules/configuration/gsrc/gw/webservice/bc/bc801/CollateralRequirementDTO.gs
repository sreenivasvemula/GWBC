package gw.webservice.bc.bc801

uses gw.api.database.Query
uses gw.api.util.StringUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.SOAPException
uses gw.entity.IEntityType
uses gw.pl.persistence.core.Bundle
uses gw.xml.ws.annotation.WsiExportable
uses java.util.Date
uses javax.annotation.Generated
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.CollateralRequirement} for use by the WS-I layer.
 * <p>Fields are mapped according to the following rules:
 * <ul><li>Primitive values are copied directly</li><li>Typekey fields are copied directly (the WS-I layer translates them to/from WS-I enums)</li><li>Foreign keys fields are represented by the target object's PublicID</li><li>Arraykey fields are represented by an array of the PublicIDs of the elements in the array</li></ul></p>
 * <p>The specific mappings for {@link CollateralRequirementDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>CollateralPublicID</td><td>CollateralRequirement.Collateral.PublicID</td></tr><tr><td>EffectiveDate</td><td>CollateralRequirement.EffectiveDate</td></tr><tr><td>ExpirationDate</td><td>CollateralRequirement.ExpirationDate</td></tr><tr><td>PolicyPublicID</td><td>CollateralRequirement.Policy.PublicID</td></tr><tr><td>PolicyPeriodPublicID</td><td>CollateralRequirement.PolicyPeriod.PublicID</td></tr><tr><td>PublicID</td><td>CollateralRequirement.PublicID</td></tr><tr><td>Required</td><td>CollateralRequirement.Required</td></tr><tr><td>RequirementName</td><td>CollateralRequirement.RequirementName</td></tr><tr><td>RequirementType</td><td>CollateralRequirement.RequirementType</td></tr><tr><td>Segregated</td><td>CollateralRequirement.Segregated</td></tr></table></p>
 *
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the Document entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/CollateralRequirementDTO")
final class CollateralRequirementDTO {
  /** Derived from CollateralRequirement#Collateral.PublicID */
  var _collateralID: String as CollateralPublicID
  var _effectiveDate: Date as EffectiveDate
  var _expirationDate: Date as ExpirationDate
  /** Derived from CollateralRequirement#Policy.PublicID */
  var _policyID: String as PolicyPublicID
  /** Derived from CollateralRequirement#PolicyPeriod.PublicID */
  var _policyPeriodID: String as PolicyPeriodPublicID
  var _publicID: String as PublicID
  var _required: gw.pl.currency.MonetaryAmount as Required
  var _requirementName: String as RequirementName
  var _requirementType: CollateralRequirementType as RequirementType
  var _segregated: Boolean as Segregated
  /**
   * Answer a new CollateralRequirementDTO that represents the current state of the supplied CollateralRequirement.
   * @param that The CollateralRequirement to be represented.
   */
  static function valueOf(that: CollateralRequirement): CollateralRequirementDTO {
    return new CollateralRequirementDTO().readFrom(that)
  }

  /**
   * Answer all of the CollateralRequirement instances whose public IDs are in the supplied list, or an empty array if the supplied list is null or empty.
   * @param publicIDs A list of the PublicIDs.
   */
  private static function fetchByID<T extends KeyableBean>(publicIDs: String[]): T[] {
    var results: T[] = {}
    if (publicIDs.HasElements) {
      results = new Query(T as IEntityType)
          .compareIn(T#PublicID, publicIDs)
          .select()
          .toTypedArray() as T[]
      var badIDs = publicIDs.subtract(results*.PublicID)
      if (badIDs.HasElements) throw BadIdentifierException.badPublicId(T, "{" + badIDs.join(", ") + "}")
    }
    return results
  }

  /**
   * Answer the CollateralRequirement whose public ID is in the supplied list, or null if the publicID is null.
   * @param publicIDs A list of the PublicIDs.
   */
  private static function fetchByID<T extends KeyableBean>(publicID: String): T {
    var result: T
    if (publicID != null) {
      result = new Query(T as IEntityType)
          .compare(T#PublicID, Equals, publicID)
          .select()
          .AtMostOneRow as T
      if (result == null) throw BadIdentifierException.badPublicId(T, publicID)
    }
    return result
  }

  construct() {
  }

  /**
   * Answer whether the fields tracked by this DTO match the same fields in the other DTO
   * @param that The CollateralRequirementDTO to compare against.
   */
  override final function equals(that: Object): boolean {
    if (that typeis CollateralRequirementDTO) {
      return CollateralPublicID == that.CollateralPublicID
          and EffectiveDate == that.EffectiveDate
          and ExpirationDate == that.ExpirationDate
          and PolicyPublicID == that.PolicyPublicID
          and PolicyPeriodPublicID == that.PolicyPeriodPublicID
          and PublicID == that.PublicID
          and Required == that.Required
          and RequirementName == that.RequirementName
          and RequirementType == that.RequirementType
          and Segregated == that.Segregated
    }
    return super.equals(that)
  }

  /**
   * Answer the hash code of this object.
   */
  override final function hashCode(): int {
    return {
        CollateralPublicID,
        EffectiveDate,
        ExpirationDate,
        PolicyPublicID,
        PolicyPeriodPublicID,
        PublicID,
        Required,
        RequirementName,
        RequirementType,
        Segregated
    }.reduce(17, \hashCode, obj -> 31 * hashCode + obj?.hashCode())
  }

  /**
   * Copies the platform-managed fields from the supplied CollateralRequirement
   * @param that The CollateralRequirement to copy from.
   */
  protected function _copyReadOnlyFieldsFrom(that: CollateralRequirement) {
  }

  /**
   * Set the fields in this DTO using the supplied CollateralRequirement
   * @param that The CollateralRequirement to copy from.
   */
  final function readFrom(that: CollateralRequirement): CollateralRequirementDTO {
    _copyReadOnlyFieldsFrom(that)
    // if field is on base class
    CollateralPublicID = that.Collateral.PublicID
    EffectiveDate = that.EffectiveDate
    ExpirationDate = that.ExpirationDate
    PolicyPublicID = that.Policy.PublicID
    PolicyPeriodPublicID = that.PolicyPeriod.PublicID
    PublicID = that.PublicID
    Required = that.Required
    RequirementName = that.RequirementName
    RequirementType = that.RequirementType
    Segregated = that.Segregated
    //
    return this
  }

  /**
   * Update the supplied CollateralRequirement using the field values stored in this DTO
   * @param that The CollateralRequirement to update.
   * @param (Optional) ignoreNullValues If {@code true}, only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified). If {@code false}, every DTO field will be used to update the CollateralRequirement, even those that are null. Usually you will want this to be {@code true}.
   */
  final function writeTo(that: CollateralRequirement, ignoreNullValues = true): CollateralRequirement {
    _copyReadOnlyFieldsFrom(that)
    // if field is on base class
    if (CollateralPublicID != null or !ignoreNullValues) that.Collateral = WebserviceEntityLoader.loadCollateral(CollateralPublicID)
    if (EffectiveDate != null or !ignoreNullValues) that.EffectiveDate = EffectiveDate
    if (ExpirationDate != null or !ignoreNullValues) that.ExpirationDate = ExpirationDate
    if (PolicyPublicID != null or !ignoreNullValues) {
      var policy = WebserviceEntityLoader.loadPolicy(PolicyPublicID)
      if (policy.Account != that.Collateral.Account) {
        throw new SOAPException(displaykey.BCAPI.Error.CollateralRequirement.PolicyDoesNotBelongToAccount(PolicyPublicID, that.Collateral.Account.PublicID, that.Collateral.PublicID))
      } else {
        that.Policy = policy
      }
    }
    if (PolicyPeriodPublicID != null or !ignoreNullValues) {
      var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(PolicyPeriodPublicID)
      if (policyPeriod.Account != that.Collateral.Account) {
        throw new SOAPException(displaykey.BCAPI.Error.CollateralRequirement.PolicyPeriodDoesNotBelongToAccount(PolicyPeriodPublicID, that.Collateral.Account.PublicID, that.Collateral.PublicID))
      } else {
        that.PolicyPeriod = policyPeriod
      }
    }
    if (PublicID != null or !ignoreNullValues) that.PublicID = PublicID
    if (Required != null or !ignoreNullValues) that.Required = Required
    if (RequirementName != null or !ignoreNullValues) that.RequirementName = RequirementName
    if (RequirementType != null or !ignoreNullValues) that.RequirementType = RequirementType
    if (Segregated != null or !ignoreNullValues) that.Segregated = Segregated
    //
    return that
  }

  /**
   * Uses the createNew block to create a new CollateralRequirement, adds it to the supplied bundle, then updates it using the field values stored in this DTO. The ignoreNullValues parameter controls how the fields that are null are treated.
   * @param bundle The bundle in which to create the new CollateralRequirement.
   * @param createNew (Optional) A block that returns a new instance of CollateralRequirement. If this is null, the default constructor will be used.
   * @param ignoreNullValues (Optional) If {@code true}, only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified). If {@code false}, every DTO field will be used to update the CollateralRequirement, even those that are null. Usually you will want this to be {@code true}.
   */
  final function writeToNewEntityIn(bundle: Bundle, createNew: block(): CollateralRequirement = null, ignoreNullValues = true): CollateralRequirement {
    if (createNew == null) createNew = \-> bundle == null ? new CollateralRequirement(WebserviceEntityLoader.loadCollateral(CollateralPublicID).Currency) : new CollateralRequirement(WebserviceEntityLoader.loadCollateral(CollateralPublicID).Currency, bundle)
    var instance = createNew()
    if (bundle != null) instance = bundle.add(instance)
    return writeTo(instance, ignoreNullValues)
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only  useful for debugging purposes.
   */
  override final function toString(): String {
    var fields = {} as List<String>
    if (CollateralPublicID.HasContent) fields.add(':CollateralID    = ' + StringUtil.enquote(CollateralPublicID))
    if (EffectiveDate != null) fields.add(':EffectiveDate   = ' + StringUtil.enquote(EffectiveDate.toString()) + ' as Date')
    if (ExpirationDate != null) fields.add(':ExpirationDate  = ' + StringUtil.enquote(ExpirationDate.toString()) + ' as Date')
    if (PolicyPublicID.HasContent) fields.add(':PolicyID        = ' + StringUtil.enquote(PolicyPublicID))
    if (PolicyPeriodPublicID.HasContent) fields.add(':PolicyPeriodID  = ' + StringUtil.enquote(PolicyPeriodPublicID))
    if (PublicID.HasContent) fields.add(':PublicID        = ' + StringUtil.enquote(PublicID))
    if (Required != null) fields.add(':Required        = ' + Required)
    if (RequirementName.HasContent) fields.add(':RequirementName = ' + StringUtil.enquote(RequirementName))
    if (RequirementType != null) fields.add(':RequirementType = CollateralRequirementType.get("' + RequirementType.Code + '")')
    if (Segregated != null) fields.add(':Segregated      = ' + Segregated)
    return "new CollateralRequirementDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

  /** Convenience property that answers the {@link Collateral} whose PublicID is {@code CollateralID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  @Generated("DTOBuilder", "DO NOT edit this method directly!", "2013-11-19T14:13Z")
  property get Collateral(): Collateral {
    return fetchByID(CollateralPublicID)
  }

  /** Convenience property that answers the {@link Policy} whose PublicID is {@code PolicyID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  @Generated("DTOBuilder", "DO NOT edit this method directly!", "2013-11-19T14:13Z")
  property get Policy(): Policy {
    return fetchByID(PolicyPublicID)
  }

  /** Convenience property that answers the {@link PolicyPeriod} whose PublicID is {@code PolicyPeriodID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  @Generated("DTOBuilder", "DO NOT edit this method directly!", "2013-11-19T14:13Z")
  property get PolicyPeriod(): PolicyPeriod {
    return fetchByID(PolicyPeriodPublicID)
  }
}