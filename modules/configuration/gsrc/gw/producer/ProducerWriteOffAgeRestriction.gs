package gw.producer
uses java.lang.Integer


/**
 * Used on the Producer Writeoffs page to constrain the search for writeoffs by age (based on the writeoff's CreateTime) 
 */
@Export
class ProducerWriteOffAgeRestriction {

  public static var LAST_30_DAYS : ProducerWriteOffAgeRestriction = new ProducerWriteOffAgeRestriction(30)
  public static var LAST_60_DAYS : ProducerWriteOffAgeRestriction = new ProducerWriteOffAgeRestriction(60)
  public static var LAST_90_DAYS : ProducerWriteOffAgeRestriction = new ProducerWriteOffAgeRestriction(90)
  public static var LAST_365_DAYS : ProducerWriteOffAgeRestriction = new ProducerWriteOffAgeRestriction(365)
  public static var NO_RESTRICTION : ProducerWriteOffAgeRestriction = new ProducerWriteOffAgeRestriction(null)
  
  public static var ALL_OPTIONS : List<ProducerWriteOffAgeRestriction> = {LAST_30_DAYS, LAST_60_DAYS, LAST_90_DAYS, LAST_365_DAYS, NO_RESTRICTION}

  private var _maximumWriteoffAgeInDays : Integer
  
  /**
   * @param maximumWriteoffAgeInDays specifies the age of the oldest writeoff to retrieve in a search (based on the writeoff's CreateTime).  Note
   *                                 that passing null for this parameter indicates that the search for writeoffs will have no age restriction 
   */
  construct(maximumWriteoffAgeInDays : Integer) {
    _maximumWriteoffAgeInDays = maximumWriteoffAgeInDays
  }
  
  /**
   * @return true if this restriction indicates a writeoff search should return only those writeoffs which have an age no greater than a specified maximum,
   *         false if this restriction indicates a writeoff search should not restrict based on age
   */
  function hasAgeRestriction() : boolean {
    return _maximumWriteoffAgeInDays != null
  }
  
  /**
   * @return maximum age in days restriction that should be used when doing a writeoff search 
   */
  function getMaximumWriteoffAgeInDays() : Integer {
    return _maximumWriteoffAgeInDays
  }

  /**
   * @return the display text to be shown for this restriction when it is displayed as a choice in a dropdown list in the UI
   */
  function getDisplayText() : String {
    if (hasAgeRestriction()) {
      return displaykey.Web.ProducerWriteOffs.CreatedInLastXDays(_maximumWriteoffAgeInDays)
    } else {
      return displaykey.Web.ProducerWriteOffs.NoAgeRestrictionForWriteoffSearch
    }
  }
  
}
