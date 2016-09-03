function MapModule(domContext) {
    this.context = domContext;
};

MapModule.prototype.startSpinner = function() {
    $('#' + this.context).addClass('loading-data');
}

MapModule.prototype.stopSpinner = function() {
    $('#' + this.context).removeClass('loading-data');
}

MapModule.prototype.setDataset = function(dataset) {
    this.dataset = dataset;
    $('#' + this.context).attr('data-set', dataset);
};

MapModule.prototype.setSpecies = function(species) {
    this.species = species;
};

MapModule.prototype.getLatinName = function() {

    if (typeof latinNames !== 'undefined' && latinNames.length) {

        for (var i = 0; i < latinNames.length; i++) {

            for(key in latinNames[i]) {

                if( latinNames[i].hasOwnProperty(key)) {
                    if (key == this.species) {
                        return latinNames[i][key];
                    }
                }
            }
        }
    }
    return false;
}


/* DOM */

MapModule.prototype.getTetradData = function(tetradId) {

    var postData = {
        "tetradId" : tetradId,
        "data-set" : this.dataset
    }

    $.ajax({
        url: '../ajax/tetradData.php',
        type: 'POST',
        dataType: 'json',
        data: postData
    })
    .done(function(data) {
        console.log(data);
    })
    .fail(function() {
        console.log("getTetradData - error");
    })
    .always(function() {
        console.log("getTetradData - complete");
    });

}

MapModule.prototype.getData = function() {

    var obj = this;

    var formData = {
        "species" : this.species,
        "data-set" : this.dataset
    }

    var theId = this.context;

    this.updateStateEls.start.call(this, theId);

    $.ajax({
            url: '../ajax/speciesData.php',
            type: 'POST',
            dataType: 'json',
            data:  formData
        })
        .done(function(data) {
            // remove previous results using currentTetradArr
            var prevResults = JSON.parse(sessionStorage.getItem(theId + "currentTetradArr"));

            if (Array.isArray(prevResults) && prevResults.length)  {
                for (var i = 0; i < prevResults.length; i++) {
                    $('#' + theId + prevResults[i]).removeClass();
                }
            }
            // 
            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem(theId + "currentTetradArr", JSON.stringify(tetArr));
            }
            // add classes to matching tetrads
            for (var i = 0; i < tetArr.length; i++) {
                    $('#' + theId + tetArr[i])
                        .addClass('pres code-' + data[i]['Code']);
            }

        })
        .done(function() {
            window.setTimeout(function(){
                obj.stopSpinner.call(obj);
                obj.updateStateEls.stop.call(obj, theId);
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

// determin what components need updating and start/stop the update
MapModule.prototype.updateStateEls = (function() {
    var theId = this.context;
    function start(theId) {
        if (this.request === 'species') {
            $('#' + theId).find('.species-titles').addClass('update');
        } else if (this.request === 'dataset') {
            $('#' + theId).find('.dataset-titles').addClass('update');
            $('#' + theId).find('.key-group').addClass('update');
        }
    }
    function stop(theId) {
        if (this.request === 'species') {
            this.updateHeadings();
        } else if (this.request === 'dataset') {
            this.updateDatasetHeadings();
            this.updateKeys();
        }
        $('#' + theId).find('.state').removeClass('update');
    }
    return {
        start : start,
        stop : stop
    };
})();

MapModule.prototype.updateHeadings = function () {
    var theId = this.context;
    $('#' + theId).find('.species-title').html(this.species);
    var latinName = this.getLatinName();
    if (latinName) {
        $('#' + theId).find('.latin-name').html(latinName);
    }
}

MapModule.prototype.updateDatasetHeadings = function() {
    var obj = this;
    var theId = this.context;
    var $els = $('#' + theId).find('.d-set');
    $els.removeClass('current');
    $els.each(function(index, el) {
        if (obj.dataset === $(el).attr('data-dset-title')) {
            $(el).addClass('current');
            return false;
        }
        if($(el).hasClass('d-set-breeding')) {
            $(this).addClass('current');
        }

    });
}

MapModule.prototype.updateKeys = function() {
    var theId = this.context;
    var keyEls = $('#' + theId).find('.key-container');
    $(keyEls).removeClass('active dwdensity dbdensity');
    if (this.dataset === 'dwdensity' || this.dataset === 'dbdensity') {
        $(keyEls[1]).addClass('active ' + this.dataset);
        return false;
    }
    $(keyEls[0]).addClass('active');
}


module.exports = MapModule;