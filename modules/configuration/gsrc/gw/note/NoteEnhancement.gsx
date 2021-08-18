package gw.note

uses gw.api.util.DisplayableException
uses gw.api.util.LocaleUtil
uses gw.document.TemplatePluginUtils
uses gw.plugin.note.INoteTemplateDescriptor
uses gw.transaction.Transaction

uses org.apache.commons.lang.StringUtils
uses java.io.StringReader
uses java.lang.Exception
uses java.util.Map

@Export
enhancement NoteEnhancement : Note {

 /**
   * Completes a note.
   */
  function complete(){
    Transaction.runWithNewBundle(\bundle -> {
      if (not StringUtils.isEmpty(this.getBody())) {
        bundle.add(this)
      }
    })
  }
  
  /** This will use the results of a template search to populate the note.
   * 
   * @param result the template result
   * @param beans the symbol table
   */
    function useTemplate(result : NoteTemplateSearchResults, beans : Map<String, Object>) {
    try {
      var locale = LocaleUtil.toLanguage( result.Language)
      if (locale == null) {
        locale = LocaleUtil.getDefaultLocale()
      }
      TemplatePluginUtils.resolveTemplates( locale , 
          {new StringReader(result.Subject), new StringReader(result.Body)}, 
          // setup the symbol table for the template processing
          \ iScriptHost -> {
            for (entry in beans.entrySet()) {
              var bean = entry.getValue()
              if (bean != null) {
                iScriptHost.putSymbol(entry.Key, typeof(bean) as String, bean)
              }
            }
          }, 
          // process the result of the template expansion
          \ results -> {
            this.Topic = result.Topic
            this.Language = LocaleUtil.toLanguageType( User.util.CurrentLocale  )
            this.Subject = results[0]
            this.Body = results[1]
          } )
    } catch (e : Exception) {
      throw new DisplayableException(displaykey.Web.Note.Template.ProcessingError(result.getName()), e)
    }
  }

  /** This will use the template to populate the note.
   * 
   * @param template the template
   * @param beans the symbol table
   */
    function useTemplate(template : INoteTemplateDescriptor, beans : Map<String, Object>) {
    try {
      var locale = template.Locale
      if (locale == null) {
        locale = LocaleUtil.getDefaultLocale()
      }
      TemplatePluginUtils.resolveTemplates( locale , 
          {new StringReader(template.Subject), new StringReader(template.Body)}, 
          // setup the symbol table for the template processing
          \ iScriptHost -> {
            for (entry in beans.entrySet()) {
              var bean = entry.getValue()
              if (bean != null) {
                iScriptHost.putSymbol(entry.Key, typeof(bean) as String, bean)
              }
            }
          }, 
          // process the result of the template expansion
          \ results -> {
            this.Topic = template.Topic
            this.Language = LocaleUtil.toLanguageType( User.util.CurrentLocale  )
            this.Subject = results[0]
            this.Body = results[1]
          } )
    } catch (e : Exception) {
       throw new DisplayableException(displaykey.Web.Note.Template.ProcessingError(template.getName()), e)
    }
  }

}