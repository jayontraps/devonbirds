var testSelect = require('./modules/test-select');

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

testSelect();
