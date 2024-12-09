<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="assets/css/home.css" />
  <title>MoneyMate - Home</title>
</head>
<body>
  <div class="gradien-r">
    <img src="assets/image/right.png" alt="">
  </div>

  <header class="header">
    <nav class="navbar">
        <h2 class="logo">
            <a href="/moneymate">
              <img src="assets/image/logo.png" alt="">
            </a>
        </h2>

        <div class="buttons">
          <a href="login.php" class="signup">LOGIN</a>
        </div>
    </nav>
  </header>

  <section class="hero-section">
      <div class="hero">
        <h2>Save More, Spend Less, Live Better.</h2>
        <p>
          Track your savings and spendings, customize your own personal allowance, set your financial future towards the bright path with MoneyMate.
        </p>

        <div class="buttons">
          <a href="register.php" class="learn">REGISTER</a>
        </div>
      </div>

      <div class="poster">
        <img src="assets/image/card.png" alt="hero image" />
      </div>
  </section>

  <section class="boxs">
    <div class="cards">
      <div class="card">
        <img src="assets/image/bca.png" alt="" />
      </div>

      <div class="card">
        <img src="assets/image/bri.png" alt="" />
      </div>

      <div class="card">
        <img src="assets/image/mandiri.png" alt="" />
      </div>

      <div class="card">
        <img src="assets/image/bsi.png" alt="" />
      </div>

      <div class="card">
        <img src="assets/image/gopay.png" alt="" />
      </div>
    </div>
  </section>

  <section class="footer">
    <div class="main-content">
      <div class="left box">
        <h2>About us</h2>

        <div class="content">
          <p>MoneyMate is a web application for tracking your savings and spendings, customize your own personal allowance, and set your financial future towards the bright path.</p>
          
          <div class="social">
            <a href="#"><span class="fab fa-facebook-f"></span></a>
            <a href="#"><span class="fab fa-twitter"></span></a>
            <a href="#"><span class="fab fa-instagram"></span></a>
            <a href="#"><span class="fab fa-youtube"></span></a>
          </div>
        </div>
      </div>

      <div class="center box">
        <h2>Address</h2>

        <div class="content">
          <div class="place">
            <span class="fas fa-map-marker-alt"></span>
            <span class="text">Jakarta, Indonesia</span>
          </div>

          <div class="phone">
              <span class="fas fa-phone-alt"></span>
              <span class="text">+628123456789</span>
            </div>

          <div class="email">
            <span class="fas fa-envelope"></span>
            <span class="text">help@moneymate.com</span>
          </div>

        </div>
      </div>

      <div class="right box">
        <h2>Contact us</h2>

        <div class="content">
          <form action="#">
            <div class="email">
              <div class="text">Email</div>
              <input type="email" required>
            </div>

            <div class="msg">
              <div class="text">Message</div>
                <textarea rows="2" cols="25" required></textarea>
              </div>
              <div class="btn">
                <button type="submit">Send</button>
              </div>
          </form>
        </div>
      </div>
    </div>

    <div class="bottom">
      <center>
        <span class="credit">Created By <a href="#home">Money Mate IT Developer</a> | </span>
        <span class="far fa-copyright"></span><span> 2024 All rights reserved.</span>
      </center>
    </div>
  </footer>
  </section>
</body>
</html>