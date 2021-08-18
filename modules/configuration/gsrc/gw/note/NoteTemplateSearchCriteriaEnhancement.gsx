package gw.note

uses gw.api.system.PLLoggerCategory
uses gw.api.util.DisplayableException
uses gw.api.util.LocaleUtil
uses gw.entity.TypeKey
uses gw.plugin.note.INoteTemplateSource

uses java.lang.Exception
uses java.util.ArrayList
uses java.util.HashMap

@Export
enhancement NoteTemplateSearchCriteriaEnhancement : entity.NoteTemplateSearchCriteria {
  /** This move the criteria from this object to the the map used to actually perform
   * the search.  It will also move the resulting templates from the the search, into
   * a results objects.
   */
  function performSearch() : NoteTemplateSearchResults[] {
    var nts : INoteTemplateSource = null
    try {
      nts = gw.plugin.Plugins.get(INoteTemplateSource)
    } catch (e : Exception) {
      throw new DisplayableException(displaykey.Java.Note.Template.Plugin.Exception, e)
    }
    
    // populate values to match
    var valuesToMatch = new HashMap<String, Object>()
    for (prop in NoteTemplateSearchCriteria.Type.EntityProperties) {
      if (prop.Name == "ID" or prop.Name == "PublicID" or prop.Name == "BeanVersion") {
        // skip
      }
      else {
        var value = this[prop.Name]
        if (value == null) {
          // skip
        } else {
          valuesToMatch.put(prop.Name, (value typeis TypeKey) ? value.Code : value)
        }
      }
    }
    
    // perform the search
    var templates = nts.getNoteTemplates(LocaleUtil.toLanguage(this.getLanguage()), valuesToMatch)
    var resultsList = new ArrayList<NoteTemplateSearchResults>(templates.Count)
    
    //Convert results from INoteTemplateDescriptor to NoteTemplateSearchResults (non-persistent bean)
    for (template in templates) {
      var searchResults = new NoteTemplateSearchResults()
      try {
        searchResults.Name = template.Name
        searchResults.Topic = NoteTopicType.get(template.Topic)
        var typeStr = template.Type
        searchResults.Type = typeStr.Empty ? null : NoteType.get(typeStr)
        searchResults.LOBs = template.LobTypes.map( \ s -> LOBCode.get( s ).DisplayName).join( ", " )
        searchResults.Body = template.Body
        searchResults.Subject = template.Subject
        searchResults.Language = LocaleUtil.toLanguageType( template.Locale )
        resultsList.add(searchResults)
      } catch (e : Exception) {
        PLLoggerCategory.PLUGIN.error("Failed to load a template (" + template.getName() + ") due to exception: ", e)
        continue
      }
    }
    return resultsList.toTypedArray()
  }
}
