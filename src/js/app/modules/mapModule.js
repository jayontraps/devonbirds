function MapModule(domContext) {
    this.context = domContext;
    this.tetrad = {
        active: false,
        currentList: ''
    };
}

MapModule.prototype.setDataset = function(dataset) {
    this.dataset = dataset;
    // $('#' + this.context).attr('data-set', dataset);
    document.getElementById(this.context).setAttribute('data-set', dataset);
};

MapModule.prototype.setSpecies = function(species) {
    this.species = species;
};

MapModule.prototype.setFetchingData = function(status) {
    this.fetchingData = status;
};

MapModule.prototype.setTetradStatus = function(tetradId, id) {
    this.tetrad = {
        active : tetradId,
        domId : id
    };
    // $('#' + this.context).addClass('tetrad-active');
    document.getElementById(this.context).classList.add('tetrad-active');
};

MapModule.prototype.logModule = function() {
    console.log(this);
};

MapModule.prototype.setGoogleMapLink = function() {

    var gMapWrap = $('#' + this.context).find('.gmap-link');
    gMapWrap.empty();

    if (this.tetrad.active) {
        var url = window.location.href;
        var gMapLink = $('<a/>', {
            'href': url + 'gmap.php/?tetrad=' + this.tetrad.active + '',
            'target': '_blank',
            'class': 'gmap',
            'html': 'Generate Google Map'
        });

        gMapLink.appendTo(gMapWrap);
    }
};

/* GETTING DATA */

MapModule.prototype.getTetradData = function() {

    if (!this.tetrad.active) { return false; }

    this.startSpinner(['tetrad-meta']);

    this.tetrad.currentList = "";

    var obj = this;

    this.updateStateEls.start.call(this, this.context);

    var postData = {
        "tetradId" : this.tetrad.active,
        "data-set" : this.dataset
    };

    $.ajax({
        url: '../ajax/tetradData.php',
        type: 'POST',
        dataType: 'json',
        data: postData,
        timeout: 12000
    })
    .done(function(data){
        obj.tetrad.counts = obj.getSums(data);

        var tetradList = document.createElement('ol');
        tetradList.classList.add('tetrad-list');

        // lookup the index, retreive the Code value and template the list item
        var theCode, el, spanEl;
        for (var i = 0; i < data.length; i++) {
            theCode = data[i].Code;
            el = document.createElement('li');
            el.innerHTML = data[i].Species.trim();
            spanEl = document.createElement('span');
            spanEl.classList.add('code-' + theCode);
            el.appendChild(spanEl);
            tetradList.appendChild(el);
        }

        obj.tetrad.currentList = tetradList;

        //  A procedure for soting the list alphabetically
        // // get the list of names
        // var orginalList = [];

        // for (var i = 0; i < data.length; i++) {
        //     orginalList.push(data[i]['Species']);
        // }
        // // sort the list to new arr
        // var sortList = [];
        // for (var i = 0; i < data.length; i++) {
        //     sortList.push(data[i]['Species']);
        // }
        // sortList.sort();

        // var tetradList = document.createElement('ol');
        // tetradList.classList.add('tetrad-list');

        // // lookup the index, retreive the Code value and template the list item
        // var theCode, el, spanEl;
        // for (var i = 0; i < sortList.length; i++) {
        //     theCode = data[orginalList.indexOf(sortList[i])]['Code'];
        //     el = document.createElement('li');
        //     el.innerHTML = sortList[i].trim();
        //     spanEl = document.createElement('span');
        //     spanEl.classList.add('code-' + theCode);
        //     el.appendChild(spanEl);
        //     tetradList.appendChild(el);
        // }

        // obj.tetrad.currentList = tetradList;
        // // truncate arrays
        // orginalList.length = 0;
        // sortList.length = 0;

    })
    .done(function(data) {
        window.setTimeout(function(){
            obj.stopSpinner.call(obj, ['tetrad-meta']);
            obj.updateStateEls.stop.call(obj, obj.context);
            obj.setFetchingData(false);
        }, 800);
    })
    .fail(function() {
        console.log("getTetradData - error");
        window.setTimeout(function(){
            obj.stopSpinner.call(obj, ['tetrad-meta']);
            obj.setMapErrorMsg(true, 'tetrad-request');
        }, 800);
    })
    .always(function() {
        // console.log("getTetradData - complete");
    });

};

MapModule.prototype.filterForTenkSpecies = function() {

    if (tenkSpecies.length && tenkSpecies.indexOf(this.species) >= 0) {
        this.tenkSpecies = true;
        this.setDataset('dbreed10');
        console.log('filterForTenkSpecies: ', this.dataset);
    }   else {
        this.tenkSpecies = false;
        var currentDataSet = document.getElementById(this.context).querySelector('.select-data-set');
        this.setDataset(currentDataSet.value);
    }
};


MapModule.prototype.getData = function() {

    this.filterForTenkSpecies();

    var obj = this;

    var formData = {
        "species" : this.species,
        "data-set" : this.dataset
    };

    this.updateStateEls.start.call(this, obj.context);

    $.ajax({
            url: '../ajax/speciesData.php',
            type: 'POST',
            dataType: 'json',
            data:  formData,
            timeout: 12000
        })
        .done(function(data) {
            // remove previous results using currentTetradArr
            var prevResults = JSON.parse(sessionStorage.getItem(obj.context + "currentTetradArr"));

            if (Array.isArray(prevResults) && prevResults.length)  {
                for (var i = 0; i < prevResults.length; i++) {
                    document.getElementById(obj.context + prevResults[i]).className = '';
                }
            }
            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem(obj.context + "currentTetradArr", JSON.stringify(tetArr));
            }

            // store an indicator of results belonging to 10K or 2K species
            // var speciesStatus = obj.tenkSpecies ? '10K' : '2K';
            // sessionStorage.setItem('status', speciesStatus);

            // add classes to matching tetrads
            for (var i = 0; i < tetArr.length; i++) {
                    document.getElementById(obj.context + tetArr[i]).classList.add('pres', 'code-' + data[i]['Code']);
            }

        })
        .done(function(data) {
            // refresh active tetrad
            if (obj.tetrad.active) {
                $('#' + obj.tetrad.domId).addClass('selected');
            }

            obj.counts = obj.getSums(data);
        })
        .done(function() {
            window.setTimeout(function(){
                obj.stopSpinner.call(obj, ['map','tetrad-meta']);
                obj.updateStateEls.stop.call(obj, obj.context);
                obj.setFetchingData(false);
            }, 800);
        })
        .fail(function() {
            console.log("getData - error");
            window.setTimeout(function(){
                obj.stopSpinner.call(obj, ['map','tetrad-meta']);
                obj.setMapErrorMsg(true, 'data-request');
            }, 800);
        })
        .always(function() {
        });

};

MapModule.prototype.getSums = function(data) {
    var sumConfirmed = 0,
        sumProbable = 0,
        sumPossible = 0,
        sumPresent = 0;
    if (this.dataset === 'dbreed' || this.dataset === 'sitters') {
        for (var i = 0; i < data.length; i++) {
            if (data[i]['Code'] === 'A') {sumConfirmed++;}
            if (data[i]['Code'] === 'B') {sumProbable++;}
            if (data[i]['Code'] === 'K') {sumPossible++;}
            if (data[i]['Code'] === 'N') {sumPresent++;}
        }
    }

    return {
        total: data.length + 1,
        sumPresent: sumPresent,
        sumPossible: sumPossible,
        sumProbable: sumProbable,
        sumConfirmed: sumConfirmed
    };
};

MapModule.prototype.getLatinName = function() {

    if (typeof latinNames !== 'undefined' && latinNames.length) {

        for (var i = 0; i < latinNames.length; i++) {

            for(var key in latinNames[i]) {

                if( latinNames[i].hasOwnProperty(key)) {
                    if (key == this.species) {
                        return latinNames[i][key];
                    }
                }
            }
        }
    }
    return false;
};



/* DOM */

MapModule.prototype.setMapErrorMsg = function(status, context) {

    var $container;

    context === "tetrad-request" ? $container = $('.tetrad-meta') : $container = $('.map-container');

    var $errorMsg = $('#' + this.context).find($container).find('.error-wrap');
    if (status) {
        $errorMsg.css('display', 'flex');
        return false;
    }
    $errorMsg.css('display', 'none');
};

MapModule.prototype.startSpinner = function(els) {
    if (Array.isArray(els) && els.length) {
        for (var i = 0; i < els.length; i++) {
            if (els[i] === 'map') {
                $('#' + this.context).find('.map-container').addClass('loading-data');
            }
            if (els[i] === 'tetrad-meta') {
                $('#' + this.context).find('.tetrad-meta ').addClass('loading-data');
            }
        }
    }
};

MapModule.prototype.stopSpinner = function(els) {
    if (Array.isArray(els) && els.length) {
        for (var i = 0; i < els.length; i++) {
            if (els[i] === 'map') {
                $('#' + this.context).find('.map-container').removeClass('loading-data');
            }
            if (els[i] === 'tetrad-meta') {
                $('#' + this.context).find('.tetrad-meta ').removeClass('loading-data');
            }
        }
    }
};

// determin what components need updating and start/stop the update
MapModule.prototype.updateStateEls = (function() {
    function start(theContext) {
        var parentEl = document.getElementById(theContext);

        if (this.request === 'species') {
            var speciesTitle = parentEl.querySelector('.species-titles');
            speciesTitle.classList.add('update');

            var counts = parentEl.querySelector('.counts');
            counts.classList.add('update');

        } else if (this.request === 'dataset') {
            // var dataSetTitles = parentEl.querySelector('.dataset-titles');
            // dataSetTitles.classList.add('update');
            // scrapped as no layering datasets currently

            var keyGroup = parentEl.querySelector('.key-group');
            keyGroup.classList.add('update');

            if (this.tetrad.active) {
                var tetradMeta = parentEl.querySelector('.tetrad-meta');
                tetradMeta.classList.add('update');

            }
        } else if (this.request === 'tetrad') {
            var tetradMeta = parentEl.querySelector('.tetrad-meta');
            tetradMeta.classList.add('update');
        }
        // old $()..
        // if (this.request === 'species') {
        //     $('#' + theContext).find('.species-titles').addClass('update');
        //     $('#' + theContext).find('.counts').addClass('update');
        // } else if (this.request === 'dataset') {
        //     $('#' + theContext).find('.dataset-titles').addClass('update');
        //     $('#' + theContext).find('.key-group').addClass('update');
        //     if (this.tetrad.active) {
        //         $('#' + theContext).find('.tetrad-meta').addClass('update');
        //     }
        // } else if (this.request === 'tetrad') {
        //     $('#' + theContext).find('.tetrad-meta').addClass('update');
        // }
    }
    function stop(theContext) {
        if (this.request === 'species') {
            this.updateHeadings();
            this.updateSums();
            this.updateTetradsPresent(this.counts.total);
        } else if (this.request === 'dataset') {
            this.updateDatasetHeadings();
            this.updateKeys();
            this.updateSums();
            this.updateTetradsPresent(this.counts.total);
            if (this.tetrad.active) {
                this.updateTeradBox();
                this.setGoogleMapLink();
            }
        } else if (this.request === 'tetrad') {
            this.updateTeradBox();
            this.setGoogleMapLink();
        }

        $('#' + theContext).find('.state').removeClass('update');
    }
    return {
        start : start,
        stop : stop
    };
})();


MapModule.prototype.updateTeradBox = function () {
    var theList = $('#' + this.context).find('.tetrad-list-wrapper');
    $('#' + this.context).find('.tetrad-title').html(this.tetrad.active);
    if (this.dataset === 'dbreed' || this.dataset === 'sitters') {
        $('#' + this.context).find('.tet-pres').html(this.tetrad.counts.sumPresent);
        $('#' + this.context).find('.tet-poss').html(this.tetrad.counts.sumPossible);
        $('#' + this.context).find('.tet-prob').html(this.tetrad.counts.sumProbable);
        $('#' + this.context).find('.tet-conf').html(this.tetrad.counts.sumConfirmed);
        $('#' + this.context).find('.tet-sums').show();
    } else {
        $('#' + this.context).find('.tet-sums').hide();
    }
    $(theList).empty();

    $(this.tetrad.currentList).appendTo(theList);
};

MapModule.prototype.updateSpeciesSelect = function() {
    var chosenList = $('#' + this.context).find('.select-species');
    chosenList.val(this.species);
    chosenList.trigger("chosen:updated");
};

MapModule.prototype.updateTetradsPresent = function(length) {
    $('#' + this.context).find('.tet_pres').html(length);
};

MapModule.prototype.updateSelectedTetrad = function(tetradId) {
    // reveal the info box if hidden
    $('#' + this.context).find('.tetrad-meta-wrapper').removeClass('hide');
    var $tetrad = $('#' + tetradId);
    if (this.tetrad.active) {
        var $prevTetrad = $('#' + this.tetrad.domId);
        $prevTetrad.removeClass('selected');
        $tetrad.addClass('selected');
    } else {
        $('#' + tetradId).addClass('selected');
    }
};

MapModule.prototype.hideCurrentlySelectedTetradInfo = function(tetradId) {
    var $tetrad = $('#' + tetradId);
    $('#' + this.context).find('.tetrad-meta-wrapper').addClass('hide');
    $tetrad.removeClass('selected');
    $('#' + this.context).removeClass('tetrad-active');
    this.tetrad.active = false;
    this.setFetchingData(false);
};

MapModule.prototype.updateSums = function() {
    var sums = this.counts;
    $('#' + this.context).find('.pres-target').html(sums.sumPresent);
    $('#' + this.context).find('.conf-target').html(sums.sumConfirmed);
    $('#' + this.context).find('.prob-target').html(sums.sumProbable);
    $('#' + this.context).find('.poss-target').html(sums.sumPossible);
};

MapModule.prototype.updateHeadings = function () {
    $('#' + this.context).find('.species-title').html(this.species);
    var latinName = this.getLatinName();
    if (latinName) {
        $('#' + this.context).find('.latin-name').html(latinName);
    }
};

MapModule.prototype.updateDatasetHeadings = function() {
    var obj = this;
    var $els = $('#' + this.context).find('.d-set');
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
};

MapModule.prototype.updateKeys = function() {
    var keyEls = $('#' + this.context).find('.key-container');
    $(keyEls).removeClass('active dwdensity dbdensity');
    if (this.dataset === 'dwdensity' || this.dataset === 'dbdensity') {
        $(keyEls[1]).addClass('active ' + this.dataset);
        return false;
    }
    $(keyEls[0]).addClass('active');
};

MapModule.prototype.toggleDataLayer = function($el) {
    $el.is(":checked") ? $('#' + this.context).removeClass('data-off') : $('#' + this.context).addClass('data-off');
};

module.exports = MapModule;