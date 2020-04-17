/* quizzes for lecture 1 */
var quizzes1 = ['https://goo.gl/forms/PnqTtPTM4Xgi67tL2',  // quiz 1
                'https://goo.gl/forms/3cKi7AHKqQux5v5A3',  // quiz 2
                'https://goo.gl/forms/rGNSOOaMEkV42xUL2',  // quiz 3
                'https://goo.gl/forms/bLbOHwRAM8VPGq4v1',  // quiz 4
                'https://goo.gl/forms/XcHH3TqPPRWQiHsb2',  // quiz 5
                'https://goo.gl/forms/s3cDvrSDFP549TXf2',  // quiz 6
                'https://goo.gl/forms/30BCAR145kZ6Lchg2',  // quiz 7
                'https://goo.gl/forms/Z4QVE74nCGMz0NdT2'   // quiz 8
               ];

/* quizzes for lecture 2 */
var quizzes2 = ['https://goo.gl/forms/Nr40qXht9H8zMmOr1',  // quiz 1
                'https://goo.gl/forms/zTP9ahs8gcWN7Wwo2',  // quiz 2
                'https://goo.gl/forms/pDlupgz4QOrdJ8pf2',  // quiz 3
                'https://goo.gl/forms/qmWyOWQYIvc2yCe33',  // quiz 4
                'https://goo.gl/forms/GIegOntUaNZ0pplz1',  // quiz 5
                'https://goo.gl/forms/WmhlxDfBWpyWIZnB3',  // quiz 6
                'https://goo.gl/forms/IvmIj0mmXcb2RnKh2',  // quiz 7
                'https://goo.gl/forms/KC9TPsr48gAEoXv93'   // quiz 8
               ];
/* IMPORTANT: on Google forms, set quizzes to 'Not accepting responses'
              while the quiz is not on-going */

/* Configuration test form */
var qtest = 'https://goo.gl/forms/dcEH5ojLzbjVW5F43';


function mqDate(hh, mm) {
  return new Date(qyear, qmonth-1, qday, hh, mm);
}


var now  = new Date();     /* Current date and time */
var lec1 = mqDate(9, 0);   /* Start time of lecture 1 */
var lec2 = mqDate(10, 30); /* End time of lecture 1 / start time of lecture 2 */
var over = mqDate(12, 0);  /* End time of lecture 2 */

/* Set where to redirect this page:  (arrays are 0-indexed)
   - to quizzes1[qnum] during lecture 1,
   - to quizzes2[qnum] during lecture 2, and
*/
var quiz = null;
if (lec1 <= now && now < lec2)   quiz = quizzes1[qnum-1];
if (lec2 <= now && now <= over)  quiz = quizzes2[qnum-1];

/* S20 special */
quiz = quizzes1[qnum-1];
