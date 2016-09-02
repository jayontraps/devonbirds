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

        // templating functions
        function updateHeadings(currentMap) {
            $('#' + currentMap).find('.species-title').html(maps[currentMap].species);
            var latinName = maps[currentMap].getLatinName();
            if (latinName) {
                $('#' + currentMap).find('.latin-name').html(latinName);
            }
        }



        $('.container').on('change', '.select-species', function(event) {
            var currentMap = event.delegateTarget.id;
            maps[currentMap].startSpinner();
            maps[currentMap].setSpecies(this.value);
            maps[currentMap].getData();
            updateHeadings(currentMap);

            // var latinName = maps[currentMap].getLatinName();
            // if (latinName) {
            //     $('#' + currentMap).find('.latin-name').html(latinName);
            // }
        });

        $('.container').on('change', '.select-data-set', function(event) {
            var currentMap = event.delegateTarget.id;
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

    $.ajax({
            url: '../ajax/speciesData.php',
            type: 'POST',
            dataType: 'json',
            data:  formData
        })
        .done(function(data) {
            // remove previous results
            var prevResults = JSON.parse(sessionStorage.getItem(theId + "currentArra"));

            if (Array.isArray(prevResults) && prevResults.length)  {
                for (var i = 0; i < prevResults.length; i++) {
                    $('#' + theId + prevResults[i]).removeClass();
                }
            }

            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem(theId + "currentArra", JSON.stringify(tetArr));
            }

            for (var i = 0; i < tetArr.length; i++) {
                    $('#' + theId + tetArr[i])
                        .addClass('pres code-' + data[i]['Code']);
            }

        })
        .done(function() {
            window.setTimeout(function(){
                obj.stopSpinner.call(obj);
            }, 1000);
        })
        .fail(function() {
            console.log("getData - error");
        })
        .always(function() {
            console.log("getData - complete");
            console.log(obj);
        });

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


module.exports = MapModule;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTWFwTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGVzL21hcE1vZHVsZScpO1xuXG4vLyBidWlsZCBtYXAgZWxlbWVudHNcbnZhciB0ZXRyYWRzID0gW1wiRVwiLCBcIkpcIiwgXCJQXCIsIFwiVVwiLCBcIlpcIiwgXCJEXCIsIFwiSVwiLCBcIk5cIiwgXCJUXCIsIFwiWVwiLCBcIkNcIiwgXCJIXCIsIFwiTVwiLCBcIlNcIiwgXCJYXCIsIFwiQlwiLCBcIkdcIiwgXCJMXCIsIFwiUlwiLCBcIldcIiwgXCJBXCIsIFwiRlwiLCBcIktcIiwgXCJRXCIsIFwiVlwiXTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVUZXRyYWQoaWQsIHBhcmVudCkge1xuICAgICAgICB2YXIgdGV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdGV0LnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgICAgIHRldC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgXCJ0ZXRyYWRcIik7XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0ZXQpO1xuICAgIH1cblxuICAgICQoJy5wYXJlbnQnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICB2YXIgcGFyZW50SWQgPSBlbC5pZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXRyYWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdGV0SWQgPSBwYXJlbnRJZCArIHRldHJhZHNbaV07XG4gICAgICAgICAgICBjcmVhdGVUZXRyYWQodGV0SWQsIGVsKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cblxuICAgIHZhciBvdmVybGF5ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gc2hvdyhsYXllciwgJGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGxheWVyID0gJCgnLicgKyBsYXllcik7XG4gICAgICAgICAgICAkY29udGV4dC5maW5kKCRsYXllcikuYWRkQ2xhc3MoJ29uJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoaWRlKGxheWVyLCAkY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciAkbGF5ZXIgPSAkKCcuJyArIGxheWVyKTtcbiAgICAgICAgICAgICRjb250ZXh0LmZpbmQoJGxheWVyKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2hvdzogc2hvdyxcbiAgICAgICAgICAgIGhpZGU6IGhpZGVcbiAgICAgICAgfTtcbiAgICB9KCkpO1xuXG5cbiAgICAkKCcub3YtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICBsYXllciA9ICR0aGlzLmF0dHIoJ25hbWUnKSxcbiAgICAgICAgICAgIGNvbnRleHQgPSAkdGhpcy5jbG9zZXN0KCcuY29udGFpbmVyJylcbiAgICAgICAgJHRoaXMuaXMoXCI6Y2hlY2tlZFwiKSA/IG92ZXJsYXkuc2hvdyhsYXllciwgY29udGV4dCkgOiBvdmVybGF5LmhpZGUobGF5ZXIsIGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgLy8gbWFwIHBhZ2VcbiAgICBpZiAoIHR5cGVvZiBtYXBQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBtYXBQYWdlKSB7XG4gICAgICAgIC8vIHNldHVwIHRoZSBtYXBNb2R1bGVzXG4gICAgICAgIHZhciBtYXBzID0ge307XG4gICAgICAgIG1hcHMubTFfID0gbmV3IE1hcE1vZHVsZSgnbTFfJyk7XG4gICAgICAgIG1hcHMubTJfID0gbmV3IE1hcE1vZHVsZSgnbTJfJyk7XG5cbiAgICAgICAgLy8gc2V0IGRlZmF1bHRzXG4gICAgICAgIG1hcHMubTFfLnNldFNwZWNpZXMoJ0FscGluZSBTd2lmdCcpO1xuICAgICAgICBtYXBzLm0xXy5zZXREYXRhc2V0KCdkYnJlZWQnKTtcblxuICAgICAgICBtYXBzLm0yXy5zZXRTcGVjaWVzKCdBbHBpbmUgU3dpZnQnKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgLy8gdGVtcGxhdGluZyBmdW5jdGlvbnNcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlSGVhZGluZ3MoY3VycmVudE1hcCkge1xuICAgICAgICAgICAgJCgnIycgKyBjdXJyZW50TWFwKS5maW5kKCcuc3BlY2llcy10aXRsZScpLmh0bWwobWFwc1tjdXJyZW50TWFwXS5zcGVjaWVzKTtcbiAgICAgICAgICAgIHZhciBsYXRpbk5hbWUgPSBtYXBzW2N1cnJlbnRNYXBdLmdldExhdGluTmFtZSgpO1xuICAgICAgICAgICAgaWYgKGxhdGluTmFtZSkge1xuICAgICAgICAgICAgICAgICQoJyMnICsgY3VycmVudE1hcCkuZmluZCgnLmxhdGluLW5hbWUnKS5odG1sKGxhdGluTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1zcGVjaWVzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgICAgICAgICBtYXBzW2N1cnJlbnRNYXBdLnN0YXJ0U3Bpbm5lcigpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG4gICAgICAgICAgICB1cGRhdGVIZWFkaW5ncyhjdXJyZW50TWFwKTtcblxuICAgICAgICAgICAgLy8gdmFyIGxhdGluTmFtZSA9IG1hcHNbY3VycmVudE1hcF0uZ2V0TGF0aW5OYW1lKCk7XG4gICAgICAgICAgICAvLyBpZiAobGF0aW5OYW1lKSB7XG4gICAgICAgICAgICAvLyAgICAgJCgnIycgKyBjdXJyZW50TWFwKS5maW5kKCcubGF0aW4tbmFtZScpLmh0bWwobGF0aW5OYW1lKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1kYXRhLXNldCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5zdGFydFNwaW5uZXIoKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uc2V0RGF0YXNldCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2snLCAnLnRlbmsgPiBkaXYnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNYXAgPSBldmVudC5kZWxlZ2F0ZVRhcmdldC5pZDtcbiAgICAgICAgICAgIHZhciB0ZXRyYWROYW1lID0gZXZlbnQudGFyZ2V0LmlkLnNsaWNlKDMsIDgpO1xuICAgICAgICAgICAgbWFwc1tjdXJyZW50TWFwXS5nZXRUZXRyYWREYXRhKHRldHJhZE5hbWUpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgaWYgKCB0eXBlb2Ygb3ZQYWdlICE9PSAndW5kZWZpbmVkJyAmJiBvdlBhZ2UpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIG1hcE1vZHVsZXNcbiAgICAgICAgdmFyIG1hcHMgPSB7fTtcbiAgICAgICAgbWFwcy5tMV8gPSBuZXcgTWFwTW9kdWxlKCdtMV8nKTtcbiAgICAgICAgbWFwcy5tMV8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbiAgICAgICAgbWFwcy5tMl8gPSBuZXcgTWFwTW9kdWxlKCdtMl8nKTtcbiAgICAgICAgbWFwcy5tMl8uc2V0RGF0YXNldCgnZGJkZW5zaXR5Jyk7XG5cbiAgICAgICAgbWFwcy5tM18gPSBuZXcgTWFwTW9kdWxlKCdtM18nKTtcbiAgICAgICAgbWFwcy5tM18uc2V0RGF0YXNldCgnZHdkZW5zaXR5Jyk7XG5cbiAgICAgICAgJCgnLnNlbGVjdC1zcGVjaWVzJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBtYXBzLm0xXy5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgbWFwcy5tMV8uc3RhcnRTcGlubmVyKCk7XG5cbiAgICAgICAgICAgIG1hcHMubTJfLnNldFNwZWNpZXModGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBtYXBzLm0yXy5zdGFydFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgbWFwcy5tM18uc2V0U3BlY2llcyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIG1hcHMubTNfLnN0YXJ0U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICBtYXBzLm0xXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0yXy5nZXREYXRhKCk7XG4gICAgICAgICAgICBtYXBzLm0zXy5nZXREYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cblxuXG4iLCJcbmZ1bmN0aW9uIE1hcE1vZHVsZShkb21Db250ZXh0KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gZG9tQ29udGV4dDtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc3RhcnRTcGlubmVyID0gZnVuY3Rpb24oKSB7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmFkZENsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zdG9wU3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5yZW1vdmVDbGFzcygnbG9hZGluZy1kYXRhJyk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0RGF0YXNldCA9IGZ1bmN0aW9uKGRhdGFzZXQpIHtcbiAgICB0aGlzLmRhdGFzZXQgPSBkYXRhc2V0O1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5hdHRyKCdkYXRhLXNldCcsIGRhdGFzZXQpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRTcGVjaWVzID0gZnVuY3Rpb24oc3BlY2llcykge1xuICAgIHRoaXMuc3BlY2llcyA9IHNwZWNpZXM7XG59O1xuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0VGV0cmFkRGF0YSA9IGZ1bmN0aW9uKHRldHJhZElkKSB7XG5cbiAgICB2YXIgcG9zdERhdGEgPSB7XG4gICAgICAgIFwidGV0cmFkSWRcIiA6IHRldHJhZElkLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcuLi9hamF4L3RldHJhZERhdGEucGhwJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiBwb3N0RGF0YVxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICB9KVxuICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImdldFRldHJhZERhdGEgLSBlcnJvclwiKTtcbiAgICB9KVxuICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0VGV0cmFkRGF0YSAtIGNvbXBsZXRlXCIpO1xuICAgIH0pO1xuXG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIG9iaiA9IHRoaXM7XG5cbiAgICB2YXIgZm9ybURhdGEgPSB7XG4gICAgICAgIFwic3BlY2llc1wiIDogdGhpcy5zcGVjaWVzLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9XG5cbiAgICB2YXIgdGhlSWQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnLi4vYWpheC9zcGVjaWVzRGF0YS5waHAnLFxuICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6ICBmb3JtRGF0YVxuICAgICAgICB9KVxuICAgICAgICAuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgcHJldmlvdXMgcmVzdWx0c1xuICAgICAgICAgICAgdmFyIHByZXZSZXN1bHRzID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKHRoZUlkICsgXCJjdXJyZW50QXJyYVwiKSk7XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByZXZSZXN1bHRzKSAmJiBwcmV2UmVzdWx0cy5sZW5ndGgpICB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmV2UmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkKCcjJyArIHRoZUlkICsgcHJldlJlc3VsdHNbaV0pLnJlbW92ZUNsYXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXRBcnIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRldEFyci5wdXNoKGRhdGFbaV1bJ1RldHJhZCddKTtcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKHRoZUlkICsgXCJjdXJyZW50QXJyYVwiLCBKU09OLnN0cmluZ2lmeSh0ZXRBcnIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXRBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnIycgKyB0aGVJZCArIHRldEFycltpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygncHJlcyBjb2RlLScgKyBkYXRhW2ldWydDb2RlJ10pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBvYmouc3RvcFNwaW5uZXIuY2FsbChvYmopO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJnZXREYXRhIC0gZXJyb3JcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImdldERhdGEgLSBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICAgIH0pO1xuXG59O1xuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0TGF0aW5OYW1lID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAodHlwZW9mIGxhdGluTmFtZXMgIT09ICd1bmRlZmluZWQnICYmIGxhdGluTmFtZXMubGVuZ3RoKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXRpbk5hbWVzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGZvcihrZXkgaW4gbGF0aW5OYW1lc1tpXSkge1xuXG4gICAgICAgICAgICAgICAgaWYoIGxhdGluTmFtZXNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09IHRoaXMuc3BlY2llcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhdGluTmFtZXNbaV1ba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBNb2R1bGU7Il19
