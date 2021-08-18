package gw.plugin.document.impl

uses gw.plugin.document.IDocumentMetadataSource

@Export
class LocalDocumentMetadataSource extends BaseLocalDocumentMetadataSource implements IDocumentMetadataSource {
  construct() {
  }

  protected override function documentMatchesCriteria( doc : Document, criteria : DocumentSearchCriteria) : boolean  {
    if (not super.documentMatchesCriteria( doc, criteria )) {
      return false;
    }
    if (criteria.getAccount() != null) {
      if (criteria.getAccount() != doc.getAccount()) {
        return false;
      }
    }
    if (criteria.getPolicy() != null) {
      if (criteria.getPolicy() != doc.getPolicy()) {
        return false;
      }
    }
    if (criteria.getProducer() != null) {
      if (criteria.getProducer() != doc.getProducer()) {
        return false;
      }
    }
    return true
  }
}
