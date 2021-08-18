package gw.webservice.bc.bc801

uses gw.api.database.Query
uses gw.api.util.StringUtil
uses gw.api.webservice.exception.BadIdentifierException
uses gw.entity.IEntityType
uses gw.pl.persistence.core.Bundle
uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date
uses java.util.List

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.Document} for use by the WS-I layer.
 * <p>Fields are mapped according to the following rules:
 * <ul><li>Primitive values are copied directly</li><li>Typekey fields are copied directly (the WS-I layer translates them to/from WS-I enums)</li><li>Foreign keys fields are represented by the target object's PublicID</li><li>Arraykey fields are represented by an array of the PublicIDs of the elements in the array</li></ul></p>
 * <p>The specific mappings for {@link DocumentDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>Author</td><td>Document.Author</td></tr><tr><td>DateCreated</td><td>Document.DateCreated</td></tr><tr><td>DateModified</td><td>Document.DateModified</td></tr><tr><td>Description</td><td>Document.Description</td></tr><tr><td>DMS</td><td>Document.DMS</td></tr><tr><td>DocUID</td><td>Document.DocUID</td></tr><tr><td>DocumentIdentifier</td><td>Document.DocumentIdentifier</td></tr><tr><td>Inbound</td><td>Document.Inbound</td></tr><tr><td>Language</td><td>Document.Language</td></tr><tr><td>MimeType</td><td>Document.MimeType</td></tr><tr><td>Name</td><td>Document.Name</td></tr><tr><td>Obsolete</td><td>Document.Obsolete</td></tr><tr><td>PendingDocUID</td><td>Document.PendingDocUID</td></tr><tr><td>PublicID</td><td>Document.PublicID</td></tr><tr><td>Recipient</td><td>Document.Recipient</td></tr><tr><td>Section</td><td>Document.Section</td></tr><tr><td>SecurityType</td><td>Document.SecurityType</td></tr><tr><td>Status</td><td>Document.Status</td></tr><tr><td>Type</td><td>Document.Type</td></tr></table></p>
 *
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the Document entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/DocumentDTO")
final class DocumentDTO {
  var _author             : String                       as Author
  var _dateCreated        : Date                         as DateCreated
  var _dateModified       : Date                         as DateModified
  var _description        : String                       as Description
  var _DMS                : Boolean                      as DMS
  var _docUID             : String                       as DocUID
  var _documentIdentifier : String                       as DocumentIdentifier
  var _inbound            : Boolean                      as Inbound
  var _language           : typekey.LanguageType         as Language
  var _mimeType           : String                       as MimeType
  var _name               : String                       as Name
  var _obsolete           : Boolean                      as Obsolete
  var _pendingDocUID      : String                       as PendingDocUID
  var _publicID           : String                       as PublicID
  var _recipient          : String                       as Recipient
  var _section            : typekey.DocumentSection      as Section
  var _securityType       : typekey.DocumentSecurityType as SecurityType
  var _status             : typekey.DocumentStatusType   as Status
  var _type               : typekey.DocumentType         as Type

  /**
   * Answer a new DocumentDTO that represents the current state of the supplied Document.
   * @param that The Document to be represented.
   */
  static function valueOf(that : Document) : DocumentDTO {
    return new DocumentDTO().readFrom(that)
  }

  /**
   * Answer all of the Document instances whose public IDs are in the supplied list, or an empty array if the supplied list is null or empty.
   * @param publicIDs A list of the PublicIDs.
   */
  private static function fetchByID<T extends KeyableBean>(publicIDs : String[]) : T[] {
    var results : T[] = {}
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
   * Answer the Document whose public ID is in the supplied list, or null if the publicID is null.
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


  construct() { }

  /**
   * Answer whether the fields tracked by this DTO match the same fields in the other DTO
   * @param that The DocumentDTO to compare against.
   */
  override final function equals(that : Object) : boolean {
    if (that typeis DocumentDTO) {
      return Author             == that.Author
         and DateCreated        == that.DateCreated
         and DateModified       == that.DateModified
         and Description        == that.Description
         and DMS                == that.DMS
         and DocUID             == that.DocUID
         and DocumentIdentifier == that.DocumentIdentifier
         and Inbound            == that.Inbound
         and Language           == that.Language
         and MimeType           == that.MimeType
         and Name               == that.Name
         and Obsolete           == that.Obsolete
         and PendingDocUID      == that.PendingDocUID
         and PublicID           == that.PublicID
         and Recipient          == that.Recipient
         and Section            == that.Section
         and SecurityType       == that.SecurityType
         and Status             == that.Status
         and Type               == that.Type
    }
    return super.equals(that)
  }

  /**
   * Answer the hash code of this object.
   */
  override final function hashCode() : int {
    return {
      Author,
      DateCreated,
      DateModified,
      Description,
      DMS,
      DocUID,
      DocumentIdentifier,
      Inbound,
      Language,
      MimeType,
      Name,
      Obsolete,
      PendingDocUID,
      PublicID,
      Recipient,
      Section,
      SecurityType,
      Status,
      Type
    }.reduce(17, \ hashCode, obj -> 31 * hashCode + obj?.hashCode())
  }

  /**
   * Copies the platform-managed fields from the supplied Document
   * @param that The Document to copy from.
   */
  protected function _copyReadOnlyFieldsFrom(that : Document) {
    
  }

  /**
   * Set the fields in this DTO using the supplied Document
   * @param that The Document to copy from.
   */
  final function readFrom(that : Document) : DocumentDTO {
    _copyReadOnlyFieldsFrom(that)

    // if field is on base class
      Author             = that.Author
      DMS                = that.DMS
      DateCreated        = that.DateCreated
      DateModified       = that.DateModified
      Description        = that.Description
      DocUID             = that.DocUID
      DocumentIdentifier = that.DocumentIdentifier
      Inbound            = that.Inbound
      Language           = that.Language
      MimeType           = that.MimeType
      Name               = that.Name
      Obsolete           = that.Obsolete
      PendingDocUID      = that.PendingDocUID
      PublicID           = that.PublicID
      Recipient          = that.Recipient
      Section            = that.Section
      SecurityType       = that.SecurityType
      Status             = that.Status
      Type               = that.Type
    //
    return this
  }

  /**
   * Update the supplied Document using the non-null field values stored in this DTO.
   * @param that The Document to update.
   */
  final function writeTo(that : Document) : Document { return writeTo(that, false) }

  /**
   * Update the supplied Document using the field values stored in this DTO
   * @param that The Document to update.
   * @param treatNullAsLegalValue If {@code true}, every DTO field will be used to update the Document, even those that
   * are null. If {@code false}, only those fields that are non-null are used (i.e. the null-valued fields are treated
   * as if they were unspecified). Usually you will want this to be {@code false}.
   */
  final function writeTo(that : Document, treatNullAsLegalValue : boolean) : Document {
    _copyReadOnlyFieldsFrom(that)

    // if field is on base class
      if (Author             != null or treatNullAsLegalValue) that.Author             = Author
      if (DMS                != null or treatNullAsLegalValue) that.DMS                = DMS
      if (DateCreated        != null or treatNullAsLegalValue) that.DateCreated        = DateCreated
      if (DateModified       != null or treatNullAsLegalValue) that.DateModified       = DateModified
      if (Description        != null or treatNullAsLegalValue) that.Description        = Description
      if (DocUID             != null or treatNullAsLegalValue) that.DocUID             = DocUID
      if (DocumentIdentifier != null or treatNullAsLegalValue) that.DocumentIdentifier = DocumentIdentifier
      if (Inbound            != null or treatNullAsLegalValue) that.Inbound            = Inbound
      if (Language           != null or treatNullAsLegalValue) that.Language           = Language
      if (MimeType           != null or treatNullAsLegalValue) that.MimeType           = MimeType
      if (Name               != null or treatNullAsLegalValue) that.Name               = Name
      if (Obsolete           != null or treatNullAsLegalValue) that.Obsolete           = Obsolete
      if (PendingDocUID      != null or treatNullAsLegalValue) that.PendingDocUID      = PendingDocUID
      if (PublicID           != null or treatNullAsLegalValue) that.PublicID           = PublicID
      if (Recipient          != null or treatNullAsLegalValue) that.Recipient          = Recipient
      if (Section            != null or treatNullAsLegalValue) that.Section            = Section
      if (SecurityType       != null or treatNullAsLegalValue) that.SecurityType       = SecurityType
      if (Status             != null or treatNullAsLegalValue) that.Status             = Status
      if (Type               != null or treatNullAsLegalValue) that.Type               = Type
    //
    return that
  }

  /**
   * Creates a new Document using the default constructor, adds it to the supplied bundle, then updates it using the field values stored in this DTO. Only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified).
   * @param bundle The bundle in which to create the new Document.
   */
  final function writeToNewEntityIn(bundle : Bundle) : Document { return writeToNewEntityIn(bundle, null, null) }

  /**
   * Uses the createNew block to create a new Document, adds it to the supplied bundle, then updates it using the field values stored in this DTO. Only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified).
   * @param bundle The bundle in which to create the new Document.
   * @param createNew A block that returns a new instance of Document. If this is null the default constructor will be used.
   */
  final function writeToNewEntityIn(bundle : Bundle, createNew : block() : Document) : Document { return writeToNewEntityIn(bundle, createNew, null) }

  /**
   * Uses the createNew block to create a new Document, adds it to the supplied bundle, then updates it using the field values stored in this DTO. The treatNullAsLegalValue parameter controls how the fields that are null are treated.
   * @param bundle The bundle in which to create the new Document.
   * @param createNew A block that returns a new instance of Document. If this is null, the default constructor will be used.
   * @param treatNullAsLegalValue If {@code true}, every DTO field will be used to update the Document, even those that are null. If {@code false}, only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified). Usually you will want this to be the default value, {@code false}.
   */
  final function writeToNewEntityIn(bundle : Bundle, createNew : block() : Document, treatNullAsLegalValue : boolean) : Document {
    if (createNew == null) createNew = \ -> bundle == null ? new Document() : new Document(bundle) 
    var instance = createNew()

    if (bundle != null) instance = bundle.add(instance)
    return writeTo(instance, treatNullAsLegalValue)
  }

  /**
   * Provides a rough idea of the command needed to re-create this DTO. Because it is rough it is probably only  useful for debugging purposes.
   */
  override final function toString() : String {
    var fields = {} as List<String>

    if (Author            .HasContent) fields.add(':Author             = ' + StringUtil.enquote(Author))
    if (DateCreated         != null  ) fields.add(':DateCreated        = ' + StringUtil.enquote(DateCreated.toString()) + ' as Date')
    if (DateModified        != null  ) fields.add(':DateModified       = ' + StringUtil.enquote(DateModified.toString()) + ' as Date')
    if (Description       .HasContent) fields.add(':Description        = ' + StringUtil.enquote(Description))
    if (DMS                 == true  ) fields.add(':DMS                = true')
    if (DocUID            .HasContent) fields.add(':DocUID             = ' + StringUtil.enquote(DocUID))
    if (DocumentIdentifier.HasContent) fields.add(':DocumentIdentifier = ' + StringUtil.enquote(DocumentIdentifier))
    if (Inbound             == true  ) fields.add(':Inbound            = true')
    if (Language            != null  ) fields.add(':Language           = typekey.LanguageType.get("' + Language.Code + '")')
    if (MimeType          .HasContent) fields.add(':MimeType           = ' + StringUtil.enquote(MimeType))
    if (Name              .HasContent) fields.add(':Name               = ' + StringUtil.enquote(Name))
    if (Obsolete            == true  ) fields.add(':Obsolete           = true')
    if (PendingDocUID     .HasContent) fields.add(':PendingDocUID      = ' + StringUtil.enquote(PendingDocUID))
    if (PublicID          .HasContent) fields.add(':PublicID           = ' + StringUtil.enquote(PublicID))
    if (Recipient         .HasContent) fields.add(':Recipient          = ' + StringUtil.enquote(Recipient))
    if (Section             != null  ) fields.add(':Section            = typekey.DocumentSection.get("' + Section.Code + '")')
    if (SecurityType        != null  ) fields.add(':SecurityType       = typekey.DocumentSecurityType.get("' + SecurityType.Code + '")')
    if (Status              != null  ) fields.add(':Status             = typekey.DocumentStatusType.get("' + Status.Code + '")')
    if (Type                != null  ) fields.add(':Type               = typekey.DocumentType.get("' + Type.Code + '")')

    return "new DocumentDTO() {\n  " + fields.join(",\n  ") + "\n}"
  }

  
}