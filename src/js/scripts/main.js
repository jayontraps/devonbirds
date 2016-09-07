/* requires:
jquery-3.1.0.min.js
modernizr-custom.js
chosen.jquery.min.js
speciesList.js
latinNames.js
*/

/* https://github.com/mkleehammer/gulp-deporder */


(function($) {

	$(document).ready(function() {

        // build the map elements
        var tetrads = ["E", "J", "P", "U", "Z", "D", "I", "N", "T", "Y", "C", "H", "M", "S", "X", "B", "G", "L", "R", "W", "A", "F", "K", "Q", "V"];

        function createTetrad(id, parent) {
            var tet = document.createElement("div");
            tet.setAttribute('id', id);
            // tet.setAttribute('class', "tetrad");
            parent.appendChild(tet);
        }

        $('.parent').each(function(index, el) {
            var parentId = el.id;
            for (var i = 0; i < tetrads.length; i++) {
                var tetId = parentId + tetrads[i];
                createTetrad(tetId, el);
            }
        });



        // template the species list and fire chosen
        for (var i = 0; i < speciesList.length; i++) {
            $('<option value="' + speciesList[i] + '" >' + speciesList[i] + '</option>')
            .appendTo('.select-species');
        }

        var media_query = window.matchMedia("(min-width: 1025px)");
        media_query.addListener(fireChosen);
        fireChosen(media_query);

        function fireChosen(media_query) {
          if (media_query.matches) {
                $(".select-species").chosen({
                disable_search_threshold: 10,
                no_results_text: "Oops, nothing found!",
                width: "95%"
            });
          }
        }


	});

})(jQuery);