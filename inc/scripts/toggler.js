/*
Provides support for toggling an element on and off.  Use "toggler-on" to start with the element being visible, with "toggler-off" for hidden

Format
<div class="toggler-on">    <!-- Portion of the document subject to toggling -->
<XX class="toggle-base">    <!-- Previous sibling of element to toggle, contains the trigger -->
 ... <span class="toggle-label">...</span> ... <!-- Element to which the toggle mark is appended -->
 <YY class="toggle-me">     <!-- Element that is toggled on and off by clicking on the trigger -->
  ...
 </YY>
</XX>
</div>
*/

// Reimplementation of 'toggle', which is now deprecated
$.fn.toggle=function(){
  var functions=arguments
  return this.click(function(){
     var iteration=$(this).data('iteration')||0
     //	console.log(iteration)
     functions[iteration].apply(this,arguments)
     iteration= (iteration+1) %functions.length
     $(this).data('iteration',iteration)
    })
}

function toggler (onMark, offMark) {
 $('.toggler-on').find('.toggle-label')
   .append('<span class="toggleon-mark">'+offMark+'</span>');
 $('.toggleon-mark').toggle
   (function () {
      $(this).parents('.toggle-base').next('.toggle-me').slideUp('slow');
      $(this).html(onMark);
    },
    function () {
      $(this).parents('.toggle-base').next('.toggle-me').slideDown('slow');
      $(this).html(offMark);
    });

 $('.toggler-off').find('.toggle-label')
                  .append('<span class="toggleoff-mark">'+onMark+'</span>');
 $('.toggler-off').find('.toggle-me').hide();
 $('.toggleoff-mark').toggle
   (function () {
      $(this).parents('.toggle-base').next('.toggle-me').slideDown('slow');
      $(this).html(offMark);
    },
    function () {
      $(this).parents('.toggle-base').next('.toggle-me').slideUp('slow');
      $(this).html(onMark);
    });
}


$(document).ready(function() {
    toggler("[+]", "[&ndash;]");
});
