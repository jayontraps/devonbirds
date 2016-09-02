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



