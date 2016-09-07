(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MapModule = require('./modules/mapModule');
var overlay = require('./modules/overlay');


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


        // toogle double view
        var $wrapper = $('#tetrad-maps');
        function doubleOn($btn) {
            $wrapper.addClass('double');
            $btn.addClass('active');
        };
        function doubleOff($btn) {
            $wrapper.removeClass('double');
            $btn.removeClass('active');
        };

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

        $('.container').on('click', '.tenk > div', function(event) {
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
};

MapModule.prototype.setDataset = function(dataset) {
    this.dataset = dataset;
    $('#' + this.context).attr('data-set', dataset);
};

MapModule.prototype.setSpecies = function(species) {
    this.species = species;
};

MapModule.prototype.setFetchingData = function(status) {
    this.fetchingData = status;
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
                html: sortList[i].trim() + '<span class="code-' + theCode + '"></span>'
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
            obj.setFetchingData(false);
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
                obj.setFetchingData(false);
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
    console.log(this.species);
    var chosenList = $('#' + this.context).find('.select-species');
    chosenList.val(this.species);
    chosenList.trigger("chosen:updated");
}

MapModule.prototype.updateTetradsPresent = function(length) {
    $('#' + this.context).find('.tet_pres').html(length);
}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyIsInNyYy9qcy9hcHAvbW9kdWxlcy9vdmVybGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTWFwTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGVzL21hcE1vZHVsZScpO1xudmFyIG92ZXJsYXkgPSByZXF1aXJlKCcuL21vZHVsZXMvb3ZlcmxheScpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gb3ZlcmxheSBjb250cm9sc1xuICAgICQoJy5vdi10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGxheWVyID0gJHRoaXMuYXR0cignbmFtZScpLFxuICAgICAgICAgICAgY29udGV4dCA9ICR0aGlzLmNsb3Nlc3QoJy5jb250YWluZXInKVxuICAgICAgICAkdGhpcy5pcyhcIjpjaGVja2VkXCIpID8gb3ZlcmxheS5zaG93KGxheWVyLCBjb250ZXh0KSA6IG92ZXJsYXkuaGlkZShsYXllciwgY29udGV4dCk7XG4gICAgfSk7XG5cblxuICAgIC8vIG1hcCBwYWdlXG4gICAgaWYgKCB0eXBlb2YgbWFwUGFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbWFwUGFnZSkge1xuXG5cbiAgICAgICAgLy8gdG9vZ2xlIGRvdWJsZSB2aWV3XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICQoJyN0ZXRyYWQtbWFwcycpO1xuICAgICAgICBmdW5jdGlvbiBkb3VibGVPbigkYnRuKSB7XG4gICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcygnZG91YmxlJyk7XG4gICAgICAgICAgICAkYnRuLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfTtcbiAgICAgICAgZnVuY3Rpb24gZG91YmxlT2ZmKCRidG4pIHtcbiAgICAgICAgICAgICR3cmFwcGVyLnJlbW92ZUNsYXNzKCdkb3VibGUnKTtcbiAgICAgICAgICAgICRidG4ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9O1xuXG4gICAgICAgICQoJyNqcy1jb21wYXJlLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICRidG4gPSAkKHRoaXMpO1xuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykgPyBkb3VibGVPZmYoJGJ0bikgOiBkb3VibGVPbigkYnRuKTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgICAgIC8vIHNldHVwIHRoZSBtYXBNb2R1bGVzXG4gICAgICAgIHZhciBtYXBzID0ge307XG4gICAgICAgIG1hcHMubTFfID0gbmV3IE1hcE1vZHVsZSgnbTFfJyk7XG4gICAgICAgIG1hcHMubTJfID0gbmV3IE1hcE1vZHVsZSgnbTJfJyk7XG5cbiAgICAgICAgLy8gc2V0IGRlZmF1bHRzXG4gICAgICAgIG1hcHMubTFfLnNldFNwZWNpZXMoJ0FscGluZSBTd2lmdCcpO1xuICAgICAgICBtYXBzLm0xXy5zZXREYXRhc2V0KCdkYnJlZWQnKTtcblxuICAgICAgICBtYXBzLm0yXy5zZXRTcGVjaWVzKCdBbHBpbmUgU3dpZnQnKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1zcGVjaWVzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBpZiAobWFwc1tjdXJyZW50TWFwXS5mZXRjaGluZ0RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldEZldGNoaW5nRGF0YSh0cnVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICdzcGVjaWVzJztcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKFsnbWFwJ10pO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRTcGVjaWVzKHRoaXMudmFsdWUudHJpbSgpKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuXG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmxvZ01vZHVsZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuY29udGFpbmVyJykub24oJ2NoYW5nZScsICcuc2VsZWN0LWRhdGEtc2V0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBpZiAobWFwc1tjdXJyZW50TWFwXS5mZXRjaGluZ0RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldEZldGNoaW5nRGF0YSh0cnVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICdkYXRhc2V0JztcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKFsnbWFwJ10pO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXREYXRhc2V0KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFRldHJhZERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcudGVuayA+IGRpdicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAgICAgaWYgKG1hcHNbY3VycmVudE1hcF0uZmV0Y2hpbmdEYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRGZXRjaGluZ0RhdGEodHJ1ZSk7XG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9ICQodGhpcykuaGFzQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgdGV0cmFkSWQgPSBldmVudC50YXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgdGV0cmFkTmFtZSA9IGV2ZW50LnRhcmdldC5pZC5zbGljZSgzLCA4KTtcblxuICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmhpZGVDdXJyZW50bHlTZWxlY3RlZFRldHJhZEluZm8odGV0cmFkSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICd0ZXRyYWQnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS51cGRhdGVTZWxlY3RlZFRldHJhZCh0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFRldHJhZFN0YXR1cyh0ZXRyYWROYW1lLCB0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFRldHJhZERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcudGV0cmFkLWxpc3QgbGknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIGlmIChtYXBzW2N1cnJlbnRNYXBdLmZldGNoaW5nRGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RmV0Y2hpbmdEYXRhKHRydWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5yZXF1ZXN0ID0gJ3NwZWNpZXMnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zdGFydFNwaW5uZXIoWydtYXAnXSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFNwZWNpZXMoJCh0aGlzKS50ZXh0KCkpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnVwZGF0ZVNwZWNpZXNTZWxlY3QoKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ubG9nTW9kdWxlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLmRhdGEtbGF0ZXItdG9nZ2xlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS50b2dnbGVEYXRhTGF5ZXIoJHRoaXMpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgaWYgKCB0eXBlb2Ygb3ZQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBvdlBhZ2UpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMV8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJkZW5zaXR5Jyk7XG5cbiAgICAgICAgbWFwcy5tM18gPSBuZXcgTWFwTW9kdWxlKCdtM18nKTtcbiAgICAgICAgbWFwcy5tM18uc2V0RGF0YXNldCgnZHdkZW5zaXR5Jyk7XG5cbiAgICAgICAgJCgnLnNlbGVjdC1zcGVjaWVzJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBtYXBzLm0xXy5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwcy5tMV8uc3RhcnRTcGlubmVyKCk7XG5cbiAgICAgICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXModGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBtYXBzLm0yXy5zdGFydFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgbWFwcy5tM18uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHMubTNfLnN0YXJ0U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICBtYXBzLm0xXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0yXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0zXy5nZXREYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cblxuXG4iLCJmdW5jdGlvbiBNYXBNb2R1bGUoZG9tQ29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGRvbUNvbnRleHQ7XG4gICAgdGhpcy50ZXRyYWQgPSB7XG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGN1cnJlbnRMaXN0OiAnJ1xuICAgIH07XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnNldERhdGFzZXQgPSBmdW5jdGlvbihkYXRhc2V0KSB7XG4gICAgdGhpcy5kYXRhc2V0ID0gZGF0YXNldDtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuYXR0cignZGF0YS1zZXQnLCBkYXRhc2V0KTtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0U3BlY2llcyA9IGZ1bmN0aW9uKHNwZWNpZXMpIHtcbiAgICB0aGlzLnNwZWNpZXMgPSBzcGVjaWVzO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRGZXRjaGluZ0RhdGEgPSBmdW5jdGlvbihzdGF0dXMpIHtcbiAgICB0aGlzLmZldGNoaW5nRGF0YSA9IHN0YXR1cztcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRUZXRyYWRTdGF0dXMgPSBmdW5jdGlvbih0ZXRyYWRJZCwgaWQpIHtcbiAgICB0aGlzLnRldHJhZCA9IHtcbiAgICAgICAgYWN0aXZlIDogdGV0cmFkSWQsXG4gICAgICAgIGRvbUlkIDogaWRcbiAgICB9XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmFkZENsYXNzKCd0ZXRyYWQtYWN0aXZlJyk7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmxvZ01vZHVsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMpO1xufVxuXG5cblxuXG5cblxuLyogR0VUVElORyBEQVRBICovXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0VGV0cmFkRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRldHJhZC5hY3RpdmUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICB0aGlzLnN0YXJ0U3Bpbm5lcihbJ3RldHJhZC1tZXRhJ10pO1xuXG4gICAgdGhpcy50ZXRyYWQuY3VycmVudExpc3QgPSBcIlwiO1xuXG4gICAgdmFyIG9iaiA9IHRoaXM7XG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlRWxzLnN0YXJ0LmNhbGwodGhpcywgdGhpcy5jb250ZXh0KTtcblxuICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgXCJ0ZXRyYWRJZFwiIDogdGhpcy50ZXRyYWQuYWN0aXZlLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcuLi9hamF4L3RldHJhZERhdGEucGhwJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiBwb3N0RGF0YVxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIG9iai50ZXRyYWQuY291bnRzID0gb2JqLmdldFN1bXMoZGF0YSk7XG5cbiAgICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG5hbWVzXG4gICAgICAgIHZhciBvcmdpbmFsTGlzdCA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgb3JnaW5hbExpc3QucHVzaChkYXRhW2ldWydTcGVjaWVzJ10pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNvcnQgdGhlIGxpc3QgdG8gbmV3IGFyclxuICAgICAgICB2YXIgc29ydExpc3QgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb3J0TGlzdC5wdXNoKGRhdGFbaV1bJ1NwZWNpZXMnXSk7XG4gICAgICAgIH1cbiAgICAgICAgc29ydExpc3Quc29ydCgpO1xuXG4gICAgICAgIHZhciB0ZXRyYWRMaXN0ID0gJCgnPG9sLz4nLCB7XG4gICAgICAgICAgICAnY2xhc3MnIDogJ3RldHJhZC1saXN0J1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gbG9va3VwIHRoZSBpbmRleCBhbmQgcmV0cmVpdmUgdGhlIENvZGUgdmFsdWVcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0TGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHRoZUNvZGUgPSBkYXRhW29yZ2luYWxMaXN0LmluZGV4T2Yoc29ydExpc3RbaV0pXVsnQ29kZSddO1xuICAgICAgICAgICAgJCgnPGxpLz4nLCB7XG4gICAgICAgICAgICAgICAgaHRtbDogc29ydExpc3RbaV0udHJpbSgpICsgJzxzcGFuIGNsYXNzPVwiY29kZS0nICsgdGhlQ29kZSArICdcIj48L3NwYW4+J1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odGV0cmFkTGlzdCk7XG4gICAgICAgIH1cbiAgICAgICAgb2JqLnRldHJhZC5jdXJyZW50TGlzdCA9IHRldHJhZExpc3Q7XG4gICAgICAgIC8vIHRydW5jYXRlIGFycmF5c1xuICAgICAgICBvcmdpbmFsTGlzdC5sZW5ndGggPSAwO1xuICAgICAgICBzb3J0TGlzdC5sZW5ndGggPSAwO1xuXG4gICAgfSlcbiAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBvYmouc3RvcFNwaW5uZXIuY2FsbChvYmosIFsndGV0cmFkLW1ldGEnXSk7XG4gICAgICAgICAgICBvYmoudXBkYXRlU3RhdGVFbHMuc3RvcC5jYWxsKG9iaiwgb2JqLmNvbnRleHQpO1xuICAgICAgICAgICAgb2JqLnNldEZldGNoaW5nRGF0YShmYWxzZSk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH0pXG4gICAgLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0VGV0cmFkRGF0YSAtIGVycm9yXCIpO1xuICAgIH0pXG4gICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJnZXRUZXRyYWREYXRhIC0gY29tcGxldGVcIik7XG4gICAgfSk7XG5cbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIG9iaiA9IHRoaXM7XG5cbiAgICB2YXIgZm9ybURhdGEgPSB7XG4gICAgICAgIFwic3BlY2llc1wiIDogdGhpcy5zcGVjaWVzLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlRWxzLnN0YXJ0LmNhbGwodGhpcywgb2JqLmNvbnRleHQpO1xuXG4gICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogJy4uL2FqYXgvc3BlY2llc0RhdGEucGhwJyxcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOiAgZm9ybURhdGFcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHByZXZpb3VzIHJlc3VsdHMgdXNpbmcgY3VycmVudFRldHJhZEFyclxuICAgICAgICAgICAgdmFyIHByZXZSZXN1bHRzID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKG9iai5jb250ZXh0ICsgXCJjdXJyZW50VGV0cmFkQXJyXCIpKTtcblxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJldlJlc3VsdHMpICYmIHByZXZSZXN1bHRzLmxlbmd0aCkgIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByZXZSZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJyMnICsgb2JqLmNvbnRleHQgKyBwcmV2UmVzdWx0c1tpXSkucmVtb3ZlQ2xhc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZXRBcnIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRldEFyci5wdXNoKGRhdGFbaV1bJ1RldHJhZCddKTtcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKG9iai5jb250ZXh0ICsgXCJjdXJyZW50VGV0cmFkQXJyXCIsIEpTT04uc3RyaW5naWZ5KHRldEFycikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYWRkIGNsYXNzZXMgdG8gbWF0Y2hpbmcgdGV0cmFkc1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXRBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnIycgKyBvYmouY29udGV4dCArIHRldEFycltpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygncHJlcyBjb2RlLScgKyBkYXRhW2ldWydDb2RlJ10pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIC8vIHJlZnJlc2ggYWN0aXZlIHRldHJhZFxuICAgICAgICAgICAgaWYgKG9iai50ZXRyYWQuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyBvYmoudGV0cmFkLmRvbUlkKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JqLmNvdW50cyA9IG9iai5nZXRTdW1zKGRhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgb2JqLnN0b3BTcGlubmVyLmNhbGwob2JqLCBbJ21hcCcsJ3RldHJhZC1tZXRhJ10pO1xuICAgICAgICAgICAgICAgIG9iai51cGRhdGVTdGF0ZUVscy5zdG9wLmNhbGwob2JqLCBvYmouY29udGV4dCk7XG4gICAgICAgICAgICAgICAgb2JqLnNldEZldGNoaW5nRGF0YShmYWxzZSk7XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImdldERhdGEgLSBlcnJvclwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgfSk7XG5cbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0U3VtcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgc3VtQ29uZmlybWVkID0gMCxcbiAgICAgICAgc3VtUHJvYmFibGUgPSAwLFxuICAgICAgICBzdW1Qb3NzaWJsZSA9IDAsXG4gICAgICAgIHN1bVByZXNlbnQgPSAwO1xuICAgIGlmICh0aGlzLmRhdGFzZXQgPT09ICdkYnJlZWQnIHx8IHRoaXMuZGF0YXNldCA9PT0gJ3NpdHRlcnMnKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRhdGFbaV1bJ0NvZGUnXSA9PT0gJ0EnKSB7c3VtQ29uZmlybWVkKyt9XG4gICAgICAgICAgICBpZiAoZGF0YVtpXVsnQ29kZSddID09PSAnQicpIHtzdW1Qcm9iYWJsZSsrfVxuICAgICAgICAgICAgaWYgKGRhdGFbaV1bJ0NvZGUnXSA9PT0gJ0snKSB7c3VtUG9zc2libGUrK31cbiAgICAgICAgICAgIGlmIChkYXRhW2ldWydDb2RlJ10gPT09ICdOJykge3N1bVByZXNlbnQrK31cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsOiBkYXRhLmxlbmd0aCArIDEsXG4gICAgICAgIHN1bVByZXNlbnQ6IHN1bVByZXNlbnQsXG4gICAgICAgIHN1bVBvc3NpYmxlOiBzdW1Qb3NzaWJsZSxcbiAgICAgICAgc3VtUHJvYmFibGU6IHN1bVByb2JhYmxlLFxuICAgICAgICBzdW1Db25maXJtZWQ6IHN1bUNvbmZpcm1lZFxuICAgIH07XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldExhdGluTmFtZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKHR5cGVvZiBsYXRpbk5hbWVzICE9PSAndW5kZWZpbmVkJyAmJiBsYXRpbk5hbWVzLmxlbmd0aCkge1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF0aW5OYW1lcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBmb3Ioa2V5IGluIGxhdGluTmFtZXNbaV0pIHtcblxuICAgICAgICAgICAgICAgIGlmKCBsYXRpbk5hbWVzW2ldLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PSB0aGlzLnNwZWNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXRpbk5hbWVzW2ldW2tleV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG5cblxuXG5cblxuLyogRE9NICovXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc3RhcnRTcGlubmVyID0gZnVuY3Rpb24oZWxzKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZWxzKSAmJiBlbHMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZWxzW2ldID09PSAnbWFwJykge1xuICAgICAgICAgICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcubWFwLWNvbnRhaW5lcicpLmFkZENsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbHNbaV0gPT09ICd0ZXRyYWQtbWV0YScpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhICcpLmFkZENsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zdG9wU3Bpbm5lciA9IGZ1bmN0aW9uKGVscykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGVscykgJiYgZWxzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGVsc1tpXSA9PT0gJ21hcCcpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLm1hcC1jb250YWluZXInKS5yZW1vdmVDbGFzcygnbG9hZGluZy1kYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxzW2ldID09PSAndGV0cmFkLW1ldGEnKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YSAnKS5yZW1vdmVDbGFzcygnbG9hZGluZy1kYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIGRldGVybWluIHdoYXQgY29tcG9uZW50cyBuZWVkIHVwZGF0aW5nIGFuZCBzdGFydC9zdG9wIHRoZSB1cGRhdGVcbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlU3RhdGVFbHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gc3RhcnQodGhlQ29udGV4dCkge1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0ID09PSAnc3BlY2llcycpIHtcbiAgICAgICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLnNwZWNpZXMtdGl0bGVzJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcuY291bnRzJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy5kYXRhc2V0LXRpdGxlcycpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLmtleS1ncm91cCcpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRldHJhZC5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YScpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICd0ZXRyYWQnKSB7XG4gICAgICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YScpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKHRoZUNvbnRleHQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ3NwZWNpZXMnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUhlYWRpbmdzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN1bXMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGV0cmFkc1ByZXNlbnQodGhpcy5jb3VudHMudG90YWwpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFzZXRIZWFkaW5ncygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVLZXlzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN1bXMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGV0cmFkc1ByZXNlbnQodGhpcy5jb3VudHMudG90YWwpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGVyYWRCb3goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICd0ZXRyYWQnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRlcmFkQm94KCk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy5zdGF0ZScpLnJlbW92ZUNsYXNzKCd1cGRhdGUnKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQgOiBzdGFydCxcbiAgICAgICAgc3RvcCA6IHN0b3BcbiAgICB9O1xufSkoKTtcblxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVRlcmFkQm94ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGVMaXN0ID0gJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbGlzdC13cmFwcGVyJyk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtdGl0bGUnKS5odG1sKHRoaXMudGV0cmFkLmFjdGl2ZSk7XG4gICAgaWYgKHRoaXMuZGF0YXNldCA9PT0gJ2RicmVlZCcgfHwgdGhpcy5kYXRhc2V0ID09PSAnc2l0dGVycycpIHtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXQtcHJlcycpLmh0bWwodGhpcy50ZXRyYWQuY291bnRzLnN1bVByZXNlbnQpO1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1wb3NzJykuaHRtbCh0aGlzLnRldHJhZC5jb3VudHMuc3VtUG9zc2libGUpO1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1wcm9iJykuaHRtbCh0aGlzLnRldHJhZC5jb3VudHMuc3VtUHJvYmFibGUpO1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1jb25mJykuaHRtbCh0aGlzLnRldHJhZC5jb3VudHMuc3VtQ29uZmlybWVkKTtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXQtc3VtcycpLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1zdW1zJykuaGlkZSgpO1xuICAgIH1cbiAgICAkKHRoZUxpc3QpLmVtcHR5KCk7XG5cbiAgICAkKHRoaXMudGV0cmFkLmN1cnJlbnRMaXN0KS5hcHBlbmRUbyh0aGVMaXN0KTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVTcGVjaWVzU2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5zcGVjaWVzKTtcbiAgICB2YXIgY2hvc2VuTGlzdCA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcuc2VsZWN0LXNwZWNpZXMnKTtcbiAgICBjaG9zZW5MaXN0LnZhbCh0aGlzLnNwZWNpZXMpO1xuICAgIGNob3Nlbkxpc3QudHJpZ2dlcihcImNob3Nlbjp1cGRhdGVkXCIpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVRldHJhZHNQcmVzZW50ID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRfcHJlcycpLmh0bWwobGVuZ3RoKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZFRldHJhZCA9IGZ1bmN0aW9uKHRldHJhZElkKSB7XG4gICAgLy8gcmV2ZWFsIHRoZSBpbmZvIGJveCBpZiBoaWRkZW5cbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhLXdyYXBwZXInKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAgIHZhciAkdGV0cmFkID0gJCgnIycgKyB0ZXRyYWRJZCk7XG4gICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICB2YXIgJHByZXZUZXRyYWQgPSAkKCcjJyArIHRoaXMudGV0cmFkLmRvbUlkKTtcbiAgICAgICAgJHByZXZUZXRyYWQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICR0ZXRyYWQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnIycgKyB0ZXRyYWRJZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLmhpZGVDdXJyZW50bHlTZWxlY3RlZFRldHJhZEluZm8gPSBmdW5jdGlvbih0ZXRyYWRJZCkge1xuICAgIHZhciAkdGV0cmFkID0gJCgnIycgKyB0ZXRyYWRJZCk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy50ZXRyYWQtbWV0YS13cmFwcGVyJykuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgICAkdGV0cmFkLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5yZW1vdmVDbGFzcygndGV0cmFkLWFjdGl2ZScpO1xuICAgIHRoaXMudGV0cmFkLmFjdGl2ZSA9IGZhbHNlO1xuICAgIGNvbnNvbGUubG9nKHRoaXMpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVN1bXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3VtcyA9IHRoaXMuY291bnRzO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcucHJlcy10YXJnZXQnKS5odG1sKHN1bXMuc3VtUHJlc2VudCk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5jb25mLXRhcmdldCcpLmh0bWwoc3Vtcy5zdW1Db25maXJtZWQpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcucHJvYi10YXJnZXQnKS5odG1sKHN1bXMuc3VtUHJvYmFibGUpO1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcucG9zcy10YXJnZXQnKS5odG1sKHN1bXMuc3VtUG9zc2libGUpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZUhlYWRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcuc3BlY2llcy10aXRsZScpLmh0bWwodGhpcy5zcGVjaWVzKTtcbiAgICB2YXIgbGF0aW5OYW1lID0gdGhpcy5nZXRMYXRpbk5hbWUoKTtcbiAgICBpZiAobGF0aW5OYW1lKSB7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcubGF0aW4tbmFtZScpLmh0bWwobGF0aW5OYW1lKTtcbiAgICB9XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlRGF0YXNldEhlYWRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9iaiA9IHRoaXM7XG4gICAgdmFyICRlbHMgPSAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLmQtc2V0Jyk7XG4gICAgJGVscy5yZW1vdmVDbGFzcygnY3VycmVudCcpO1xuICAgICRlbHMuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICAgaWYgKG9iai5kYXRhc2V0ID09PSAkKGVsKS5hdHRyKCdkYXRhLWRzZXQtdGl0bGUnKSkge1xuICAgICAgICAgICAgJChlbCkuYWRkQ2xhc3MoJ2N1cnJlbnQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZigkKGVsKS5oYXNDbGFzcygnZC1zZXQtYnJlZWRpbmcnKSkge1xuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnY3VycmVudCcpO1xuICAgICAgICB9XG5cbiAgICB9KTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVLZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleUVscyA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcua2V5LWNvbnRhaW5lcicpO1xuICAgICQoa2V5RWxzKS5yZW1vdmVDbGFzcygnYWN0aXZlIGR3ZGVuc2l0eSBkYmRlbnNpdHknKTtcbiAgICBpZiAodGhpcy5kYXRhc2V0ID09PSAnZHdkZW5zaXR5JyB8fCB0aGlzLmRhdGFzZXQgPT09ICdkYmRlbnNpdHknKSB7XG4gICAgICAgICQoa2V5RWxzWzFdKS5hZGRDbGFzcygnYWN0aXZlICcgKyB0aGlzLmRhdGFzZXQpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgICQoa2V5RWxzWzBdKS5hZGRDbGFzcygnYWN0aXZlJyk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudG9nZ2xlRGF0YUxheWVyID0gZnVuY3Rpb24oJGVsKSB7XG4gICAgJGVsLmlzKFwiOmNoZWNrZWRcIikgPyAkKCcjJyArIHRoaXMuY29udGV4dCkucmVtb3ZlQ2xhc3MoJ2RhdGEtb2ZmJykgOiAkKCcjJyArIHRoaXMuY29udGV4dCkuYWRkQ2xhc3MoJ2RhdGEtb2ZmJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwTW9kdWxlOyIsInZhciBvdmVybGF5ID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgZnVuY3Rpb24gc2hvdyhsYXllciwgJGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciAkbGF5ZXIgPSAkKCcuJyArIGxheWVyKTtcbiAgICAgICAgJGNvbnRleHQuZmluZCgkbGF5ZXIpLmFkZENsYXNzKCdvbicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpZGUobGF5ZXIsICRjb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgJGxheWVyID0gJCgnLicgKyBsYXllcik7XG4gICAgICAgICRjb250ZXh0LmZpbmQoJGxheWVyKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2hvdzogc2hvdyxcbiAgICAgICAgaGlkZTogaGlkZVxuICAgIH07XG59KGpRdWVyeSkpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlcmxheTsiXX0=
