<?php

    require '../ajax/db.inc.php';

    $myTetrad = $_GET['tetrad'];
    $tetresult = mysqli_query($link, "SELECT * FROM `gmap_data` WHERE `Tetrad`='$myTetrad'");
    $tetradinfo = mysqli_fetch_array($tetresult);
    $result_lat = $tetradinfo['clat'];
    $result_long = $tetradinfo['clong'];
    $res_tr_lat = $tetradinfo['trlat'];
    $res_tr_long = $tetradinfo['trlong'];
    $res_bl_lat = $tetradinfo['bllat'];
    $res_bl_long = $tetradinfo['bllong'];

?>

<!doctype html>
<html lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/main.css">
        <style type="text/css">
            #map {
                height: 100vh;
                width: 100%;
                min-height: 700px;
            }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA57gciXeunxBOJ9gkvdVqOV7g7FYRRilI"></script>
        <script>
            var gMapPage = true;
            var myvar = <?php echo json_encode($myTetrad); ?>;
            var myvar2 = <?php echo json_encode($result_lat); ?>;
            var myvar3 = <?php echo json_encode($result_long); ?>;

            var sw_lat = <?php echo json_encode($res_tr_lat); ?>;
            var sw_long = <?php echo json_encode($res_tr_long); ?>;

            var ne_lat = <?php echo json_encode($res_bl_lat); ?>;
            var ne_long = <?php echo json_encode($res_bl_long); ?>;

            function initialize() {
                //var myLatLng = new google.maps.LatLng(51.407344,-1.065041);
                var myLatLng = new google.maps.LatLng(myvar2, myvar3);
                var mapOptions = {
                zoom: 14,
                center: myLatLng,
                mapTypeId: google.maps.MapTypeId.SATELLITE
            };

            var map = new google.maps.Map(document.getElementById('map'), mapOptions);

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: myvar
            });



            var rectangle = new google.maps.Rectangle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0,
                map: map,
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(ne_lat, ne_long ),
                new google.maps.LatLng(sw_lat, sw_long ))
            });

            }

            google.maps.event.addDomListener(window, 'load', initialize);
        </script>
    </head>
    <body>
        <div id="map"></div>
      <!--   <script src="js/all.min.js"></script> -->

    </body>
</html>
