<!doctype html>
<html lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/main.css">
        <script>
            var mapPage = true;
        </script>
    </head>
    <body>
        <div class="header">
            <input type="checkbox" id="toggleDouble">
            <label>Toggle</label>
        </div>
        <?php include('inc/map-page.php'); ?>

        <div class="footer"></div>

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>

        <script src="js/all.min.js"></script>
        <script>
            $(document).ready(function() {
                var $wrapper = $('#tetrad-maps');
                // function addPageClass(argument) {
                //     $wrapper.addClass('double');
                // }
                // function removePageClass(argument) {
                //     $wrapper.removeClass('double');
                // }
                $('#toggleDouble').on('click', function() {
                    $(this).is(":checked") ? $wrapper.addClass('double') : $wrapper.removeClass('double');
                });
            });

        </script>

    </body>
</html>
