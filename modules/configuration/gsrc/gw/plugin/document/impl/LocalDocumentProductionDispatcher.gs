package gw.plugin.document.impl

uses gw.api.util.LocaleUtil
uses gw.document.DocumentContentsInfo
uses gw.document.TemplatePluginUtils
uses gw.plugin.document.IDocumentProduction
uses gw.plugin.document.IDocumentProductionBase
uses gw.plugin.document.IDocumentTemplateDescriptor

uses java.util.Map

@Export
class LocalDocumentProductionDispatcher extends BaseDocumentProductionDispatcher implements IDocumentProduction {
  construct() {
  }

  override function createDocumentSynchronously(templateDescriptor : IDocumentTemplateDescriptor , parameters : Map<Object, Object>, document : Document) : DocumentContentsInfo {
    var result : DocumentContentsInfo
    var language = templateDescriptor.Language
    if (language == null) {
      language = LocaleUtil.getDefaultLanguage()
    }
    document.DocumentLanguage = language // does the translation to language
    LocaleUtil.runAsCurrentLanguage( language , \ ->  {
      result = (getDispatchImplementation(templateDescriptor) as IDocumentProduction).createDocumentSynchronously(templateDescriptor, parameters, document);
    })
    return result
  }
  
  
  override protected function cast(obj : Object) : IDocumentProductionBase {
    return TemplatePluginUtils.castDocumentProduction(obj, IDocumentProduction)
  }

}
