<?php 

    header('Access-Control-Allow-Origin: *');
    header('Content-Type: text/json');

    $dsn = 'mysql:dbname=projeto_logistica;port=3306';
    $conn = new PDO($dsn, 'arichardz', '091203Aa@0');

    // $conn->query('insert into ...');

    $result = $conn->query('select * from ranking order by pontos desc');
    $data = $result->fetchAll();

    echo json_encode($data);

?>