var ss = SpreadsheetApp.getActive().getActiveSheet()
function uiFunc() {
  var ui = SpreadsheetApp.getUi()
   ui = ui.createMenu('25Live Parser')
   ui.addItem('Create a Template','createTemplate')
   ui.addItem('Create a Calendar','createCalendar')
   ui.addToUi()
}

function createTemplate(){
  ss.appendRow(['Name','ical URL', '','','', 'Calendar ID'])
  ss.appendRow(['','','','','', 'calendar id goes here...'])
}

function createCalendar(){
  // var newCalendar = CalendarApp.createCalendar('25Live')
  // ss.getRange(2,6).setValue(newCalendar.getId())
  Logger.log(ss.getRange(String("B2:B")).getValues()[10] == '')
}
