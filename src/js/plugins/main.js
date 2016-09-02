/* requires:
chosen.jquery.min.js
speciesList.js
latinNames.js
*/

/* https://github.com/mkleehammer/gulp-deporder */


(function($) {

	$(document).ready(function() {

        // var arr = [];

        // console.log(speciesList.length, latin.length);

        // for (var i = 0; i < speciesList.length; i++) {

        //     var englishName = speciesList[i];

        //     for (var index = 0; index < latin.length; index++) {

        //         for(key in latin[index]) {
        //             if( latin[index].hasOwnProperty(key)) {

        //                 if (key == englishName) {
        //                     var obj = {};
        //                     obj[key] = latin[index][key];
        //                     arr.push(obj);
        //                 }
        //             }
        //         }
        //     }
        // }

        // sessionStorage.setItem('arr', JSON.stringify(arr));


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