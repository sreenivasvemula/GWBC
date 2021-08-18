package gw.document

uses gw.api.util.LocaleUtil
uses gw.plugin.document.IDocumentContentSource
uses gw.plugin.document.IDocumentProduction
uses gw.plugin.document.IDocumentTemplateDescriptor
uses gw.plugin.document.IDocumentTemplateSource

uses java.lang.RuntimeException
uses java.util.Date
uses java.util.Map

/**
 * The DocumentProduction class contains methods which can be used in both.pcf configuration
 * and from rules to create Document entities from Document Templates.
 */
@Export
class DocumentProduction {

  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var LOB_ATTRIB : String = "lob"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var SECTION_ATTRIB : String = "section"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var STATE_ATTRIB : String = "state"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var ID_ATTRIB : String = "id"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var IDENTIFIER_ATTRIB : String = "identifier"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var NAME_ATTRIB : String = "name"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var SCOPE_ATTRIB : String = "scope"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var KEYWORDS_ATTRIB : String = "keywords"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var TYPE_ATTRIB : String = "type"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var PRODUCTION_TYPE_ATTRIB : String = "production-type"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var PASSWORD_ATTRIB : String = "password"
  /** This corresponds to an XSD attribute on element DocumentTemplateDescriptor in document-template.xsd */
  public static final var MIME_TYPE_ATTRIB : String = "mime-type"

  /**
   * Default constructor
   */
  construct() {
  }

  /*******************************************************************************************
  *  Document Creation functions
  *******************************************************************************************/


  /**
   * Determine whether synchronous creation is supported by the IDocumentProduction plugin for
   * the specified template. Returns true if so, false otherwise. Returns false if a template cannot be found
   * with the specified name.
   *
   * @deprecated use method that takes IDocumentTemplateDescriptor for I18N support
   * @param templateName the name of the template
   * @return true if synchronous creation supported
   */
  public static function synchronousDocumentCreationSupported(template : IDocumentTemplateDescriptor) : boolean {
    if (template == null) {
      return false;
    } else {
      return getDocumentProductionPlugin().synchronousCreationSupported( template );
    }
  }

  /**
   * Determine whether asynchronous creation is supported by the IDocumentProduction plugin for
   * the specified template. Returns true if so, false otherwise. Returns false if a template cannot be found
   * with the specified name.
   *
   * @param template the template
   * @return true if asynchronous creation supported
   */
  public static function asynchronousDocumentCreationSupported(template : IDocumentTemplateDescriptor) : boolean {
    if (template == null) {
      return false;
    } else {
      return getDocumentProductionPlugin().asynchronousCreationSupported( template );
    }
  }

  /**
   * Create a document synchronously and pass it to the IDocumentContentSource plugin for persistence
   * This method should be used when the document should be created and stored without any further user interaction.
   *
   * @param template the template to be used to create the document
   * @param parameters the set of objects, keyed by name, which will be supplied to the template generation process to create the document
   * @param document the Document entity corresponding to the newly generated content
   */
  public static function createAndStoreDocumentSynchronously(template : IDocumentTemplateDescriptor, parameters : Map, document : Document) {
    var documentContentSource = getDocumentContentSourcePlugin();

    adjustDocumentName(documentContentSource, document);

    var dci = createDocumentSynchronously(template, parameters, document);

    if (dci.ResponseType != DocumentContentsInfo.DOCUMENT_CONTENTS) {
      throw new RuntimeException("The IDocumentProduction implementation must return document contents to be called from a rule");
    }

    document.DMS = true;
    if (document.DateModified == null) {
      document.DateModified = (DateTime.now() as DateTime);
    }
    if (document.Author == null) {
      document.Author = displaykey.Java.Document.DefaultAuthor
    }
    document.MimeType = dci.ResponseMimeType
    if (documentContentSource.addDocument( dci.InputStream, document )) {
      document.setPersistenceRequired( false );
    }
  }

  /*
   * Create a document synchronously. Does not persist the newly generated content.
   * This method should be used when the generated content is desired for display in the UI.
   *
   * @param template the template to be used to create the document
   * @param parameters the set of objects, keyed by name, which will be supplied to the template generation process to create the document
   * document - the Document entity corresponding to the newly generated content
   * @return A DocumentContentsInfo object with the metadata of the Document Contents, and possibly the contents themselves
   */
  public static function createDocumentSynchronously(template : IDocumentTemplateDescriptor , parameters : Map<Object, Object>, document : Document) : DocumentContentsInfo {
    var result : DocumentContentsInfo
    var language = template.Language
    if (language == null) {
      language = LocaleUtil.getDefaultLanguage()
    }
    document.DocumentLanguage = language // does the translation to language
    LocaleUtil.runAsCurrentLanguage( language , \ ->  {
      result = getDocumentProductionPlugin().createDocumentSynchronously(template, parameters, document);
    })
    return result
      }

  /**
   * Creates a document asynchronously. This means that the function will return immediately, but the actual document
   * creation will take place over an extended period of time.
   * This method should be called when the creation process will take place over an extended period of time. The external
   * document production system is responsible for creating a Document entity (if desired) when the creation is complete.
   *
   * @param templateName the id of the template to be used to create the document
   * @param parameters the set of objects, keyed by name, which will be supplied to the template generation process to create the document
   * @param fieldValues a set of values, keyed by field name, which should be set on the Document entity which is eventually created
   *                      at the end of the asynchronous creation process.
   * @return A URL which the user could visit to see the status of the document creation, or null if none exists
   */
  static function createDocumentAsynchronously(templateName : String, parameters : Map, fieldValues : Map) : String {
    return getDocumentProductionPlugin().createDocumentAsynchronously(
            getDocumentTemplateSourcePlugin().getDocumentTemplate( templateName, null ), parameters, fieldValues )
  }

  /**
   * Create a document asynchronously. This means that the function will return immediately, but the actual document
   * creation will take place over an extended period of time.
   * This method should be called when the creation process will take place over an extended period of time. The external
   * document production system is responsible for creating a Document entity (if desired) when the creation is complete.
   *
   * @param template the template to be used to create the document
   * @param parameters the set of objects, keyed by name, which will be supplied to the template generation process to create the document
   * @param fieldValues a set of values, keyed by field name, which should be set on the Document entity which is eventually created
   * at the end of the asynchronous creation process.
   * @return A URL which the user could visit to see the status of the document creation, or null if none exists
   */
  public static function createDocumentAsynchronously(template : IDocumentTemplateDescriptor, parameters : Map, fieldValues : Map) : String {
    var documentProductionPlugin = getDocumentProductionPlugin();

    var language = template.Language
    if (language == null) {
      language = LocaleUtil.DefaultLanguage
    }
    var rtn : String
    LocaleUtil.runAsCurrentLanguage( language , \ ->  {
     rtn = documentProductionPlugin.createDocumentAsynchronously( template, parameters, fieldValues )
    });
    return rtn
  }

  /**********************************************************************************************
  * Helper functions
  **********************************************************************************************/

  /**
   * Retrieves the configured IDocumentProduction implementation.
   */
  private static function getDocumentProductionPlugin() : IDocumentProduction  {
    return gw.plugin.Plugins.get(IDocumentProduction)
  }

  /**
   * Retrieves the configured IDocumentTemplateSource implementation.
   */
  private static function getDocumentTemplateSourcePlugin() : IDocumentTemplateSource {
    return gw.plugin.Plugins.get(IDocumentTemplateSource)
  }

  /**
   * Retrieves the configured IDocumentContentSource implementation.
   */
  private static function getDocumentContentSourcePlugin() : IDocumentContentSource {
    return gw.plugin.Plugins.get(IDocumentContentSource)
  }

  /**
   * Adjusts the supplied document's name to avoid conflicts with documents already in the system. This
   * will supply a numeric argument to a display key, producing alternate names like "Foo (2)", "Foo (3)", etc.
   * until a unique name is generated.
   */
  private static function adjustDocumentName(documentContentSource : IDocumentContentSource, document : Document) {
    var i=1
    var originalName = document.Name
    while(documentContentSource.isDocument( document )) {
      //As long as the DocumentSource rejects the document name, tweak it to avoid conflicts.
      //This assumes that the name is all that needs to be changed; that may not be true for
      // every DMS integration.
      i = i+1 //Start the index at 2, since by definition there's already one
     document.Name = displaykey.Java.Document.DocumentDuplicateNameAdjustment(originalName, i)
    }
  }
}
