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








