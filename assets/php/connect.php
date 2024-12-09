<?php
    $server = 'localhost';
    $username = '';
    $password = '';
    $database = 'project_moneymate';

    if(isset($_POST)){
        $conn = new mysqli($server, $username, $password, $database);
    }
        
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } else {
        // echo 'Server Connected Successfully';
    }
?>