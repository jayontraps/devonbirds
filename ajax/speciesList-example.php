<?php
  require 'config.php';

  $dataset = $_POST['data-set'];
  $dataset = stripslashes($dataset);

  try {
    $conn = new PDO('mysql:host=localhost;dbname=devon_data', $config['DB_USERNAME'], $config['DB_PASSWORD']);

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare('SELECT DISTINCT Species FROM ' . $dataset . ' ORDER BY Species');

    $stmt->execute(array(
      'species' => $species
    ));

    $results=$stmt->fetchAll(PDO::FETCH_ASSOC);
    print json_encode($results);

  } catch(PDOException $e) {
  echo 'ERROR: ' . $e->getMessage();
  }


  die();


?>