<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MoneyMate - Register</title>
    <link rel="stylesheet" href="assets/css/register.css">
</head>
<body>
    <div class="logo">
        <a href="index.php">
            <img src="assets/image/logo.png" alt="Logo">
        </a>
    </div>

    <div class="container">
        <h1>Register</h1>

        <div class="regform">
            <form action="assets/php/add.php" method="post">
                <div class="form-row">
                    <div class="form-group">
                        <label for="fullname">Full Name</label>
                        <input type="text" id="fullname" name="fullname" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>

                    <div class="form-group">
                        <label for="country">Country</label>
                        <select id="country" name="country" required>
                            <option value="-">-</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Japan">Japan</option>
                            <option value="China">China</option>
                            <option value="England">England</option>
                            <option value="United States America">United States America</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="card">Card</label>
                        <select id="card" name="card" required>
                            <option value="-">-</option>
                            <option value="Bank Central Asia">Bank Central Asia</option>
                            <option value="Bank Rakyat Indonesia">Bank Rakyat Indonesia</option>
                            <option value="Bank Mandiri">Bank Mandiri</option>
                            <option value="Bank Syariah Indonesia">Bank Syariah Indonesia</option>
                            <option value="GoPay E-Wallet">GoPay E-Wallet</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="number" id="cardnumber" name="cardnumber" required>
                    </div>
                </div>

                <div class="button">
                    <button type="submit" name="register" >REGISTER</button>
                </div>
            </form>
        </div>
    
        <div class="login-link">
            <p>Already have an account? <a href="login.php">Log In</a></p>
        </div>
    </div>
</body>
</html>
