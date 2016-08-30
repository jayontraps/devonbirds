(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// var testSelect = require('./modules/test-select');
var MapModule = require('./modules/mapModule');
// build map elements
var tetrads = ["E", "J", "P", "U", "Z", "D", "I", "N", "T", "Y", "C", "H", "M", "S", "X", "B", "G", "L", "R", "W", "A", "F", "K", "Q", "V"];

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




// setup the mapModules
var maps = {};
maps.m1_ = new MapModule('m1_');
maps.m2_ = new MapModule('m2_');

// set defaults
maps.m1_.setSpecies('Red-throated Diver');
maps.m1_.setDataset('dbreed');

maps.m2_.setSpecies('Red-throated Diver');
maps.m2_.setDataset('dbreed');


$('.container').on('change', '.select-species', function(event) {
    var currentMap = event.delegateTarget.id;
    maps[currentMap].startSpinner();
    maps[currentMap].setSpecies(this.value);
    maps[currentMap].getData();
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
        console.log("error");
    })
    .always(function() {
        console.log("complete");
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
            console.log(data.length);
            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem(theId + "currentArra", JSON.stringify(tetArr));
            }

            console.log(tetArr);

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
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });

};


module.exports = MapModule;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL21hcE1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyB2YXIgdGVzdFNlbGVjdCA9IHJlcXVpcmUoJy4vbW9kdWxlcy90ZXN0LXNlbGVjdCcpO1xudmFyIE1hcE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9tYXBNb2R1bGUnKTtcbi8vIGJ1aWxkIG1hcCBlbGVtZW50c1xudmFyIHRldHJhZHMgPSBbXCJFXCIsIFwiSlwiLCBcIlBcIiwgXCJVXCIsIFwiWlwiLCBcIkRcIiwgXCJJXCIsIFwiTlwiLCBcIlRcIiwgXCJZXCIsIFwiQ1wiLCBcIkhcIiwgXCJNXCIsIFwiU1wiLCBcIlhcIiwgXCJCXCIsIFwiR1wiLCBcIkxcIiwgXCJSXCIsIFwiV1wiLCBcIkFcIiwgXCJGXCIsIFwiS1wiLCBcIlFcIiwgXCJWXCJdO1xuXG5mdW5jdGlvbiBjcmVhdGVUZXRyYWQoaWQsIHBhcmVudCkge1xuICAgIHZhciB0ZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRldC5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIHRldC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgXCJ0ZXRyYWRcIik7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRldCk7XG59XG5cbiQoJy5wYXJlbnQnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgIHZhciBwYXJlbnRJZCA9IGVsLmlkO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV0cmFkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdGV0SWQgPSBwYXJlbnRJZCArIHRldHJhZHNbaV07XG4gICAgICAgIGNyZWF0ZVRldHJhZCh0ZXRJZCwgZWwpO1xuICAgIH1cbn0pO1xuXG5cblxuXG4vLyBzZXR1cCB0aGUgbWFwTW9kdWxlc1xudmFyIG1hcHMgPSB7fTtcbm1hcHMubTFfID0gbmV3IE1hcE1vZHVsZSgnbTFfJyk7XG5tYXBzLm0yXyA9IG5ldyBNYXBNb2R1bGUoJ20yXycpO1xuXG4vLyBzZXQgZGVmYXVsdHNcbm1hcHMubTFfLnNldFNwZWNpZXMoJ1JlZC10aHJvYXRlZCBEaXZlcicpO1xubWFwcy5tMV8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cbm1hcHMubTJfLnNldFNwZWNpZXMoJ1JlZC10aHJvYXRlZCBEaXZlcicpO1xubWFwcy5tMl8uc2V0RGF0YXNldCgnZGJyZWVkJyk7XG5cblxuJCgnLmNvbnRhaW5lcicpLm9uKCdjaGFuZ2UnLCAnLnNlbGVjdC1zcGVjaWVzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgIG1hcHNbY3VycmVudE1hcF0uc3RhcnRTcGlubmVyKCk7XG4gICAgbWFwc1tjdXJyZW50TWFwXS5zZXRTcGVjaWVzKHRoaXMudmFsdWUpO1xuICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0RGF0YSgpO1xufSk7XG5cbiQoJy5jb250YWluZXInKS5vbignY2hhbmdlJywgJy5zZWxlY3QtZGF0YS1zZXQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBjdXJyZW50TWFwID0gZXZlbnQuZGVsZWdhdGVUYXJnZXQuaWQ7XG4gICAgbWFwc1tjdXJyZW50TWFwXS5zdGFydFNwaW5uZXIoKTtcbiAgICBtYXBzW2N1cnJlbnRNYXBdLnNldERhdGFzZXQodGhpcy52YWx1ZSk7XG4gICAgbWFwc1tjdXJyZW50TWFwXS5nZXREYXRhKCk7XG59KTtcblxuXG4kKCcuY29udGFpbmVyJykub24oJ2NsaWNrJywgJy50ZW5rID4gZGl2JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgY3VycmVudE1hcCA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmlkO1xuICAgIHZhciB0ZXRyYWROYW1lID0gZXZlbnQudGFyZ2V0LmlkLnNsaWNlKDMsIDgpO1xuICAgIG1hcHNbY3VycmVudE1hcF0uZ2V0VGV0cmFkRGF0YSh0ZXRyYWROYW1lKTtcbn0pOyBcblxuXG5cblxuXG5cblxuXG4iLCJcbmZ1bmN0aW9uIE1hcE1vZHVsZShkb21Db250ZXh0KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gZG9tQ29udGV4dDtcbn07XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc3RhcnRTcGlubmVyID0gZnVuY3Rpb24oKSB7XG4gICAgJCgnIycgKyB0aGlzLmNvbnRleHQpLmFkZENsYXNzKCdsb2FkaW5nLWRhdGEnKTtcbn1cblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zdG9wU3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5yZW1vdmVDbGFzcygnbG9hZGluZy1kYXRhJyk7XG59XG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuc2V0RGF0YXNldCA9IGZ1bmN0aW9uKGRhdGFzZXQpIHtcbiAgICB0aGlzLmRhdGFzZXQgPSBkYXRhc2V0O1xuICAgICQoJyMnICsgdGhpcy5jb250ZXh0KS5hdHRyKCdkYXRhLXNldCcsIGRhdGFzZXQpO1xufTtcblxuTWFwTW9kdWxlLnByb3RvdHlwZS5zZXRTcGVjaWVzID0gZnVuY3Rpb24oc3BlY2llcykge1xuICAgIHRoaXMuc3BlY2llcyA9IHNwZWNpZXM7XG59O1xuXG5cbk1hcE1vZHVsZS5wcm90b3R5cGUuZ2V0VGV0cmFkRGF0YSA9IGZ1bmN0aW9uKHRldHJhZElkKSB7XG5cbiAgICB2YXIgcG9zdERhdGEgPSB7XG4gICAgICAgIFwidGV0cmFkSWRcIiA6IHRldHJhZElkLFxuICAgICAgICBcImRhdGEtc2V0XCIgOiB0aGlzLmRhdGFzZXRcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcuLi9hamF4L3RldHJhZERhdGEucGhwJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiBwb3N0RGF0YVxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICB9KVxuICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgIH0pXG4gICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb21wbGV0ZVwiKTtcbiAgICB9KTtcblxufVxuXG5NYXBNb2R1bGUucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBvYmogPSB0aGlzO1xuXG4gICAgdmFyIGZvcm1EYXRhID0ge1xuICAgICAgICBcInNwZWNpZXNcIiA6IHRoaXMuc3BlY2llcyxcbiAgICAgICAgXCJkYXRhLXNldFwiIDogdGhpcy5kYXRhc2V0XG4gICAgfVxuXG4gICAgdmFyIHRoZUlkID0gdGhpcy5jb250ZXh0O1xuXG4gICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogJy4uL2FqYXgvc3BlY2llc0RhdGEucGhwJyxcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOiAgZm9ybURhdGFcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHByZXZpb3VzIHJlc3VsdHNcbiAgICAgICAgICAgIHZhciBwcmV2UmVzdWx0cyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSh0aGVJZCArIFwiY3VycmVudEFycmFcIikpO1xuXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcmV2UmVzdWx0cykgJiYgcHJldlJlc3VsdHMubGVuZ3RoKSAge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJldlJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnIycgKyB0aGVJZCArIHByZXZSZXN1bHRzW2ldKS5yZW1vdmVDbGFzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEubGVuZ3RoKTtcbiAgICAgICAgICAgIHRldEFyciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGV0QXJyLnB1c2goZGF0YVtpXVsnVGV0cmFkJ10pO1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0odGhlSWQgKyBcImN1cnJlbnRBcnJhXCIsIEpTT04uc3RyaW5naWZ5KHRldEFycikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXRBcnIpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRldEFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkKCcjJyArIHRoZUlkICsgdGV0QXJyW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdwcmVzIGNvZGUtJyArIGRhdGFbaV1bJ0NvZGUnXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIG9iai5zdG9wU3Bpbm5lci5jYWxsKG9iaik7XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgICAgICB9KVxuICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb21wbGV0ZVwiKTtcbiAgICAgICAgfSk7XG5cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBNb2R1bGU7Il19
