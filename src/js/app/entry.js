// var foo = require('./modules/foo');
// foo("It's working again..");
var testSelect = require('./modules/test-select');

var container = document.getElementById('app');
var results = [
    {
         "tetId" : "tet_528",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_562",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_439",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_263",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_950",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_1142",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_1171",
         "tetClass" : "className"
    },
    {
         "tetId" : "tet_1037",
         "tetClass" : "className" 
    },
    {
         "tetId" : "tet_2483",
         "tetClass" : "className" 
    }
];

var tetrads = ["E", "J", "P", "U", "Z", "D", "I", "N", "T", "Y", "C", "H", "M", "S", "X", "B", "G", "L", "R", "W", "A", "F", "K", "Q", "V"];


// if (container) {
//     function createTetrad(count) {
//         var tet = document.createElement("div");
//         tet.setAttribute('id', "tet_" + count);
//         tet.setAttribute('class', "tet");
//         container.appendChild(tet);
//         return count;
//     }

//     for (var i = 0; i < 2500; i++) {
//         createTetrad(i);
//     }
// }

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



// $('#app').on('click', '.tet', function(e){
//     results.forEach(function(item){
//         for(key in item) {
//             if (item.hasOwnProperty(key)) {
//                 if (key === "tetId") {
//                     $('#app').find('#' + item["tetId"])
//                                 .addClass(item["tetClass"]);
//                 }
//             }
//         }
//     });
// });




