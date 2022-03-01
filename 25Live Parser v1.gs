/**
 * 25Live Parser: Parses ical files from 25Live into a Google Calendar format
 * Created By: Benjamin Goldstone '24
 * Revision Date: 2/27/2022
 * A program to parse Event Location ical files from 25Live and append them to a specified Google Calendar.
 * Only Change calendarID and/or append to icals Array.
 */
var calendarID = "c_h0s33079kg1gi81p6gckcoobeg@group.calendar.google.com"
function myFunction() {
  //All separated by a comma (Includes Red Doors, Event Space, 113) MUST BE A LOCATION
  //uses Calendar ID from Integrate Calendar Setting
  var now = new Date()
  //If Midnight delete all events.
  if(now.getHours() == 0){
    deleteEvents()
  } else {
  var icals = Array()
  //Red Doors
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=42&start_dt=-30&end_dt=+180&options=standard")
  //Event Space
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=315&start_dt=-30&end_dt=+180&options=standard")
  //113
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=39&start_dt=-30&end_dt=+180&options=standard")
  //111-113
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=41&start_dt=-30&end_dt=+180&options=standard")
  //Parents' Plaza
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=52&start_dt=-30&end_dt=+180&options=standard")
 
  //Detects Daylight Savings Time
  Date.prototype.stdTimezoneOffset = function() 
  {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }
  Date.prototype.dst = function() {
  if(this.getTimezoneOffset() < this.stdTimezoneOffset()){
    return " -0400"
  }
  return " -0500"
  }

  
  var eventCalendar = CalendarApp.getCalendarById(calendarID)
  // eventCalendar.setHidden(false)
  
  //For Each Calendar
  for (var calendar in icals){
    Utilities.sleep(15000)
    currentCalendar = String(UrlFetchApp.fetch(icals[calendar])).split("UID")
    
    //For Each Event
    for (var event in currentCalendar){
      var eventInfo = Array()
      var eventLocation = ""
      var eventStartDate = ""
      var eventEndDate = ""
      var eventTitle = ""
      var eventLink = ""
      if(event == 0){
        continue
      }

      //gets info for each event
      lines = currentCalendar[event].split("\n")
      for (var line in lines){
        if(lines[line].startsWith("X-R25-TITLE")){
          eventTitle = lines[line].substring(12)
        }

        //Gets event id for event link
        if(line == 0){
         eventLink = "https://25live.collegenet.com/pro/muhlenberg#!/home/event/" + (lines[line].substring((lines[line].indexOf("=")+1),lines[line].indexOf(":")))+"/details"
        }
        
        //Gets Event type
        if(lines[line].startsWith("X-R25-TYPE")){
          eventInfo.push("TYPE: "+ lines[line].substring(lines[line].indexOf(":")+1))
        }

        //Gets Event Organization
        if(lines[line].startsWith("X-R25-ORGANIZATION")){
          eventInfo.push("ORGANIZATION: " + lines[line].substring(lines[line].indexOf(":")+1))
        }

        //Gets Event Location
        if (lines[line].startsWith("LOCATION")){
          eventLocation = lines[line].substring(9)
        }

        //Gets Event Status
        if(lines[line].startsWith("STATUS")){
          eventInfo.push(lines[line])
        }

        //Gets Event Requestor
        if(lines[line].startsWith("ATTENDEE")){
          eventInfo.push("REQUESTOR:"+ lines[line].split(";")[3].substring(3))
        }

        //Gets Event Organizer
        if(lines[line].startsWith("ORGANIZER")){
          eventInfo.push("ORGANIZER:"+ lines[line].split(";")[2].substring(3))
        }

        //Get Start Date and Time
        if(lines[line].startsWith("DTSTART")){
          eventStartDate = lines[line].substring(lines[line].indexOf(":"))
        }

        //Get Start Date and Time
        if(lines[line].startsWith("DTEND")){
          eventEndDate = lines[line].substring(lines[line].indexOf(":"))
        }
      }
    //parses date
    //Just event Date
    var justStartDate = new Date(eventStartDate.substring(5,7) + "-" + eventStartDate.substring(7,9) + "-" + eventStartDate.substring(1,5))
    var justEndDate = new Date(eventEndDate.substring(5,7) + "-" + eventEndDate.substring(7,9) + "-" + eventEndDate.substring(1,5))
    //Date and Time
    var eventStartDateParsed = new Date((eventStartDate.substring(5,7) + "-" + eventStartDate.substring(7,9) + "-" + eventStartDate.substring(1,5) + " " + eventStartDate.substring(10,12)+":" + eventStartDate.substring(12,14) + justStartDate.dst()))
    var eventEndDateParsed = new Date((eventEndDate.substring(5,7) + "-" + eventEndDate.substring(7,9) + "-" + eventEndDate.substring(1,5) + " " + eventEndDate.substring(10,12)+":" + eventEndDate.substring(12,14) + justEndDate.dst()))
    var exists = false
    var today = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))

    //Checks if event is today or in future does not look at past events
    if(justStartDate >= today){
      
      var eventsForDay = eventCalendar.getEventsForDay(justStartDate)
      //Checks if Event exists
      for(event in eventsForDay){
        if (String(eventsForDay[event].getTitle()) == eventTitle && eventsForDay[event].getLocation() == eventLocation && eventsForDay[event].getStartTime().getHours() == eventStartDateParsed.getHours()){
          exists = true
          break
        }
      }
      //If event does not exist create it.
      if(!exists){
        var today = new Date()
        eventInfo.push("Date Added: " + today.getMonth()+1 +"/" + today.getDate() + "/" + today.getFullYear() + " " + today.getHours() + ":" + ((today.getMinutes()<10?'0':'') + today.getMinutes()))
        var thisEvent = eventCalendar.createEvent(eventTitle,eventStartDateParsed, eventEndDateParsed,{location : eventLocation})
        eventInfo.push(eventLink)
        thisEvent.setDescription(eventInfo.join("\n\n"))
        //Delay so server doesn't get overloaded
        if(event % 5 == 0){ 
        Utilities.sleep(3000)
        }
        Logger.log("Event: " + eventTitle + " created!")
      }else{
        Logger.log("Event: " + eventTitle + " already exists!")
      }
    }
    }
  }
  Logger.log("END!") 
}
}

function deleteEvents(){
  var eventCalendar = CalendarApp.getCalendarById(calendarID)
  var today = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
  var a_year_from_now = new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000))
  //gets all events between now and a year from now
  events = eventCalendar.getEvents(today,a_year_from_now)
  //deletes all events between now and a year from now
  for (event in events){
    Logger.log(events[event].getTitle() + " deleted!")
    events[event].deleteEvent()
    if(event % 5 == 0){
    Utilities.sleep(3000)
    }
  }

}
