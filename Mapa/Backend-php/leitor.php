<?php 

    // Esse código lê o arquivo txt e transforma em json, essa duas linhas de header tem o objetivo de permitir que o svelte possa se comunicar com o php

    header('Access-Control-Allow-Origin: *');
    header('Content-Type: text/json');
    $leitor = file('ranking.txt');
    echo json_encode($leitor);

?>