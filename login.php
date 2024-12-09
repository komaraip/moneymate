<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MoneyMate - Login</title>
    <link rel="stylesheet" href="assets/css/login.css">
</head>
<body>
    <div class="logo">
        <a href="index.php" class="logo">
            <img src="assets/image/logo.png" alt="Logo">
        </a>
    </div>
    
    
    <div class="container">
        <div class="box">
            <h2>Log in</h2>
            <form action="assets/php/check.php" method="post">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <div class="button">
                    <button type="submit" name="login">
                        LOG IN
                    </button> 
                </div>
                
            </form>

            <div class="register-link">
                <p>Don't have an account yet? <a href="register.php">Register</a></p>
            </div>
        </div>
        
    </div>
</body>
</html>
