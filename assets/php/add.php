<?php
include_once('connect.php');

if(isset($_POST['register'])){
    $fullname = $_POST['fullname'];
    $email = $_POST['email'];
    $password = md5($_POST['password']);
    $country= $_POST['country'];
    $card= $_POST['card'];
    $cardnumber= $_POST['cardnumber'];

    $sql ="INSERT INTO `user`(`fullname`, `email`, `password`, `country`, `card`, `cardnumber`) VALUES ('$fullname','$email','$password','$country','$card','$cardnumber')";
    $result = mysqli_query($conn,$sql);

    if($result){ 
        header('location:../../success.php');
        echo"<script>alert('New User Register Success');</script>";   
    } else {
        die(mysqli_error($conn)) ;
    }
}