<?php
  require 'config.php';
  $tetrad = $_POST['tetradId'];
  $tetrad = stripslashes($tetrad);

  $dataset = $_POST['data-set'];
  $dataset = stripslashes($dataset);

  try {
    $conn = new PDO('mysql:host=localhost;dbname=devonbirdatlas', $config['DB_USERNAME'], $config['DB_PASSWORD']);

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare('SELECT Species,Code FROM ' . $dataset . ' WHERE Tetrad =:tetrad');
    // $stmt = $conn->prepare('SELECT Tetrad,Code FROM ' . $dataset . ' WHERE Species =:species');

    $stmt->execute(array(
      'tetrad' => $tetrad
    ));

    $results=$stmt->fetchAll(PDO::FETCH_ASSOC);
    print json_encode($results);

  } catch(PDOException $e) {
  echo 'ERROR: ' . $e->getMessage();
  }


  die();


?>