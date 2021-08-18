package gw.activity

uses gw.api.database.Query

@Export
enhancement ActivityPatternEnhancement : ActivityPattern {
  static property get Notification() : ActivityPattern {
    return findActivityPattern("notification")
  }

  static property get Approval() : ActivityPattern {
    return findActivityPattern("approval")
  }

  private static function findActivityPattern(code : String) : ActivityPattern {
    return Query.make(ActivityPattern)
      .compare("Code", Equals, code)
      .select()
      .AtMostOneRow
  }
}
