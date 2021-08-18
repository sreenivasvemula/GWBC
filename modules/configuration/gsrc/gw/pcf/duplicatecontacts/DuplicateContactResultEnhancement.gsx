package gw.pcf.duplicatecontacts

uses gw.plugin.contact.DuplicateContactResult

@Export
enhancement DuplicateContactResultEnhancement : DuplicateContactResult {

  property get MatchType() : String {
    return this.ExactMatch
        ? displaykey.Web.DuplicateContactsPopup.MatchType.Exact
        : displaykey.Web.DuplicateContactsPopup.MatchType.Potential
  }
}
