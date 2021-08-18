package libraries

@Export
enhancement BCStringExt : java.lang.String
{
  function summarize(maxLength : int) : String {
    if(this.length > maxLength){
      return this.substring( 0, maxLength ) + "..."
    }
    return this
  }
}
