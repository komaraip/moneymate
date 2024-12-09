<?php
session_start();
require '../assets/php/connect.php'; // Pastikan file connect.php sudah termasuk koneksi ke database

// Ambil userID dari session setelah login
$userID = $_SESSION['id'];

$query = "SELECT category, SUM(balance) AS total_balance
          FROM trans
          WHERE userID = ?
          GROUP BY category";

// Persiapkan statement SQL
$stmt = $conn->prepare($query);

if ($stmt) {
    // Bind parameter dan eksekusi statement
    $stmt->bind_param("i", $userID);
    $stmt->execute();

    // Ambil hasil query
    $result = $stmt->get_result();

    // Close statement
    $stmt->close();
} else {
    echo "Error: Failed to prepare SQL statement.";
}
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>Transaction Summary by Category</title>
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }

        .btn {
            display: flex;
            justify-content: center;
            margin: 20px;
            text-decoration: none;
        }
    </style>
</head>
<body>
<div class="container">
    <h2>Transaction Summary by Category</h2>
    <table>
        <tr>
            <th>Category</th>
            <th>Total Balance</th>
        </tr>

        <?php while ($row = $result->fetch_assoc()) { ?>
            <tr>
                <td><?php echo htmlspecialchars($row["category"]); ?></td>
                <td><?php echo htmlspecialchars($row["total_balance"]); ?></td>
            </tr>
        <?php } ?>
    </table>

    <a href="financial.php" class="btn">
        <button>
            Back
        </button>
    </a>
</div>
</body>
</html>

<?php
// Close connection
$conn->close();
?>
