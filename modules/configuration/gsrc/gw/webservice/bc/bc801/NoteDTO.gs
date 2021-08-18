package gw.webservice.bc.bc801

uses gw.pl.persistence.core.Bundle
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.xml.ws.annotation.WsiExportable

uses java.util.Date

/**
 * Data Transfer Object ("DTO") to represent an instance of {@link entity.Note} for use by the WS-I layer.
 * <p>Fields are mapped according to the following rules:
 * <ul><li>Primitive values are copied directly</li><li>Typekey fields are copied directly (the WS-I layer translates them to/from WS-I enums)</li><li>Foreign keys fields are represented by the target object's PublicID</li><li>Arraykey fields are represented by an array of the PublicIDs of the elements in the array</li></ul></p>
 * <p>The specific mappings for {@link NoteDTO} are as follows:
 * <table border="1"><tr><td><b>Field</b></td><td><b>Maps to</b></td></tr><tr><td>AuthorPublicID</td><td>Note.Author.PublicID</td></tr><tr><td>AuthoringDate</td><td>Note.AuthoringDate</td></tr><tr><td>Body</td><td>Note.Body</td></tr><tr><td>Confidential</td><td>Note.Confidential</td></tr><tr><td>Language</td><td>Note.Language</td></tr><tr><td>PublicID</td><td>Note.PublicID</td></tr><tr><td>RelatedTo</td><td>Note.RelatedTo</td></tr><tr><td>SecurityType</td><td>Note.SecurityType</td></tr><tr><td>Subject</td><td>Note.Subject</td></tr><tr><td>Topic</td><td>Note.Topic</td></tr></table></p>
 *
 * Customer configuration: modify this file by adding a property corresponding to each extension column that you added to the Note entity.
 */
@Export
@WsiExportable("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/NoteDTO")
final class NoteDTO  {

  var _authorPublicID : String                   as AuthorPublicID
  var _authoringDate  : Date                     as AuthoringDate
  var _body           : String                   as Body
  var _confidential   : Boolean                  as Confidential
  var _language       : typekey.LanguageType     as Language
  var _publicID       : String                   as PublicID
  var _relatedTo      : typekey.RelatedTo        as RelatedTo
  var _securityType   : typekey.NoteSecurityType as SecurityType
  var _subject        : String                   as Subject
  var _topic          : typekey.NoteTopicType    as Topic



  /**
   * Creates a new NoteDTO that represents the current state of the supplied Note.
   * @param that The Note to be represented.
   */
  static function valueOf(that : Note) : NoteDTO {
    return new NoteDTO().readFrom(that)
  }

  /**
   * Set the fields in this DTO using the supplied Note
   * @param that The Note to copy from.
   */
  final function readFrom(that : Note) : NoteDTO {

    AuthoringDate    =  that.AuthoringDate
    Body             =  that.Body
    Confidential     =  that.Confidential
    Language         =  that.Language
    PublicID         =  that.PublicID
    RelatedTo        =  that.RelatedTo
    SecurityType     =  that.SecurityType
    Subject          =  that.Subject
    Topic            =  that.Topic
    AuthorPublicID   =  that.Author.PublicID

    return this
  }


  /**
   * Update the supplied Note using the field values stored in this DTO
   * @param that The Note to update.
   * @param treatNullAsLegalValue If {@code true}, every DTO field will be used to update the Note, even those that
   * are null. If {@code false}, only those fields that are non-null are used (i.e. the null-valued fields are treated
   * as if they were unspecified). Usually you will want this to be {@code false}.
   */
  final function writeTo(that : Note, treatNullAsLegalValue : boolean) : Note {
    // if field is on base class
    if (AuthoringDate != null or treatNullAsLegalValue) that.AuthoringDate = AuthoringDate
    if (Body          != null or treatNullAsLegalValue) that.Body          = Body
    if (Confidential  != null or treatNullAsLegalValue) that.Confidential  = Confidential
    if (Language      != null or treatNullAsLegalValue) that.Language      = Language
    if (PublicID      != null or treatNullAsLegalValue) that.PublicID      = PublicID
    if (RelatedTo     != null or treatNullAsLegalValue) that.RelatedTo     = RelatedTo
    if (SecurityType  != null or treatNullAsLegalValue) that.SecurityType  = SecurityType
    if (Subject       != null or treatNullAsLegalValue) that.Subject       = Subject
    if (Topic         != null or treatNullAsLegalValue) that.Topic         = Topic
    if (AuthorPublicID != null) {
      that.Author = WebserviceEntityLoader.loadUser(AuthorPublicID)
    }

    return that
  }

  /**
   * Creates a new Note using the default constructor, adds it to the supplied bundle, then updates it using the field values stored in this DTO. Only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified).
   * @param bundle The bundle in which to create the new Note.
   */
  final function writeToNewEntityIn(bundle : Bundle) : Note {
    return writeToNewEntityIn(bundle, null, null)
  }

  /**
   * Uses the createNew block to create a new Note, adds it to the supplied bundle, then updates it using the field values stored in this DTO. Only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified).
   * @param bundle The bundle in which to create the new Note.
   * @param createNew A block that returns a new instance of Note. If this is null the default constructor will be used.
   */
  final function writeToNewEntityIn(bundle : Bundle, createNew : block() : Note) : Note {
    return writeToNewEntityIn(bundle, createNew, null)
  }

  /**
   * Uses the createNew block to create a new Note, adds it to the supplied bundle, then updates it using the field values stored in this DTO. The treatNullAsLegalValue parameter controls how the fields that are null are treated.
   * @param bundle The bundle in which to create the new Note.
   * @param createNew A block that returns a new instance of Note. If this is null, the default constructor will be used.
   * @param treatNullAsLegalValue If {@code true}, every DTO field will be used to update the Note, even those that are null. If {@code false}, only those fields that are non-null are used (i.e. the null-valued fields are treated as if they were unspecified). Usually you will want this to be the default value, {@code false}.
   */
  final function writeToNewEntityIn(bundle : Bundle, createNew : block() : Note, treatNullAsLegalValue : boolean) : Note {
    if (createNew == null) createNew = \ -> bundle == null ? new Note() : new Note(bundle)
    var instance = createNew()

    if (bundle != null) instance = bundle.add(instance)
    return writeTo(instance, treatNullAsLegalValue)
  }


}
