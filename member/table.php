<?php
  require 'connect.php';
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>Transaction Table</title>
    <style>
      table {
        border-collapse: collapse;
        width: 100%;
      }
      table, th, td {
        border: 1px solid black;
        padding: 10px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
    </style>
</head>
<body>
    <h2>Transaction Table</h2>
    <table class="table table-responsive-md card-table transactions-table">
      <tr>
        <th>No.</th>
        <th>Transaction</th>
        <th>Date</th>
        <th>Time</th>
        <th>Balance</th>
        <th>Category</th>
      </tr>

      <?php
        $i = 1;
        $query = "SELECT * FROM `trans` ORDER BY `tranID` ASC";
        $result = mysqli_query($conn, $query);

        while ($row = mysqli_fetch_assoc($result)) {
      ?>

      <tr>
        <td><?php echo $i++; ?></td>
        <td><?php echo $row["transaction"]; ?></td>
        <td><?php echo $row["date"]; ?></td>
        <td><?php echo $row["time"]; ?></td>
        <td><?php echo $row["balance"]; ?></td>
        <td><?php echo $row["category"]; ?></td>
      </tr>

      <?php } ?>

    </table>
</body>
</html>
