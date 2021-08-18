package gw.troubleticket;

/**
 * Gosu class for applying hold types from the UI. This class adds an additional layer of indirection
 * between the HoldDV and the Hold entity, thereby eliminating the need to use the "setter" attribute.
 **/
@Export
class ApplyHoldType {

  // ----------- Static Members ----------------

  /**
   * Returns a list of rows, one per HoldType to which the Hold may be applied.
   **/
  public static function getRows(hold : Hold) : ApplyHoldType[] {
    var results = new java.util.ArrayList();
    for (t in HoldType.getTypeKeys(false)) {
      results.add(new ApplyHoldType(hold, t));
    }
    return results as ApplyHoldType[];
  }

  // ----------- Instance Members ----------------

  var _hold : Hold;
  var _holdType : HoldType;
  

  construct(hold : Hold, type : HoldType) {
    _hold = hold;
    _holdType = type;
  }

  public property get HoldType() : HoldType {
    return _holdType;  
  }

  public property get Applied() : Boolean {
    return _hold.isAppliedToHoldType(_holdType);
  }

  public property set Applied(apply : Boolean) {
    _hold.setAppliedToHoldType(_holdType, apply);
  }

  public property get ReleaseDate() : DateTime {
    return _hold.getReleaseDate(_holdType);
  }

  public property set ReleaseDate(date : DateTime) {
    _hold.setReleaseDate(_holdType, date);
  }
}