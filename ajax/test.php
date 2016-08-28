<?php
  require 'config.php';
  $id = $_POST['species'];
  $id = stripslashes($id);

  try {
    $conn = new PDO('mysql:host=localhost;dbname=devon-test', $config['DB_USERNAME'], $config['DB_PASSWORD']);

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare('SELECT Tetrad,Code FROM dbreed_clean WHERE Species =:id');

    $stmt->execute(array(
      'id' => $id
    ));

    $results=$stmt->fetchAll(PDO::FETCH_ASSOC);
    print json_encode($results);

  } catch(PDOException $e) {
  echo 'ERROR: ' . $e->getMessage();
  }


  die();


?>