/**
 * 25Live Parser: Parses ical files from 25Live into a Google Calendar format
 * Created By: Benjamin Goldstone '24 <bgoldstone1@gmail.com>
 * Revision Date: 11/28/2022
 * A program to parse Event Location ical files from 25Live and append them to a specified Google Calendar.
 * Only Change calendarID and/or append to icals Array.
 */
//uses Calendar ID from Integrate Calendar Setting
var calendarID = "c_h0s33079kg1gi81p6gckcoobeg@group.calendar.google.com"
var eventIDList = Array()
function myFunction() {
  var icals = Array()
  //Red Doors
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=42&start_dt=-30&end_dt=+90&options=standard")
  //Event Space
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=315&start_dt=-30&end_dt=+90&options=standard")
  //113
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=39&start_dt=-30&end_dt=+90&options=standard")
  //111-113
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=41&start_dt=-30&end_dt=+90&options=standard")
  //Parents' Plaza
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=52&start_dt=-30&end_dt=+90&options=standard")
  //Fireside Lounge
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=50&start_dt=-30&end_dt=+90&options=standard")
  //College Green
  icals.push("https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=211&start_dt=-30&end_dt=+90&options=standard")
  //Miller Forum
  icals.push('https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=57&start_dt=-30&end_dt=+90&options=standard')
  // RH Amphitheater
  icals.push('https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=592&start_dt=-30&end_dt=+90&options=standard')
  // CA Galleria
  icals.push('https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=91&start_dt=-30&end_dt=+90&options=standard')
  // CA Galleria Bridge
  icals.push('https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&space_id=439&start_dt=-30&end_dt=+90&options=standard')
  //SOLE REQUESTED
  icals.push('https://25live.collegenet.com/25live/data/muhlenberg/run/rm_reservations.ics?caller=pro&query_id=265049&start_dt=-30&end_dt=+90&options=standard')

  //Detects Daylight Savings Time
  Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }
  Date.prototype.dst = function () {
    if (this.getTimezoneOffset() < this.stdTimezoneOffset()) {
      return " -0400"
    }
    return " -0500"
  }

  var eventCalendar = CalendarApp.getCalendarById(calendarID)
  // eventCalendar.setHidden(false)

  //For Each Calendar
  for (var calendar in icals) {
    Utilities.sleep(1000)
    try {
      currentCalendar = String(UrlFetchApp.fetch(icals[calendar])).split("UID")
    } catch (error1) {
      Utilities.sleep(5000)
      try {
        currentCalendar = String(UrlFetchApp.fetch(icals[calendar])).split("UID")
      } catch (error) {
        Logger.log(`${icals[calendar]}\nError: ${error}`)
        return
      }
    }



    //For Each Event
    for (var event in currentCalendar) {
      var eventInfo = Array()
      var eventLocation = ""
      var eventStartDate = ""
      var eventEndDate = ""
      var eventTitle = ""
      var eventLink = ""
      let eventID
      if (event == 0) {
        continue
      }

      //gets info for each event
      lines = currentCalendar[event].split("\n")
      for (var line in lines) {
        if (lines[line].startsWith("X-R25-TITLE")) {
          eventTitle = lines[line].substring(12)
        }

        //Gets event id for event link
        if (line == 0) {
          eventID = lines[line].substring((lines[line].indexOf("=") + 1), lines[line].indexOf(":"))
          eventLink = "https://25live.collegenet.com/pro/muhlenberg#!/home/event/" + eventID + "/details"
        }

        //Gets Event type
        if (lines[line].startsWith("X-R25-TYPE")) {
          eventInfo.push("Type: " + lines[line].substring(lines[line].indexOf(":") + 1))
        }

        //Gets Event Organization
        if (lines[line].startsWith("X-R25-ORGANIZATION")) {
          eventInfo.push("Organization: " + lines[line].substring(lines[line].indexOf(":") + 1))
        }

        //Gets Event Location
        if (lines[line].startsWith("LOCATION")) {
          eventLocation = lines[line].substring(9)
        }

        //Gets Event Status
        if (lines[line].startsWith("STATUS")) {
          try {
            eventInfo.push(`Status: ${String(lines[line].split(":")[1]).toLowerCase()}`)
          } catch {
            Logger.log(`Status not found for ${eventTitle}`)
          }

        }

        //Gets Event Requestor
        if (lines[line].startsWith("ATTENDEE")) {
          eventInfo.push("Requestor: " + lines[line].split(";")[3].substring(3).replace(":MAILTO:", " "))
        }

        //Gets Event Organizer
        if (lines[line].startsWith("ORGANIZER")) {
          eventInfo.push("Organizer: " + lines[line].split(";")[2].substring(3).replace(":MAILTO:", " "))
        }

        //Get Start Date and Time
        if (lines[line].startsWith("DTSTART")) {
          eventStartDate = lines[line].substring(lines[line].indexOf(":"))
        }

        //Get Start Date and Time
        if (lines[line].startsWith("DTEND")) {
          eventEndDate = lines[line].substring(lines[line].indexOf(":"))
        }
      }
      //parses date
      //Just event Date
      var justStartDate = new Date(eventStartDate.substring(5, 7) + "-" + eventStartDate.substring(7, 9) + "-" + eventStartDate.substring(1, 5))
      var justEndDate = new Date(eventEndDate.substring(5, 7) + "-" + eventEndDate.substring(7, 9) + "-" + eventEndDate.substring(1, 5))
      //Date and Time
      var eventStartDateParsed = new Date((eventStartDate.substring(5, 7) + "-" + eventStartDate.substring(7, 9) + "-" + eventStartDate.substring(1, 5) + " " + eventStartDate.substring(10, 12) + ":" + eventStartDate.substring(12, 14) + justStartDate.dst()))
      var eventEndDateParsed = new Date((eventEndDate.substring(5, 7) + "-" + eventEndDate.substring(7, 9) + "-" + eventEndDate.substring(1, 5) + " " + eventEndDate.substring(10, 12) + ":" + eventEndDate.substring(12, 14) + justEndDate.dst()))
      var exists = false
      var today = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
      //append to Event List
      eventIDList.push(`${eventTitle}${eventLocation}${eventLink}${eventStartDateParsed}`)
      //Checks if event is today or in future does not look at past events
      var eventsForDay = eventCalendar.getEventsForDay(justStartDate)
      //Checks if Event exists
      let existingEvent
      for (event in eventsForDay) {
        if (String(eventsForDay[event].getTitle()) == eventTitle && eventsForDay[event].getLocation() == eventLocation && eventsForDay[event].getStartTime().getHours() == eventStartDateParsed.getHours()) {
          existingEvent = eventsForDay[event]
          exists = true
          break
        }
      }
      //get event details
      let eventDetails = getRequirements(eventID)
      if (eventDetails) {
        eventInfo.push(eventDetails)
      } else {
        eventInfo.push("Requirements: None")
      }
      eventInfo.push(eventLink)
      var today = new Date()
      eventInfo.push("Date Added: " + String(today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear() + " " + String(today.getHours() % 12 == 0 ? "12" : today.getHours() % 12) + ":" + ((today.getMinutes() < 10 ? '0' : '') + today.getMinutes()) + " " + String(today.getHours() >= 12 ? "PM" : "AM"))
      let eventDescription = eventInfo.join("\n\n")
      //If event does not exist create it.
      if (!exists) {
        var thisEvent = eventCalendar.createEvent(eventTitle, eventStartDateParsed, eventEndDateParsed, { location: eventLocation })
        thisEvent.setDescription(eventDescription)
        //Delay so server doesn't get overloaded
        if (event % 5 == 0) {
          Utilities.sleep(3000)
        }
        Logger.log("Event: " + eventTitle + " created!")
      } else {
        // If updated description, update description.
        if (String(existingEvent.getDescription()).substring(0,String(existingEvent.getDescription()).indexOf("\n\nDate Added:")) != String(eventDescription).substring(0,eventDescription.indexOf("\n\nDate Added:"))) {
          existingEvent.setDescription(eventDescription)
          Logger.log("Event: " + eventTitle + " updated!")
        } else {
          Logger.log("Event: " + eventTitle + " already exists!")
        }
      }
    }
  }
  deleteEvents()
  Logger.log("END!")
}

//Checks list of events to see if it needs to be deleted.
function deleteEvents() {
  var eventCalendar = CalendarApp.getCalendarById(calendarID)
  var today = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
  var a_year_from_now = new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000))
  //gets all events between now and a year from now
  events = eventCalendar.getEvents(today, a_year_from_now)
  //deletes all events between now and a year from now

  for (event in events) {
    //
    let eventDescription = events[event].getDescription()
    //creates unique indentiifer using `${eventTitle}${eventLocation}${eventID}${eventStartDateParsed}`
    let eventID = `${events[event].getTitle()}${events[event].getLocation()}${eventDescription.substring(eventDescription.indexOf("https://25live.collegenet.com/pro/muhlenberg#!/home/event/"), eventDescription.indexOf("/details\n\nDate Added:") + 8)}${events[event].getStartTime()}`
    if (eventIDList.indexOf(eventID) == -1) {
      Logger.log(`${events[event].getTitle()} ${events[event].getLocation()} Deleted!`)
      events[event].deleteEvent()
      Utilities.sleep(3000)
    }
  }

}
