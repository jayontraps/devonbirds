module.exports = function overlay() {

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

};

