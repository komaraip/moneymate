<?php
    $server = 'localhost';
    $username = 'komarai1_admin';
    $password = '@Ipanjay321@';
    $database = 'komarai1_moneymate';

    if(isset($_POST)){
        $conn = new mysqli($server, $username, $password, $database);
    }
        
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } else {
        // echo 'Server Connected Successfully';
    }
?>