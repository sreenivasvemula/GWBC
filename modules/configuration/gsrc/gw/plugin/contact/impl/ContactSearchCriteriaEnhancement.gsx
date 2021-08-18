package gw.plugin.contact.impl

uses gw.plugin.contact.ContactResult

uses java.lang.Exception
uses java.util.ArrayList
uses java.util.HashSet

@Export
enhancement ContactSearchCriteriaEnhancement : entity.ContactSearchCriteria {

 function performSearch() : ContactResultWrapper {
    var uids = new HashSet()
    var warningMsg : String
    var searchResults = new ArrayList<ContactResult>()
    
    var internalResults = this.searchInternalContacts()
    var resultsIterator = internalResults.iterator()
    while (resultsIterator.hasNext()){
      var contact = resultsIterator.next()
      searchResults.add(new ContactResultInternal(contact))
      if(contact.AddressBookUID != null){
        uids.add(contact.AddressBookUID)
      }
    }

    try {
      var remoteResults = this.searchExternalContacts()
      for(result in remoteResults){
        if(not uids.contains(result.ContactAddressBookUID)){
          searchResults.add(result)
        }
      }      
    } catch(e : Exception) {
      warningMsg = e.Message
    }
    return new ContactResultWrapper(searchResults.toTypedArray(), warningMsg)
  }
  
  /*Read: 
    This temp function is added only to:
    1. in-line with PC since they are not implementing external ProducerContact for 7.x version now.
    2. for easy removal, instead of modifying the original method.
    3. Avoid possible performance issue.
    if you are implementing external ProducerContact from CM. Simply take this function out.
  */
  function performProducerContactInternalSearch() : ContactResultWrapper {
    var warningMsg : String
    var searchResults = new ArrayList<ContactResult>()
    
    var internalResults = this.searchInternalContacts()
    var resultsIterator = internalResults.iterator()
    while (resultsIterator.hasNext()){
      var contact = resultsIterator.next()
      searchResults.add(new ContactResultInternal(contact))
    }
    return new ContactResultWrapper(searchResults.toTypedArray(), warningMsg)
  }
}
