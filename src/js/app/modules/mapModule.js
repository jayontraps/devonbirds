
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


module.exports = MapModule;