package gw.webservice.bc.bc801

uses gw.api.database.Query
uses gw.api.util.StringUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.entity.IEntityType
uses gw.pl.persistence.core.Bundle
uses gw.xml.ws.annotation.WsiExportable

uses java.lang.IllegalStateException
uses java.util.Date

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.TroubleTicket} for use by the WS-I layer.
 * <p>Fields are mapped according to the following rules:
 * <ul><li>Primitive values are copied directly</li><li>Typekey fields are copied directly (the WS-I layer translates them to/from WS-I enums)</li><li>Foreign keys fields are represented by the target object's PublicID</li><li>Arraykey fields are represented by an array of the PublicIDs of the elements in the array</li></ul></p>
 * <p>The specific mappings for {@link TroubleTicketDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>CloseUserPublicID</td><td>TroubleTicket.CloseUser.PublicID</td></tr><tr><td>DetailedDescription</td><td>TroubleTicket.DetailedDescription</td></tr><tr><td>EscalationDate</td><td>TroubleTicket.EscalationDate</td></tr><tr><td>HoldPublicID</td><td>TroubleTicket.Hold.PublicID</td></tr><tr><td>Priority</td><td>TroubleTicket.Priority</td></tr><tr><td>PublicID</td><td>TroubleTicket.PublicID</td></tr><tr><td>TargetDate</td><td>TroubleTicket.TargetDate</td></tr><tr><td>TicketType</td><td>TroubleTicket.TicketType</td></tr><tr><td>Title</td><td>TroubleTicket.Title</td></tr><tr><td>TroubleTicketNumber</td><td>TroubleTicket.TroubleTicketNumber</td></tr></table></p>
 *
 *
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the TroubleTicket entity.
 */
@Export
@WsiExportable ("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/TroubleTicketDTO")
final class TroubleTicketDTO {
  var _closeUserPublicID   : String                    as CloseUserPublicID
  var _detailedDescription : String                    as DetailedDescription // nullok=false
  var _escalationDate      : Date                      as EscalationDate
  var _holdPublicID        : String                    as HoldPublicID
  var _priority            : typekey.Priority          as Priority
  var _publicID            : String                    as PublicID
  var _targetDate          : Date                      as TargetDate
  var _ticketType          : typekey.TroubleTicketType as TicketType
  var _title               : String                    as Title // nullok=false
  var _troubleTicketNumber : String                    as TroubleTicketNumber

  /**
   * Set the fields in this DTO using the supplied TroubleTicket
   * @param that The TroubleTicket to copy from.
   */
  final function readFrom(that : TroubleTicket) : TroubleTicketDTO {

    // sync up ReadOnly fields
    _copyReadOnlyFieldsFrom(that)

    DetailedDescription  = that.DetailedDescription
    EscalationDate       = that.EscalationDate
    Priority             = that.Priority
    TargetDate           = that.TargetDate
    TicketType           = that.TicketType
    Title                = that.Title
    //
    return this
  }

  /**
   * Create a new TroubleTicket in the supplied bundle then update it using the field values stored in this DTO.
   * @param bundle The bundle in which to create the new TroubleTicket.
   */
  final function writeToNewIn(bundle : Bundle) : TroubleTicket { return writeTo(new TroubleTicket(bundle)) }

   /**
   * Update the supplied TroubleTicket using the field values stored in this DTO
   * @param that The TroubleTicket to update.
   */
  final function writeTo(that : TroubleTicket) : TroubleTicket {

    if (DetailedDescription.Empty or Title.Empty) {
      throw new IllegalStateException("'DetailedDescription' and 'Title' are required fields.")
    }

    // sync up ReadOnly fields
    _copyReadOnlyFieldsFrom(that)

    var treatNullAsLegalValue = false
    if (DetailedDescription != null or treatNullAsLegalValue) that.DetailedDescription = DetailedDescription
    if (EscalationDate      != null or treatNullAsLegalValue) that.EscalationDate      = EscalationDate
    if (Priority            != null or treatNullAsLegalValue) that.Priority            = Priority
    if (PublicID            != null or treatNullAsLegalValue) that.PublicID            = PublicID
    if (TargetDate          != null or treatNullAsLegalValue) that.TargetDate          = TargetDate
    if (TicketType          != null or treatNullAsLegalValue) that.TicketType          = TicketType
    if (Title               != null or treatNullAsLegalValue) that.Title               = Title
    //
    return that
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only  useful for debugging purposes.
   */
  override final function toString() : String {
    var fields = {} as List<String>

    if (CloseUserPublicID  .HasContent) fields.add(':CloseUserID         = ' + StringUtil.enquote(CloseUserPublicID))
    if (DetailedDescription.HasContent) fields.add(':DetailedDescription = ' + StringUtil.enquote(DetailedDescription))
    if (EscalationDate       != null  ) fields.add(':EscalationDate      = ' + StringUtil.enquote(EscalationDate.toString()) + ' as Date')
    if (HoldPublicID       .HasContent) fields.add(':HoldID              = ' + StringUtil.enquote(HoldPublicID))
    if (Priority             != null  ) fields.add(':Priority            = typekey.Priority.get("' + Priority.Code + '")')
    if (PublicID           .HasContent) fields.add(':PublicID            = ' + StringUtil.enquote(PublicID))
    if (TargetDate           != null  ) fields.add(':TargetDate          = ' + StringUtil.enquote(TargetDate.toString()) + ' as Date')
    if (TicketType           != null  ) fields.add(':TicketType          = typekey.TroubleTicketType.get("' + TicketType.Code + '")')
    if (Title              .HasContent) fields.add(':Title               = ' + StringUtil.enquote(Title))
    if (TroubleTicketNumber.HasContent) fields.add(':TroubleTicketNumber = ' + StringUtil.enquote(TroubleTicketNumber))

    return "new TroubleTicketDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

  /** Convenience property that answers the {@link User} whose PublicID is {@code CloseUserPublicID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  property get CloseUser()        : User                     { return fetchByID(CloseUserPublicID) }
  
  /** Convenience property that answers the {@link Hold} whose PublicID is {@code HoldPublicID}, or {@code null} if PublicID is {@code null}. This property is only available on the server--it is not exposed through the WS-I layer. */
  property get Hold()             : Hold                     { return fetchByID(HoldPublicID) }

  /**
   * Copies the platform-managed fields from the supplied TroubleTicket
   * @param that The TroubleTicket to copy from.
   */
  private function _copyReadOnlyFieldsFrom(that : TroubleTicket) {
    // if field is on base class
    _closeUserPublicID   = that.CloseUser.PublicID
    _holdPublicID        = that.Hold.PublicID
    _troubleTicketNumber = that.TroubleTicketNumber
  }

  /**
   * Answer the TroubleTicket whose public ID is in the supplied list, or null if the publicID is null.
   * @param publicIDs A list of the PublicIDs.
   */
  private static function fetchByID<T extends KeyableBean>(publicID : String) : T {
    var result : T
    if (publicID != null) {
      result = new Query(T as IEntityType)
          .compare(T#PublicID, Equals, publicID)
          .select()
          .AtMostOneRow as T
      if (result == null) throw BadIdentifierException.badPublicId(T, publicID)
    }
    return result
  }
}