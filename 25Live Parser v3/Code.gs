/**
 * 25Live Parser: Parses ical files from 25Live into a Google Calendar format
 * Created By: Benjamin Goldstone '24
 * Revision Date: 2/27/2022
 * A program to parse Event Location ical files from 25Live and append them to a specified Google Calendar.
 * Only Change calendarID and/or append to icals Array.
 */
var calendarID = "xyz@group.calendar.google.com";
var location = "";
function myFunction() {
  //All separated by a comma (Includes Red Doors, Event Space, 113) MUST BE A LOCATION
  //uses Calendar ID from Integrate Calendar Setting
  var icals = Array();
  let eventIDs = {};

  //icals.push("Location ical URL")

  //Detects Daylight Savings Time
  Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  };
  Date.prototype.dst = function () {
    if (this.getTimezoneOffset() < this.stdTimezoneOffset()) {
      return " -0400";
    }
    return " -0500";
  };

  var eventCalendar = CalendarApp.getCalendarById(calendarID);
  // eventCalendar.setHidden(false)

  //For Each Calendar
  for (var calendar in icals) {
    Utilities.sleep(5000);
    try {
      currentCalendar = String(UrlFetchApp.fetch(icals[calendar])).split("UID");
    } catch (error) {
      Utilities.sleep(5000);
      try {
        currentCalendar = String(UrlFetchApp.fetch(icals[calendar])).split(
          "UID"
        );
      } catch (error) {
        Logger.logI(`${icals[calendar]}\nError: ${error}`);
      }
    }

    //For Each Event
    for (var event in currentCalendar) {
      var eventInfo = Array();
      var eventLocation = "";
      var eventStartDate = "";
      var eventEndDate = "";
      var eventTitle = "";
      var eventLink = "";
      let eventID;
      if (event == 0) {
        continue;
      }

      //gets info for each event
      lines = currentCalendar[event].split("\n");
      for (var line in lines) {
        if (lines[line].startsWith("X-R25-TITLE")) {
          eventTitle = lines[line].substring(12);
        }

        //Gets event id for event link
        if (line == 0) {
          eventID = lines[line].substring(
            lines[line].indexOf("=") + 1,
            lines[line].indexOf(":")
          );
          eventLink =
            `https://25live.collegenet.com/pro/${location}#!/home/event/` +
            eventID +
            "/details";
        }

        //Gets Event type
        if (lines[line].startsWith("X-R25-TYPE")) {
          eventInfo.push(
            "TYPE: " + lines[line].substring(lines[line].indexOf(":") + 1)
          );
        }

        //Gets Event Organization
        if (lines[line].startsWith("X-R25-ORGANIZATION")) {
          eventInfo.push(
            "ORGANIZATION: " +
              lines[line].substring(lines[line].indexOf(":") + 1)
          );
        }

        //Gets Event Location
        if (lines[line].startsWith("LOCATION")) {
          eventLocation = lines[line].substring(9);
        }

        //Gets Event Status
        if (lines[line].startsWith("STATUS")) {
          eventInfo.push(lines[line]);
        }

        //Gets Event Requestor
        if (lines[line].startsWith("ATTENDEE")) {
          eventInfo.push("REQUESTOR:" + lines[line].split(";")[3].substring(3));
        }

        //Gets Event Organizer
        if (lines[line].startsWith("ORGANIZER")) {
          eventInfo.push("ORGANIZER:" + lines[line].split(";")[2].substring(3));
        }

        //Get Start Date and Time
        if (lines[line].startsWith("DTSTART")) {
          eventStartDate = lines[line].substring(lines[line].indexOf(":"));
        }

        //Get Start Date and Time
        if (lines[line].startsWith("DTEND")) {
          eventEndDate = lines[line].substring(lines[line].indexOf(":"));
        }
      }
      //parses date
      //Just event Date
      var justStartDate = new Date(
        eventStartDate.substring(5, 7) +
          "-" +
          eventStartDate.substring(7, 9) +
          "-" +
          eventStartDate.substring(1, 5)
      );
      var justEndDate = new Date(
        eventEndDate.substring(5, 7) +
          "-" +
          eventEndDate.substring(7, 9) +
          "-" +
          eventEndDate.substring(1, 5)
      );
      //Date and Time
      var eventStartDateParsed = new Date(
        eventStartDate.substring(5, 7) +
          "-" +
          eventStartDate.substring(7, 9) +
          "-" +
          eventStartDate.substring(1, 5) +
          " " +
          eventStartDate.substring(10, 12) +
          ":" +
          eventStartDate.substring(12, 14) +
          justStartDate.dst()
      );
      var eventEndDateParsed = new Date(
        eventEndDate.substring(5, 7) +
          "-" +
          eventEndDate.substring(7, 9) +
          "-" +
          eventEndDate.substring(1, 5) +
          " " +
          eventEndDate.substring(10, 12) +
          ":" +
          eventEndDate.substring(12, 14) +
          justEndDate.dst()
      );
      var exists = false;
      var today = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

      //Checks if event is today or in future does not look at past events

      var eventsForDay = eventCalendar.getEventsForDay(justStartDate);
      //Checks if Event exists
      for (event in eventsForDay) {
        if (
          String(eventsForDay[event].getTitle()) == eventTitle &&
          eventsForDay[event].getLocation() == eventLocation &&
          eventsForDay[event].getStartTime().getHours() ==
            eventStartDateParsed.getHours()
        ) {
          exists = true;
          break;
        }
      }
      //Adds to EventIDs
      if (eventLink in eventIDs) {
        eventIDs[eventLink].push([
          eventTitle,
          eventStartDateParsed,
          eventLocation,
        ]);
      } else {
        eventIDs[eventLink] = [];
        eventIDs[eventLink].push([
          eventTitle,
          eventStartDateParsed,
          eventLocation,
        ]);
      }
      //If event does not exist create it.
      if (!exists) {
        var thisEvent = eventCalendar.createEvent(
          eventTitle,
          eventStartDateParsed,
          eventEndDateParsed,
          { location: eventLocation }
        );
        let eventDetails = getRequirements(eventID);
        if (eventDetails) {
          eventInfo.push(eventDetails);
        } else {
          eventInfo.push("Requirements: None");
        }
        eventInfo.push(eventLink);
        var today = new Date();
        eventInfo.push(
          "Date Added: " +
            String(today.getMonth() + 1) +
            "/" +
            today.getDate() +
            "/" +
            today.getFullYear() +
            " " +
            String(today.getHours() % 12 == 0 ? "12" : today.getHours() % 12) +
            ":" +
            ((today.getMinutes() < 10 ? "0" : "") + today.getMinutes()) +
            " " +
            String(today.getHours() >= 12 ? "PM" : "AM")
        );
        thisEvent.setDescription(eventInfo.join("\n\n"));
        //Delay so server doesn't get overloaded
        if (event % 5 == 0) {
          Utilities.sleep(3000);
        }
        Logger.log("Event: " + eventTitle + " created!");
      } else {
        Logger.log("Event: " + eventTitle + " already exists!");
      }
    }
  }
  deleteDeletedEvents(eventIDs);
  Logger.log("END!");
}

function deleteDeletedEvents(eventIDs) {
  let eventCalendar = CalendarApp.getCalendarById(calendarID);
  let today = new Date(new Date().getTime() - 24 * 60 * 20 * 1000);
  let oneHundredEightyDays = new Date(
    new Date().getTime() + 181 * 24 * 60 * 60 * 1000
  );
  events = eventCalendar.getEvents(today, oneHundredEightyDays);
  for (let event in events) {
    let deleteBool = true;
    //{link : title start location}
    let eventLink = String(events[event].getDescription()).match(
      /https:\/\/[\S]*details/
    );
    Logger.log(eventLink);
    if (eventLink != null) {
      eventLink = eventLink[0];
      let currentEvents = eventIDs[eventLink];
      for (let currentEvent in currentEvents) {
        Logger.log(
          String(events[event].getTitle()).indexOf(
            currentEvents[currentEvent][0]
          )
        );
        Logger.log(events[event].getStartTime().getTime());
        Logger.log(currentEvents[currentEvent][1].getTime());
        Logger.log(urrentEvents[currentEvent][2]);
        Logger.log(events[event].getLocation());
        Logger.log(String(events[event].getDescription()).indexOf(eventLink));
        if (
          String(events[event].getTitle()).indexOf(
            currentEvents[currentEvent][0]
          ) > -1 &&
          events[event].getStartTime().getTime() ==
            currentEvents[currentEvent][1].getTime() &&
          currentEvents[currentEvent][2] == events[event].getLocation() &&
          String(events[event].getDescription()).indexOf(eventLink) > -1
        ) {
          deleteBool = false;
          break;
        }
      }
    }
    if (deleteBool) {
      Logger.log(events[event].getTitle() + " Deleted!");
      events[event].deleteEvent();
      if (event % 2 == 0) {
        Utilities.sleep(1500);
      }
    } else {
      Logger.log(events[event].getTitle() + " kept!");
    }
  }
}
