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
            console.log(data.length);
            $('.tetrad').each(function(index, el) {
                var tet = el.id;
                for (var i = 0; i < data.length; i++) {
                    if (data[i]['Tetrad'] === tet) {
                        $(el).addClass('true');
                    }
                }
            });
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });

    });
};