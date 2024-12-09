<?php
session_start();
require '../assets/php/connect.php'; // Pastikan file connect.php sudah termasuk koneksi ke database

if (isset($_POST["submit"])) {
    $transaction = $_POST["transaction"];
    $date = $_POST["date"];
    $time = $_POST["time"];
    $balance = $_POST["balance"];
    $category = $_POST["category"];

    // Mendapatkan id dari session (misalnya id dari tabel user)
    if (isset($_SESSION['id'])) {
        $userID = $_SESSION['id'];

        // Query SQL menggunakan prepared statement
        $query = "INSERT INTO `trans` (`transaction`, `date`, `time`, `balance`, `category`, `userID`)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);

        if ($stmt) {
            $stmt->bind_param("sssssi", $transaction, $date, $time, $balance, $category, $userID);

            if ($stmt->execute()) {
                echo "<script>alert('Successfully Added'); document.location.href = 'financial.php';</script>";
            } else {
                echo "<script>alert('Failed to Add Data');</script>";
            }

            $stmt->close();
        } else {
            echo "<script>alert('Failed to prepare SQL statement');</script>";
        }
    } else {
        echo "<script>alert('User ID not found. Please login again.');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>Upload Transactions</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
        }
        .container {
            width: 50%;
            margin: auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .container h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input[type=text],
        .form-group input[type=date],
        .form-group input[type=time],
        .form-group input[type=number] {
            width: calc(100% - 10px);
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }
        .form-group input[type=submit] {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            border-radius: 4px;
            cursor: pointer;
        }
        .form-group input[type=submit]:hover {
            background-color: #45a049;
        }
        .form-group select {
            width: calc(100% - 10px);
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
<div class="container">
    <h2>Upload Transactions</h2>
    <form method="post" autocomplete="off" enctype="multipart/form-data">
        <div class="form-group">
            <label for="transaction">Transaction:</label>
            <input type="text" name="transaction" id="transaction" required>
        </div>

        <div class="form-group">
            <label for="date">Date:</label>
            <input type="date" name="date" id="date" required>
        </div>

        <div class="form-group">
            <label for="time">Time:</label>
            <input type="time" name="time" id="time" required>
        </div>

        <div class="form-group">
            <label for="balance">Balance:</label>
            <input type="number" name="balance" id="balance" required>
        </div>

        <div class="form-group">
            <label for="category">Category:</label>
            <select id="category" name="category" required>
                <option value="-">-</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Fashion">Fashion</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bill">Bill</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div class="form-group">
            <input type="submit" name="submit" value="Submit">
        </div>
    </form>
</div>
</body>
</html>
