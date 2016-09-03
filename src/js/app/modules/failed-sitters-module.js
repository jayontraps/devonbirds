
MapModule.prototype.getSittersData = function() {

    var obj = this;

    var formData = {
        "species" : this.species,
        "data-set" : this.dataset
    }

    var theId = this.context;

    $.ajax({
            url: '../ajax/speciesData.php',
            type: 'POST',
            dataType: 'json',
            data:  formData
        })
        .done(function(data) {
            // // remove previous results using currentTetradArr
            // var prevResults = JSON.parse(sessionStorage.getItem(theId + "currentTetradArr"));

            // if (Array.isArray(prevResults) && prevResults.length)  {
            //     for (var i = 0; i < prevResults.length; i++) {
            //         $('#' + theId + prevResults[i]).removeClass();
            //     }
            // }
            // 
            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem(theId + "currentSittersArr", JSON.stringify(tetArr));
            }
            // add classes to matching tetrads
            // var prefix = obj.dataset === 'sitters' ? 'sitters-' : 'code-';
            for (var i = 0; i < tetArr.length; i++) {
                    $('#' + theId + tetArr[i])
                        .addClass('pres sitters-' + data[i]['Code']);
            }

        })
        .done(function() {
            window.setTimeout(function(){
                obj.stopSpinner.call(obj);
                // obj.updateStateEls.stop.call(obj, theId);
            }, 1000);
        })
        .fail(function() {
            console.log("getData - error");
        })
        .always(function() {
            // console.log("getData - complete");
            console.log(obj);
        });

};

MapModule.prototype.purgeSitters = function() {
    var theId = this.context;
    // GET THE LOCAL Array
    var prevSittersResults = JSON.parse(sessionStorage.getItem(theId + "currentSittersArr"));
    // loop through and remove classes
    if (Array.isArray(prevSittersResults) && prevSittersResults.length)  {
        for (var i = 0; i < prevSittersResults.length; i++) {
            $('#' + theId + prevSittersResults[i]).removeClass();
        }
    }
    this.sittersDataIsLoaded = false;
}


MapModule.prototype.resetBreedingToggles = function() {
    // remove .dbreed-off
    var theId = this.context;
    $('#' + theId).removeClass('dbreed-off');
    $('#' + theId).addClass('sitters-off');
    $('#' + theId).find('.dbreed-toggle').prop('checked', true);
    $('#' + theId).find('.sitters-toggle').prop('checked', false);
}





/* events */
dbreed and sitters toggles
$('.container').on('click', '.b-toggle input', function(event) {
    var currentMap = event.delegateTarget.id;
    var $this = $(this);
    var context = $this.closest('.container');

    function fireGetSittersData() {
        if (maps[currentMap].sittersDataIsLoaded) {
            $(context).removeClass('sitters-off');
        } else {
            $(context).removeClass('sitters-off');
            maps[currentMap].setDataset('sitters');
            maps[currentMap].startSpinner();
            maps[currentMap].getSittersData();
            maps[currentMap].sittersDataIsLoaded = true;
        }
    }
    if ($this.attr('data-dset') === 'dbreed') {
        $this.is(":checked") ? $(context).removeClass('dbreed-off') : $(context).addClass('dbreed-off');
    }
    if ($this.attr('data-dset') === 'sitters') {
        $this.is(":checked") ? fireGetSittersData() : $(context).addClass('sitters-off');
    }
});