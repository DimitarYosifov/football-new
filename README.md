# football
 <script>
        // for debug on unavailable mobile devices
        window.addEventListener("error", handleError, true);
        function handleError(evt) {
            // if (evt.message) { // Chrome sometimes provides this
            //     alert("error: " + evt.message + " at linenumber: " + evt.lineno + " of file: " + evt.filename);
            // } else {
            //     alert("error: " + evt.type + " from element: " + (evt.srcElement || evt.target));
            // }
        }

        // make game full screen on mobile. disabled for now...
        // if (!screenfull.isEnabled) {
        //     // return false;
        // } //TODO...use full screen icon here
        $('#play').click(function () {
            if (document.webkitFullscreenElement) {
                // document.webkitCancelFullScreen();
            }
            else {
                // document.getElementById('stage').webkitRequestFullScreen();
            };
            // screenfull.request(document.getElementById('stage'));
        });
    </script>

if we want to add new club or change existing double click add-players.html and open it in a local browser
<!-- 
    TODO LIST:

                REMOVE ALL CDN - USE NPM!!
                add autoplay
                add usage for players' exp points
                add players' price
                make name generator
    -->

<!--       
    INFO!!!!!!!!!
        BALL COLORS:  
               RED: ' config.defaultBlockColors.red'
               BLUE: '3052FF'
               GREEN: '2F7F07'
               YELLOW: 'E2D841'
               ORANGE 'FF9702'   //removed
               PURPLE: 'B200FF'
        
  
<!--    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    https://www.youtube.com/watch?v=LOeioOKUKI8     - firebase nose -express server tutorial!!!!!!!-->