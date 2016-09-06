(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MapModule = require('./modules/mapModule');
var overlay = require('./modules/overlay');
// core
// gettingDate
// updating the DOM




$(document).ready(function() {

    // overlay controls
    $('.ov-toggle').on('click', function() {
        var $this = $(this),
            layer = $this.attr('name'),
            context = $this.closest('.container')
        $this.is(":checked") ? overlay.show(layer, context) : overlay.hide(layer, context);
    });


    // map page
    if ( typeof mapPage !== 'undefined' && mapPage) {
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
            maps[currentMap].request = 'species';
            maps[currentMap].startSpinner(['map']);
            maps[currentMap].setSpecies(this.value.trim());
            maps[currentMap].getData();

            maps[currentMap].logModule();
        });

        $('.container').on('change', '.select-data-set', function(event) {
            var currentMap = event.delegateTarget.id;
            maps[currentMap].request = 'dataset';
            maps[currentMap].startSpinner(['map']);
            maps[currentMap].setDataset(this.value);
            maps[currentMap].getData();
            maps[currentMap].getTetradData();

            maps[currentMap].logModule();
        });

        $('.container').on('click', '.tenk > div', function(event) {

            var isSelected = $(this).hasClass('selected');

            var currentMap = event.delegateTarget.id,
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
            maps[currentMap].request = 'species';
            maps[currentMap].startSpinner(['map']);
            maps[currentMap].setSpecies(this.innerText.trim());
            maps[currentMap].getData();
            maps[currentMap].updateSpeciesSelect();
            maps[currentMap].logModule();
        });

        $('.container').on('click', '.data-later-toggle', function(event) {
            var currentMap = event.delegateTarget.id,
            $this = $(this);
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
};

MapModule.prototype.setDataset = function(dataset) {
    this.dataset = dataset;
    $('#' + this.context).attr('data-set', dataset);
};

MapModule.prototype.setSpecies = function(species) {
    this.species = species;
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
}

MapModule.prototype.hideCurrentlySelectedTetradInfo = function(tetradId) {
    var $tetrad = $('#' + tetradId);
    $('#' + this.context).find('.tetrad-meta-wrapper').addClass('hide');
    $tetrad.removeClass('selected');
    $('#' + this.context).removeClass('tetrad-active');
    this.tetrad.active = false;
    console.log(this);
}



MapModule.prototype.setTetradStatus = function(tetradId, id) {
    this.tetrad = {
        active : tetradId,
        domId : id
    }
    $('#' + this.context).addClass('tetrad-active');
};

MapModule.prototype.logModule = function() {
    console.log(this);
}



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
    }

    $.ajax({
        url: '../ajax/tetradData.php',
        type: 'POST',
        dataType: 'json',
        data: postData
    })
    .done(function(data){
        obj.tetrad.counts = obj.getSums(data);

        // get the list of names
        var orginalList = [];

        for (var i = 0; i < data.length; i++) {
            orginalList.push(data[i]['Species']);
        }
        // sort the list to new arr
        var sortList = [];
        for (var i = 0; i < data.length; i++) {
            sortList.push(data[i]['Species']);
        }
        sortList.sort();

        var tetradList = $('<ol/>', {
            'class' : 'tetrad-list'
        });
        // lookup the index and retreive the Code value
        for (var i = 0; i < sortList.length; i++) {
            var theCode = data[orginalList.indexOf(sortList[i])]['Code'];
            $('<li/>', {
                html: sortList[i] + '<span class="code-' + theCode + '"></span>'
            }).appendTo(tetradList);
        }
        obj.tetrad.currentList = tetradList;
        // truncate arrays
        orginalList.length = 0;
        sortList.length = 0;

    })
    .done(function(data) {
        window.setTimeout(function(){
            obj.stopSpinner.call(obj, ['tetrad-meta']);
            obj.updateStateEls.stop.call(obj, obj.context);
        }, 1000);
    })
    .fail(function() {
        console.log("getTetradData - error");
    })
    .always(function() {
        // console.log("getTetradData - complete");
    });

};

MapModule.prototype.getData = function() {

    var obj = this;

    var formData = {
        "species" : this.species,
        "data-set" : this.dataset
    }

    this.updateStateEls.start.call(this, obj.context);

    $.ajax({
            url: '../ajax/speciesData.php',
            type: 'POST',
            dataType: 'json',
            data:  formData
        })
        .done(function(data) {
            // remove previous results using currentTetradArr
            var prevResults = JSON.parse(sessionStorage.getItem(obj.context + "currentTetradArr"));

            if (Array.isArray(prevResults) && prevResults.length)  {
                for (var i = 0; i < prevResults.length; i++) {
                    $('#' + obj.context + prevResults[i]).removeClass();
                }
            }
            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem(obj.context + "currentTetradArr", JSON.stringify(tetArr));
            }
            // add classes to matching tetrads
            for (var i = 0; i < tetArr.length; i++) {
                    $('#' + obj.context + tetArr[i])
                        .addClass('pres code-' + data[i]['Code']);
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
            }, 1000);
        })
        .fail(function() {
            console.log("getData - error");
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
            if (data[i]['Code'] === 'A') {sumConfirmed++}
            if (data[i]['Code'] === 'B') {sumProbable++}
            if (data[i]['Code'] === 'K') {sumPossible++}
            if (data[i]['Code'] === 'N') {sumPresent++}
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
};







/* DOM */

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
}

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
}

// determin what components need updating and start/stop the update
MapModule.prototype.updateStateEls = (function() {
    function start(theContext) {
        if (this.request === 'species') {
            $('#' + theContext).find('.species-titles').addClass('update');
            $('#' + theContext).find('.counts').addClass('update');
        } else if (this.request === 'dataset') {
            $('#' + theContext).find('.dataset-titles').addClass('update');
            $('#' + theContext).find('.key-group').addClass('update');
            if (this.tetrad.active) {
                $('#' + theContext).find('.tetrad-meta').addClass('update');
            }
        } else if (this.request === 'tetrad') {
            $('#' + theContext).find('.tetrad-meta').addClass('update');
        }
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
            }
        } else if (this.request === 'tetrad') {
            this.updateTeradBox();
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
}

MapModule.prototype.updateSpeciesSelect = function() {
    $('#' + this.context)
        .find('.select-species')
            .val(this.species)
                .trigger('chosen:updated');
}

MapModule.prototype.updateTetradsPresent = function(length) {
    $('#' + this.context).find('.tet_pres').html(length);
}

MapModule.prototype.updateSums = function() {
    var sums = this.counts;
    $('#' + this.context).find('.pres-target').html(sums.sumPresent);
    $('#' + this.context).find('.conf-target').html(sums.sumConfirmed);
    $('#' + this.context).find('.prob-target').html(sums.sumProbable);
    $('#' + this.context).find('.poss-target').html(sums.sumPossible);
}

MapModule.prototype.updateHeadings = function () {
    $('#' + this.context).find('.species-title').html(this.species);
    var latinName = this.getLatinName();
    if (latinName) {
        $('#' + this.context).find('.latin-name').html(latinName);
    }
}

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
}

MapModule.prototype.updateKeys = function() {
    var keyEls = $('#' + this.context).find('.key-container');
    $(keyEls).removeClass('active dwdensity dbdensity');
    if (this.dataset === 'dwdensity' || this.dataset === 'dbdensity') {
        $(keyEls[1]).addClass('active ' + this.dataset);
        return false;
    }
    $(keyEls[0]).addClass('active');
}


MapModule.prototype.toggleDataLayer = function($el) {
    $el.is(":checked") ? $('#' + this.context).removeClass('data-off') : $('#' + this.context).addClass('data-off');
}

module.exports = MapModule;
},{}],3:[function(require,module,exports){
var overlay = (function () {
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
}());


module.exports = overlay;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyIsInNyYy9qcy9hcHAvbW9kdWxlcy9vdmVybGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNYXBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbWFwTW9kdWxlJyk7XG52YXIgb3ZlcmxheSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9vdmVybGF5Jyk7XG4vLyBjb3JlXG4vLyBnZXR0aW5nRGF0ZVxuLy8gdXBkYXRpbmcgdGhlIERPTVxuXG5cblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgIC8vIG92ZXJsYXkgY29udHJvbHNcbiAgICAkKCcub3YtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICBsYXllciA9ICR0aGlzLmF0dHIoJ25hbWUnKSxcbiAgICAgICAgICAgIGNvbnRleHQgPSAkdGhpcy5jbG9zZXN0KCcuY29udGFpbmVyJylcbiAgICAgICAgJHRoaXMuaXMoXCI6Y2hlY2tlZFwiKSA/IG92ZXJsYXkuc2hvdyhsYXllciwgY29udGV4dCkgOiBvdmVybGF5LmhpZGUobGF5ZXIsIGNvbnRleHQpO1xuICAgIH0pO1xuXG5cbiAgICAvLyBtYXAgcGFnZVxuICAgIGlmICggdHlwZW9mIG1hcFBhZ2UgIT09ICd1bmRlZmluZWQnICYmIG1hcFBhZ2UpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcblxuICAgICAgICAvLyBzZXQgZGVmYXVsdHNcbiAgICAgICAgbWFwcy5tMV8uc2V0U3BlY2llcygnQWxwaW5lIFN3aWZ0Jyk7XG4gICAgICAgIG1hcHMubTFfLnNldERhdGFzZXQoJ2RicmVlZCcpO1xuXG4gICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXMoJ0FscGluZSBTd2lmdCcpO1xuICAgICAgICBtYXBzLm0yXy5zZXREYXRhc2V0KCdkYnJlZWQnKTtcblxuICAgICAgICAkKCcuY29udGFpbmVyJykub24oJ2NoYW5nZScsICcuc2VsZWN0LXNwZWNpZXMnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICdzcGVjaWVzJztcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKFsnbWFwJ10pO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRTcGVjaWVzKHRoaXMudmFsdWUudHJpbSgpKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuXG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmxvZ01vZHVsZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuY29udGFpbmVyJykub24oJ2NoYW5nZScsICcuc2VsZWN0LWRhdGEtc2V0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnJlcXVlc3QgPSAnZGF0YXNldCc7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnN0YXJ0U3Bpbm5lcihbJ21hcCddKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RGF0YXNldCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXRUZXRyYWREYXRhKCk7XG5cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ubG9nTW9kdWxlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLnRlbmsgPiBkaXYnLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9ICQodGhpcykuaGFzQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgdGV0cmFkSWQgPSBldmVudC50YXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgdGV0cmFkTmFtZSA9IGV2ZW50LnRhcmdldC5pZC5zbGljZSgzLCA4KTtcblxuICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmhpZGVDdXJyZW50bHlTZWxlY3RlZFRldHJhZEluZm8odGV0cmFkSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICd0ZXRyYWQnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS51cGRhdGVTZWxlY3RlZFRldHJhZCh0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFRldHJhZFN0YXR1cyh0ZXRyYWROYW1lLCB0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFRldHJhZERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcudGV0cmFkLWxpc3QgbGknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICdzcGVjaWVzJztcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKFsnbWFwJ10pO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRTcGVjaWVzKHRoaXMuaW5uZXJUZXh0LnRyaW0oKSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldERhdGEoKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0udXBkYXRlU3BlY2llc1NlbGVjdCgpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcuZGF0YS1sYXRlci10b2dnbGUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZCxcbiAgICAgICAgICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0udG9nZ2xlRGF0YUxheWVyKCR0aGlzKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cblxuICAgIGlmICggdHlwZW9mIG92UGFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgb3ZQYWdlKSB7XG4gICAgICAgIC8vIHNldHVwIHRoZSBtYXBNb2R1bGVzXG4gICAgICAgIHZhciBtYXBzID0ge307XG4gICAgICAgIG1hcHMubTFfID0gbmV3IE1hcE1vZHVsZSgnbTFfJyk7XG4gICAgICAgIG1hcHMubTFfLnNldERhdGFzZXQoJ2RicmVlZCcpO1xuXG4gICAgICAgIG1hcHMubTJfID0gbmV3IE1hcE1vZHVsZSgnbTJfJyk7XG4gICAgICAgIG1hcHMubTJfLnNldERhdGFzZXQoJ2RiZGVuc2l0eScpO1xuXG4gICAgICAgIG1hcHMubTNfID0gbmV3IE1hcE1vZHVsZSgnbTNfJyk7XG4gICAgICAgIG1hcHMubTNfLnNldERhdGFzZXQoJ2R3ZGVuc2l0eScpO1xuXG4gICAgICAgICQoJy5zZWxlY3Qtc3BlY2llcycpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgbWFwcy5tMV8uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHMubTFfLnN0YXJ0U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICBtYXBzLm0yXy5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwcy5tMl8uc3RhcnRTcGlubmVyKCk7XG5cbiAgICAgICAgICAgIG1hcHMubTNfLnNldFNwZWNpZXModGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBtYXBzLm0zXy5zdGFydFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgbWFwcy5tMV8uZ2V0RGF0YSgpO1xuICAgICAgICAgICAgbWFwcy5tMl8uZ2V0RGF0YSgpO1xuICAgICAgICAgICAgbWFwcy5tM18uZ2V0RGF0YSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn0pO1xuXG5cblxuIiwiZnVuY3Rpb24gTWFwTW9kdWxlKGRvbUNvbnRleHQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBkb21Db250ZXh0O1xuICAgIHRoaXMudGV0cmFkID0ge1xuICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICBjdXJyZW50TGlzdDogJydcbiAgICB9O1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXREYXRhc2V0ID0gZnVuY3Rpb24oZGF0YXNldCkge1xuICAgIHRoaXMuZGF0YXNldCA9IGRhdGFzZXQ7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmF0dHIoJ2RhdGEtc2V0JywgZGF0YXNldCk7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnNldFNwZWNpZXMgPSBmdW5jdGlvbihzcGVjaWVzKSB7XG4gICAgdGhpcy5zcGVjaWVzID0gc3BlY2llcztcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlU2VsZWN0ZWRUZXRyYWQgPSBmdW5jdGlvbih0ZXRyYWRJZCkge1xuICAgIC8vIHJldmVhbCB0aGUgaW5mbyBib3ggaWYgaGlkZGVuXG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YS13cmFwcGVyJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgICB2YXIgJHRldHJhZCA9ICQoJyMnICsgdGV0cmFkSWQpO1xuICAgIGlmICh0aGlzLnRldHJhZC5hY3RpdmUpIHtcbiAgICAgICAgdmFyICRwcmV2VGV0cmFkID0gJCgnIycgKyB0aGlzLnRldHJhZC5kb21JZCk7XG4gICAgICAgICRwcmV2VGV0cmFkLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAkdGV0cmFkLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJyMnICsgdGV0cmFkSWQpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH1cbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5oaWRlQ3VycmVudGx5U2VsZWN0ZWRUZXRyYWRJbmZvID0gZnVuY3Rpb24odGV0cmFkSWQpIHtcbiAgICB2YXIgJHRldHJhZCA9ICQoJyMnICsgdGV0cmFkSWQpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEtd3JhcHBlcicpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgJHRldHJhZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkucmVtb3ZlQ2xhc3MoJ3RldHJhZC1hY3RpdmUnKTtcbiAgICB0aGlzLnRldHJhZC5hY3RpdmUgPSBmYWxzZTtcbiAgICBjb25zb2xlLmxvZyh0aGlzKTtcbn1cblxuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0VGV0cmFkU3RhdHVzID0gZnVuY3Rpb24odGV0cmFkSWQsIGlkKSB7XG4gICAgdGhpcy50ZXRyYWQgPSB7XG4gICAgICAgIGFjdGl2ZSA6IHRldHJhZElkLFxuICAgICAgICBkb21JZCA6IGlkXG4gICAgfVxuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5hZGRDbGFzcygndGV0cmFkLWFjdGl2ZScpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5sb2dNb2R1bGUgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzKTtcbn1cblxuXG5cbi8qIEdFVFRJTkcgREFUQSAqL1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldFRldHJhZERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy50ZXRyYWQuYWN0aXZlKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdGhpcy5zdGFydFNwaW5uZXIoWyd0ZXRyYWQtbWV0YSddKTtcblxuICAgIHRoaXMudGV0cmFkLmN1cnJlbnRMaXN0ID0gXCJcIjtcblxuICAgIHZhciBvYmogPSB0aGlzO1xuXG4gICAgdGhpcy51cGRhdGVTdGF0ZUVscy5zdGFydC5jYWxsKHRoaXMsIHRoaXMuY29udGV4dCk7XG5cbiAgICB2YXIgcG9zdERhdGEgPSB7XG4gICAgICAgIFwidGV0cmFkSWRcIiA6IHRoaXMudGV0cmFkLmFjdGl2ZSxcbiAgICAgICAgXCJkYXRhLXNldFwiIDogdGhpcy5kYXRhc2V0XG4gICAgfVxuXG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAnLi4vYWpheC90ZXRyYWREYXRhLnBocCcsXG4gICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgZGF0YTogcG9zdERhdGFcbiAgICB9KVxuICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBvYmoudGV0cmFkLmNvdW50cyA9IG9iai5nZXRTdW1zKGRhdGEpO1xuXG4gICAgICAgIC8vIGdldCB0aGUgbGlzdCBvZiBuYW1lc1xuICAgICAgICB2YXIgb3JnaW5hbExpc3QgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG9yZ2luYWxMaXN0LnB1c2goZGF0YVtpXVsnU3BlY2llcyddKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzb3J0IHRoZSBsaXN0IHRvIG5ldyBhcnJcbiAgICAgICAgdmFyIHNvcnRMaXN0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29ydExpc3QucHVzaChkYXRhW2ldWydTcGVjaWVzJ10pO1xuICAgICAgICB9XG4gICAgICAgIHNvcnRMaXN0LnNvcnQoKTtcblxuICAgICAgICB2YXIgdGV0cmFkTGlzdCA9ICQoJzxvbC8+Jywge1xuICAgICAgICAgICAgJ2NsYXNzJyA6ICd0ZXRyYWQtbGlzdCdcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGxvb2t1cCB0aGUgaW5kZXggYW5kIHJldHJlaXZlIHRoZSBDb2RlIHZhbHVlXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0aGVDb2RlID0gZGF0YVtvcmdpbmFsTGlzdC5pbmRleE9mKHNvcnRMaXN0W2ldKV1bJ0NvZGUnXTtcbiAgICAgICAgICAgICQoJzxsaS8+Jywge1xuICAgICAgICAgICAgICAgIGh0bWw6IHNvcnRMaXN0W2ldICsgJzxzcGFuIGNsYXNzPVwiY29kZS0nICsgdGhlQ29kZSArICdcIj48L3NwYW4+J1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odGV0cmFkTGlzdCk7XG4gICAgICAgIH1cbiAgICAgICAgb2JqLnRldHJhZC5jdXJyZW50TGlzdCA9IHRldHJhZExpc3Q7XG4gICAgICAgIC8vIHRydW5jYXRlIGFycmF5c1xuICAgICAgICBvcmdpbmFsTGlzdC5sZW5ndGggPSAwO1xuICAgICAgICBzb3J0TGlzdC5sZW5ndGggPSAwO1xuXG4gICAgfSlcbiAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBvYmouc3RvcFNwaW5uZXIuY2FsbChvYmosIFsndGV0cmFkLW1ldGEnXSk7XG4gICAgICAgICAgICBvYmoudXBkYXRlU3RhdGVFbHMuc3RvcC5jYWxsKG9iaiwgb2JqLmNvbnRleHQpO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICB9KVxuICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImdldFRldHJhZERhdGEgLSBlcnJvclwiKTtcbiAgICB9KVxuICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0VGV0cmFkRGF0YSAtIGNvbXBsZXRlXCIpO1xuICAgIH0pO1xuXG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBvYmogPSB0aGlzO1xuXG4gICAgdmFyIGZvcm1EYXRhID0ge1xuICAgICAgICBcInNwZWNpZXNcIiA6IHRoaXMuc3BlY2llcyxcbiAgICAgICAgXCJkYXRhLXNldFwiIDogdGhpcy5kYXRhc2V0XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVTdGF0ZUVscy5zdGFydC5jYWxsKHRoaXMsIG9iai5jb250ZXh0KTtcblxuICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcuLi9hamF4L3NwZWNpZXNEYXRhLnBocCcsXG4gICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGF0YTogIGZvcm1EYXRhXG4gICAgICAgIH0pXG4gICAgICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwcmV2aW91cyByZXN1bHRzIHVzaW5nIGN1cnJlbnRUZXRyYWRBcnJcbiAgICAgICAgICAgIHZhciBwcmV2UmVzdWx0cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShvYmouY29udGV4dCArIFwiY3VycmVudFRldHJhZEFyclwiKSk7XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByZXZSZXN1bHRzKSAmJiBwcmV2UmVzdWx0cy5sZW5ndGgpICB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmV2UmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkKCcjJyArIG9iai5jb250ZXh0ICsgcHJldlJlc3VsdHNbaV0pLnJlbW92ZUNsYXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGV0QXJyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0ZXRBcnIucHVzaChkYXRhW2ldWydUZXRyYWQnXSk7XG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShvYmouY29udGV4dCArIFwiY3VycmVudFRldHJhZEFyclwiLCBKU09OLnN0cmluZ2lmeSh0ZXRBcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkZCBjbGFzc2VzIHRvIG1hdGNoaW5nIHRldHJhZHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV0QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJyMnICsgb2JqLmNvbnRleHQgKyB0ZXRBcnJbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3ByZXMgY29kZS0nICsgZGF0YVtpXVsnQ29kZSddKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyByZWZyZXNoIGFjdGl2ZSB0ZXRyYWRcbiAgICAgICAgICAgIGlmIChvYmoudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICQoJyMnICsgb2JqLnRldHJhZC5kb21JZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9iai5jb3VudHMgPSBvYmouZ2V0U3VtcyhkYXRhKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIG9iai5zdG9wU3Bpbm5lci5jYWxsKG9iaiwgWydtYXAnLCd0ZXRyYWQtbWV0YSddKTtcbiAgICAgICAgICAgICAgICBvYmoudXBkYXRlU3RhdGVFbHMuc3RvcC5jYWxsKG9iaiwgb2JqLmNvbnRleHQpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJnZXREYXRhIC0gZXJyb3JcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIH0pO1xuXG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldFN1bXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHN1bUNvbmZpcm1lZCA9IDAsXG4gICAgICAgIHN1bVByb2JhYmxlID0gMCxcbiAgICAgICAgc3VtUG9zc2libGUgPSAwLFxuICAgICAgICBzdW1QcmVzZW50ID0gMDtcbiAgICBpZiAodGhpcy5kYXRhc2V0ID09PSAnZGJyZWVkJyB8fCB0aGlzLmRhdGFzZXQgPT09ICdzaXR0ZXJzJykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2ldWydDb2RlJ10gPT09ICdBJykge3N1bUNvbmZpcm1lZCsrfVxuICAgICAgICAgICAgaWYgKGRhdGFbaV1bJ0NvZGUnXSA9PT0gJ0InKSB7c3VtUHJvYmFibGUrK31cbiAgICAgICAgICAgIGlmIChkYXRhW2ldWydDb2RlJ10gPT09ICdLJykge3N1bVBvc3NpYmxlKyt9XG4gICAgICAgICAgICBpZiAoZGF0YVtpXVsnQ29kZSddID09PSAnTicpIHtzdW1QcmVzZW50Kyt9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0b3RhbDogZGF0YS5sZW5ndGggKyAxLFxuICAgICAgICBzdW1QcmVzZW50OiBzdW1QcmVzZW50LFxuICAgICAgICBzdW1Qb3NzaWJsZTogc3VtUG9zc2libGUsXG4gICAgICAgIHN1bVByb2JhYmxlOiBzdW1Qcm9iYWJsZSxcbiAgICAgICAgc3VtQ29uZmlybWVkOiBzdW1Db25maXJtZWRcbiAgICB9O1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXRMYXRpbk5hbWUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICh0eXBlb2YgbGF0aW5OYW1lcyAhPT0gJ3VuZGVmaW5lZCcgJiYgbGF0aW5OYW1lcy5sZW5ndGgpIHtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhdGluTmFtZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgZm9yKGtleSBpbiBsYXRpbk5hbWVzW2ldKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggbGF0aW5OYW1lc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT0gdGhpcy5zcGVjaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGF0aW5OYW1lc1tpXVtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblxuXG5cblxuXG5cbi8qIERPTSAqL1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnN0YXJ0U3Bpbm5lciA9IGZ1bmN0aW9uKGVscykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGVscykgJiYgZWxzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGVsc1tpXSA9PT0gJ21hcCcpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLm1hcC1jb250YWluZXInKS5hZGRDbGFzcygnbG9hZGluZy1kYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxzW2ldID09PSAndGV0cmFkLW1ldGEnKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YSAnKS5hZGRDbGFzcygnbG9hZGluZy1kYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc3RvcFNwaW5uZXIgPSBmdW5jdGlvbihlbHMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShlbHMpICYmIGVscy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlbHNbaV0gPT09ICdtYXAnKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5tYXAtY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmctZGF0YScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsc1tpXSA9PT0gJ3RldHJhZC1tZXRhJykge1xuICAgICAgICAgICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEgJykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmctZGF0YScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBkZXRlcm1pbiB3aGF0IGNvbXBvbmVudHMgbmVlZCB1cGRhdGluZyBhbmQgc3RhcnQvc3RvcCB0aGUgdXBkYXRlXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVN0YXRlRWxzID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHN0YXJ0KHRoZUNvbnRleHQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ3NwZWNpZXMnKSB7XG4gICAgICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy5zcGVjaWVzLXRpdGxlcycpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLmNvdW50cycpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICdkYXRhc2V0Jykge1xuICAgICAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcuZGF0YXNldC10aXRsZXMnKS5hZGRDbGFzcygndXBkYXRlJyk7XG4gICAgICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy5rZXktZ3JvdXAnKS5hZGRDbGFzcygndXBkYXRlJyk7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXRyYWQuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEnKS5hZGRDbGFzcygndXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1ZXN0ID09PSAndGV0cmFkJykge1xuICAgICAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEnKS5hZGRDbGFzcygndXBkYXRlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3RvcCh0aGVDb250ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3QgPT09ICdzcGVjaWVzJykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVIZWFkaW5ncygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdW1zKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRldHJhZHNQcmVzZW50KHRoaXMuY291bnRzLnRvdGFsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICdkYXRhc2V0Jykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhc2V0SGVhZGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlS2V5cygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdW1zKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRldHJhZHNQcmVzZW50KHRoaXMuY291bnRzLnRvdGFsKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRldHJhZC5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRlcmFkQm94KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1ZXN0ID09PSAndGV0cmFkJykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXJhZEJveCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcuc3RhdGUnKS5yZW1vdmVDbGFzcygndXBkYXRlJyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0IDogc3RhcnQsXG4gICAgICAgIHN0b3AgOiBzdG9wXG4gICAgfTtcbn0pKCk7XG5cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVUZXJhZEJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhlTGlzdCA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLWxpc3Qtd3JhcHBlcicpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLXRpdGxlJykuaHRtbCh0aGlzLnRldHJhZC5hY3RpdmUpO1xuICAgIGlmICh0aGlzLmRhdGFzZXQgPT09ICdkYnJlZWQnIHx8IHRoaXMuZGF0YXNldCA9PT0gJ3NpdHRlcnMnKSB7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXByZXMnKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1QcmVzZW50KTtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXQtcG9zcycpLmh0bWwodGhpcy50ZXRyYWQuY291bnRzLnN1bVBvc3NpYmxlKTtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXQtcHJvYicpLmh0bWwodGhpcy50ZXRyYWQuY291bnRzLnN1bVByb2JhYmxlKTtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXQtY29uZicpLmh0bWwodGhpcy50ZXRyYWQuY291bnRzLnN1bUNvbmZpcm1lZCk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXN1bXMnKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXQtc3VtcycpLmhpZGUoKTtcbiAgICB9XG4gICAgJCh0aGVMaXN0KS5lbXB0eSgpO1xuXG4gICAgJCh0aGlzLnRldHJhZC5jdXJyZW50TGlzdCkuYXBwZW5kVG8odGhlTGlzdCk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlU3BlY2llc1NlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KVxuICAgICAgICAuZmluZCgnLnNlbGVjdC1zcGVjaWVzJylcbiAgICAgICAgICAgIC52YWwodGhpcy5zcGVjaWVzKVxuICAgICAgICAgICAgICAgIC50cmlnZ2VyKCdjaG9zZW46dXBkYXRlZCcpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVRldHJhZHNQcmVzZW50ID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRfcHJlcycpLmh0bWwobGVuZ3RoKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVTdW1zID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN1bXMgPSB0aGlzLmNvdW50cztcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnByZXMtdGFyZ2V0JykuaHRtbChzdW1zLnN1bVByZXNlbnQpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcuY29uZi10YXJnZXQnKS5odG1sKHN1bXMuc3VtQ29uZmlybWVkKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnByb2ItdGFyZ2V0JykuaHRtbChzdW1zLnN1bVByb2JhYmxlKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnBvc3MtdGFyZ2V0JykuaHRtbChzdW1zLnN1bVBvc3NpYmxlKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVIZWFkaW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnNwZWNpZXMtdGl0bGUnKS5odG1sKHRoaXMuc3BlY2llcyk7XG4gICAgdmFyIGxhdGluTmFtZSA9IHRoaXMuZ2V0TGF0aW5OYW1lKCk7XG4gICAgaWYgKGxhdGluTmFtZSkge1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLmxhdGluLW5hbWUnKS5odG1sKGxhdGluTmFtZSk7XG4gICAgfVxufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZURhdGFzZXRIZWFkaW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvYmogPSB0aGlzO1xuICAgIHZhciAkZWxzID0gJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5kLXNldCcpO1xuICAgICRlbHMucmVtb3ZlQ2xhc3MoJ2N1cnJlbnQnKTtcbiAgICAkZWxzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgIGlmIChvYmouZGF0YXNldCA9PT0gJChlbCkuYXR0cignZGF0YS1kc2V0LXRpdGxlJykpIHtcbiAgICAgICAgICAgICQoZWwpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYoJChlbCkuaGFzQ2xhc3MoJ2Qtc2V0LWJyZWVkaW5nJykpIHtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2N1cnJlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlS2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlFbHMgPSAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLmtleS1jb250YWluZXInKTtcbiAgICAkKGtleUVscykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZSBkd2RlbnNpdHkgZGJkZW5zaXR5Jyk7XG4gICAgaWYgKHRoaXMuZGF0YXNldCA9PT0gJ2R3ZGVuc2l0eScgfHwgdGhpcy5kYXRhc2V0ID09PSAnZGJkZW5zaXR5Jykge1xuICAgICAgICAkKGtleUVsc1sxXSkuYWRkQ2xhc3MoJ2FjdGl2ZSAnICsgdGhpcy5kYXRhc2V0KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkKGtleUVsc1swXSkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xufVxuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudG9nZ2xlRGF0YUxheWVyID0gZnVuY3Rpb24oJGVsKSB7XG4gICAgJGVsLmlzKFwiOmNoZWNrZWRcIikgPyAkKCcjJyArIHRoaXMuY29udGV4dCkucmVtb3ZlQ2xhc3MoJ2RhdGEtb2ZmJykgOiAkKCcjJyArIHRoaXMuY29udGV4dCkuYWRkQ2xhc3MoJ2RhdGEtb2ZmJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwTW9kdWxlOyIsInZhciBvdmVybGF5ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBzaG93KGxheWVyLCAkY29udGV4dCkge1xuICAgICAgICAgICAgdmFyICRsYXllciA9ICQoJy4nICsgbGF5ZXIpO1xuICAgICAgICAkY29udGV4dC5maW5kKCRsYXllcikuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGlkZShsYXllciwgJGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciAkbGF5ZXIgPSAkKCcuJyArIGxheWVyKTtcbiAgICAgICAgJGNvbnRleHQuZmluZCgkbGF5ZXIpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzaG93OiBzaG93LFxuICAgICAgICBoaWRlOiBoaWRlXG4gICAgfTtcbn0oKSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVybGF5OyJdfQ==
