<?php
    include '../assets/php/connect.php';
    session_start();

    $sql = "SELECT * FROM user";
	$result = $conn->query($sql);
	
	if ($result && $result->num_rows > 0) {
		$row = $result->fetch_assoc();
        $_SESSION['id'] = $row['id'];
		$_SESSION['fullname'] = $row['fullname'];
		$_SESSION['phone'] = $row['phone'];
		$_SESSION['country'] = $row['country'];
		$_SESSION['city'] = $row['city'];
        $_SESSION['address'] = $row['address'];
        $_SESSION['postalcode'] = $row['postalcode'];
	} else {
		echo "Error: User not found or database error.";
	}

    $user_id = $_SESSION['id'];

    if(isset($_POST['update'])){

        $update_name = mysqli_real_escape_string($conn, $_POST['update_fullname']);
        $update_phone = mysqli_real_escape_string($conn, $_POST['update_phone']);
        $update_country = mysqli_real_escape_string($conn, $_POST['update_country']);
        $update_city = mysqli_real_escape_string($conn, $_POST['update_city']);
        $update_address = mysqli_real_escape_string($conn, $_POST['update_address']);
        $update_postalcode = mysqli_real_escape_string($conn, $_POST['update_postalcode']);

        mysqli_query($conn, "UPDATE `user` SET `fullname` = '$update_name', `phone` = '$update_phone', `country` = '$update_country', `city` = '$update_city', `address` = '$update_address', `postalcode` = '$update_postalcode' WHERE id = '$user_id'") or die('Query failed');

    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Update Profile Details</title>
   <link rel="stylesheet" href="css/update.css">
</head>
<body>
   
<div class="update-profile">

   <?php
      $select = mysqli_query($conn, "SELECT * FROM `user` WHERE id = '$user_id'") or die('query failed');
      if(mysqli_num_rows($select) > 0){
         $fetch = mysqli_fetch_assoc($select);
      }
   ?>

   <form action="" method="post" enctype="multipart/form-data">
      <div class="flex">
         <div class="inputBox">
            <span>Fullname :</span>
            <input type="text" name="update_fullname" value="<?php echo $fetch['fullname']; ?>" class="box">

            <span>Phone :</span>
            <input type="number" name="update_phone" value="<?php echo $fetch['phone']; ?>" class="box">

            <span>Country :</span>
            <input type="text" name="update_country" value="<?php echo $fetch['country']; ?>" class="box">

            <span>City :</span>
            <input type="text" name="update_city" value="<?php echo $fetch['city']; ?>" class="box">

            <span>Address :</span>
            <input type="text" name="update_address" value="<?php echo $fetch['address']; ?>" class="box">

            <span>Postal Code :</span>
            <input type="number" name="update_postalcode" value="<?php echo $fetch['postalcode']; ?>" class="box">
         </div>
      </div>

      <input type="submit" value="Update" name="update" class="btn">

      <a href="account.php" class="delete-btn">Back</a>
   </form>

</div>

</body>
</html>