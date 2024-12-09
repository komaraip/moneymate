<?php
    session_start();
    include_once('../assets/php/connect.php');
    
    // Periksa apakah user sudah login
    if(isset($_SESSION['email'])){
        $email = $_SESSION['email'];
    
        // Ambil data user berdasarkan email dari session
        $sql = "SELECT * FROM user WHERE email = '$email'";
        $result = mysqli_query($conn, $sql);
    
        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
    
            // Proses update jika form disubmit
            if(isset($_POST['update_email'])){
                $update_email = mysqli_real_escape_string($conn, $_POST['update_email']);
    
                // Lakukan validasi jika email baru sama dengan email lama
                if($update_email == $email){
                    $message[] = 'Email is the same as the current one.';
                } else {
                    // Lakukan update email
                    mysqli_query($conn, "UPDATE `user` SET email = '$update_email' WHERE email = '$email'") or die('Query failed: ' . mysqli_error($conn));
                    $_SESSION['email'] = $update_email; // Update session email dengan email baru
                    $message[] = 'Email updated successfully!';
                }
            }
    
            // Proses update password jika form disubmit
            if(isset($_POST['update_password'])){
                $old_pass = mysqli_real_escape_string($conn, $_POST['old_pass']);
                $new_pass = mysqli_real_escape_string($conn, $_POST['new_pass']);
                $confirm_pass = mysqli_real_escape_string($conn, $_POST['confirm_pass']);
    
                // Validasi password lama sesuai dengan yang ada di database
                if(md5($old_pass) != $row['password']){
                    $message[] = 'Old password is incorrect.';
                } elseif($new_pass != $confirm_pass){
                    $message[] = 'Confirm password does not match new password.';
                } else {
                    // Lakukan update password
                    $hashed_password = md5($new_pass);
                    mysqli_query($conn, "UPDATE `user` SET password = '$hashed_password' WHERE email = '$email'") or die('Query failed: ' . mysqli_error($conn));
                    $message[] = 'Password updated successfully!';
                }
            }
        } else {
            echo "Error: User not found or database error.";
        }
        
    } else {
        // Jika belum login, arahkan ke hal
        echo "Please login first.";
    }
?>



<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Update Details</title>
   <link rel="stylesheet" href="css/update.css">
</head>
<body>
   
<div class="update-profile">
    <?php
        $select = mysqli_query($conn, "SELECT * FROM `user` WHERE email = '$email'") or die('query failed');
        if(mysqli_num_rows($select) > 0){
            $fetch = mysqli_fetch_assoc($select);
        }
    ?>

   <form action="" method="post" enctype="multipart/form-data">
      <div class="flex">
         <div class="inputBox">
            <span>New Email :</span>
            <input type="email" name="update_email" value="<?php echo $_SESSION['email']; ?>" class="box" required>
         </div>
      </div>
      
      <input type="submit" value="Update Email" name="update_email" class="btn">
      
      <div class="flex">
         <div class="inputBox">
            <span>Old Password :</span>
            <input type="password" name="old_pass" placeholder="Enter old password" class="box" required>

            <span>New Password :</span>
            <input type="password" name="new_pass" placeholder="Enter new password" class="box" required>
            
            <span>Confirm Password :</span>
            <input type="password" name="confirm_pass" placeholder="Confirm new password" class="box" required>
         </div>
      </div>
      
      <input type="submit" value="Update Password" name="update_password" class="btn">
      
      <a href="settings.php" class="delete-btn">Back</a>
   </form>
</div>

</body>
</html>