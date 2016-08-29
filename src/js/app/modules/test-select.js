module.exports = function testSelect() {
    $('#js_species').on('change', function(e) {
        console.log(this.value);
        var species = this.value;
        $.ajax({
            url: '../ajax/test.php',
            type: 'POST',
            dataType: 'json',
            data: {species: species},
        })
        .done(function(data) {
            // remove previous results
            var prevResults = JSON.parse(sessionStorage.getItem("currentArra"));
            console.log(prevResults);

            if (Array.isArray(prevResults) && prevResults.length)  {
                for (var i = 0; i < prevResults.length; i++) {
                    $('#' + prevResults[i]).removeClass('code-A code-B code-K code-N');
                }
            }

            // 
            tetArr = [];
            for (var i = 0; i < data.length; i++) {
                tetArr.push(data[i]['Tetrad']);
                sessionStorage.setItem("currentArra", JSON.stringify(tetArr));
            }


            console.log(tetArr);

            for (var i = 0; i < tetArr.length; i++) {

            //     $('#' + tetArr[i]).addClass(data[i]['Code']);
                    $('#' + tetArr[i]).addClass('code-' + data[i]['Code']);
            }


            // $('.tetrad').each(function(index, el) {
            //     var tet = el.id;
            //     for (var i = 0; i < data.length; i++) {
            //         if (data[i]['Tetrad'] === tet) {
            //             $(el).addClass('true');
            //         }
            //     }
            // });
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });

    });
};