package gw.command

uses com.guidewire.bc.util.BCDateTimeUtil
uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.DefaultMethod

@Export
@DefaultMethod("withDefault")
class Clock extends BCBaseCommand
{
  construct()
  {
    super()
  }
  
  @Argument("Number of Days", "1")
  function addDays() : String 
  {
    addDays( getArgumentAsInt("Number of Days") )
    return "Today is: " + currentDate()
  }

  @Argument("Number of Weeks", "1")
  function addWeeks() : String 
  {
    addWeeks( getArgumentAsInt("Number of Weeks"))
    return "Today is: " + currentDate()
  }

  @Argument("Number of Months", "1")
  function addMonths() : String
  {
    addMonths( getArgumentAsInt("Number of Months"))
    return "Today is: " + currentDate()
  }
  
  function withDefault() : String
  {
    return "Today is: " + currentDate()
  }
  
  function withBeginOfMonth() : String
  {
    var newDate = BCDateTimeUtil.getNextDateOfThisDay( 1, currentDate() )
    setDate( newDate )
    return "Today is: " + currentDate()
  }
  
  function withEndOfMonth() : String
  {
    var lastDay = new org.joda.time.DateTime().dayOfMonth().MaximumValue
    if(currentDate().DayOfMonth != lastDay)
    {
      var newDate = BCDateTimeUtil.getNextDateOfThisDay( lastDay, currentDate() )
      setDate( newDate )
    }
    return "Today is: " + currentDate()
  }
  
  function withOneMoreMonth(): String
  {
    addMonths( 1 )
    return "Today is: " + currentDate()
  }
  
  function withOneMoreDay(): String
  {
    addDays( 1 )
    return "Today is: " + currentDate()
  }
  
  function withOneMoreWeek(): String
  {
    addDays( 7 )
    return "Today is: " + currentDate()
  }
  
  function withDayIs_15() : String
  {
    var newDate = BCDateTimeUtil.getNextDateOfThisDay( 15, currentDate() )
      setDate( newDate )
    return "Today is: " + currentDate()
  }
  
  @Argument("dayOfMonth", "1")
  function withDayIs() : String
  {
    var newDate = BCDateTimeUtil.getNextDateOfThisDay( getArgumentAsInt("dayOfMonth"), currentDate() )
    setDate( newDate )
    return "Today is: " + currentDate()
  }
}
