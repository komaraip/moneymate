<?php
    include '../assets/php/connect.php';
    session_start();

    $sql = "SELECT * FROM user";
    $result = $conn->query($sql);
        
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $_SESSION['id'] = $row['id'];
        $_SESSION['profile'] = $row['profile'];
    } else {
        echo "Error: User not found or database error.";
    }

    $user_id = $_SESSION['id'];

    if(isset($_POST['update'])){
        $update_image = $_FILES['update_image']['name'];
        $update_image_size = $_FILES['update_image']['size'];
        $update_image_tmp_name = $_FILES['update_image']['tmp_name'];
        $update_image_folder = 'uploaded/'.$update_image;

        if(!empty($update_image)){
            if($update_image_size > 2000000){
                $message[] = 'Image is Too Large';
            } else {
                $image_update_query = mysqli_query($conn, "UPDATE `user` SET profile = '$update_image' WHERE id = '$user_id'") or die('query failed');
                if($image_update_query){
                    move_uploaded_file($update_image_tmp_name, $update_image_folder);
                }
                $message[] = 'Image Updated Successfully!';
            }
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Picture</title>
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
            <?php
                if($fetch['profile'] == ''){
                    echo '<img src="profile/default.png">';
                }else{
                    echo '<img src="uploaded/'.$fetch['profile'].'">';
                }
                if(isset($message)){
                    foreach($message as $message){
                    echo '<div class="message">'.$message.'</div>';
                    }
                }
            ?>
            <div class="flex">
                <div class="inputBox">
                    <span>Profile Picture :</span>
                    <input type="file" name="update_image" accept="image/jpg, image/jpeg, image/png" class="box">
                </div>
            </div>
            <input type="submit" value="Update" name="update" class="btn">
            <a href="account.php" class="delete-btn">Back</a>
        </form>
    </div>

</body>
</html>