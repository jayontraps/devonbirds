(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MapModule = require('./modules/mapModule');
var overlay = require('./modules/overlay');


$(document).ready(function() {

    // overlay controls
    $('.ov-toggle').on('click', function() {
        var $this = $(this),
            layer = $this.attr('name'),
            context = $this.closest('.container');
        $this.is(":checked") ? overlay.show(layer, context) : overlay.hide(layer, context);
    });

    // toogle double view
    var $wrapper = $('#tetrad-maps');
    function doubleOn($btn) {
        $wrapper.addClass('double');
        $btn.addClass('active');
    }
    function doubleOff($btn) {
        $wrapper.removeClass('double');
        $btn.removeClass('active');
    }


    // map page
    if ( typeof mapPage !== 'undefined' && mapPage) {

        $('#js-compare-toggle').on('click', function() {
            var $btn = $(this);
            $(this).hasClass('active') ? doubleOff($btn) : doubleOn($btn);
        });


        // setup the mapModules
        var maps = {};
        maps.m1_ = new MapModule('m1_');
        maps.m2_ = new MapModule('m2_');

        // set defaults
        maps.m1_.setSpecies('Alpine Swift');
        maps.m1_.setDataset('dbreed');

        maps.m2_.setSpecies('Alpine Swift');
        maps.m2_.setDataset('dbreed');


        $('.container').on('change', '.select-species', function(event) {
            var currentMap = event.delegateTarget.id;
            if (maps[currentMap].fetchingData) {
                return false;
            }
            maps[currentMap].setFetchingData(true);
            maps[currentMap].request = 'species';
            maps[currentMap].startSpinner(['map']);
            maps[currentMap].setSpecies(this.value.trim());
            maps[currentMap].getData();

            maps[currentMap].logModule();
        });

        $('.container').on('change', '.select-data-set', function(event) {
            var currentMap = event.delegateTarget.id;
            if (maps[currentMap].fetchingData) {
                return false;
            }
            maps[currentMap].setFetchingData(true);
            maps[currentMap].request = 'dataset';
            maps[currentMap].startSpinner(['map']);
            maps[currentMap].setDataset(this.value);
            maps[currentMap].getData();
            maps[currentMap].getTetradData();

            maps[currentMap].logModule();
        });

        // $('.container').on('click', '.tenk > div', function(event) {
        $('.container').on('click', '[data-tetrad="2K"]', function(event) {    
            var currentMap = event.delegateTarget.id;
            if (maps[currentMap].fetchingData) {
                return false;
            }
            maps[currentMap].setFetchingData(true);
            var isSelected = $(this).hasClass('selected');
                tetradId = event.target.id,
                tetradName = event.target.id.slice(3, 8);

            if (isSelected) {
                maps[currentMap].hideCurrentlySelectedTetradInfo(tetradId);
                return false;
            }
            maps[currentMap].request = 'tetrad';
            maps[currentMap].updateSelectedTetrad(tetradId);
            maps[currentMap].setTetradStatus(tetradName, tetradId);
            maps[currentMap].getTetradData();

            maps[currentMap].logModule();
        });

        $('.container').on('click', '.tetrad-list li', function(event) {
            var currentMap = event.delegateTarget.id;
            if (maps[currentMap].fetchingData) {
                return false;
            }
            maps[currentMap].setFetchingData(true);
            maps[currentMap].request = 'species';
            maps[currentMap].startSpinner(['map']);
            maps[currentMap].setSpecies($(this).text());
            maps[currentMap].getData();
            maps[currentMap].updateSpeciesSelect();
            maps[currentMap].logModule();
        });

        $('.container').on('click', '.data-later-toggle', function(event) {
            var currentMap = event.delegateTarget.id;
            var $this = $(this);
            maps[currentMap].toggleDataLayer($this);
        });

    }


    if ( typeof ovPage !== 'undefined' && ovPage) {
        // setup the mapModules
        var maps = {};
        maps.m1_ = new MapModule('m1_');
        maps.m1_.setDataset('dbreed');

        maps.m2_ = new MapModule('m2_');
        maps.m2_.setDataset('dbdensity');

        maps.m3_ = new MapModule('m3_');
        maps.m3_.setDataset('dwdensity');

        $('.select-species').on('change', function(event) {
            maps.m1_.setSpecies(this.value);
            maps.m1_.startSpinner();

            maps.m2_.setSpecies(this.value);
            maps.m2_.startSpinner();

            maps.m3_.setSpecies(this.value);
            maps.m3_.startSpinner();

            maps.m1_.getData();
            maps.m2_.getData();
            maps.m3_.getData();
        });
    }

});




},{"./modules/mapModule":2,"./modules/overlay":3}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
var overlay = (function ($) {
    function show(layer, $context) {
            var $layer = $('.' + layer);
        $context.find($layer).addClass('on');
    }

    function hide(layer, $context) {
            var $layer = $('.' + layer);
        $context.find($layer).removeClass('on');
    }
    return {
        show: show,
        hide: hide
    };
}(jQuery));


module.exports = overlay;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyIsInNyYy9qcy9hcHAvbW9kdWxlcy9vdmVybGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNYXBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbWFwTW9kdWxlJyk7XG52YXIgb3ZlcmxheSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9vdmVybGF5Jyk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBvdmVybGF5IGNvbnRyb2xzXG4gICAgJCgnLm92LXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgbGF5ZXIgPSAkdGhpcy5hdHRyKCduYW1lJyksXG4gICAgICAgICAgICBjb250ZXh0ID0gJHRoaXMuY2xvc2VzdCgnLmNvbnRhaW5lcicpO1xuICAgICAgICAkdGhpcy5pcyhcIjpjaGVja2VkXCIpID8gb3ZlcmxheS5zaG93KGxheWVyLCBjb250ZXh0KSA6IG92ZXJsYXkuaGlkZShsYXllciwgY29udGV4dCk7XG4gICAgfSk7XG5cbiAgICAvLyB0b29nbGUgZG91YmxlIHZpZXdcbiAgICB2YXIgJHdyYXBwZXIgPSAkKCcjdGV0cmFkLW1hcHMnKTtcbiAgICBmdW5jdGlvbiBkb3VibGVPbigkYnRuKSB7XG4gICAgICAgICR3cmFwcGVyLmFkZENsYXNzKCdkb3VibGUnKTtcbiAgICAgICAgJGJ0bi5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvdWJsZU9mZigkYnRuKSB7XG4gICAgICAgICR3cmFwcGVyLnJlbW92ZUNsYXNzKCdkb3VibGUnKTtcbiAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgfVxuXG5cbiAgICAvLyBtYXAgcGFnZVxuICAgIGlmICggdHlwZW9mIG1hcFBhZ2UgIT09ICd1bmRlZmluZWQnICYmIG1hcFBhZ2UpIHtcblxuICAgICAgICAkKCcjanMtY29tcGFyZS10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkYnRuID0gJCh0aGlzKTtcbiAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpID8gZG91YmxlT2ZmKCRidG4pIDogZG91YmxlT24oJGJ0bik7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcblxuICAgICAgICAvLyBzZXQgZGVmYXVsdHNcbiAgICAgICAgbWFwcy5tMV8uc2V0U3BlY2llcygnQWxwaW5lIFN3aWZ0Jyk7XG4gICAgICAgIG1hcHMubTFfLnNldERhdGFzZXQoJ2RicmVlZCcpO1xuXG4gICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXMoJ0FscGluZSBTd2lmdCcpO1xuICAgICAgICBtYXBzLm0yXy5zZXREYXRhc2V0KCdkYnJlZWQnKTtcblxuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2hhbmdlJywgJy5zZWxlY3Qtc3BlY2llcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAgICAgaWYgKG1hcHNbY3VycmVudE1hcF0uZmV0Y2hpbmdEYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRGZXRjaGluZ0RhdGEodHJ1ZSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnJlcXVlc3QgPSAnc3BlY2llcyc7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnN0YXJ0U3Bpbm5lcihbJ21hcCddKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0U3BlY2llcyh0aGlzLnZhbHVlLnRyaW0oKSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1kYXRhLXNldCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAgICAgaWYgKG1hcHNbY3VycmVudE1hcF0uZmV0Y2hpbmdEYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRGZXRjaGluZ0RhdGEodHJ1ZSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnJlcXVlc3QgPSAnZGF0YXNldCc7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnN0YXJ0U3Bpbm5lcihbJ21hcCddKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RGF0YXNldCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXRUZXRyYWREYXRhKCk7XG5cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ubG9nTW9kdWxlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLnRlbmsgPiBkaXYnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAkKCcuY29udGFpbmVyJykub24oJ2NsaWNrJywgJ1tkYXRhLXRldHJhZD1cIjJLXCJdJywgZnVuY3Rpb24oZXZlbnQpIHsgICAgXG4gICAgICAgICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAgICAgaWYgKG1hcHNbY3VycmVudE1hcF0uZmV0Y2hpbmdEYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRGZXRjaGluZ0RhdGEodHJ1ZSk7XG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9ICQodGhpcykuaGFzQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgdGV0cmFkSWQgPSBldmVudC50YXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgdGV0cmFkTmFtZSA9IGV2ZW50LnRhcmdldC5pZC5zbGljZSgzLCA4KTtcblxuICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmhpZGVDdXJyZW50bHlTZWxlY3RlZFRldHJhZEluZm8odGV0cmFkSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICd0ZXRyYWQnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS51cGRhdGVTZWxlY3RlZFRldHJhZCh0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFRldHJhZFN0YXR1cyh0ZXRyYWROYW1lLCB0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFRldHJhZERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcudGV0cmFkLWxpc3QgbGknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIGlmIChtYXBzW2N1cnJlbnRNYXBdLmZldGNoaW5nRGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RmV0Y2hpbmdEYXRhKHRydWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5yZXF1ZXN0ID0gJ3NwZWNpZXMnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zdGFydFNwaW5uZXIoWydtYXAnXSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFNwZWNpZXMoJCh0aGlzKS50ZXh0KCkpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnVwZGF0ZVNwZWNpZXNTZWxlY3QoKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ubG9nTW9kdWxlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLmRhdGEtbGF0ZXItdG9nZ2xlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS50b2dnbGVEYXRhTGF5ZXIoJHRoaXMpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgaWYgKCB0eXBlb2Ygb3ZQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBvdlBhZ2UpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMV8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJkZW5zaXR5Jyk7XG5cbiAgICAgICAgbWFwcy5tM18gPSBuZXcgTWFwTW9kdWxlKCdtM18nKTtcbiAgICAgICAgbWFwcy5tM18uc2V0RGF0YXNldCgnZHdkZW5zaXR5Jyk7XG5cbiAgICAgICAgJCgnLnNlbGVjdC1zcGVjaWVzJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBtYXBzLm0xXy5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwcy5tMV8uc3RhcnRTcGlubmVyKCk7XG5cbiAgICAgICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXModGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBtYXBzLm0yXy5zdGFydFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgbWFwcy5tM18uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHMubTNfLnN0YXJ0U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICBtYXBzLm0xXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0yXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0zXy5nZXREYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cblxuXG4iLCJmdW5jdGlvbiBNYXBNb2R1bGUoZG9tQ29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGRvbUNvbnRleHQ7XG4gICAgdGhpcy50ZXRyYWQgPSB7XG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGN1cnJlbnRMaXN0OiAnJ1xuICAgIH07XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0RGF0YXNldCA9IGZ1bmN0aW9uKGRhdGFzZXQpIHtcbiAgICB0aGlzLmRhdGFzZXQgPSBkYXRhc2V0O1xuICAgIC8vICQoJyMnICsgdGhpcy5jb250ZXh0KS5hdHRyKCdkYXRhLXNldCcsIGRhdGFzZXQpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udGV4dCkuc2V0QXR0cmlidXRlKCdkYXRhLXNldCcsIGRhdGFzZXQpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRTcGVjaWVzID0gZnVuY3Rpb24oc3BlY2llcykge1xuICAgIHRoaXMuc3BlY2llcyA9IHNwZWNpZXM7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnNldEZldGNoaW5nRGF0YSA9IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgIHRoaXMuZmV0Y2hpbmdEYXRhID0gc3RhdHVzO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRUZXRyYWRTdGF0dXMgPSBmdW5jdGlvbih0ZXRyYWRJZCwgaWQpIHtcbiAgICB0aGlzLnRldHJhZCA9IHtcbiAgICAgICAgYWN0aXZlIDogdGV0cmFkSWQsXG4gICAgICAgIGRvbUlkIDogaWRcbiAgICB9O1xuICAgIC8vICQoJyMnICsgdGhpcy5jb250ZXh0KS5hZGRDbGFzcygndGV0cmFkLWFjdGl2ZScpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udGV4dCkuY2xhc3NMaXN0LmFkZCgndGV0cmFkLWFjdGl2ZScpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5sb2dNb2R1bGUgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzKTtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0R29vZ2xlTWFwTGluayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdNYXBXcmFwID0gJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5nbWFwLWxpbmsnKTtcbiAgICBnTWFwV3JhcC5lbXB0eSgpO1xuXG4gICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgIHZhciBnTWFwTGluayA9ICQoJzxhLz4nLCB7XG4gICAgICAgICAgICAnaHJlZic6IHVybCArICdnbWFwLnBocC8/dGV0cmFkPScgKyB0aGlzLnRldHJhZC5hY3RpdmUgKyAnJyxcbiAgICAgICAgICAgICd0YXJnZXQnOiAnX2JsYW5rJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdnbWFwJyxcbiAgICAgICAgICAgICdodG1sJzogJ0dlbmVyYXRlIEdvb2dsZSBNYXAnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdNYXBMaW5rLmFwcGVuZFRvKGdNYXBXcmFwKTtcbiAgICB9XG59O1xuXG4vKiBHRVRUSU5HIERBVEEgKi9cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXRUZXRyYWREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXRoaXMudGV0cmFkLmFjdGl2ZSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHRoaXMuc3RhcnRTcGlubmVyKFsndGV0cmFkLW1ldGEnXSk7XG5cbiAgICB0aGlzLnRldHJhZC5jdXJyZW50TGlzdCA9IFwiXCI7XG5cbiAgICB2YXIgb2JqID0gdGhpcztcblxuICAgIHRoaXMudXBkYXRlU3RhdGVFbHMuc3RhcnQuY2FsbCh0aGlzLCB0aGlzLmNvbnRleHQpO1xuXG4gICAgdmFyIHBvc3REYXRhID0ge1xuICAgICAgICBcInRldHJhZElkXCIgOiB0aGlzLnRldHJhZC5hY3RpdmUsXG4gICAgICAgIFwiZGF0YS1zZXRcIiA6IHRoaXMuZGF0YXNldFxuICAgIH07XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcuLi9hamF4L3RldHJhZERhdGEucGhwJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiBwb3N0RGF0YSxcbiAgICAgICAgdGltZW91dDogMTIwMDBcbiAgICB9KVxuICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBvYmoudGV0cmFkLmNvdW50cyA9IG9iai5nZXRTdW1zKGRhdGEpO1xuXG4gICAgICAgIHZhciB0ZXRyYWRMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgICAgICAgdGV0cmFkTGlzdC5jbGFzc0xpc3QuYWRkKCd0ZXRyYWQtbGlzdCcpO1xuXG4gICAgICAgIC8vIGxvb2t1cCB0aGUgaW5kZXgsIHJldHJlaXZlIHRoZSBDb2RlIHZhbHVlIGFuZCB0ZW1wbGF0ZSB0aGUgbGlzdCBpdGVtXG4gICAgICAgIHZhciB0aGVDb2RlLCBlbCwgc3BhbkVsO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoZUNvZGUgPSBkYXRhW2ldLkNvZGU7XG4gICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBkYXRhW2ldLlNwZWNpZXMudHJpbSgpO1xuICAgICAgICAgICAgc3BhbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgc3BhbkVsLmNsYXNzTGlzdC5hZGQoJ2NvZGUtJyArIHRoZUNvZGUpO1xuICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoc3BhbkVsKTtcbiAgICAgICAgICAgIHRldHJhZExpc3QuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgb2JqLnRldHJhZC5jdXJyZW50TGlzdCA9IHRldHJhZExpc3Q7XG5cbiAgICAgICAgLy8gIEEgcHJvY2VkdXJlIGZvciBzb3RpbmcgdGhlIGxpc3QgYWxwaGFiZXRpY2FsbHlcbiAgICAgICAgLy8gLy8gZ2V0IHRoZSBsaXN0IG9mIG5hbWVzXG4gICAgICAgIC8vIHZhciBvcmdpbmFsTGlzdCA9IFtdO1xuXG4gICAgICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyAgICAgb3JnaW5hbExpc3QucHVzaChkYXRhW2ldWydTcGVjaWVzJ10pO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIC8vIHNvcnQgdGhlIGxpc3QgdG8gbmV3IGFyclxuICAgICAgICAvLyB2YXIgc29ydExpc3QgPSBbXTtcbiAgICAgICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vICAgICBzb3J0TGlzdC5wdXNoKGRhdGFbaV1bJ1NwZWNpZXMnXSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gc29ydExpc3Quc29ydCgpO1xuXG4gICAgICAgIC8vIHZhciB0ZXRyYWRMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgICAgICAgLy8gdGV0cmFkTGlzdC5jbGFzc0xpc3QuYWRkKCd0ZXRyYWQtbGlzdCcpO1xuXG4gICAgICAgIC8vIC8vIGxvb2t1cCB0aGUgaW5kZXgsIHJldHJlaXZlIHRoZSBDb2RlIHZhbHVlIGFuZCB0ZW1wbGF0ZSB0aGUgbGlzdCBpdGVtXG4gICAgICAgIC8vIHZhciB0aGVDb2RlLCBlbCwgc3BhbkVsO1xuICAgICAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vICAgICB0aGVDb2RlID0gZGF0YVtvcmdpbmFsTGlzdC5pbmRleE9mKHNvcnRMaXN0W2ldKV1bJ0NvZGUnXTtcbiAgICAgICAgLy8gICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgLy8gICAgIGVsLmlubmVySFRNTCA9IHNvcnRMaXN0W2ldLnRyaW0oKTtcbiAgICAgICAgLy8gICAgIHNwYW5FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgLy8gICAgIHNwYW5FbC5jbGFzc0xpc3QuYWRkKCdjb2RlLScgKyB0aGVDb2RlKTtcbiAgICAgICAgLy8gICAgIGVsLmFwcGVuZENoaWxkKHNwYW5FbCk7XG4gICAgICAgIC8vICAgICB0ZXRyYWRMaXN0LmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIG9iai50ZXRyYWQuY3VycmVudExpc3QgPSB0ZXRyYWRMaXN0O1xuICAgICAgICAvLyAvLyB0cnVuY2F0ZSBhcnJheXNcbiAgICAgICAgLy8gb3JnaW5hbExpc3QubGVuZ3RoID0gMDtcbiAgICAgICAgLy8gc29ydExpc3QubGVuZ3RoID0gMDtcblxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgb2JqLnN0b3BTcGlubmVyLmNhbGwob2JqLCBbJ3RldHJhZC1tZXRhJ10pO1xuICAgICAgICAgICAgb2JqLnVwZGF0ZVN0YXRlRWxzLnN0b3AuY2FsbChvYmosIG9iai5jb250ZXh0KTtcbiAgICAgICAgICAgIG9iai5zZXRGZXRjaGluZ0RhdGEoZmFsc2UpO1xuICAgICAgICB9LCA4MDApO1xuICAgIH0pXG4gICAgLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0VGV0cmFkRGF0YSAtIGVycm9yXCIpO1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgb2JqLnN0b3BTcGlubmVyLmNhbGwob2JqLCBbJ3RldHJhZC1tZXRhJ10pO1xuICAgICAgICAgICAgb2JqLnNldE1hcEVycm9yTXNnKHRydWUsICd0ZXRyYWQtcmVxdWVzdCcpO1xuICAgICAgICB9LCA4MDApO1xuICAgIH0pXG4gICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJnZXRUZXRyYWREYXRhIC0gY29tcGxldGVcIik7XG4gICAgfSk7XG5cbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZmlsdGVyRm9yVGVua1NwZWNpZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICh0ZW5rU3BlY2llcy5sZW5ndGggJiYgdGVua1NwZWNpZXMuaW5kZXhPZih0aGlzLnNwZWNpZXMpID49IDApIHtcbiAgICAgICAgdGhpcy50ZW5rU3BlY2llcyA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0RGF0YXNldCgnZGJyZWVkMTAnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2ZpbHRlckZvclRlbmtTcGVjaWVzOiAnLCB0aGlzLmRhdGFzZXQpO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhpcy50ZW5rU3BlY2llcyA9IGZhbHNlO1xuICAgICAgICB2YXIgY3VycmVudERhdGFTZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRleHQpLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtZGF0YS1zZXQnKTtcbiAgICAgICAgdGhpcy5zZXREYXRhc2V0KGN1cnJlbnREYXRhU2V0LnZhbHVlKTtcbiAgICB9XG59O1xuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5maWx0ZXJGb3JUZW5rU3BlY2llcygpO1xuXG4gICAgdmFyIG9iaiA9IHRoaXM7XG5cbiAgICB2YXIgZm9ybURhdGEgPSB7XG4gICAgICAgIFwic3BlY2llc1wiIDogdGhpcy5zcGVjaWVzLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGVTdGF0ZUVscy5zdGFydC5jYWxsKHRoaXMsIG9iai5jb250ZXh0KTtcblxuICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcuLi9hamF4L3NwZWNpZXNEYXRhLnBocCcsXG4gICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGF0YTogIGZvcm1EYXRhLFxuICAgICAgICAgICAgdGltZW91dDogMTIwMDBcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHByZXZpb3VzIHJlc3VsdHMgdXNpbmcgY3VycmVudFRldHJhZEFyclxuICAgICAgICAgICAgdmFyIHByZXZSZXN1bHRzID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKG9iai5jb250ZXh0ICsgXCJjdXJyZW50VGV0cmFkQXJyXCIpKTtcblxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJldlJlc3VsdHMpICYmIHByZXZSZXN1bHRzLmxlbmd0aCkgIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByZXZSZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9iai5jb250ZXh0ICsgcHJldlJlc3VsdHNbaV0pLmNsYXNzTmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRldEFyciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGV0QXJyLnB1c2goZGF0YVtpXVsnVGV0cmFkJ10pO1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0ob2JqLmNvbnRleHQgKyBcImN1cnJlbnRUZXRyYWRBcnJcIiwgSlNPTi5zdHJpbmdpZnkodGV0QXJyKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIGFuIGluZGljYXRvciBvZiByZXN1bHRzIGJlbG9uZ2luZyB0byAxMEsgb3IgMksgc3BlY2llc1xuICAgICAgICAgICAgLy8gdmFyIHNwZWNpZXNTdGF0dXMgPSBvYmoudGVua1NwZWNpZXMgPyAnMTBLJyA6ICcySyc7XG4gICAgICAgICAgICAvLyBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzdGF0dXMnLCBzcGVjaWVzU3RhdHVzKTtcblxuICAgICAgICAgICAgLy8gYWRkIGNsYXNzZXMgdG8gbWF0Y2hpbmcgdGV0cmFkc1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXRBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob2JqLmNvbnRleHQgKyB0ZXRBcnJbaV0pLmNsYXNzTGlzdC5hZGQoJ3ByZXMnLCAnY29kZS0nICsgZGF0YVtpXVsnQ29kZSddKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyByZWZyZXNoIGFjdGl2ZSB0ZXRyYWRcbiAgICAgICAgICAgIGlmIChvYmoudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICQoJyMnICsgb2JqLnRldHJhZC5kb21JZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9iai5jb3VudHMgPSBvYmouZ2V0U3VtcyhkYXRhKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIG9iai5zdG9wU3Bpbm5lci5jYWxsKG9iaiwgWydtYXAnLCd0ZXRyYWQtbWV0YSddKTtcbiAgICAgICAgICAgICAgICBvYmoudXBkYXRlU3RhdGVFbHMuc3RvcC5jYWxsKG9iaiwgb2JqLmNvbnRleHQpO1xuICAgICAgICAgICAgICAgIG9iai5zZXRGZXRjaGluZ0RhdGEoZmFsc2UpO1xuICAgICAgICAgICAgfSwgODAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImdldERhdGEgLSBlcnJvclwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgb2JqLnN0b3BTcGlubmVyLmNhbGwob2JqLCBbJ21hcCcsJ3RldHJhZC1tZXRhJ10pO1xuICAgICAgICAgICAgICAgIG9iai5zZXRNYXBFcnJvck1zZyh0cnVlLCAnZGF0YS1yZXF1ZXN0Jyk7XG4gICAgICAgICAgICB9LCA4MDApO1xuICAgICAgICB9KVxuICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICB9KTtcblxufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXRTdW1zID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzdW1Db25maXJtZWQgPSAwLFxuICAgICAgICBzdW1Qcm9iYWJsZSA9IDAsXG4gICAgICAgIHN1bVBvc3NpYmxlID0gMCxcbiAgICAgICAgc3VtUHJlc2VudCA9IDA7XG4gICAgaWYgKHRoaXMuZGF0YXNldCA9PT0gJ2RicmVlZCcgfHwgdGhpcy5kYXRhc2V0ID09PSAnc2l0dGVycycpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVtpXVsnQ29kZSddID09PSAnQScpIHtzdW1Db25maXJtZWQrKzt9XG4gICAgICAgICAgICBpZiAoZGF0YVtpXVsnQ29kZSddID09PSAnQicpIHtzdW1Qcm9iYWJsZSsrO31cbiAgICAgICAgICAgIGlmIChkYXRhW2ldWydDb2RlJ10gPT09ICdLJykge3N1bVBvc3NpYmxlKys7fVxuICAgICAgICAgICAgaWYgKGRhdGFbaV1bJ0NvZGUnXSA9PT0gJ04nKSB7c3VtUHJlc2VudCsrO31cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsOiBkYXRhLmxlbmd0aCArIDEsXG4gICAgICAgIHN1bVByZXNlbnQ6IHN1bVByZXNlbnQsXG4gICAgICAgIHN1bVBvc3NpYmxlOiBzdW1Qb3NzaWJsZSxcbiAgICAgICAgc3VtUHJvYmFibGU6IHN1bVByb2JhYmxlLFxuICAgICAgICBzdW1Db25maXJtZWQ6IHN1bUNvbmZpcm1lZFxuICAgIH07XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldExhdGluTmFtZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKHR5cGVvZiBsYXRpbk5hbWVzICE9PSAndW5kZWZpbmVkJyAmJiBsYXRpbk5hbWVzLmxlbmd0aCkge1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF0aW5OYW1lcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBmb3IodmFyIGtleSBpbiBsYXRpbk5hbWVzW2ldKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggbGF0aW5OYW1lc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT0gdGhpcy5zcGVjaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGF0aW5OYW1lc1tpXVtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblxuXG4vKiBET00gKi9cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRNYXBFcnJvck1zZyA9IGZ1bmN0aW9uKHN0YXR1cywgY29udGV4dCkge1xuXG4gICAgdmFyICRjb250YWluZXI7XG5cbiAgICBjb250ZXh0ID09PSBcInRldHJhZC1yZXF1ZXN0XCIgPyAkY29udGFpbmVyID0gJCgnLnRldHJhZC1tZXRhJykgOiAkY29udGFpbmVyID0gJCgnLm1hcC1jb250YWluZXInKTtcblxuICAgIHZhciAkZXJyb3JNc2cgPSAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgkY29udGFpbmVyKS5maW5kKCcuZXJyb3Itd3JhcCcpO1xuICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgJGVycm9yTXNnLmNzcygnZGlzcGxheScsICdmbGV4Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgJGVycm9yTXNnLmNzcygnZGlzcGxheScsICdub25lJyk7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnN0YXJ0U3Bpbm5lciA9IGZ1bmN0aW9uKGVscykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGVscykgJiYgZWxzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGVsc1tpXSA9PT0gJ21hcCcpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLm1hcC1jb250YWluZXInKS5hZGRDbGFzcygnbG9hZGluZy1kYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxzW2ldID09PSAndGV0cmFkLW1ldGEnKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YSAnKS5hZGRDbGFzcygnbG9hZGluZy1kYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnN0b3BTcGlubmVyID0gZnVuY3Rpb24oZWxzKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZWxzKSAmJiBlbHMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZWxzW2ldID09PSAnbWFwJykge1xuICAgICAgICAgICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcubWFwLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbHNbaV0gPT09ICd0ZXRyYWQtbWV0YScpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhICcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIGRldGVybWluIHdoYXQgY29tcG9uZW50cyBuZWVkIHVwZGF0aW5nIGFuZCBzdGFydC9zdG9wIHRoZSB1cGRhdGVcbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlU3RhdGVFbHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gc3RhcnQodGhlQ29udGV4dCkge1xuICAgICAgICB2YXIgcGFyZW50RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGVDb250ZXh0KTtcblxuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0ID09PSAnc3BlY2llcycpIHtcbiAgICAgICAgICAgIHZhciBzcGVjaWVzVGl0bGUgPSBwYXJlbnRFbC5xdWVyeVNlbGVjdG9yKCcuc3BlY2llcy10aXRsZXMnKTtcbiAgICAgICAgICAgIHNwZWNpZXNUaXRsZS5jbGFzc0xpc3QuYWRkKCd1cGRhdGUnKTtcblxuICAgICAgICAgICAgdmFyIGNvdW50cyA9IHBhcmVudEVsLnF1ZXJ5U2VsZWN0b3IoJy5jb3VudHMnKTtcbiAgICAgICAgICAgIGNvdW50cy5jbGFzc0xpc3QuYWRkKCd1cGRhdGUnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICAvLyB2YXIgZGF0YVNldFRpdGxlcyA9IHBhcmVudEVsLnF1ZXJ5U2VsZWN0b3IoJy5kYXRhc2V0LXRpdGxlcycpO1xuICAgICAgICAgICAgLy8gZGF0YVNldFRpdGxlcy5jbGFzc0xpc3QuYWRkKCd1cGRhdGUnKTtcbiAgICAgICAgICAgIC8vIHNjcmFwcGVkIGFzIG5vIGxheWVyaW5nIGRhdGFzZXRzIGN1cnJlbnRseVxuXG4gICAgICAgICAgICB2YXIga2V5R3JvdXAgPSBwYXJlbnRFbC5xdWVyeVNlbGVjdG9yKCcua2V5LWdyb3VwJyk7XG4gICAgICAgICAgICBrZXlHcm91cC5jbGFzc0xpc3QuYWRkKCd1cGRhdGUnKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0ZXRyYWRNZXRhID0gcGFyZW50RWwucXVlcnlTZWxlY3RvcignLnRldHJhZC1tZXRhJyk7XG4gICAgICAgICAgICAgICAgdGV0cmFkTWV0YS5jbGFzc0xpc3QuYWRkKCd1cGRhdGUnKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ3RldHJhZCcpIHtcbiAgICAgICAgICAgIHZhciB0ZXRyYWRNZXRhID0gcGFyZW50RWwucXVlcnlTZWxlY3RvcignLnRldHJhZC1tZXRhJyk7XG4gICAgICAgICAgICB0ZXRyYWRNZXRhLmNsYXNzTGlzdC5hZGQoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG9sZCAkKCkuLlxuICAgICAgICAvLyBpZiAodGhpcy5yZXF1ZXN0ID09PSAnc3BlY2llcycpIHtcbiAgICAgICAgLy8gICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLnNwZWNpZXMtdGl0bGVzJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAvLyAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcuY291bnRzJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAvLyB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgIC8vICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy5kYXRhc2V0LXRpdGxlcycpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgLy8gICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLmtleS1ncm91cCcpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgLy8gICAgIGlmICh0aGlzLnRldHJhZC5hY3RpdmUpIHtcbiAgICAgICAgLy8gICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YScpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICd0ZXRyYWQnKSB7XG4gICAgICAgIC8vICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YScpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgLy8gfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKHRoZUNvbnRleHQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ3NwZWNpZXMnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUhlYWRpbmdzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN1bXMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGV0cmFkc1ByZXNlbnQodGhpcy5jb3VudHMudG90YWwpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFzZXRIZWFkaW5ncygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVLZXlzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN1bXMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGV0cmFkc1ByZXNlbnQodGhpcy5jb3VudHMudG90YWwpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGVyYWRCb3goKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEdvb2dsZU1hcExpbmsoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICd0ZXRyYWQnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRlcmFkQm94KCk7XG4gICAgICAgICAgICB0aGlzLnNldEdvb2dsZU1hcExpbmsoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLnN0YXRlJykucmVtb3ZlQ2xhc3MoJ3VwZGF0ZScpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCA6IHN0YXJ0LFxuICAgICAgICBzdG9wIDogc3RvcFxuICAgIH07XG59KSgpO1xuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlVGVyYWRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoZUxpc3QgPSAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1saXN0LXdyYXBwZXInKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC10aXRsZScpLmh0bWwodGhpcy50ZXRyYWQuYWN0aXZlKTtcbiAgICBpZiAodGhpcy5kYXRhc2V0ID09PSAnZGJyZWVkJyB8fCB0aGlzLmRhdGFzZXQgPT09ICdzaXR0ZXJzJykge1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1wcmVzJykuaHRtbCh0aGlzLnRldHJhZC5jb3VudHMuc3VtUHJlc2VudCk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXBvc3MnKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1Qb3NzaWJsZSk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXByb2InKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1Qcm9iYWJsZSk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LWNvbmYnKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1Db25maXJtZWQpO1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1zdW1zJykuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXN1bXMnKS5oaWRlKCk7XG4gICAgfVxuICAgICQodGhlTGlzdCkuZW1wdHkoKTtcblxuICAgICQodGhpcy50ZXRyYWQuY3VycmVudExpc3QpLmFwcGVuZFRvKHRoZUxpc3QpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVTcGVjaWVzU2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNob3Nlbkxpc3QgPSAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnNlbGVjdC1zcGVjaWVzJyk7XG4gICAgY2hvc2VuTGlzdC52YWwodGhpcy5zcGVjaWVzKTtcbiAgICBjaG9zZW5MaXN0LnRyaWdnZXIoXCJjaG9zZW46dXBkYXRlZFwiKTtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlVGV0cmFkc1ByZXNlbnQgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldF9wcmVzJykuaHRtbChsZW5ndGgpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZFRldHJhZCA9IGZ1bmN0aW9uKHRldHJhZElkKSB7XG4gICAgLy8gcmV2ZWFsIHRoZSBpbmZvIGJveCBpZiBoaWRkZW5cbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhLXdyYXBwZXInKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAgIHZhciAkdGV0cmFkID0gJCgnIycgKyB0ZXRyYWRJZCk7XG4gICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICB2YXIgJHByZXZUZXRyYWQgPSAkKCcjJyArIHRoaXMudGV0cmFkLmRvbUlkKTtcbiAgICAgICAgJHByZXZUZXRyYWQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICR0ZXRyYWQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnIycgKyB0ZXRyYWRJZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5oaWRlQ3VycmVudGx5U2VsZWN0ZWRUZXRyYWRJbmZvID0gZnVuY3Rpb24odGV0cmFkSWQpIHtcbiAgICB2YXIgJHRldHJhZCA9ICQoJyMnICsgdGV0cmFkSWQpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEtd3JhcHBlcicpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgJHRldHJhZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkucmVtb3ZlQ2xhc3MoJ3RldHJhZC1hY3RpdmUnKTtcbiAgICB0aGlzLnRldHJhZC5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLnNldEZldGNoaW5nRGF0YShmYWxzZSk7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVN1bXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3VtcyA9IHRoaXMuY291bnRzO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcucHJlcy10YXJnZXQnKS5odG1sKHN1bXMuc3VtUHJlc2VudCk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5jb25mLXRhcmdldCcpLmh0bWwoc3Vtcy5zdW1Db25maXJtZWQpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcucHJvYi10YXJnZXQnKS5odG1sKHN1bXMuc3VtUHJvYmFibGUpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcucG9zcy10YXJnZXQnKS5odG1sKHN1bXMuc3VtUG9zc2libGUpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVIZWFkaW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnNwZWNpZXMtdGl0bGUnKS5odG1sKHRoaXMuc3BlY2llcyk7XG4gICAgdmFyIGxhdGluTmFtZSA9IHRoaXMuZ2V0TGF0aW5OYW1lKCk7XG4gICAgaWYgKGxhdGluTmFtZSkge1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLmxhdGluLW5hbWUnKS5odG1sKGxhdGluTmFtZSk7XG4gICAgfVxufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVEYXRhc2V0SGVhZGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2JqID0gdGhpcztcbiAgICB2YXIgJGVscyA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcuZC1zZXQnKTtcbiAgICAkZWxzLnJlbW92ZUNsYXNzKCdjdXJyZW50Jyk7XG4gICAgJGVscy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICBpZiAob2JqLmRhdGFzZXQgPT09ICQoZWwpLmF0dHIoJ2RhdGEtZHNldC10aXRsZScpKSB7XG4gICAgICAgICAgICAkKGVsKS5hZGRDbGFzcygnY3VycmVudCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKCQoZWwpLmhhc0NsYXNzKCdkLXNldC1icmVlZGluZycpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVLZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleUVscyA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcua2V5LWNvbnRhaW5lcicpO1xuICAgICQoa2V5RWxzKS5yZW1vdmVDbGFzcygnYWN0aXZlIGR3ZGVuc2l0eSBkYmRlbnNpdHknKTtcbiAgICBpZiAodGhpcy5kYXRhc2V0ID09PSAnZHdkZW5zaXR5JyB8fCB0aGlzLmRhdGFzZXQgPT09ICdkYmRlbnNpdHknKSB7XG4gICAgICAgICQoa2V5RWxzWzFdKS5hZGRDbGFzcygnYWN0aXZlICcgKyB0aGlzLmRhdGFzZXQpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgICQoa2V5RWxzWzBdKS5hZGRDbGFzcygnYWN0aXZlJyk7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnRvZ2dsZURhdGFMYXllciA9IGZ1bmN0aW9uKCRlbCkge1xuICAgICRlbC5pcyhcIjpjaGVja2VkXCIpID8gJCgnIycgKyB0aGlzLmNvbnRleHQpLnJlbW92ZUNsYXNzKCdkYXRhLW9mZicpIDogJCgnIycgKyB0aGlzLmNvbnRleHQpLmFkZENsYXNzKCdkYXRhLW9mZicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBNb2R1bGU7IiwidmFyIG92ZXJsYXkgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICBmdW5jdGlvbiBzaG93KGxheWVyLCAkY29udGV4dCkge1xuICAgICAgICAgICAgdmFyICRsYXllciA9ICQoJy4nICsgbGF5ZXIpO1xuICAgICAgICAkY29udGV4dC5maW5kKCRsYXllcikuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGlkZShsYXllciwgJGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciAkbGF5ZXIgPSAkKCcuJyArIGxheWVyKTtcbiAgICAgICAgJGNvbnRleHQuZmluZCgkbGF5ZXIpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzaG93OiBzaG93LFxuICAgICAgICBoaWRlOiBoaWRlXG4gICAgfTtcbn0oalF1ZXJ5KSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVybGF5OyJdfQ==
