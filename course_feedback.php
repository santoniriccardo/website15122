<?php
// Purpose: Send anonymous feedback about a course
// Author: Iliano Cervesato


$subject = "Feedback on ${_POST['course_id']}";
$to      = $_POST['email_addr'];
$message = $_POST['feedback'];

// echo "Subject: $subject<br>To: $to<br>Text: $message";

//if (mail("iliano@cmu.edu", "Test", "Testing"))
if (mail($to, $subject, $message))
    echo("<p>Email successfully sent!</p>");
else
    echo("<p>Email delivery failed ...</p>");
?>
