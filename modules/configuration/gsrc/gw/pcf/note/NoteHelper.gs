package gw.pcf.note

uses gw.api.util.LocaleUtil

@Export
class NoteHelper {

  private construct() {}
  
  static function createNoteWithCurrentUsersLanguage() : Note {
    var note = new Note()
    note.Language = LocaleUtil.getCurrentLanguageType()
    return note
  }

}
