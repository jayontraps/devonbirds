/* requires:
chosen.jquery.min.js
speciesList.js
*/

/* https://github.com/mkleehammer/gulp-deporder */


(function($) {

	$(document).ready(function() {

        for (var i = 0; i < speciesList.length; i++) {
            $('<option value="' + speciesList[i] + '" >' + speciesList[i] + '</option>')
            .appendTo('.select-species');
        }


        $(".select-species").chosen({
            disable_search_threshold: 10,
            no_results_text: "Oops, nothing found!",
            width: "95%"
        });

	});

})(jQuery);