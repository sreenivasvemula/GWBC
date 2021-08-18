package gw.activity

uses gw.api.database.Query
uses gw.api.filters.StandardQueryFilter

@Export
class ActivityPatternFilterSet {
  construct() {}

  property get FilterOptions() : StandardQueryFilter[] {
    // filters for each ActivityPattern...
    final var filters =
        Query.make(ActivityPattern).select()
            .map(\ ap ->
                new StandardQueryFilter(ap.DisplayName,
                    \ qf -> {qf.compare("ActivityPattern", Equals, ap)})
            )
    // insert All as first...
    filters.add(0, new StandardQueryFilter(displaykey.Java.ListView.Filter.All, \ of -> {}))

    return filters.toTypedArray()
  }
}
