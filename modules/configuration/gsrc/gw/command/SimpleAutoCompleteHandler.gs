package gw.command

uses gw.api.contact.AutocompleteHandler
uses gw.api.contact.AutocompleteResult

uses java.util.ArrayList

/**
* Use this auto complete handler for simple, "short" list of suggestions
* @author mvu
*/
@Export
class SimpleAutoCompleteHandler implements AutocompleteHandler {
  private var valueRange : String[]
  
  construct(_values : String[]) {
    valueRange = _values
  }

  override function getSuggestions( p0: String, p1: Object[] ) : AutocompleteResult[] {
    var results = new ArrayList<AutocompleteResult>()
    for(s in valueRange){
      if(s.startsWith( p0 )){
        results.add( new AutocompleteResult(s, s, true) )
      }
    }
    return results.toTypedArray()
  }

  override function moreResultsExist() : boolean {
    return false
  }

  override function waitForKeypress() : boolean {
    return false
  }

}
