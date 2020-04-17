/***********************************************
This file provides functions that allow to define and automatically
build a class calendar and related utilities for a course web page.
Currently supported utilities:
- compact calendar of classes with hyperlink to schedule
- schedule with description of each class

Author: Iliano Cervesato, based on Brian Gosselin's "basic calendar"
        (http://scriptasylum.com/bgaudiodr/), script also featured on
        Dynamic Drive (http://www.dynamicdrive.com)

External functions:
- setSemester():       sets beginning and end of semester
- setBreak():          sets beginning and end of break
- setWeek():           sets a style for each day of the week during classes
- setFinal():          sets the date, room and time of the final
- addExam():           adds an exam for a given date with type and date (any number)
- addHw():             adds a homework for a given date (any number)
- go():                does some initialization
- buildCalendar():     outputs the calendar for the semester
- buildSchedule():     outputs a schedule of classes for a syllabus
- buildWorkCalendar(): outputs the calendar of all classwork

Useful extensions (not yet implemented):
- Allow lectures to start/resume mid-week

Last modified: 16 Jul 2014
***********************************************/

var week = [];                   // Weekly schedule: 7-element array with values
                                 // in 'weekend, noclass, lecture, recitation'
var classes  = { start: null,
                 end:   null};   // Start and end of classes
var exams    = { start: null,
                 end:   null};   // Start and end of the exam period
var Break    = null;             // Start and end of week-long break, if any
var holidays = [];               // National holidays and random days off
var exms     = [];               // Exams
var hws      = [];               // Homeworks
var nextHw   = null;             // Next homework
var final    = null;             // Final, if any
var baseURL  ='schedule.shtml';  // Base URL for schedule page

// Lecture categories -- add more as needed
var weekend = 	 { style: 'weekend',
              	   type:  'noclass'
              	 }
var noclass = 	 { style: 'noclass',
              	   type:  'noclass'
              	 }
var lecture = 	 { name:  'Lecture',
              	   style: 'lecture',
              	   type:  'lecture',
                   start: 0,
                   skipHolidays: true
                 }
var recitation = { name:  'Recitation',
                   style: 'recitation',
                   type:  'practice',
                   start: 1,
                   skipHolidays: false
                 }
var lab =        { name:  'Lab',
                   style: 'lab',
                   type:  'practice',
                   start: 1,
                   skipHolidays: false
                 }


function setToday() {
  var td = new Date();
  return (new Date(td.getFullYear(), td.getMonth(), td.getDate()));
}
var today = setToday();

function setWeek (sat, sun, mon, tue, wed, thu, fri) {
  week = [sat, sun, mon, tue, wed, thu, fri];
}
function setSemester (y, bm,bd, em,ed) { // Begin-end of teaching semester
  classes = { start: new Date (y, bm-1, bd),
	      end:   new Date (y, em-1, ed)
            };
 }
function setExams (y, bm,bd, em,ed) {    // Begin-end of exam period
  exams = { start: new Date (y, bm-1, bd),
	    end:   new Date (y, em-1, ed)
          };
 }
function setBreak (y, bm,bd, em,ed) {    // Begin-end of mid-semester break
  Break = { start: new Date (y, bm-1, bd),
	    end:   new Date (y, em-1, ed)
          };
 }
function addHoliday (y,m,d) {
  holidays.push (new Date(y,m-1,d));
}
function setFinal (y,m,d,t,r,pc,lo,cor) {   // Begin-end of final (+logistics)
  final = { date:      new Date(y,m-1,d),
	    time:      t,
	    room:      r,
	    percent:   pc,
	    learnobj:  lo,
	    corrected: cor
          };
 }
function addExam (nm,y,m,d,pc,lo,cor) {     // Begin-end of exam (+logistics)
  exms.push ({ date:      new Date(y,m-1,d),
	       percent:   pc,
	       learnobj:  lo,
	       corrected: cor,
	       name:      nm
	    });
}
function addHw (tp,y,m,d,pc,lo,pos,cor,url) {
  hws.push ({ date:      new Date(y,m-1,d),
	      name:      tp,
	      percent:   pc,
	      learnobj:  lo,
	      posted:    pos,
	      corrected: cor,
              url:       url
	   });
}


/**************************
   Utility functions
**************************/
function mkURL(text, url) {          // Format hyperling if URL is given
  if (url == null) return text;
  return '<a href="' + url + '">' + text + '</a>';
}
function sortAndPrintList(cmp, l) {
  l.sort(cmp);
  var s = '<ul>';
  for (var i=0; i<l.length; i++)
    s += '<li>' + l[i].msg + '</li>';
  s += '</ul>';
  return s;
}


function isDate(d1,d2) {             // Check if two dates are equal
  return (d1<=d2 && d1>=d2);
}
function lectureDay(day) {            // Check if day is a lecture day
  return (week[day%7].type == 'lecture');
}
function practiceDay(day) {           // Check if day is a practice day
  return (week[day%7].type == 'practice');
}
function noclassDay(day) {           // Check if day is a day with no class
  return (week[day%7].type == 'noclass');
}
function weekendDay(day) {           // Check if day is a weekend day
  return (week[day%7].style == 'weekend');
}

function isHoliday(date) {           // Check if 'date' is a holiday
  return holidays.some(function(x) {return isDate(date,x)});
}
function isExam(date) {              // Check if 'date' is an exam
  return exms.some(function(x) {return isDate(date,x.date) == true});
}
function getExam(date) {
  for (var i=0; i<exms.length; i++)
    if (isDate(date,exms[i].date)) return exms[i];
  return null;
}

function isFinal(date) {             // Check if the final is on 'date'
  if (final==null) return false;
  if (isDate(date, final.date)) return true;
  return false;
}

function checkHw(date) {             // Check if there is a homework on 'date'
  return hws.some(function(x) {return isDate(date,x.date) == true});
}
function setNextHw() {               // Returns the date of the next homework
  for (var i=0; i<hws.length; i++)
    if (today<=hws[i].date) return hws[i];
  return null;
}
function nextHwDue(type, tp, suffix) { // Returns the next hw by type
  var n = 0;
  for (var i=0; i<hws.length; i++)
    if (hws[i].name == tp) {
      n++;
      if (today<=hws[i].date) {
        var date = hws[i].date;
        var s  = '<span style="color:red;">Next ' + type + '</span>: ';
            s += '<em>' + tp + " " + n + '</em>';
            s += ' due on <b>' + formatDateLong(date) + '</b> '
            s += suffix;
        return { msg: s, date: date };
      }
    }
  return { msg: "No more " + type + " due", date : exams.end };
}
function nextExam() {   // Returns the date of the next exam
  var n = 0;
  for (var i=0; i<exms.length; i++) {
    n++;
    if (today<=exms[i].date) {
      var date = exms[i].date;
      var s  = '<span style="color:red;">Next exam</span>: ';
          s += '<em>' + exms[i].name + " " + n + '</em>';
          s += ' on <b>' + formatDateLong(date) + '</b>';
      return { msg: s, date: date };
    }
  }
  if (final != null && today <= final.date) {
      var s  = '<span style="color:red;">Next exam</span>: ';
          s += '<em>final </em> on <b>' + formatDateLong(final.date) + '</b>';
    return { msg: s, date: final.date };
  }

  return { msg: "No exams left", date: exams.end };
}

// Populate/reset the counters variable
function buildCounters() {
  counters = { e: 1,          // Exam counter
	       h: 1};         // Holiday counter
  for (var i=0; i < 7; i++) { // Counters for lectures and practice classes
    if ('name' in week[i])
      counters[week[i].name] = week[i].start;
  }
}


function compareByDate (h1,h2) {
  if (h1.date < h2.date) return -1;
  if (h1.date > h2.date) return 1;
  return 0;
}
function go() {                      // Initialization: when is next homework
  hws.sort(compareByDate);
  nextHw = setNextHw();
  exms.sort(compareByDate);
  sortClasswork();
}

/****************************************************************************
   The next batch of code builds a compact calendars to include in
   the class website.
****************************************************************************/

/* buildCal(month, year, css_table, css_month, css_week, css_day, border)
    month     = The month you wish to display where 1=January and 12=December.
    year      = The year you wish to display.
    css_table = Name of the CSS class to style the calendar's outermost table.
    css_month = Name of the CSS class to style the calendar's month/year bar.
    css_week  = Name of the CSS class to style the calendar's week days row
    css_day   = Name of the CSS class to style the individual days cells.
    border    = The thickness of the border between all cells. 0=no border.
   This function was adapted from
    http://www.dynamicdrive.com/dynamicindex7/basiccalendar.htm
*/
function buildCal(m, y,    // Month and year
		  cM, cH,  // Styles for container and month/year header
		  cDW, cD, // Styles for weekday header and individual days
		  brdr) {  // Border width
var mn=['January', 'February', 'March',     'April',   'May',      'June',
        'July',    'August',   'September', 'October', 'November', 'December'];
var dim=[31,0,31,30,31,30,31,31,30,31,30,31]; // Number of days in each month

//DD replaced lines to fix date bug when current day is 31st
var oD = new Date(y, m, 1);
oD.od = oD.getDay()+1;

// Handles February
dim[1]=(   (oD.getFullYear()%100 != 0 && oD.getFullYear()%4 == 0)
        || oD.getFullYear()%400 == 0)
       ? 29 : 28;

// Surrounding table
var t = '<div class="'+cM+'">';
t += '<table class="'+cM+'" cols="7" border="'+brdr+'">';

// Row containing the month and year
t += '<thead><th colspan="7" class="'+cH+'">'+mn[m]+' '+y+'</th></thead>';
t += '<tbody><tr>';

// Row containing the days of the week
for (var s=0; s<7; s++)
  t += '<td class="'+cDW+'">'+"UMTWRFS".substr(s,1)+'</td>';
t += '</tr><tr>';

// Individual dates
for (var i=1; i<=42; i++) {
  if (i-oD.od>=0 && i-oD.od<dim[m]) {
    var x = i-oD.od+1;                // Current date
    var day = new Date(y,m,x);         // Current date object
    var csD = cD;
    // Handle today
    if (isDate(today,day)) csD +=' today';
    var style = csD + ' ' + week[i%7].style; // Apply style for day of the week
    // set style for homework due dates
    if (checkHw(day)) {
      style += ' hwdue';
      if (nextHw!=null && isDate(day,nextHw.date)) style += ' hwnext';
    }
    // Set non-semester days to 'vacation'
    if ((day<classes.start || classes.end<day) && !weekendDay(i))
      style = csD + ' vacation';
    // Set break days
    else if (Break!=null && Break.start<=day && day<=Break.end)
           style = csD + ' break';
    // Set style and URL for exams
    else if (isExam(day)) {
      style += ' exam';
      var url = baseURL + '#e'+ counters.e++;
      x = '<a class="calendar" href="'+url+'">'+x+'</a>';
    }
    // Set holidays
    else if (isHoliday(day)) {
      style += ' holiday';
      var url = baseURL + '#h'+ counters.h++;
      x = '<a class="calendar" href="'+url+'">'+x+'</a>';
      // Keep counter running even during holidays
      if (   (lectureDay(i) || practiceDay(i))
           && !week[i%7].skipHolidays) {
        var name = week[i%7].name;
        counters[name]++;
      }
    }
    // Set URL for classes
    else if (practiceDay(i) || lectureDay(i)) {
      var tp = week[i%7].name;
      var url = baseURL + '#' + tp.toLowerCase() + counters[tp]++;
      x = '<a class="calendar" href="'+url+'">'+x+'</a>';
    }
    // Set style and URL for final
    if (isFinal(day)) {
      style = csD + ' final';
      var url = baseURL + '#FINAL';
      x = '<a class="calendar" href="'+url+'">'+x+'</a>';
    }
    t += '<td class="'+style+'">'+x+'</td>';
  }
  // Cells that do not contain a date
  else t += '<td class="'+cD+' noday">&nbsp;</td>';
  // End of row
  if (i%7==0 && i<36) t += '</tr><tr>';
  }
return t + '</tr></tbody></table></div>';
}

function buildCalendar() {
  var date = new Date(classes.start.getFullYear(), classes.start.getMonth(), 1);
  buildCounters();

  var t = '<table style="margin: auto;" border=1><tr>';
  while (date<=exams.end) {
    t += '<td>'
      +  buildCal(date.getMonth(),date.getFullYear(),
		  "main", "month", "daysofweek", "days", 0)
      +  '</td>';
    date.setMonth(date.getMonth()+1);
  }
  return t+'</tr></table>';
}

/****************************************************************************
   The next batch of code builds the schedule of classes to embed in
   the syllabus
****************************************************************************/

// Prints a date in the format 'Day nn Mon'
function formatDate(date){
  var day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var month = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec'];
  return day[date.getDay()] +' '+ date.getDate() +' '+ month[date.getMonth()];
}
// Prints a date fully spelled out
function formatDateLong(date){
  var day = ['Sunday','Monday','Tuesday','Wednesday','Thursday',
	     'Friday','Saturday'];
  var month = ['January','February','March','April','May','June',
               'July','August','September','October','November','December'];
  return day[date.getDay()] +' '+ date.getDate() +' '+ month[date.getMonth()]+' '+date.getFullYear();
}


// Date increment
function incrDate(date, days){
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDate();
  return new Date(y,m,d+days);
}

function nextDay(date){
  return incrDate(date,1);
}

function nextWeek(date){
  return incrDate(date,7);
}

// Prints separator sep and value n only if test is true
function pprint(n, sep, test) {
  if (test) return sep + n;
  return "";
}


// The next four fuctions load all the lecture descriptions asynchronously and
// execute a callback when all of them have returned
var snippets = [];
function registerSnippet (url, id) {
  snippets.push ({url: url, id: id});
}

function fetchSnippets (theSnippets) {
  function fetch_one (x) {
    return $.ajax ({ url:     x.url,
		     data:    {},
		     success: function (data) { $('#'+x.id).html(data); },
		  });
  }
  return $.map(theSnippets, fetch_one);
}

function callPendingSnippets(successCallback) {
  var promises = fetchSnippets(snippets);
  $.when.apply(null, promises)
   .then( successCallback,
	  function () {
	     alert('Unable to get '+this.url);
	     console.log("Failure to get snippet", this, arguments);
	  });
}

// Formats the break week for the schedule
function buildSchBreak(date){
  registerSnippet("inc/schedule/break.shtml", 'break');

  if (date.getDay()!= 6) {
    alert('Break date must start on Saturday');
    return '';
  }
  var n=0;  // Number of class days in the week
  for (var i=0; i < 7; i++) {
    if (!noclassDay(i)) n++;
  }
  console.log(n);
  // Invariant: date is a day starting on a Saturday
  var c=0;  // Iterator c in [0..6]
  while (noclassDay(c)) {
    c++;
    date = nextDay(date);
  }
  var t='<table class="classweek">';
  t +=  '<tr class="break">';
  t +=  '<td class="schedule-lecture-id">';
  t +=  '<a name="break"></a>';
  t +=  '  <div class="schedule-date">'+formatDate(date)+'</div></td>';
  t +=  '<td id="break" rowspan='+n+' class="schedule-lecture-body">';
  t +=  'waiting on id break...</td></tr>';
  c++;
  date = nextDay(date);
  for (; c < 7; c++) {
    if (!noclassDay(c)) {
      t += '<tr class="break">';
      t += '<td class="schedule-lecture-id">';
      t += '  <div class="schedule-date">'+formatDate(date)+'</div></td></tr>';
    }
    date = nextDay(date);
  }
  return t + '</table>';
}

// Formats a day within a classweek
function buildSchDay(dateString,style,type,id) {
  registerSnippet("inc/schedule/"+id+".shtml", id);
  var t='<tr class="classday '+style+'">';
  t +=  '<td class="schedule-lecture-id">';
  t +=  '<a name="'+id+'"></a>';
  t +=  '  <div class="schedule-top">';
  t +=  '    <a href="#"><img class="schedule-topimg" src="inc/img/parent.gif"></a>';
  t +=  '    <input type="button" class="summary" value="S"  title="Click to toggle the description on and off"/>';
  t +=  '    <input type="button" class="details" value="D" title="Click to toggle the concepts and readings on and off" />';
  t +=  '  </div>';
  t +=  '  <div class="schedule-date">'+dateString+'</div>';
  t +=  '  <div class="schedule-lectureN">'+type+'</div></td>';
  t +=  '<td id="'+id+'" class="schedule-lecture-body">';
  t +=  'waiting on id '+id+'...</td></tr>';
  return t;
}

// Formats a holiday within a classweek
function buildHoliday(dateString,id) {
  registerSnippet("inc/schedule/"+id+".shtml", id);
  var t='<tr class="classday holiday">';
  t +=  '<td class="schedule-lecture-id">';
  t +=  '<a name="'+id+'"></a>';
  t +=  '  <div class="schedule-date">'+dateString+'</div>';
  t +=  '<td id="'+id+'" class="schedule-lecture-body">';
  t +=  'waiting on id '+id+'...</td></tr>';
  return t;
}

// Formats a classweek for the schedule
function buildSchWeek(date){
  if (date.getDay()!= 6) {
    alert('Break date must start on Saturday');
    return '';
  }
  var t ='<table class="classweek">';
  for (var c=0; c<7; c++) {
    if (isExam(date)) {
      var s = pprint (counters.e,' ', (exms.length>1));
      t += buildSchDay(formatDate(date),'exam',getExam(date).name+s,'e'+counters.e);
      counters.e++;
    }
    else if (   isHoliday(date)
	     && (lectureDay(c) || practiceDay(c))) {
      t += buildHoliday(formatDate(date),'h'+ counters.h);
      counters.h++;
      // Keep counter running even during holidays
      if (!week[c].skipHolidays) {
        var name = week[c].name;
        counters[name]++;
      }
    }
    else if (lectureDay(c) || practiceDay(c)) {
      var name = week[c].name;
      var title = name +' '+ counters[name];
      var id = name.toLowerCase() + counters[name]++;
      t += buildSchDay(formatDate(date),week[c].style,title,id);
    }
    date = nextDay(date);
  }
  return t + '</table>';
}

// Formats the final
function buildSchFinal() {
  if (final==null) return "";
  var dateString = formatDate(final.date)+'<br>('+final.time+')';
  if (final.room != null) dateString += '<br>['+final.room+']';
  var t='<table class="classweek">';
  t +=  buildSchDay(dateString,'final','final','FINAL');
  t += '</table>';
  return t;
}

// Builds the full schedule
function buildSchedule() {
  buildCounters();

  var date = classes.start;
  while (date.getDay()!=6)   /* Align on Saturday */
    date = incrDate(date,-1);

  var satBeforeBreak = null;
  if (Break != null) {
    satBeforeBreak = Break.start;           /* Handle the break */
    while (satBeforeBreak.getDay() != 6)    /* Align on Saturday */
      satBeforeBreak = incrDate(satBeforeBreak, -1);
  }
  var t='';
  while (date<=classes.end) {
    if (   Break != null            // There is no break
	&& isDate(date,satBeforeBreak))
      t += buildSchBreak(date);
    else
      t += buildSchWeek(date);
    date = nextWeek(date);
  }
  t += buildSchFinal();
  return t;
}


/****************************************************************************
   The next batch of code builds the calendar of homeworks and exams.
****************************************************************************/

function formatDateDDM(date){
  var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var month = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec'];
  return day[date.getDay()] +'<br>'+ date.getDate() +' '+ month[date.getMonth()];
}

function formatDateDM(date){
  var month = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec'];
  return date.getDate() +' '+ month[date.getMonth()];
}

var maxcol = 14;  // maximum number of columns to be printed at once
var cwk = [];  // Sorted array of arrays containing homeworks and exams
function sortClasswork() {
  var i=0;
  var j=0;
  var itemno = [];
  function nextNumber(name) {
    if (name in itemno) return ++itemno[name]
    return (itemno[name] = 1);
  }
  var chunk = [];
  for (; i<hws.length || j<exms.length;) {
    var addHw = (i<hws.length)
                 ? ((j<exms.length)
                    ? (hws[i].date<exms[j].date)
		    : true)
                 : false;
    if (addHw) {
      chunk.push ({ date:      hws[i].date,
		    type:      'hw',
		    name:      hws[i].name,
		    num:       nextNumber(hws[i].name),
		    percent:   hws[i].percent,
		    learnobj:  hws[i].learnobj,
		    posted:    hws[i].posted,
		    corrected: hws[i].corrected,
                    url      : hws[i].url
		  });
      i++;
    } else {
      chunk.push ({ date:      exms[j].date,
		    type:      'exam',
		    name:      exms[j].name,
		    num:       nextNumber(exms[j].name),
		    percent:   exms[j].percent,
		    learnobj:  exms[j].learnobj,
		    corrected: exms[j].corrected,
                    url:       null
		  });
      j++;
    }
    if (chunk.length >= maxcol) {
      cwk.push(chunk);
      chunk = [];
    }
  }
  if (chunk.length != 0)
    cwk.push(chunk);
}

function buildWkHeader(chunk, last) {
  var t='<th class="rowType">Test';
  t +=  '<br><span class="points">Percentage</span>';
  t +=  '<br><span class="learning"><a href="about.shtml#LO">learn. obj</a></span></th>';
  for (var i=0; i<chunk.length; i++) {
    if (chunk[i].type=="hw") {
      t += '<th class="'+chunk[i].type+'">'+chunk[i].name+chunk[i].num;
      t += '<br><span class="points">'+chunk[i].percent+'</span>';
      t += '<br><span class="learning">'+chunk[i].learnobj+'</span></th>';
    } else { // chunk[i].type=="exam"
      var s = pprint (chunk[i].num,'', (exms.length>1));
      t += '<th class="'+chunk[i].type+'">'+chunk[i].name+s;
      t += '<br><span class="points">'+chunk[i].percent+'</span>';
      t += '<br><span class="learning">'+chunk[i].learnobj+'</span></th>';
    }
  }
  if (last && final!=null) {
    t += '<th class="final">Final';
    t += '<br><span class="points">'+final.percent+'</span>';
    t += '<br><span class="learning">'+final.learnobj+'</span></th>';
    }
  return t;
}

function buildWkPosted(chunk, last) {
  var t = '<tr class="posted"><td class="rowType">Posted</td>';
  for (var i=0; i<chunk.length; i++) {
    if (chunk[i].type=="hw") {
      t += '<td class="hw">'+formatDateDM(incrDate(chunk[i].date,chunk[i].posted))+'</td>';
    } else if (chunk[i].type=="exam") {
      t += '<td class="exam hwdue" rowspan=2>'+formatDateDDM(chunk[i].date)+'</td>';
    }
  }
  if (last && final!=null) {
    t += '<td class="final hwdue" rowspan=2>'+formatDateDDM(final.date);
    t += '<br>('+final.time+')<br>'+(final.room == null ? '' : '['+final.room+']')+'</td>';
  }
  return t + '</tr>';
}

function buildWkDue(chunk, last) {
  var t = '<tr class="due"><td class="rowType">Due<br>';
  t +=  '<span class="points">(9pm)</span></td>';
  for (var i=0; i<chunk.length; i++) {
    if (chunk[i].type=="hw")
      t += '<td class="hw hwdue">'+mkURL(formatDateDDM(chunk[i].date), chunk[i].url)+'</td>';
  }
  return t + '</tr>';
}

function buildWkCorrected(chunk, last) {
  var t = '<tr class="corrected"><td class="rowType">Corrected</td>';
  for (var i=0; i<chunk.length; i++) {
    t += '<td class="'+chunk[i].type+'">'
      +  formatDateDM(incrDate(chunk[i].date,chunk[i].corrected))
      +  '</td>';
  }
  if (last && final!=null) {
    t += '<td class="final">'
      +  formatDateDM(incrDate(final.date,final.corrected))
      +  '</td>';
  }
  return t + '</tr>';
}

function buildWorkCalendarPart(chunk, last) {
  var t='<table class="workCal" border=1>';
  t +=  '<thead>' + buildWkHeader(chunk, last)    + '</thead>';
  t +=  '<tbody style="text-align:center">';
  t +=  buildWkPosted(chunk, last);
  t +=  buildWkDue(chunk, last);
  t +=  buildWkCorrected(chunk, last);
  return t + '</tbody></table>';
}

function buildWorkCalendar() {
  var t = '';
  for (var i=0; i < cwk.length-1; i++) {
    t += buildWorkCalendarPart(cwk[i], false)
//    t += '<br style="padding-top: 1ex">';
  }
  t += buildWorkCalendarPart(cwk[cwk.length-1], true);
  return t;
}
/****************************************************************************
   Code that makes use of jQuery
****************************************************************************/

/* Display picture of course personnel */
function peopleFaces () {
  var n = 0;
  $('.participants').each (
    function (i) {
      n++;
      var ppath = 'inc/img/people/';
      var cid = $(this).get(0).id;
      $('<div id="pic-' +cid+n+ '" class="people-pic"><img class="people-pic" src="' +ppath+cid+ '.jpg"></div>').insertBefore('#invisible');
      $(this).bubbletip($('#pic-' + cid+n), {
        deltaDirection: 'top',
        offsetTop: 5,
        XXoffsetLeft: -220,
        calculateOnShow: true,
        delayShow: 500
      });
    });
}

// Reimplementation of 'toggle', which is now deprecated
$.fn.toggleClick=function(){
  var functions=arguments
  return this.click(function(){
     var iteration=$(this).data('iteration')||0
     //	console.log(iteration)
     functions[iteration].apply(this,arguments)
     iteration= (iteration+1) %functions.length
     $(this).data('iteration',iteration)
    })
}

function toggleItem (src, dst) {
  src.toggleClick
    (function () {
       $(this).parents('td.schedule-lecture-id').next().find(dst).slideUp('slow');
       $(this).css('color','green');
     },
     function () {
       $(this).parents('td.schedule-lecture-id').next().find(dst).slideDown('slow');
       $(this).css('color','red');
     }
    );
}

// Toggles various bits of contents in scheduler
function toggleContents (src, dst, related) {
  src.toggleClick
    (function () {
       dst.slideUp('slow');
       $(this).css('color','green');
       $(related).css('color','green');
     },
     function () {
       dst.slideDown('slow');
       $(this).css('color','red');
       $(related).css('color','red');
     }
    );
}

/* Filter box and functionality */
function buildFilter () {
  var s = '<div class="filterbox"><form id="filterbox">'
        + '<input title="Type to filter results" type="text" '
        +        'placeholder="Type to filter results" '
        +        'class="filter" id="liveFilter" />'
	+ '</form></div>';
  $('ul.menu').after(s);
  $('#schedule').liveFilter('#liveFilter', '.classweek, .classday');
}

// Practice sessions
function join (st1, sep, st2) {  // concatenates 2 string if a separator
    if (st1 == '') return st2;
    if (st2 == '') return st1;
    return st1 + sep + st2;
}
function getPracticeClasses () { // styles of practice classes
  var s = '';
  for (var c=0; c<7; c++)
    if (practiceDay(c))
      s = join(s, ', ', 'tr.'+week[c].style);
  return s;
}
var practiceTriggers = ''

// Build the buttons to toggle descriptions and details on and off
// on the schedule page
function buildButtons () {
  var s = '<form id="buttons">';
  // Summaries
  s += '<input type="button" id="summary-button" value="Summaries" ';
  s +=        'title="Click to toggle the descriptions on and off" />';
  // Details
  s += '<input type="button" id="details-button" value="Details" ';
  s +=        'title="Click to toggle the concepts and readings on and off" />';

  // Recitations if any
  if (practiceTriggers != '') {
    s += '<br>';
    s += '<input type="button" id="practice-button" value="practice sessions" ';
    s +=         'title="Click to hide/show the practice sessions" />';
  }
  s += '</form>';
  return s;
}

function buildCheckMeIn () {
  //  var url = "https://grades.qatar.cmu.edu/15150/login/index.php?checkmein=true"
  var s = "<div style='float:right; margin: 2ex 3em 2ex 1em;'>";
  s += "<input type='button' class='checkin-button' value='Check me in'";
  s += "       onClick='window.location = \"" + checkinURL + "\"'>";
  s += "</div>";
  return s;
}

// Enable animations after content has been loaded
function afterLoadingSnippets () {
  buildFilter ();
  practiceTriggers = getPracticeClasses();
  $('ul.menu').after(buildButtons());
  toggleContents($('#summary-button'), $('.lecture-summary'), '.summary');
  toggleContents($('#details-button'), $('.lecture-readings'), '.details');
  toggleContents($('#practice-button'), $(practiceTriggers), '');
  toggleItem($('.summary'), '.lecture-summary');
  toggleItem($('.details'), '.lecture-readings');
//  $('a.autolab').attr("href", autolab);
  $('a.qatoolname').text(qatoolname);
  $('a.qatool').attr("href", qatool);
  // Insert CheckMeIn buttons
//  $('tr.recitation td.schedule-lecture-body').prepend(buildCheckMeIn());
//  $('tr.lab td.schedule-lecture-body').prepend(buildCheckMeIn());
  $('.video').hide();
  $('.remoteLinks').html(mkRemoteLinks());
}
