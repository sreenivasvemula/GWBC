package gw.plugin.fundstracking.impl

uses com.google.common.collect.Ordering

uses java.util.Collection
uses java.util.List
uses java.util.Set
uses java.util.TreeSet

/**
 * FundAllotter allots all given trackers which are tracking a reversal to what they reversed.  For example, it
 * allots the the reversal of a Disbursement to that reversed Disbursement.
 * </p>
 * It allots the remaining source trackers, in order of event date earliest first, to the remaining use trackers,
 * in order of event date earliest first.  That is, it allots as much as possible from the first source tracker to
 * the earliest use tracker and continues alloting that source tracker to the use trackers, in order of event date,
 * until it is fully allotted or until there are no more use trackers.  It continues with the remaining source
 * trackers in order of event date.
 */
@Export
class FundsAllotter {
  var _unallottedSourceTrackers : Set<FundsSourceTracker>
  var _unallottedUseTrackers : Set<FundsUseTracker>

  /**
   * An ordering which orders trackers by event date, earliest first.
   */
  static final var EVENT_DATE = new Ordering<FundsTracker>() {
    override function compare(tracker1 : FundsTracker, tracker2 : FundsTracker) : int {
      return tracker1.getEventDate().compareTo(tracker2.getEventDate());
    }
  };

  /**
   * An ordering which orders trackers by ID.
   */
  static final var ID = new Ordering<FundsTracker>() {
    override function compare(tracker1 : FundsTracker, tracker2 : FundsTracker) : int {
      return tracker1.getID().compareTo(tracker2.getID());
    }
  };
  
  construct(unallottedSourceTrackers : Set<FundsSourceTracker>, unallottedUseTrackers : Set<FundsUseTracker>) {
    _unallottedSourceTrackers = createSetOrderedByEventDate<FundsSourceTracker>(unallottedSourceTrackers)
    _unallottedUseTrackers = createSetOrderedByEventDate<FundsUseTracker>(unallottedUseTrackers)
  }

  /**
   * Allots the funds from the unallotted source trackers to the unallotted use trackers.
   */
  function allotFunds() {
    allotReversalsToWhatTheyReversed()
    allotUnallottedSources()
  }
  
  /**
   * Allots the remaining unallotted funds for each source tracker to the unallotted use trackers.  
   * Allots the source trackers in order of event date, earliest first, to the use trackers in 
   * order of event date, earliest first.
   */
  private function allotUnallottedSources() {
    _unallottedSourceTrackers.each(\ sourceTracker -> allotFundsFor(sourceTracker))
  }
  
  /**
   * Allots the remaining unallotted funds from the given source tracker to the unallotted use trackers.  
   * Allots the funds to the unallotted use trackers in order of event date, earliest first.
   */
  private function allotFundsFor(sourceTracker : FundsSourceTracker) {
    _unallottedUseTrackers.each(\ useTracker -> sourceTracker.allotAsMuchAsPossibleTo(useTracker))
  }
  
  /**
   * Allots the funds for the source and use trackers which are tracking reversals to the tracker of the
   * reversed entity.
   * </p>
   * For example, a direct bill money received is a source of funds that is tracked by a fund source
   * tracker.  Initially it may have been allotted to a PaymentItemGroup to pay for a policy.  Later if
   * the direct bill money received gets reversed, that reversal is a use of funds that is tracked by a fund
   * use tracker.  
   * <p/>
   * This removes the original allotments of the matching original source and use trackers and re-allots
   * them to their reversals.
   */
  private function allotReversalsToWhatTheyReversed() {
    sourceTrackersTrackingReversals().each(\ sourceTracker -> allotToTrackerOfReversedEntity(sourceTracker))
    useTrackersTrackingReversals().each(\ useTracker -> allotToTrackerOfReversedEntity(useTracker))
  }
  
  /**
   * Allots the funds for the given source tracker to the use tracker that tracks the reversed entity.  For example
   * if the given source tracker is tracking the reversal of a Disbursement, this allots that source
   * tracker to the use tracker which tracks the reversed Disbursement.
   * </p>
   * This unallots the reversed entity and re-allots it to the given reversal tracker.
   */
  private function allotToTrackerOfReversedEntity(reversal : FundsSourceTracker) {
    var trackerOfReversedEntity = reversal.TrackerOfReversedEntity
    unallotUseTracker(trackerOfReversedEntity)
    reversal.allotAsMuchAsPossibleTo(trackerOfReversedEntity)
  }
  
  /**
   * Allots the funds for the given use tracker to the source tracker that tracks the reversed entity.  For example
   * if the given use tracker is tracking the reversal of a DirectBillMoneyReceived, this allots that use
   * tracker to the source tracker which tracks the reversed DirectBillMoneyReceived.
   * </p>
   * This unallots the reversed entity and re-allots it to the given reversal tracker.
   */
  private function allotToTrackerOfReversedEntity(reversalUseTracker : FundsUseTracker) {
    var trackerOfReversedEntity = reversalUseTracker.TrackerOfReversedEntity
    unallotSourceTracker(trackerOfReversedEntity)
    trackerOfReversedEntity.allotAsMuchAsPossibleTo(reversalUseTracker)
  }
  
  /**
   * Returns the unallotted source trackers which are tracking reversals.  This includes, for example, the tracker
   * of the reversal of a Disbursement.
   */
  private function sourceTrackersTrackingReversals() : List<FundsSourceTracker> {
    return _unallottedSourceTrackers.where(\ tracker -> tracker.TrackingReversal)  
  }
 
  /**
   * Returns the unallotted use trackers which are tracking reversals.  This includes, for example, the tracker
   * of the reversal of a DirectBillMoneyReceived.
   */ 
  private function useTrackersTrackingReversals() : List<FundsUseTracker> {
    return _unallottedUseTrackers.where(\ tracker -> tracker.TrackingReversal)  
  }
  
  /**
   * Unallots the given source tracker by removing all of its current allotments.  That affects the use trackers 
   * to which the given tracker was allotted -- it increases the amount unallotted for each of them.
   * Since they may be newly unallotted, this adds them to the set of unallotted use trackers.
   */
  private function unallotSourceTracker(sourceTracker : FundsSourceTracker) {
    var affectedUseTrackers = sourceTracker.UseTrackersAllottedTo
    sourceTracker.unallotFunds()  
    _unallottedUseTrackers.addAll(affectedUseTrackers)
  }
  
  /**
   * Unallots the given use tracker by removing all of its current allotments.  That affects the source trackers 
   * from which the given tracker was allotted -- it increases the amount unallotted for each of them.
   * Since they may be newly unallotted, this adds them to the set of unallotted source trackers.
   */
  private function unallotUseTracker(useTracker : FundsUseTracker) {
    var affectedSourceTrackers = useTracker.SourceTrackersAllottedFrom
    useTracker.unallotFunds()
    _unallottedSourceTrackers.addAll(affectedSourceTrackers)
  }

  /**
  * Returns a Set containing the given elements.  The Set keeps itself ordered by event date, earliest first.
  */
  private function createSetOrderedByEventDate<T extends FundsTracker>(elements : Collection<T>) : Set<T> {
    // The TreeSet keeps itself ordered by the provided Ordering -- by eventDate and then by ID.
    // The Set uses the provided Ordering to test whether two elements are equal, so it's important to include the
    // ID; otherwise the Set would not be able to contain two elements that have the same EventDate.
    var setOrderedByEventDate = new TreeSet<T>(EVENT_DATE.compound(ID))
    setOrderedByEventDate.addAll(elements)
    return setOrderedByEventDate
  }    
 
}