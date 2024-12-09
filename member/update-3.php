<?php
   include '../assets/php/connect.php';
   session_start();

   $sql = "SELECT * FROM user";
	$result = $conn->query($sql);
	
	if ($result && $result->num_rows > 0) {
		$row = $result->fetch_assoc();
      $_SESSION['id'] = $row['id'];
		$_SESSION['balance'] = $row['balance'];
		$_SESSION['cardnumber'] = $row['cardnumber'];
		$_SESSION['card'] = $row['card'];
		$_SESSION['currency'] = $row['currency'];
	} else {
		echo "Error: User not found or database error.";
	}

   $user_id = $_SESSION['id'];

   if(isset($_POST['update'])){

      $update_card = mysqli_real_escape_string($conn, $_POST['update_card']);
      $update_cardnumber = mysqli_real_escape_string($conn, $_POST['update_cardnumber']);
      $update_balance = mysqli_real_escape_string($conn, $_POST['update_balance']);
      $update_currency = mysqli_real_escape_string($conn, $_POST['update_currency']);

      mysqli_query($conn, "UPDATE `user` SET `card` = '$update_card', `cardnumber` = '$update_cardnumber', `balance` = '$update_balance', `currency` = '$update_currency' WHERE id = '$user_id'") or die('Query failed');

   }
?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Update Finance Details</title>
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
            <span>Card :</span>
            <input type="text" name="update_card" value="<?php echo $fetch['card']; ?>" class="box">

            <span>Card Number :</span>
            <input type="number" name="update_cardnumber" value="<?php echo $fetch['cardnumber']; ?>" class="box">

            <span>Balance :</span>
            <input type="number" name="update_balance" value="<?php echo $fetch['balance']; ?>" class="box">

            <span>Currency :</span>
            <input type="text" name="update_currency" value="<?php echo $fetch['currency']; ?>" class="box">
         </div>
      </div>

      <input type="submit" value="Update" name="update" class="btn">

      <a href="account.php" class="delete-btn">Back</a>
   </form>

</div>

</body>
</html>