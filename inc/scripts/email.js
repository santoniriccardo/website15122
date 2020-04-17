function setEmailSubject (s) {
  eSubject = s =="" ? "" : ("?Subject=" + s);
}

// Builds an email address out of a list of strings passed as arguments
function MEA()
{ var out = MEA.arguments[0] + '\@';
  for (var i=1; i < MEA.arguments.length - 1; i++) {
    out = out + MEA.arguments[i] + ".";
  }
  out = out + MEA.arguments[MEA.arguments.length - 1];
  return (out);
}

// Serializes an array of email addresses
function mAddrs(emails) {
  var s = (emails.length==0? "" : emails[0]);
  for (var i=1; i<emails.length; i++)
    s += "," + emails[i];
  return s;
}

// Hyperlinks some text with a number of email addresses
function hMail (txt, emails) {
  var s = mAddrs(emails);
  return (txt.link('mailto:' + s + eSubject));
}
// Email address hyperlinked to itself
function eMail (l) {
  //if (l == null) l = "nobody@nowhere.edu";
  return (l.link('mailto:' + l + eSubject));
}
