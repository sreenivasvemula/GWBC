package gw.plugin.invoice.impl

uses gw.plugin.invoice.IDateSequence
uses gw.api.domain.invoice.DateSequence
uses gw.api.domain.invoice.WeeklyDateSequence
uses gw.api.domain.invoice.MonthlyDateSequence
uses com.guidewire.bc.util.BCDateTimeUtil
uses com.guidewire.bc.util.Dates

uses java.util.Date
uses java.lang.UnsupportedOperationException

@Export
class DateSequence implements IDateSequence {

  construct() {
  }

  override function createPeriodicSequenceWith( thePeriodicity : Periodicity, anchorDates : Date[]) : DateSequence {
    var jodaAnchorDates = Dates.toJodaDates(anchorDates);
    var firstAnchorDate = jodaAnchorDates[0];
    if (thePeriodicity == Periodicity.TC_EVERYWEEK) {
      return new WeeklyDateSequence(firstAnchorDate)
    } else if (thePeriodicity == Periodicity.TC_EVERYOTHERWEEK) {
      return new WeeklyDateSequence(firstAnchorDate, 2)
    } else if (thePeriodicity == Periodicity.TC_MONTHLY) {
      return new MonthlyDateSequence(firstAnchorDate)
    } else if (thePeriodicity == Periodicity.TC_EVERYOTHERMONTH) {
      return new MonthlyDateSequence(firstAnchorDate, 2)
    } else if (thePeriodicity == Periodicity.TC_QUARTERLY) {
      return new MonthlyDateSequence(firstAnchorDate, 3)
    } else if (thePeriodicity == Periodicity.TC_EVERYFOURMONTHS) {
      return new MonthlyDateSequence(firstAnchorDate, 4)
    } else if (thePeriodicity == Periodicity.TC_EVERYSIXMONTHS) {
      return new MonthlyDateSequence(firstAnchorDate, 6)
    } else if (thePeriodicity == Periodicity.TC_EVERYYEAR) {
      return new MonthlyDateSequence(firstAnchorDate, 12)
    } else if (thePeriodicity == Periodicity.TC_EVERYOTHERYEAR) {
      return new MonthlyDateSequence(firstAnchorDate, 24)
    } else if (thePeriodicity == Periodicity.TC_TWICEPERMONTH) {
      var secondAnchorDate = jodaAnchorDates.length > 1
        ? jodaAnchorDates[1]
        : BCDateTimeUtil.halfAMonthFrom(firstAnchorDate)
      return new MonthlyDateSequence(firstAnchorDate)
        .combinedWith(new MonthlyDateSequence(secondAnchorDate))
    } else {
      throw new UnsupportedOperationException("Add to this factory for other periodicity types, in DateSequence.gs: "
          + thePeriodicity)
    }
  }

}