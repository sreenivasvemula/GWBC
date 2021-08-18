package gw.plugin.document.impl

uses gw.document.DocumentContentsInfo
uses gw.plugin.document.IDocumentContentSource

uses java.io.File
uses java.io.InputStream
uses java.lang.System
uses java.lang.UnsupportedOperationException
uses java.util.Date
uses gw.pl.util.FileUtil

@Export
class LocalDocumentContentSource extends BaseLocalDocumentContentSource implements IDocumentContentSource {
  construct() {
  }
  
  override function addDocument(documentContents : InputStream, document : Document) : boolean {
    var docInfoWrapper = new DocumentInfoWrapper(document)
    var docUID : String
    if ((documentContents == null) && isDocument(document)) {
        docUID = getDocUID(docInfoWrapper)
    } else {
        docUID = addDocument(documentContents, docInfoWrapper)
        document.DateModified = Date.CurrentDate
    }
    document.DocUID = docUID
    return false
  }
  
  override function isDocument(document : Document) : boolean {
    if (document.getDocUID() != null) {
        var docFile = getDocumentFile(document.getDocUID())
        return FileUtil.isFile(docFile) && docFile.exists()
    } else {
        return isDocumentFile(new DocumentInfoWrapper(document))
    }
  }
  
  override function getDocumentContentsInfo(document : Document, includeContents : boolean) : DocumentContentsInfo {
    if (document.getDocUID() == null) {
      return null;
    }
    var dci = getDocumentContents(document.getDocUID(), includeContents)
    dci.setResponseMimeType(document.getMimeType())
    return dci
  }
  
  override function getDocumentContentsInfoForExternalUse(document : Document) : DocumentContentsInfo {
    if (document.getDocUID() == null) {
      return null;
    }
    var dci = getExternalDocumentContents(document.getDocUID());
    dci.setResponseMimeType(document.getMimeType())
    return dci
  }

  override function updateDocument(document : Document, isDocument : InputStream) : boolean {
    updateDocument(document.getDocUID(), isDocument)
    document.DateModified = Date.CurrentDate
    return false
  }
  
  override function removeDocument(document : Document) : boolean {
    removeDocumentById(document.getDocUID())
    return false
  }
  
  /**
   * Inner class that represents a document name and the name of a subdirectory where the document will reside
   */
  static class DocumentInfoWrapper implements BaseLocalDocumentContentSource.IDocumentInfoWrapper {

    private var _docName : String

    private var _docSubDirName : String

    public construct(document : Document) {
        _docName = document.getName()
        _docSubDirName = getDocumentContainerIDString(document) + File.separator
    }

    override function getDocumentName() : String {
        return _docName
    }

    override function getSubDirForDocument() : String {
        return _docSubDirName
    }

    /**
         * Return a unique string that identifies the container of the document (eg: "account1234")
         *
         * @param document a document
         * @return unique string id of the document's container
         */
    private function getDocumentContainerIDString(document : Document) : String {
        var documentContainer = document.getDocumentContainer()
        if (documentContainer typeis Account) { // does cast as well
            return "account" + documentContainer.getID().toString() + System.currentTimeMillis()
        } else if (documentContainer typeis Policy) { // does cast as well
            return "policy" + documentContainer.getID().toString() + System.currentTimeMillis()
        } else if (documentContainer typeis Producer) { // does cast as well
            return "producer" + documentContainer.getID().toString() + System.currentTimeMillis()
        } else {
            throw new UnsupportedOperationException("DocumentContainer must be an Account, Policy, or Producer")
        }
    }
  }

}
