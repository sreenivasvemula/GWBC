package gw.command

uses gw.api.database.Query
uses gw.api.util.SampleDataGenerator
uses gw.transaction.Transaction
uses com.guidewire.pl.quickjump.DefaultMethod

@Export 
@DefaultMethod("withDefault")
class ImportSampleData extends BCBaseCommand
{
  function withDefault() : String {
    SampleDataGenerator.generateDefaultSampleData()
    return displaykey.Web.InternalTools.SampleData.SampleDataImported;
  }

  function dropdb() : String{
    Transaction.runWithNewBundle( \ bundle -> {
      var q = Query.make(PolicyPeriod).select()
      for(p in q){
        p = bundle.add( p )
        p.remove()
      }  
    } )
    return "All policies are retired"
  }
}
