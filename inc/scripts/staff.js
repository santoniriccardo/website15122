// How is the office hour schedule displayed
var scheduleConfig = {
  showPeople : false,
};

var imgPath  = 'inc/img/';
var facePath = imgPath + 'people/';
var nobody   = 'nobody.jpg';

var staff = [];  // Array containing all course staff

/**************** Inputting data ****************/

function parseTime (time) { // Parse time of day
  var s = time.trim().toLowerCase();
  var hm = time.split(':');
  var h = parseInt(hm[0]);
  //  var m = hm.length >= 2 ? hm[1] : "00";
  var m = hm[1];  // minutes are required
  if (m.match(/am/g) != null || m.match(/a/g) != null) {
    h = ampm2mil (h, "am");
    m = parseInt(m.split('a')[0]);
  }
  else if (m.match(/pm/g) != null || m.match(/p/g) != null) {
    h = ampm2mil(h, "pm");
    m = parseInt(m.split('p')[0]);
  }

  return (new Date (0,0,1,h,m));
}

// Time conversion functions
function mil2ampm (h) {
  if (h == 0)            return { hour: 12,   period: "am" };
  if (0 < h  && h < 12)  return { hour:  h,   period: "am" };
  if (h == 12)           return { hour: 12,   period: "pm" };
  if (12 < h && h <= 23) return { hour: h-12, period: "pm" };
  console.log ('Incorrect time ' + h);
  return { hour: -1, period: "error" };
}
function ampm2mil (h, p) {
  if (h < 1 || h > 12 || (p != "am" && p != "pm")) {
    console.log ('Incorrect am/pm time ' + h + p);
    return -1;
  }
  if (h == 12 && p == "am") return 0;
  if (           p == "am") return h;
  if (h == 12 && p == "pm") return 12;
  if (           p == "pm") return h + 12;
}

function printBaseTimeAMPM (time) {
  function printMinutes (time) {
    var m = time.getMinutes();
    return (m < 10 ? "0" + m : m);
  }
  return mil2ampm(time.getHours()).hour + ':' + printMinutes(time);
}
function printTimeAMPM (time) {
  return printBaseTimeAMPM (time) + mil2ampm(time.getHours()).period;
}

/**************************************************************/

// Set office hours
function officeHours (day, start, duration, room, comment) {
  var dayofweek = {'U':1, 'M':2, 'T':3, 'W':4, 'R':5, 'F':6, 'S':7};
  var from = parseTime(start);
  from.setDate(dayofweek[day]);
  return {from     : from,
	  duration : duration,
	  room     : room,
	  comment  : comment,
	 };
}
function specialOfficeHours (s) {
  return {special : s,
	  from    : null
	 };
}

// Add various staff
function addStaff (role, name, email, photo, webpage, office, officehours) {
  staff.push ({role   : role,
	       name   : name,
	       email  : email,
	       photo  : photo,
	       web    : webpage,
	       office : office,
	       hours  : officehours
	      });
}
function addInstructor (name, email, photo, webpage, officehours) {
  addStaff('instructor', name, email, photo, webpage, null, officehours);
}
function addAA (name, email, photo, webpage, office) {
  addStaff('aa', name, email, photo, webpage, office, []);
}
function addTA (name, email, photo, webpage, officehours) {
  addStaff('ta', name, email, photo, webpage, null, officehours);
}
function addOHonly (officehours) {
  addStaff('', null, null, null, null, null, officehours);
}


/************ Utilility functions **************/

function printStaffName (staff, cls) {
  var name = '<span class="' +cls+ '">' +staff.name+ '</span>';
  if (staff.web != null)
    name = '<a href="' + staff.web + '">' + name + '</a>';
  return name;
}

/************ Print staff ***************/
// Print interval between two times
function printInterval (from, duration) {
  var dayofweek = {1:'U', 2:'M', 3:'T', 4:'W', 5:'R', 6:'F', 7:'S'};

  function ampmifneeded (f,t) {
    var pf = mil2ampm(f.getHours()).period;
    var pt = mil2ampm(t.getHours()).period;
    return pf == pt ? '' : pf;
  }

  var to = new Date (0,0,from.getDate(), from.getHours(),
		         from.getMinutes() + duration);

  var s = '';
  s += dayofweek[from.getDate()] + ' ';
  s += printBaseTimeAMPM(from) + ampmifneeded(from,to);
  s += '-';
  s += printTimeAMPM(to);
  return s;
}

// Print office hours for a person
function printOfficeHours (hours) {
  var s = '<table class="officehours"><tbody>';
  for (var i=0; i < hours.length; i++) {
    s += '<tr><td style="padding: 0;">';
    if (hours[i].from != null) {
      s += printInterval(hours[i].from, hours[i].duration);
      s += ' (' + hours[i].room + ')'
    }
    else s += hours[i].special;
    if (hours[i].comment != null)
      s += '<br><span class="ohcomment">' + hours[i].comment + '</span>';
    s += '</td></tr>';
  }
  s += '</tbody></table>';
  return s;
}

// if staff.photo contains an array, a picture is chosen at random
function pickPhoto (staff) {
  if (Array.isArray(staff.photo)) {
    i = Date.now() % staff.photo.length;
    return staff.photo[i];
  }

  if (staff.photo == null) staff.photo = nobody;
  return staff.photo;
}

// Print data for a single person
function printStaff (staff) {
  //if (staff.photo == null) staff.photo = nobody;

  var s = '<div class="staffpic">';
  s += '<img class="staffpic" src="' + facePath
//    + staff.photo
    + pickPhoto(staff)
    +  '" alt="photo of '+ staff.name + '">';
  s += printStaffName(staff, 'staffname') + ' ';
  if (staff.email != null)
    s += hMail('<img src="' + imgPath + 'envelope.png" style="height: 1.7ex;">',
	       [staff.email]);
  if (staff.office != null) {
    s += '<br style="margin-bottom:1ex;">';
    s += '<span class="office">'+staff.office+'</span>';
  }
  if (staff.hours.length > 0) {
    s += '<br style="margin-bottom:2ex;">';
    s += '<span class="officehoursname">Office hours:</span><br>';
    s += '<span class="officehours">' + printOfficeHours(staff.hours) + '</span>';
  }
  s += '</div>';
  return s;
}

// Print data for everybody in a given role
function printByRole (role) {
  var c = 0;
  var style = "padding: 0.5ex 0; vertical-align: top";
  var s = '<table></tbody>';
  for (var i=0; i < staff.length; i++) {
    if (staff[i].role != role) continue;
    if (c%2 == 0) s += '<tr>';
    s += '<td style="'+style+'">' + printStaff(staff[i]) + '</td>';
    if (c%2 == 1) s += '</tr>';
    c++;
  }
  if (c%2 == 1) s += '</tr>';
  s += '</tbody></table>';
  return s;
}

function emailByRole (role) {
  var emails = [];
  for (var i=0; i < staff.length; i++) {
    if (staff[i].role != role) continue;
    emails.push (staff[i].email);
  }
  return emails;
}

function staffByRole (role) {
  var tmp = [];
  for (var i=0; i < staff.length; i++) {
    if (staff[i].role != role) continue;
    tmp.push (staff[i]);
  }
  return tmp;
}

/************ Print office hour schedule ***************/
function makeOHschedule () {
  function minOfDay (time) {
    return time.getMinutes() + 60 * time.getHours();
  }

  var schedule = {};

  staff.forEach(
    function (staff) {
      staff.hours.forEach(
	function (oh) {
	  if (oh.from == null) return;
	  var idx = minOfDay (oh.from);
	  var d = oh.from.getDate();
	  var slot = {who      : staff,
		      from     : oh.from,
		      where    : oh.room,
		      duration : oh.duration,
		      comment  : oh.comment
		     };
	  if (idx in schedule) {
	    if (d in schedule[idx]) schedule[idx][d].push (slot);
	    else schedule[idx][d] = [slot];
	  }
	  else {
	    schedule[idx] = {};
	    schedule[idx][d] = [slot];
	  }
	});
    }
  );
  return schedule;
}


function printOHschedule () {
  var schedule = makeOHschedule();
  function printTimeMin (t) {
    var h = mil2ampm(Math.floor(t / 60));
    var m = t % 60;

    return h.hour + ':' + (m < 10 ? '0'+m : m) + h.period;
  }
  function printDay (sch, d) {
    if (!(d in sch)) return "";
    var lastWhere    = "";   // to avoid printing repeated locations
    var lastDuration = 0;    // to avoid printing repeated durations
    var lastComment  = null; // to avoid printing repeated comments
    var s = ''
    sch[d].forEach(
      function (slot) {
	var id = slot.who.email == null ? null : slot.who.email.split('@')[0];
	s += slot.where == lastWhere ? ''
           : '<span class="howhere">' + slot.where + '</span>';
	s += slot.duration == lastDuration ? ''
          : '<span class="holength">' + slot.duration + '</span>';
        if (scheduleConfig.showPeople && id != null) {
	  s += '<div style="margin-top: -0.5ex; margin-bottom: 0.5ex">';
 	  s += printStaffName(slot.who, 'honame' + (slot.who.photo == null ? '' : ' participants bubble') + '" id="' + id);
        }
	if (slot.comment != null && slot.comment != lastComment) {
          s += '<div class="ohcomment">' + slot.comment + '</div>';
        }
        if (scheduleConfig.showPeople)
	  s += '</div>';
        lastWhere    = slot.where;
        lastDuration = slot.duration;
        lastComment  = slot.comment;
     });
    return s;
  }

  var s = '<table class="ohschedule" border=1><tbody>';
  s += '<tr><th></th><th>Sunday</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th></tr>';
  for (var idx in schedule) {
    s += '<tr><th>' + printTimeMin(idx) + '</th>';
    for (var i=1; i <= 7; i++)
      s += '<td>' + printDay(schedule[idx], i) + '</td>';
    s += '</tr>';
  }
  s += '</tbody></table>';
  return s;
}
