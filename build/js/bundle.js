(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./modules/test-select":2}],2:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2VudHJ5Iiwic3JjL2pzL2FwcC9tb2R1bGVzL3Rlc3Qtc2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHRlc3RTZWxlY3QgPSByZXF1aXJlKCcuL21vZHVsZXMvdGVzdC1zZWxlY3QnKTtcblxudmFyIHRldHJhZHMgPSBbXCJFXCIsIFwiSlwiLCBcIlBcIiwgXCJVXCIsIFwiWlwiLCBcIkRcIiwgXCJJXCIsIFwiTlwiLCBcIlRcIiwgXCJZXCIsIFwiQ1wiLCBcIkhcIiwgXCJNXCIsIFwiU1wiLCBcIlhcIiwgXCJCXCIsIFwiR1wiLCBcIkxcIiwgXCJSXCIsIFwiV1wiLCBcIkFcIiwgXCJGXCIsIFwiS1wiLCBcIlFcIiwgXCJWXCJdO1xuXG5mdW5jdGlvbiBjcmVhdGVUZXRyYWQoaWQsIHBhcmVudCkge1xuICAgIHZhciB0ZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRldC5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIHRldC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgXCJ0ZXRyYWRcIik7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRldCk7XG59XG5cblxuJCgnLnBhcmVudCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgdmFyIHBhcmVudElkID0gZWwuaWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXRyYWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0ZXRJZCA9IHBhcmVudElkICsgdGV0cmFkc1tpXTtcbiAgICAgICAgY3JlYXRlVGV0cmFkKHRldElkLCBlbCk7XG4gICAgfVxufSk7XG5cbnRlc3RTZWxlY3QoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVzdFNlbGVjdCgpIHtcbiAgICAkKCcjanNfc3BlY2llcycpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMudmFsdWUpO1xuICAgICAgICB2YXIgc3BlY2llcyA9IHRoaXMudmFsdWU7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcuLi9hamF4L3Rlc3QucGhwJyxcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOiB7c3BlY2llczogc3BlY2llc30sXG4gICAgICAgIH0pXG4gICAgICAgIC5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwcmV2aW91cyByZXN1bHRzXG4gICAgICAgICAgICB2YXIgcHJldlJlc3VsdHMgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJjdXJyZW50QXJyYVwiKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2UmVzdWx0cyk7XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByZXZSZXN1bHRzKSAmJiBwcmV2UmVzdWx0cy5sZW5ndGgpICB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmV2UmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkKCcjJyArIHByZXZSZXN1bHRzW2ldKS5yZW1vdmVDbGFzcygnY29kZS1BIGNvZGUtQiBjb2RlLUsgY29kZS1OJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcbiAgICAgICAgICAgIHRldEFyciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGV0QXJyLnB1c2goZGF0YVtpXVsnVGV0cmFkJ10pO1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJjdXJyZW50QXJyYVwiLCBKU09OLnN0cmluZ2lmeSh0ZXRBcnIpKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXRBcnIpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRldEFyci5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAvLyAgICAgJCgnIycgKyB0ZXRBcnJbaV0pLmFkZENsYXNzKGRhdGFbaV1bJ0NvZGUnXSk7XG4gICAgICAgICAgICAgICAgICAgICQoJyMnICsgdGV0QXJyW2ldKS5hZGRDbGFzcygnY29kZS0nICsgZGF0YVtpXVsnQ29kZSddKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAvLyAkKCcudGV0cmFkJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICAgICAgIC8vICAgICB2YXIgdGV0ID0gZWwuaWQ7XG4gICAgICAgICAgICAvLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGlmIChkYXRhW2ldWydUZXRyYWQnXSA9PT0gdGV0KSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAkKGVsKS5hZGRDbGFzcygndHJ1ZScpO1xuICAgICAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvclwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29tcGxldGVcIik7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG59OyJdfQ==
