<?php
session_start();
include_once('connect.php');

if (isset($_POST['login'])) {
    $email = $_POST['email'];
    $password = md5($_POST['password']);

    $sql = "SELECT * FROM `user` WHERE `email`='$email' AND `password`='$password'";
    $result = mysqli_query($conn, $sql);

    if (empty($_POST['email']) && empty($_POST['password'])) {
        echo "<script>alert('Please Fill Email and Password');</script>";
        exit;
    } elseif (empty($_POST['password'])) {
        echo "<script>alert('Please Fill Password');</script>";
        exit;
    } elseif (empty($_POST['email'])) {
        echo "<script>alert('Please Fill Email);</script>";
        exit;
    } else {
        if(mysqli_num_rows($result) > 0){
            $row = mysqli_fetch_array($result);
            $fullname = $row['fullname'];
            $email = $row['email'];
            $password = $row['password'];

            if($email == $email && $password == $password){
                $_SESSION['fullname'] = $fullname;
                $_SESSION['email'] = $email;
                $_SESSION['password'] = $password;
                header('location:../../member/welcome.php');
                exit;
            }
        } else {
            echo "<script>alert('Invalid Email or Password');</script>";
            exit;
        }
    }
}