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
        data: postData,
        timeout: 12000
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
        window.setTimeout(function(){
            obj.stopSpinner.call(obj, ['tetrad-meta']);
            obj.setMapErrorMsg(true, 'tetrad-request');
        }, 1000);
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
            data:  formData,
            timeout: 12000
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
            window.setTimeout(function(){
                obj.stopSpinner.call(obj, ['map','tetrad-meta']);
                obj.setMapErrorMsg(true, 'data-request');
            }, 1000);
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

MapModule.prototype.setMapErrorMsg = function(status, context) {

    var $container;

    context === "tetrad-request" ? $container = $('.tetrad-meta') : $container = $('.map-container');

    var $errorMsg = $('#' + this.context).find($container).find('.error-wrap');
    if (status) {
        $errorMsg.css('display', 'flex');
        return false;
    }
    $errorMsg.css('display', 'none');
}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyIsInNyYy9qcy9hcHAvbW9kdWxlcy9vdmVybGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTWFwTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGVzL21hcE1vZHVsZScpO1xudmFyIG92ZXJsYXkgPSByZXF1aXJlKCcuL21vZHVsZXMvb3ZlcmxheScpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gb3ZlcmxheSBjb250cm9sc1xuICAgICQoJy5vdi10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGxheWVyID0gJHRoaXMuYXR0cignbmFtZScpLFxuICAgICAgICAgICAgY29udGV4dCA9ICR0aGlzLmNsb3Nlc3QoJy5jb250YWluZXInKVxuICAgICAgICAkdGhpcy5pcyhcIjpjaGVja2VkXCIpID8gb3ZlcmxheS5zaG93KGxheWVyLCBjb250ZXh0KSA6IG92ZXJsYXkuaGlkZShsYXllciwgY29udGV4dCk7XG4gICAgfSk7XG5cblxuICAgIC8vIG1hcCBwYWdlXG4gICAgaWYgKCB0eXBlb2YgbWFwUGFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbWFwUGFnZSkge1xuXG5cbiAgICAgICAgLy8gdG9vZ2xlIGRvdWJsZSB2aWV3XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICQoJyN0ZXRyYWQtbWFwcycpO1xuICAgICAgICBmdW5jdGlvbiBkb3VibGVPbigkYnRuKSB7XG4gICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcygnZG91YmxlJyk7XG4gICAgICAgICAgICAkYnRuLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfTtcbiAgICAgICAgZnVuY3Rpb24gZG91YmxlT2ZmKCRidG4pIHtcbiAgICAgICAgICAgICR3cmFwcGVyLnJlbW92ZUNsYXNzKCdkb3VibGUnKTtcbiAgICAgICAgICAgICRidG4ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9O1xuXG4gICAgICAgICQoJyNqcy1jb21wYXJlLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICRidG4gPSAkKHRoaXMpO1xuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykgPyBkb3VibGVPZmYoJGJ0bikgOiBkb3VibGVPbigkYnRuKTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgICAgIC8vIHNldHVwIHRoZSBtYXBNb2R1bGVzXG4gICAgICAgIHZhciBtYXBzID0ge307XG4gICAgICAgIG1hcHMubTFfID0gbmV3IE1hcE1vZHVsZSgnbTFfJyk7XG4gICAgICAgIG1hcHMubTJfID0gbmV3IE1hcE1vZHVsZSgnbTJfJyk7XG5cbiAgICAgICAgLy8gc2V0IGRlZmF1bHRzXG4gICAgICAgIG1hcHMubTFfLnNldFNwZWNpZXMoJ0FscGluZSBTd2lmdCcpO1xuICAgICAgICBtYXBzLm0xXy5zZXREYXRhc2V0KCdkYnJlZWQnKTtcblxuICAgICAgICBtYXBzLm0yXy5zZXRTcGVjaWVzKCdBbHBpbmUgU3dpZnQnKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1zcGVjaWVzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBpZiAobWFwc1tjdXJyZW50TWFwXS5mZXRjaGluZ0RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldEZldGNoaW5nRGF0YSh0cnVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICdzcGVjaWVzJztcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKFsnbWFwJ10pO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRTcGVjaWVzKHRoaXMudmFsdWUudHJpbSgpKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuXG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmxvZ01vZHVsZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuY29udGFpbmVyJykub24oJ2NoYW5nZScsICcuc2VsZWN0LWRhdGEtc2V0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBpZiAobWFwc1tjdXJyZW50TWFwXS5mZXRjaGluZ0RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldEZldGNoaW5nRGF0YSh0cnVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICdkYXRhc2V0JztcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKFsnbWFwJ10pO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXREYXRhc2V0KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFRldHJhZERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcudGVuayA+IGRpdicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAgICAgaWYgKG1hcHNbY3VycmVudE1hcF0uZmV0Y2hpbmdEYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRGZXRjaGluZ0RhdGEodHJ1ZSk7XG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9ICQodGhpcykuaGFzQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgdGV0cmFkSWQgPSBldmVudC50YXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgdGV0cmFkTmFtZSA9IGV2ZW50LnRhcmdldC5pZC5zbGljZSgzLCA4KTtcblxuICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmhpZGVDdXJyZW50bHlTZWxlY3RlZFRldHJhZEluZm8odGV0cmFkSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ucmVxdWVzdCA9ICd0ZXRyYWQnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS51cGRhdGVTZWxlY3RlZFRldHJhZCh0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFRldHJhZFN0YXR1cyh0ZXRyYWROYW1lLCB0ZXRyYWRJZCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFRldHJhZERhdGEoKTtcblxuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5sb2dNb2R1bGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljaycsICcudGV0cmFkLWxpc3QgbGknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIGlmIChtYXBzW2N1cnJlbnRNYXBdLmZldGNoaW5nRGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RmV0Y2hpbmdEYXRhKHRydWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5yZXF1ZXN0ID0gJ3NwZWNpZXMnO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zdGFydFNwaW5uZXIoWydtYXAnXSk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnNldFNwZWNpZXMoJCh0aGlzKS50ZXh0KCkpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnVwZGF0ZVNwZWNpZXNTZWxlY3QoKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0ubG9nTW9kdWxlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLmRhdGEtbGF0ZXItdG9nZ2xlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS50b2dnbGVEYXRhTGF5ZXIoJHRoaXMpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgaWYgKCB0eXBlb2Ygb3ZQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBvdlBhZ2UpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMV8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJkZW5zaXR5Jyk7XG5cbiAgICAgICAgbWFwcy5tM18gPSBuZXcgTWFwTW9kdWxlKCdtM18nKTtcbiAgICAgICAgbWFwcy5tM18uc2V0RGF0YXNldCgnZHdkZW5zaXR5Jyk7XG5cbiAgICAgICAgJCgnLnNlbGVjdC1zcGVjaWVzJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBtYXBzLm0xXy5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwcy5tMV8uc3RhcnRTcGlubmVyKCk7XG5cbiAgICAgICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXModGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBtYXBzLm0yXy5zdGFydFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgbWFwcy5tM18uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHMubTNfLnN0YXJ0U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICBtYXBzLm0xXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0yXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0zXy5nZXREYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cblxuXG4iLCJmdW5jdGlvbiBNYXBNb2R1bGUoZG9tQ29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGRvbUNvbnRleHQ7XG4gICAgdGhpcy50ZXRyYWQgPSB7XG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGN1cnJlbnRMaXN0OiAnJ1xuICAgIH07XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnNldERhdGFzZXQgPSBmdW5jdGlvbihkYXRhc2V0KSB7XG4gICAgdGhpcy5kYXRhc2V0ID0gZGF0YXNldDtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuYXR0cignZGF0YS1zZXQnLCBkYXRhc2V0KTtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0U3BlY2llcyA9IGZ1bmN0aW9uKHNwZWNpZXMpIHtcbiAgICB0aGlzLnNwZWNpZXMgPSBzcGVjaWVzO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRGZXRjaGluZ0RhdGEgPSBmdW5jdGlvbihzdGF0dXMpIHtcbiAgICB0aGlzLmZldGNoaW5nRGF0YSA9IHN0YXR1cztcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRUZXRyYWRTdGF0dXMgPSBmdW5jdGlvbih0ZXRyYWRJZCwgaWQpIHtcbiAgICB0aGlzLnRldHJhZCA9IHtcbiAgICAgICAgYWN0aXZlIDogdGV0cmFkSWQsXG4gICAgICAgIGRvbUlkIDogaWRcbiAgICB9XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmFkZENsYXNzKCd0ZXRyYWQtYWN0aXZlJyk7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmxvZ01vZHVsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMpO1xufVxuXG5cblxuXG5cblxuLyogR0VUVElORyBEQVRBICovXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0VGV0cmFkRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRldHJhZC5hY3RpdmUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICB0aGlzLnN0YXJ0U3Bpbm5lcihbJ3RldHJhZC1tZXRhJ10pO1xuXG4gICAgdGhpcy50ZXRyYWQuY3VycmVudExpc3QgPSBcIlwiO1xuXG4gICAgdmFyIG9iaiA9IHRoaXM7XG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlRWxzLnN0YXJ0LmNhbGwodGhpcywgdGhpcy5jb250ZXh0KTtcblxuICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgXCJ0ZXRyYWRJZFwiIDogdGhpcy50ZXRyYWQuYWN0aXZlLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcuLi9hamF4L3RldHJhZERhdGEucGhwJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiBwb3N0RGF0YSxcbiAgICAgICAgdGltZW91dDogMTIwMDBcbiAgICB9KVxuICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBvYmoudGV0cmFkLmNvdW50cyA9IG9iai5nZXRTdW1zKGRhdGEpO1xuXG4gICAgICAgIC8vIGdldCB0aGUgbGlzdCBvZiBuYW1lc1xuICAgICAgICB2YXIgb3JnaW5hbExpc3QgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG9yZ2luYWxMaXN0LnB1c2goZGF0YVtpXVsnU3BlY2llcyddKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzb3J0IHRoZSBsaXN0IHRvIG5ldyBhcnJcbiAgICAgICAgdmFyIHNvcnRMaXN0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc29ydExpc3QucHVzaChkYXRhW2ldWydTcGVjaWVzJ10pO1xuICAgICAgICB9XG4gICAgICAgIHNvcnRMaXN0LnNvcnQoKTtcblxuICAgICAgICB2YXIgdGV0cmFkTGlzdCA9ICQoJzxvbC8+Jywge1xuICAgICAgICAgICAgJ2NsYXNzJyA6ICd0ZXRyYWQtbGlzdCdcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGxvb2t1cCB0aGUgaW5kZXggYW5kIHJldHJlaXZlIHRoZSBDb2RlIHZhbHVlXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0aGVDb2RlID0gZGF0YVtvcmdpbmFsTGlzdC5pbmRleE9mKHNvcnRMaXN0W2ldKV1bJ0NvZGUnXTtcbiAgICAgICAgICAgICQoJzxsaS8+Jywge1xuICAgICAgICAgICAgICAgIGh0bWw6IHNvcnRMaXN0W2ldLnRyaW0oKSArICc8c3BhbiBjbGFzcz1cImNvZGUtJyArIHRoZUNvZGUgKyAnXCI+PC9zcGFuPidcbiAgICAgICAgICAgIH0pLmFwcGVuZFRvKHRldHJhZExpc3QpO1xuICAgICAgICB9XG4gICAgICAgIG9iai50ZXRyYWQuY3VycmVudExpc3QgPSB0ZXRyYWRMaXN0O1xuICAgICAgICAvLyB0cnVuY2F0ZSBhcnJheXNcbiAgICAgICAgb3JnaW5hbExpc3QubGVuZ3RoID0gMDtcbiAgICAgICAgc29ydExpc3QubGVuZ3RoID0gMDtcblxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgb2JqLnN0b3BTcGlubmVyLmNhbGwob2JqLCBbJ3RldHJhZC1tZXRhJ10pO1xuICAgICAgICAgICAgb2JqLnVwZGF0ZVN0YXRlRWxzLnN0b3AuY2FsbChvYmosIG9iai5jb250ZXh0KTtcbiAgICAgICAgICAgIG9iai5zZXRGZXRjaGluZ0RhdGEoZmFsc2UpO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICB9KVxuICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImdldFRldHJhZERhdGEgLSBlcnJvclwiKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIG9iai5zdG9wU3Bpbm5lci5jYWxsKG9iaiwgWyd0ZXRyYWQtbWV0YSddKTtcbiAgICAgICAgICAgIG9iai5zZXRNYXBFcnJvck1zZyh0cnVlLCAndGV0cmFkLXJlcXVlc3QnKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfSlcbiAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdldFRldHJhZERhdGEgLSBjb21wbGV0ZVwiKTtcbiAgICB9KTtcblxufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgb2JqID0gdGhpcztcblxuICAgIHZhciBmb3JtRGF0YSA9IHtcbiAgICAgICAgXCJzcGVjaWVzXCIgOiB0aGlzLnNwZWNpZXMsXG4gICAgICAgIFwiZGF0YS1zZXRcIiA6IHRoaXMuZGF0YXNldFxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlU3RhdGVFbHMuc3RhcnQuY2FsbCh0aGlzLCBvYmouY29udGV4dCk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnLi4vYWpheC9zcGVjaWVzRGF0YS5waHAnLFxuICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6ICBmb3JtRGF0YSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDEyMDAwXG4gICAgICAgIH0pXG4gICAgICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwcmV2aW91cyByZXN1bHRzIHVzaW5nIGN1cnJlbnRUZXRyYWRBcnJcbiAgICAgICAgICAgIHZhciBwcmV2UmVzdWx0cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShvYmouY29udGV4dCArIFwiY3VycmVudFRldHJhZEFyclwiKSk7XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByZXZSZXN1bHRzKSAmJiBwcmV2UmVzdWx0cy5sZW5ndGgpICB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmV2UmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkKCcjJyArIG9iai5jb250ZXh0ICsgcHJldlJlc3VsdHNbaV0pLnJlbW92ZUNsYXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGV0QXJyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0ZXRBcnIucHVzaChkYXRhW2ldWydUZXRyYWQnXSk7XG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShvYmouY29udGV4dCArIFwiY3VycmVudFRldHJhZEFyclwiLCBKU09OLnN0cmluZ2lmeSh0ZXRBcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkZCBjbGFzc2VzIHRvIG1hdGNoaW5nIHRldHJhZHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV0QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJyMnICsgb2JqLmNvbnRleHQgKyB0ZXRBcnJbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3ByZXMgY29kZS0nICsgZGF0YVtpXVsnQ29kZSddKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyByZWZyZXNoIGFjdGl2ZSB0ZXRyYWRcbiAgICAgICAgICAgIGlmIChvYmoudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICQoJyMnICsgb2JqLnRldHJhZC5kb21JZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9iai5jb3VudHMgPSBvYmouZ2V0U3VtcyhkYXRhKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIG9iai5zdG9wU3Bpbm5lci5jYWxsKG9iaiwgWydtYXAnLCd0ZXRyYWQtbWV0YSddKTtcbiAgICAgICAgICAgICAgICBvYmoudXBkYXRlU3RhdGVFbHMuc3RvcC5jYWxsKG9iaiwgb2JqLmNvbnRleHQpO1xuICAgICAgICAgICAgICAgIG9iai5zZXRGZXRjaGluZ0RhdGEoZmFsc2UpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJnZXREYXRhIC0gZXJyb3JcIik7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIG9iai5zdG9wU3Bpbm5lci5jYWxsKG9iaiwgWydtYXAnLCd0ZXRyYWQtbWV0YSddKTtcbiAgICAgICAgICAgICAgICBvYmouc2V0TWFwRXJyb3JNc2codHJ1ZSwgJ2RhdGEtcmVxdWVzdCcpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIH0pO1xuXG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldFN1bXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHN1bUNvbmZpcm1lZCA9IDAsXG4gICAgICAgIHN1bVByb2JhYmxlID0gMCxcbiAgICAgICAgc3VtUG9zc2libGUgPSAwLFxuICAgICAgICBzdW1QcmVzZW50ID0gMDtcbiAgICBpZiAodGhpcy5kYXRhc2V0ID09PSAnZGJyZWVkJyB8fCB0aGlzLmRhdGFzZXQgPT09ICdzaXR0ZXJzJykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2ldWydDb2RlJ10gPT09ICdBJykge3N1bUNvbmZpcm1lZCsrfVxuICAgICAgICAgICAgaWYgKGRhdGFbaV1bJ0NvZGUnXSA9PT0gJ0InKSB7c3VtUHJvYmFibGUrK31cbiAgICAgICAgICAgIGlmIChkYXRhW2ldWydDb2RlJ10gPT09ICdLJykge3N1bVBvc3NpYmxlKyt9XG4gICAgICAgICAgICBpZiAoZGF0YVtpXVsnQ29kZSddID09PSAnTicpIHtzdW1QcmVzZW50Kyt9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0b3RhbDogZGF0YS5sZW5ndGggKyAxLFxuICAgICAgICBzdW1QcmVzZW50OiBzdW1QcmVzZW50LFxuICAgICAgICBzdW1Qb3NzaWJsZTogc3VtUG9zc2libGUsXG4gICAgICAgIHN1bVByb2JhYmxlOiBzdW1Qcm9iYWJsZSxcbiAgICAgICAgc3VtQ29uZmlybWVkOiBzdW1Db25maXJtZWRcbiAgICB9O1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXRMYXRpbk5hbWUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICh0eXBlb2YgbGF0aW5OYW1lcyAhPT0gJ3VuZGVmaW5lZCcgJiYgbGF0aW5OYW1lcy5sZW5ndGgpIHtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhdGluTmFtZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgZm9yKGtleSBpbiBsYXRpbk5hbWVzW2ldKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggbGF0aW5OYW1lc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT0gdGhpcy5zcGVjaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGF0aW5OYW1lc1tpXVtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblxuXG5cblxuXG5cbi8qIERPTSAqL1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnNldE1hcEVycm9yTXNnID0gZnVuY3Rpb24oc3RhdHVzLCBjb250ZXh0KSB7XG5cbiAgICB2YXIgJGNvbnRhaW5lcjtcblxuICAgIGNvbnRleHQgPT09IFwidGV0cmFkLXJlcXVlc3RcIiA/ICRjb250YWluZXIgPSAkKCcudGV0cmFkLW1ldGEnKSA6ICRjb250YWluZXIgPSAkKCcubWFwLWNvbnRhaW5lcicpO1xuXG4gICAgdmFyICRlcnJvck1zZyA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCRjb250YWluZXIpLmZpbmQoJy5lcnJvci13cmFwJyk7XG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgICAkZXJyb3JNc2cuY3NzKCdkaXNwbGF5JywgJ2ZsZXgnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkZXJyb3JNc2cuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zdGFydFNwaW5uZXIgPSBmdW5jdGlvbihlbHMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShlbHMpICYmIGVscy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlbHNbaV0gPT09ICdtYXAnKSB7XG4gICAgICAgICAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5tYXAtY29udGFpbmVyJykuYWRkQ2xhc3MoJ2xvYWRpbmctZGF0YScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsc1tpXSA9PT0gJ3RldHJhZC1tZXRhJykge1xuICAgICAgICAgICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEgJykuYWRkQ2xhc3MoJ2xvYWRpbmctZGF0YScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnN0b3BTcGlubmVyID0gZnVuY3Rpb24oZWxzKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZWxzKSAmJiBlbHMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZWxzW2ldID09PSAnbWFwJykge1xuICAgICAgICAgICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcubWFwLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbHNbaV0gPT09ICd0ZXRyYWQtbWV0YScpIHtcbiAgICAgICAgICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhICcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gZGV0ZXJtaW4gd2hhdCBjb21wb25lbnRzIG5lZWQgdXBkYXRpbmcgYW5kIHN0YXJ0L3N0b3AgdGhlIHVwZGF0ZVxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVTdGF0ZUVscyA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBzdGFydCh0aGVDb250ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3QgPT09ICdzcGVjaWVzJykge1xuICAgICAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcuc3BlY2llcy10aXRsZXMnKS5hZGRDbGFzcygndXBkYXRlJyk7XG4gICAgICAgICAgICAkKCcjJyArIHRoZUNvbnRleHQpLmZpbmQoJy5jb3VudHMnKS5hZGRDbGFzcygndXBkYXRlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1ZXN0ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLmRhdGFzZXQtdGl0bGVzJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgJCgnIycgKyB0aGVDb250ZXh0KS5maW5kKCcua2V5LWdyb3VwJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGV0cmFkLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ3RldHJhZCcpIHtcbiAgICAgICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0b3AodGhlQ29udGV4dCkge1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0ID09PSAnc3BlY2llcycpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSGVhZGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3VtcygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXRyYWRzUHJlc2VudCh0aGlzLmNvdW50cy50b3RhbCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1ZXN0ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YXNldEhlYWRpbmdzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUtleXMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3VtcygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXRyYWRzUHJlc2VudCh0aGlzLmNvdW50cy50b3RhbCk7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXRyYWQuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUZXJhZEJveCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ3RldHJhZCcpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGVyYWRCb3goKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyMnICsgdGhlQ29udGV4dCkuZmluZCgnLnN0YXRlJykucmVtb3ZlQ2xhc3MoJ3VwZGF0ZScpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCA6IHN0YXJ0LFxuICAgICAgICBzdG9wIDogc3RvcFxuICAgIH07XG59KSgpO1xuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlVGVyYWRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoZUxpc3QgPSAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1saXN0LXdyYXBwZXInKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC10aXRsZScpLmh0bWwodGhpcy50ZXRyYWQuYWN0aXZlKTtcbiAgICBpZiAodGhpcy5kYXRhc2V0ID09PSAnZGJyZWVkJyB8fCB0aGlzLmRhdGFzZXQgPT09ICdzaXR0ZXJzJykge1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1wcmVzJykuaHRtbCh0aGlzLnRldHJhZC5jb3VudHMuc3VtUHJlc2VudCk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXBvc3MnKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1Qb3NzaWJsZSk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXByb2InKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1Qcm9iYWJsZSk7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LWNvbmYnKS5odG1sKHRoaXMudGV0cmFkLmNvdW50cy5zdW1Db25maXJtZWQpO1xuICAgICAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldC1zdW1zJykuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0LXN1bXMnKS5oaWRlKCk7XG4gICAgfVxuICAgICQodGhlTGlzdCkuZW1wdHkoKTtcblxuICAgICQodGhpcy50ZXRyYWQuY3VycmVudExpc3QpLmFwcGVuZFRvKHRoZUxpc3QpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVNwZWNpZXNTZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnNwZWNpZXMpO1xuICAgIHZhciBjaG9zZW5MaXN0ID0gJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5zZWxlY3Qtc3BlY2llcycpO1xuICAgIGNob3Nlbkxpc3QudmFsKHRoaXMuc3BlY2llcyk7XG4gICAgY2hvc2VuTGlzdC50cmlnZ2VyKFwiY2hvc2VuOnVwZGF0ZWRcIik7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlVGV0cmFkc1ByZXNlbnQgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldF9wcmVzJykuaHRtbChsZW5ndGgpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVNlbGVjdGVkVGV0cmFkID0gZnVuY3Rpb24odGV0cmFkSWQpIHtcbiAgICAvLyByZXZlYWwgdGhlIGluZm8gYm94IGlmIGhpZGRlblxuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcudGV0cmFkLW1ldGEtd3JhcHBlcicpLnJlbW92ZUNsYXNzKCdoaWRlJyk7XG4gICAgdmFyICR0ZXRyYWQgPSAkKCcjJyArIHRldHJhZElkKTtcbiAgICBpZiAodGhpcy50ZXRyYWQuYWN0aXZlKSB7XG4gICAgICAgIHZhciAkcHJldlRldHJhZCA9ICQoJyMnICsgdGhpcy50ZXRyYWQuZG9tSWQpO1xuICAgICAgICAkcHJldlRldHJhZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgJHRldHJhZC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcjJyArIHRldHJhZElkKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuaGlkZUN1cnJlbnRseVNlbGVjdGVkVGV0cmFkSW5mbyA9IGZ1bmN0aW9uKHRldHJhZElkKSB7XG4gICAgdmFyICR0ZXRyYWQgPSAkKCcjJyArIHRldHJhZElkKTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLnRldHJhZC1tZXRhLXdyYXBwZXInKS5hZGRDbGFzcygnaGlkZScpO1xuICAgICR0ZXRyYWQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLnJlbW92ZUNsYXNzKCd0ZXRyYWQtYWN0aXZlJyk7XG4gICAgdGhpcy50ZXRyYWQuYWN0aXZlID0gZmFsc2U7XG4gICAgY29uc29sZS5sb2codGhpcyk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlU3VtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdW1zID0gdGhpcy5jb3VudHM7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5wcmVzLXRhcmdldCcpLmh0bWwoc3Vtcy5zdW1QcmVzZW50KTtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuZmluZCgnLmNvbmYtdGFyZ2V0JykuaHRtbChzdW1zLnN1bUNvbmZpcm1lZCk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5wcm9iLXRhcmdldCcpLmh0bWwoc3Vtcy5zdW1Qcm9iYWJsZSk7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5wb3NzLXRhcmdldCcpLmh0bWwoc3Vtcy5zdW1Qb3NzaWJsZSk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUudXBkYXRlSGVhZGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5zcGVjaWVzLXRpdGxlJykuaHRtbCh0aGlzLnNwZWNpZXMpO1xuICAgIHZhciBsYXRpbk5hbWUgPSB0aGlzLmdldExhdGluTmFtZSgpO1xuICAgIGlmIChsYXRpbk5hbWUpIHtcbiAgICAgICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5sYXRpbi1uYW1lJykuaHRtbChsYXRpbk5hbWUpO1xuICAgIH1cbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVEYXRhc2V0SGVhZGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2JqID0gdGhpcztcbiAgICB2YXIgJGVscyA9ICQoJyMnICsgdGhpcy5jb250ZXh0KS5maW5kKCcuZC1zZXQnKTtcbiAgICAkZWxzLnJlbW92ZUNsYXNzKCdjdXJyZW50Jyk7XG4gICAgJGVscy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICBpZiAob2JqLmRhdGFzZXQgPT09ICQoZWwpLmF0dHIoJ2RhdGEtZHNldC10aXRsZScpKSB7XG4gICAgICAgICAgICAkKGVsKS5hZGRDbGFzcygnY3VycmVudCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKCQoZWwpLmhhc0NsYXNzKCdkLXNldC1icmVlZGluZycpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZUtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5RWxzID0gJCgnIycgKyB0aGlzLmNvbnRleHQpLmZpbmQoJy5rZXktY29udGFpbmVyJyk7XG4gICAgJChrZXlFbHMpLnJlbW92ZUNsYXNzKCdhY3RpdmUgZHdkZW5zaXR5IGRiZGVuc2l0eScpO1xuICAgIGlmICh0aGlzLmRhdGFzZXQgPT09ICdkd2RlbnNpdHknIHx8IHRoaXMuZGF0YXNldCA9PT0gJ2RiZGVuc2l0eScpIHtcbiAgICAgICAgJChrZXlFbHNbMV0pLmFkZENsYXNzKCdhY3RpdmUgJyArIHRoaXMuZGF0YXNldCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgJChrZXlFbHNbMF0pLmFkZENsYXNzKCdhY3RpdmUnKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS50b2dnbGVEYXRhTGF5ZXIgPSBmdW5jdGlvbigkZWwpIHtcbiAgICAkZWwuaXMoXCI6Y2hlY2tlZFwiKSA/ICQoJyMnICsgdGhpcy5jb250ZXh0KS5yZW1vdmVDbGFzcygnZGF0YS1vZmYnKSA6ICQoJyMnICsgdGhpcy5jb250ZXh0KS5hZGRDbGFzcygnZGF0YS1vZmYnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBNb2R1bGU7IiwidmFyIG92ZXJsYXkgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICBmdW5jdGlvbiBzaG93KGxheWVyLCAkY29udGV4dCkge1xuICAgICAgICAgICAgdmFyICRsYXllciA9ICQoJy4nICsgbGF5ZXIpO1xuICAgICAgICAkY29udGV4dC5maW5kKCRsYXllcikuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGlkZShsYXllciwgJGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciAkbGF5ZXIgPSAkKCcuJyArIGxheWVyKTtcbiAgICAgICAgJGNvbnRleHQuZmluZCgkbGF5ZXIpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzaG93OiBzaG93LFxuICAgICAgICBoaWRlOiBoaWRlXG4gICAgfTtcbn0oalF1ZXJ5KSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVybGF5OyJdfQ==
