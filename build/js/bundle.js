(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MapModule = require('./modules/mapModule');

// build map elements
var tetrads = ["E", "J", "P", "U", "Z", "D", "I", "N", "T", "Y", "C", "H", "M", "S", "X", "B", "G", "L", "R", "W", "A", "F", "K", "Q", "V"];

$(document).ready(function() {

    function createTetrad(id, parent) {
        var tet = document.createElement("div");
        tet.setAttribute('id', id);
        tet.setAttribute('class', "tetrad");
        parent.appendChild(tet);
    }

    $('.parent').each(function(index, el) {
        var parentId = el.id;
        for (var i = 0; i < tetrads.length; i++) {
            var tetId = parentId + tetrads[i];
            createTetrad(tetId, el);
        }
    });



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


        // dbreed and sitters toggles
        // $('.container').on('click', '.b-toggle input', function(event) {
        //     var currentMap = event.delegateTarget.id;
        //     var $this = $(this);
        //     var context = $this.closest('.container');

        //     function fireGetSittersData() {
        //         if (maps[currentMap].sittersDataIsLoaded) {
        //             $(context).removeClass('sitters-off');
        //         } else {
        //             $(context).removeClass('sitters-off');
        //             maps[currentMap].setDataset('sitters');
        //             maps[currentMap].startSpinner();
        //             maps[currentMap].getSittersData();
        //             maps[currentMap].sittersDataIsLoaded = true;
        //         }
        //     }
        //     if ($this.attr('data-dset') === 'dbreed') {
        //         $this.is(":checked") ? $(context).removeClass('dbreed-off') : $(context).addClass('dbreed-off');
        //     }
        //     if ($this.attr('data-dset') === 'sitters') {
        //         $this.is(":checked") ? fireGetSittersData() : $(context).addClass('sitters-off');
        //     }
        // });


        $('.container').on('change', '.select-species', function(event) {
            var currentMap = event.delegateTarget.id;
            maps[currentMap].request = 'species';
            // maps[currentMap].resetBreedingToggles();
            // maps[currentMap].purgeSitters();
            maps[currentMap].startSpinner();
            maps[currentMap].setSpecies(this.value);
            maps[currentMap].getData();
        });

        $('.container').on('change', '.select-data-set', function(event) {
            var currentMap = event.delegateTarget.id;
            maps[currentMap].request = 'dataset';
            // maps[currentMap].resetBreedingToggles();
            maps[currentMap].startSpinner();
            maps[currentMap].setDataset(this.value);
            maps[currentMap].getData();
        });

        $('.container').on('click', '.tenk > div', function(event) {
            var currentMap = event.delegateTarget.id;
            var tetradName = event.target.id.slice(3, 8);
            maps[currentMap].getTetradData(tetradName);
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




},{"./modules/mapModule":2}],2:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNYXBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbWFwTW9kdWxlJyk7XG5cbi8vIGJ1aWxkIG1hcCBlbGVtZW50c1xudmFyIHRldHJhZHMgPSBbXCJFXCIsIFwiSlwiLCBcIlBcIiwgXCJVXCIsIFwiWlwiLCBcIkRcIiwgXCJJXCIsIFwiTlwiLCBcIlRcIiwgXCJZXCIsIFwiQ1wiLCBcIkhcIiwgXCJNXCIsIFwiU1wiLCBcIlhcIiwgXCJCXCIsIFwiR1wiLCBcIkxcIiwgXCJSXCIsIFwiV1wiLCBcIkFcIiwgXCJGXCIsIFwiS1wiLCBcIlFcIiwgXCJWXCJdO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRldHJhZChpZCwgcGFyZW50KSB7XG4gICAgICAgIHZhciB0ZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB0ZXQuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICAgICAgdGV0LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBcInRldHJhZFwiKTtcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRldCk7XG4gICAgfVxuXG4gICAgJCgnLnBhcmVudCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgIHZhciBwYXJlbnRJZCA9IGVsLmlkO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRldHJhZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0ZXRJZCA9IHBhcmVudElkICsgdGV0cmFkc1tpXTtcbiAgICAgICAgICAgIGNyZWF0ZVRldHJhZCh0ZXRJZCwgZWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuXG4gICAgdmFyIG92ZXJsYXkgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBzaG93KGxheWVyLCAkY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciAkbGF5ZXIgPSAkKCcuJyArIGxheWVyKTtcbiAgICAgICAgICAgICRjb250ZXh0LmZpbmQoJGxheWVyKS5hZGRDbGFzcygnb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhpZGUobGF5ZXIsICRjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyICRsYXllciA9ICQoJy4nICsgbGF5ZXIpO1xuICAgICAgICAgICAgJGNvbnRleHQuZmluZCgkbGF5ZXIpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaG93OiBzaG93LFxuICAgICAgICAgICAgaGlkZTogaGlkZVxuICAgICAgICB9O1xuICAgIH0oKSk7XG5cblxuICAgICQoJy5vdi10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGxheWVyID0gJHRoaXMuYXR0cignbmFtZScpLFxuICAgICAgICAgICAgY29udGV4dCA9ICR0aGlzLmNsb3Nlc3QoJy5jb250YWluZXInKVxuICAgICAgICAkdGhpcy5pcyhcIjpjaGVja2VkXCIpID8gb3ZlcmxheS5zaG93KGxheWVyLCBjb250ZXh0KSA6IG92ZXJsYXkuaGlkZShsYXllciwgY29udGV4dCk7XG4gICAgfSk7XG5cblxuXG4gICAgLy8gbWFwIHBhZ2VcbiAgICBpZiAoIHR5cGVvZiBtYXBQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBtYXBQYWdlKSB7XG4gICAgICAgIC8vIHNldHVwIHRoZSBtYXBNb2R1bGVzXG4gICAgICAgIHZhciBtYXBzID0ge307XG4gICAgICAgIG1hcHMubTFfID0gbmV3IE1hcE1vZHVsZSgnbTFfJyk7XG4gICAgICAgIG1hcHMubTJfID0gbmV3IE1hcE1vZHVsZSgnbTJfJyk7XG5cbiAgICAgICAgLy8gc2V0IGRlZmF1bHRzXG4gICAgICAgIG1hcHMubTFfLnNldFNwZWNpZXMoJ0FscGluZSBTd2lmdCcpO1xuICAgICAgICBtYXBzLm0xXy5zZXREYXRhc2V0KCdkYnJlZWQnKTtcblxuICAgICAgICBtYXBzLm0yXy5zZXRTcGVjaWVzKCdBbHBpbmUgU3dpZnQnKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cblxuICAgICAgICAvLyBkYnJlZWQgYW5kIHNpdHRlcnMgdG9nZ2xlc1xuICAgICAgICAvLyAkKCcuY29udGFpbmVyJykub24oJ2NsaWNrJywgJy5iLXRvZ2dsZSBpbnB1dCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAvLyAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgLy8gICAgIHZhciBjb250ZXh0ID0gJHRoaXMuY2xvc2VzdCgnLmNvbnRhaW5lcicpO1xuXG4gICAgICAgIC8vICAgICBmdW5jdGlvbiBmaXJlR2V0U2l0dGVyc0RhdGEoKSB7XG4gICAgICAgIC8vICAgICAgICAgaWYgKG1hcHNbY3VycmVudE1hcF0uc2l0dGVyc0RhdGFJc0xvYWRlZCkge1xuICAgICAgICAvLyAgICAgICAgICAgICAkKGNvbnRleHQpLnJlbW92ZUNsYXNzKCdzaXR0ZXJzLW9mZicpO1xuICAgICAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgICAgICQoY29udGV4dCkucmVtb3ZlQ2xhc3MoJ3NpdHRlcnMtb2ZmJyk7XG4gICAgICAgIC8vICAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RGF0YXNldCgnc2l0dGVycycpO1xuICAgICAgICAvLyAgICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnN0YXJ0U3Bpbm5lcigpO1xuICAgICAgICAvLyAgICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLmdldFNpdHRlcnNEYXRhKCk7XG4gICAgICAgIC8vICAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2l0dGVyc0RhdGFJc0xvYWRlZCA9IHRydWU7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgICAgaWYgKCR0aGlzLmF0dHIoJ2RhdGEtZHNldCcpID09PSAnZGJyZWVkJykge1xuICAgICAgICAvLyAgICAgICAgICR0aGlzLmlzKFwiOmNoZWNrZWRcIikgPyAkKGNvbnRleHQpLnJlbW92ZUNsYXNzKCdkYnJlZWQtb2ZmJykgOiAkKGNvbnRleHQpLmFkZENsYXNzKCdkYnJlZWQtb2ZmJyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgICBpZiAoJHRoaXMuYXR0cignZGF0YS1kc2V0JykgPT09ICdzaXR0ZXJzJykge1xuICAgICAgICAvLyAgICAgICAgICR0aGlzLmlzKFwiOmNoZWNrZWRcIikgPyBmaXJlR2V0U2l0dGVyc0RhdGEoKSA6ICQoY29udGV4dCkuYWRkQ2xhc3MoJ3NpdHRlcnMtb2ZmJyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1zcGVjaWVzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnJlcXVlc3QgPSAnc3BlY2llcyc7XG4gICAgICAgICAgICAvLyBtYXBzW2N1cnJlbnRNYXBdLnJlc2V0QnJlZWRpbmdUb2dnbGVzKCk7XG4gICAgICAgICAgICAvLyBtYXBzW2N1cnJlbnRNYXBdLnB1cmdlU2l0dGVycygpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zdGFydFNwaW5uZXIoKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuY29udGFpbmVyJykub24oJ2NoYW5nZScsICcuc2VsZWN0LWRhdGEtc2V0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnJlcXVlc3QgPSAnZGF0YXNldCc7XG4gICAgICAgICAgICAvLyBtYXBzW2N1cnJlbnRNYXBdLnJlc2V0QnJlZWRpbmdUb2dnbGVzKCk7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnN0YXJ0U3Bpbm5lcigpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXREYXRhc2V0KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLnRlbmsgPiBkaXYnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIHZhciB0ZXRyYWROYW1lID0gZXZlbnQudGFyZ2V0LmlkLnNsaWNlKDMsIDgpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXRUZXRyYWREYXRhKHRldHJhZE5hbWUpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgaWYgKCB0eXBlb2Ygb3ZQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBvdlBhZ2UpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMV8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJkZW5zaXR5Jyk7XG5cbiAgICAgICAgbWFwcy5tM18gPSBuZXcgTWFwTW9kdWxlKCdtM18nKTtcbiAgICAgICAgbWFwcy5tM18uc2V0RGF0YXNldCgnZHdkZW5zaXR5Jyk7XG5cbiAgICAgICAgJCgnLnNlbGVjdC1zcGVjaWVzJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBtYXBzLm0xXy5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwcy5tMV8uc3RhcnRTcGlubmVyKCk7XG5cbiAgICAgICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXModGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBtYXBzLm0yXy5zdGFydFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgbWFwcy5tM18uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHMubTNfLnN0YXJ0U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICBtYXBzLm0xXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0yXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0zXy5nZXREYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cblxuXG4iLCJmdW5jdGlvbiBNYXBNb2R1bGUoZG9tQ29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGRvbUNvbnRleHQ7XG59O1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnN0YXJ0U3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5hZGRDbGFzcygnbG9hZGluZy1kYXRhJyk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc3RvcFNwaW5uZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmctZGF0YScpO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnNldERhdGFzZXQgPSBmdW5jdGlvbihkYXRhc2V0KSB7XG4gICAgdGhpcy5kYXRhc2V0ID0gZGF0YXNldDtcbiAgICAkKCcjJyArIHRoaXMuY29udGV4dCkuYXR0cignZGF0YS1zZXQnLCBkYXRhc2V0KTtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0U3BlY2llcyA9IGZ1bmN0aW9uKHNwZWNpZXMpIHtcbiAgICB0aGlzLnNwZWNpZXMgPSBzcGVjaWVzO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXRMYXRpbk5hbWUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICh0eXBlb2YgbGF0aW5OYW1lcyAhPT0gJ3VuZGVmaW5lZCcgJiYgbGF0aW5OYW1lcy5sZW5ndGgpIHtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhdGluTmFtZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgZm9yKGtleSBpbiBsYXRpbk5hbWVzW2ldKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggbGF0aW5OYW1lc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT0gdGhpcy5zcGVjaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGF0aW5OYW1lc1tpXVtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKiBET00gKi9cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXRUZXRyYWREYXRhID0gZnVuY3Rpb24odGV0cmFkSWQpIHtcblxuICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgXCJ0ZXRyYWRJZFwiIDogdGV0cmFkSWQsXG4gICAgICAgIFwiZGF0YS1zZXRcIiA6IHRoaXMuZGF0YXNldFxuICAgIH1cblxuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogJy4uL2FqYXgvdGV0cmFkRGF0YS5waHAnLFxuICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIGRhdGE6IHBvc3REYXRhXG4gICAgfSlcbiAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgIH0pXG4gICAgLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0VGV0cmFkRGF0YSAtIGVycm9yXCIpO1xuICAgIH0pXG4gICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJnZXRUZXRyYWREYXRhIC0gY29tcGxldGVcIik7XG4gICAgfSk7XG5cbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgb2JqID0gdGhpcztcblxuICAgIHZhciBmb3JtRGF0YSA9IHtcbiAgICAgICAgXCJzcGVjaWVzXCIgOiB0aGlzLnNwZWNpZXMsXG4gICAgICAgIFwiZGF0YS1zZXRcIiA6IHRoaXMuZGF0YXNldFxuICAgIH1cblxuICAgIHZhciB0aGVJZCA9IHRoaXMuY29udGV4dDtcblxuICAgIHRoaXMudXBkYXRlU3RhdGVFbHMuc3RhcnQuY2FsbCh0aGlzLCB0aGVJZCk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnLi4vYWpheC9zcGVjaWVzRGF0YS5waHAnLFxuICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6ICBmb3JtRGF0YVxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgcHJldmlvdXMgcmVzdWx0cyB1c2luZyBjdXJyZW50VGV0cmFkQXJyXG4gICAgICAgICAgICB2YXIgcHJldlJlc3VsdHMgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0odGhlSWQgKyBcImN1cnJlbnRUZXRyYWRBcnJcIikpO1xuXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcmV2UmVzdWx0cykgJiYgcHJldlJlc3VsdHMubGVuZ3RoKSAge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJldlJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnIycgKyB0aGVJZCArIHByZXZSZXN1bHRzW2ldKS5yZW1vdmVDbGFzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFxuICAgICAgICAgICAgdGV0QXJyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0ZXRBcnIucHVzaChkYXRhW2ldWydUZXRyYWQnXSk7XG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSh0aGVJZCArIFwiY3VycmVudFRldHJhZEFyclwiLCBKU09OLnN0cmluZ2lmeSh0ZXRBcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkZCBjbGFzc2VzIHRvIG1hdGNoaW5nIHRldHJhZHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV0QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJyMnICsgdGhlSWQgKyB0ZXRBcnJbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3ByZXMgY29kZS0nICsgZGF0YVtpXVsnQ29kZSddKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgb2JqLnN0b3BTcGlubmVyLmNhbGwob2JqKTtcbiAgICAgICAgICAgICAgICBvYmoudXBkYXRlU3RhdGVFbHMuc3RvcC5jYWxsKG9iaiwgdGhlSWQpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJnZXREYXRhIC0gZXJyb3JcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdldERhdGEgLSBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICAgIH0pO1xuXG59O1xuXG4vLyBkZXRlcm1pbiB3aGF0IGNvbXBvbmVudHMgbmVlZCB1cGRhdGluZyBhbmQgc3RhcnQvc3RvcCB0aGUgdXBkYXRlXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZVN0YXRlRWxzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGVJZCA9IHRoaXMuY29udGV4dDtcbiAgICBmdW5jdGlvbiBzdGFydCh0aGVJZCkge1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0ID09PSAnc3BlY2llcycpIHtcbiAgICAgICAgICAgICQoJyMnICsgdGhlSWQpLmZpbmQoJy5zcGVjaWVzLXRpdGxlcycpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcXVlc3QgPT09ICdkYXRhc2V0Jykge1xuICAgICAgICAgICAgJCgnIycgKyB0aGVJZCkuZmluZCgnLmRhdGFzZXQtdGl0bGVzJykuYWRkQ2xhc3MoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgJCgnIycgKyB0aGVJZCkuZmluZCgnLmtleS1ncm91cCcpLmFkZENsYXNzKCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKHRoZUlkKSB7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3QgPT09ICdzcGVjaWVzJykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVIZWFkaW5ncygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdCA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFzZXRIZWFkaW5ncygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVLZXlzKCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnIycgKyB0aGVJZCkuZmluZCgnLnN0YXRlJykucmVtb3ZlQ2xhc3MoJ3VwZGF0ZScpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCA6IHN0YXJ0LFxuICAgICAgICBzdG9wIDogc3RvcFxuICAgIH07XG59KSgpO1xuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZUhlYWRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGVJZCA9IHRoaXMuY29udGV4dDtcbiAgICAkKCcjJyArIHRoZUlkKS5maW5kKCcuc3BlY2llcy10aXRsZScpLmh0bWwodGhpcy5zcGVjaWVzKTtcbiAgICB2YXIgbGF0aW5OYW1lID0gdGhpcy5nZXRMYXRpbk5hbWUoKTtcbiAgICBpZiAobGF0aW5OYW1lKSB7XG4gICAgICAgICQoJyMnICsgdGhlSWQpLmZpbmQoJy5sYXRpbi1uYW1lJykuaHRtbChsYXRpbk5hbWUpO1xuICAgIH1cbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS51cGRhdGVEYXRhc2V0SGVhZGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2JqID0gdGhpcztcbiAgICB2YXIgdGhlSWQgPSB0aGlzLmNvbnRleHQ7XG4gICAgdmFyICRlbHMgPSAkKCcjJyArIHRoZUlkKS5maW5kKCcuZC1zZXQnKTtcbiAgICAkZWxzLnJlbW92ZUNsYXNzKCdjdXJyZW50Jyk7XG4gICAgJGVscy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICBpZiAob2JqLmRhdGFzZXQgPT09ICQoZWwpLmF0dHIoJ2RhdGEtZHNldC10aXRsZScpKSB7XG4gICAgICAgICAgICAkKGVsKS5hZGRDbGFzcygnY3VycmVudCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKCQoZWwpLmhhc0NsYXNzKCdkLXNldC1icmVlZGluZycpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLnVwZGF0ZUtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhlSWQgPSB0aGlzLmNvbnRleHQ7XG4gICAgdmFyIGtleUVscyA9ICQoJyMnICsgdGhlSWQpLmZpbmQoJy5rZXktY29udGFpbmVyJyk7XG4gICAgJChrZXlFbHMpLnJlbW92ZUNsYXNzKCdhY3RpdmUgZHdkZW5zaXR5IGRiZGVuc2l0eScpO1xuICAgIGlmICh0aGlzLmRhdGFzZXQgPT09ICdkd2RlbnNpdHknIHx8IHRoaXMuZGF0YXNldCA9PT0gJ2RiZGVuc2l0eScpIHtcbiAgICAgICAgJChrZXlFbHNbMV0pLmFkZENsYXNzKCdhY3RpdmUgJyArIHRoaXMuZGF0YXNldCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgJChrZXlFbHNbMF0pLmFkZENsYXNzKCdhY3RpdmUnKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcE1vZHVsZTsiXX0=
