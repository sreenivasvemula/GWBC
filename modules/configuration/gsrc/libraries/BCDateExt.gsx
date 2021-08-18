package libraries

uses com.guidewire.pl.system.util.DateTimeUtil
uses gw.api.tools.TestingClock
uses gw.api.util.BCUtils
uses gw.api.util.StringUtil
uses java.util.Date
uses gw.xml.date.XmlDateTime

@Export
enhancement BCDateExt : Date {
  property get XmlDateTime() : XmlDateTime{
    return new XmlDateTime(this.toCalendar(), true)
  }
  
  /**
   * Return string representation of this date in compact format (MM/dd/yy)
   * @deprecated This is not localizable. Use AsUISTyle, which is.
   */
  public property get Compact() : String {
    return StringUtil.formatDate(this, "MM/dd/yy");
  }
  
  /**
   * Format this Date in the general UI style.  This will vary from
   * locale to locale; for the US, the format is "MM/dd/YYYY".  Other
   * specific formats may be rendered by using format(style) or
   * format(patternstring).
   * Return this Date, formatted as a String
   * @see Date.format(String)
   */
  public property get AsUIStyle() : String {
    return StringUtil.formatDate(this, "short");
  }

  /**
   * Set the system clock to this Date.  The clock may only move forward.
   * If this date is in the past (compared to the system clock), the
   * result is a no-op.
   */
  public function setClock() : Date {
    var clock = new TestingClock()
    if (clock.DateTime < this) {
      clock.DateTime = this
    }
    return clock.DateTime
  }

  /**
   * Get the date for the given day in the next month.
   * @return the same day in the month after this Date, as a Date.
   */
  function nextDayOfMonth(dayOfMonth : int) : Date {
    return com.guidewire.bc.util.BCDateTimeUtil.getNextDateOfThisDay( dayOfMonth, this )
  }

  /**
   * Add months to this date, starting with the given current time and
   * respecting the day of month.
   * The important difference between this method and {@see Date#addMonths()}
   * is that this method will identify if the current date is at the end of a
   * month, and potentially larger than a future date's end of month.  We want
   * to avoid situations where the day of month changes as part of a series of
   * calls to this method.
   * <p/>
   * For example, Date.addMonths would return the following series:
   * <p/>
   * Jan 30, Feb 28, Mar 28, etc
   *
   * This method would return:
   * Jan 30, Feb 28, Mar 30, etc

   * @param count
   * @return a new Date
   */
  function addMonthsRespectingDayOfMonth(count : int) : Date {
    return BCUtils.addMonthsRespectingDayOfMonth(this, count);
  }

  /**
   * Get the date for the start of the next year.
   * @return the start of the year after this Date, as a Date.
   */
  function startOfNextYear() : Date {
    return DateTimeUtil.trimToStartOfNextYear(this);
  }

  /**
   * Compares the target date to this date, ignoring the time component
   *
   * @param targetDate date to compare to this date
   * @return true if the dates are equal, regardless of the time
   */
  function isSameDayIgnoringTime(targetDate: Date) : boolean {
    return this.differenceInDays(targetDate) == 0 ? true : false
  }
}
