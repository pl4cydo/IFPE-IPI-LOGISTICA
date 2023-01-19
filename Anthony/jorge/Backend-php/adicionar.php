<?php 
    header('Access-Control-Allow-Origin: *');
    $conn = new PDO('mysql:dbname=projeto_logistica;port=3306', 'arichardz', '091203Aa@0');

    $nome = $_POST['Nome'];
    $pontos = $_POST['pontos'];

    $conn->query("INSERT INTO ranking (Nome, pontos) value ('$nome', $pontos)");
?>