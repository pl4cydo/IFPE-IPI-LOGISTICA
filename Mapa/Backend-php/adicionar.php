<?php 
    header('Access-Control-Allow-Origin: *');
    $conn = new PDO('mysql:dbname=projeto_logistica;port=3306', 'placydo', 'placydo');

    $nome = $_POST['Nome'];
    $pontos = $_POST['pontos'];

    $conn->query("INSERT INTO ranking (Nome, pontos) value ('$nome', $pontos)");
?>