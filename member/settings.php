<?php
    session_start();
    include_once('../assets/php/connect.php');

    $email = $_SESSION['email'];

    $sql = "SELECT * FROM user WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);

    if ($stmt->execute()) {
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $_SESSION['fullname'] = $row['fullname'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['password'] = $row['password'];
            $_SESSION['balance'] = $row['balance'];
            $_SESSION['cardnumber'] = $row['cardnumber'];
            $_SESSION['card'] = $row['card'];
            $_SESSION['currency'] = $row['currency'];
            $_SESSION['profile'] = $row['profile'];
        } else {
            echo "Error: User not found or database error.";
        }
    } else {
        echo "Error: Failed to execute SQL query.";
    }

    $stmt->close();
?>

<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="vendor/jquery-nice-select/css/nice-select.css" rel="stylesheet">
	<link rel="stylesheet" href="vendor/nouislider/nouislider.min.css">
	<link href="css/universal.css" rel="stylesheet">
	<title>MoneyMate - Member Area</title>
</head>

<body>
	<div id="preloader">
		<img src="../assets/image/logo1.png" alt="">

		<div class="waviy">
			<span style="--i:1">M</span>
			<span style="--i:2">o</span>
			<span style="--i:3">n</span>
			<span style="--i:4">e</span>
			<span style="--i:5">y</span>
			<span style="--i:6">M</span>
			<span style="--i:7">a</span>
			<span style="--i:8">t</span>
			<span style="--i:9">e</span>
		</div>
	</div>

	<div id="main-wrapper">
		<div class="nav-header box-shadow-none">
			<a href="dashboard.php" class="brand-logo">
				<img class="logo-abbr" viewBox="0 0 53 53" src="../assets/image/logo1.png" alt="">
				<p class="brand-title" width="124px" height="33px" style="font-size: 20px;">Money Mate</p>
			</a>

			<div class="nav-control">
				<div class="hamburger">
					<span class="line"></span>
					<span class="line"></span>
					<span class="line"></span>
				</div>
			</div>
		</div>

		<div class="header box-shadow-none">
			<div class="header-content">
				<nav class="navbar navbar-expand">
					<div class="collapse navbar-collapse justify-content-between">
						<div class="header-left">
							<div class="dashboard_bar">
								Settings
							</div>
						</div>
						<ul class="navbar-nav header-right">
							<li class="nav-item">
								<div class="input-group search-area">
									<input type="text" class="form-control" placeholder="Search here...">
									<span class="input-group-text">
										<a href="#"><i class="flaticon-381-search-2"></i></a>
									</span>
								</div>
							</li>

							<li class="nav-item dropdown notification_dropdown">
								<a class="nav-link  ai-icon" href="javascript:void(0);" role="button"
									data-bs-toggle="dropdown">
									<svg width="28" height="28" viewBox="0 0 28 28" fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd"
											d="M12.638 4.9936V2.3C12.638 1.5824 13.2484 1 14.0006 1C14.7513 1 15.3631 1.5824 15.3631 2.3V4.9936C17.3879 5.2718 19.2805 6.1688 20.7438 7.565C22.5329 9.2719 23.5384 11.5872 23.5384 14V18.8932L24.6408 20.9966C25.1681 22.0041 25.1122 23.2001 24.4909 24.1582C23.8709 25.1163 22.774 25.7 21.5941 25.7H15.3631C15.3631 26.4176 14.7513 27 14.0006 27C13.2484 27 12.638 26.4176 12.638 25.7H6.40705C5.22571 25.7 4.12888 25.1163 3.50892 24.1582C2.88759 23.2001 2.83172 22.0041 3.36039 20.9966L4.46268 18.8932V14C4.46268 11.5872 5.46691 9.2719 7.25594 7.565C8.72068 6.1688 10.6119 5.2718 12.638 4.9936ZM14.0006 7.5C12.1924 7.5 10.4607 8.1851 9.18259 9.4045C7.90452 10.6226 7.18779 12.2762 7.18779 14V19.2C7.18779 19.4015 7.13739 19.6004 7.04337 19.7811C7.04337 19.7811 6.43703 20.9381 5.79662 22.1588C5.69171 22.3603 5.70261 22.6008 5.82661 22.7919C5.9506 22.983 6.16996 23.1 6.40705 23.1H21.5941C21.8298 23.1 22.0492 22.983 22.1732 22.7919C22.2972 22.6008 22.3081 22.3603 22.2031 22.1588C21.5627 20.9381 20.9564 19.7811 20.9564 19.7811C20.8624 19.6004 20.8133 19.4015 20.8133 19.2V14C20.8133 12.2762 20.0953 10.6226 18.8172 9.4045C17.5391 8.1851 15.8073 7.5 14.0006 7.5Z"
											fill="#fff" />
									</svg>
									<span class="badge light text-white bg-info rounded-circle">4</span>
								</a>

								<div class="dropdown-menu dropdown-menu-end">
									<div id="dlab_W_Notification1" class="widget-media dz-scroll p-3 height380">
										<ul class="timeline">
											<li>
												<div class="timeline-panel">
													<div class="media-body">
														<h6 class="mb-1">V1.2 Release</h6>
														<small class="d-block">16 April 2024 - 03:00 PM</small>
													</div>
												</div>
											</li>

											<li>
												<div class="timeline-panel">
													<div class="media-body">
														<h6 class="mb-1">New card added</h6>
														<small class="d-block">5 April 2024 - 07:12 PM</small>
													</div>
												</div>
											</li>

											<li>
												<div class="timeline-panel">
													<div class="media-body">
														<h6 class="mb-1">You have reached the limit for this month</h6>
														<small class="d-block">25 March 2024 - 11:00 AM</small>
													</div>
												</div>
											</li>

											<li>
												<div class="timeline-panel">
													<div class="media-body">
														<h6 class="mb-1">Profile picture updated</h6>
														<small class="d-block">14 March 2024 - 10:15 AM</small>
													</div>
												</div>
											</li>

											<li>
												<div class="timeline-panel">
													<div class="media-body">
														<h6 class="mb-1">New Feature - Allowance Limit</h6>
														<small class="d-block">12 February 2024 - 03:00 PM</small>
													</div>
												</div>
											</li>
										</ul>
									</div>

									<a class="all-notification" href="notification.php">See all notifications <i class="ti-arrow-right"></i></a>
								</div>

							</li>

							<li class="nav-item">
								<a href="dashboard.php" class="btn btn-primary d-sm-inline-block d-none">Member Area</a>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</div>

		<div class="dlabnav">
			<div class="dlabnav-scroll">
				<ul class="metismenu" id="menu">
					<li class="dropdown header-profile">
						<a class="nav-link" href="javascript:void(0);" role="button" data-bs-toggle="dropdown">
                     		<img src="uploaded/<?php echo $_SESSION['profile'];?>" width="20">
							<div class="header-info ms-3">
                        	<span class="font-w400" style="font-size: 13px;">
									<?=$_SESSION['fullname'];?>
									<br>
									<?=$_SESSION['email'];?>
								</span>	
							</div>
						</a>
					</li>

					<li>
						<a href="dashboard.php" aria-expanded="false">
							<i class="fa flaticon-025-dashboard"></i>
							<span class="nav-text">Dashboard</span>
						</a>
					</li>

					<li>
						<a href="financial.php" aria-expanded="false">
							<i class="flaticon-381-transfer"></i>
							<span class="nav-text">Financial</span>
						</a>
					</li>

					<li>
						<a href="account.php" aria-expanded="false">
							<i class="flaticon-381-user-8"></i>
							<span class="nav-text">Account</span>
						</a>
					</li>

					<li>
						<a href="settings.php" aria-expanded="false">
							<i class="flaticon-381-settings-5"></i>
							<span class="nav-text">Settings</span>
						</a>
					</li>

					<li>
						<a href="../logout.php" aria-expanded="false">
							<i class="flaticon-381-exit-1"></i>
							<span class="nav-text">Logout</span>
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div class="content-body">
			<div class="container-fluid">
				<div class="row">
					<div class="col-xl-12 col-xxl-6">
						<div class="card box-shadow-none">
							<div class="card-header d-flex flex-wrap border-0 pb-0">
								<div class="me-auto mb-sm-0 mb-3">
									<h4 class="card-title mb-2">Security</h4>
								</div>
							</div>

							<div class="card-body pb-2">
								<div class="d-sm-flex d-block">
									<ul class="card-list d-flex mt-sm-0 mt-3">
                           				<div class="container-kom">
											<div class="details">
												<p>Email		: <?=$_SESSION['email'];?></p>
												<p>Password		: <?=$_SESSION['password'];?></p>
											</div>

											<li class="nav-item">
												<a href="update-4.php" class="btn btn-primary d-sm-inline-block d-none">Update Details</a>
											</li>
										</div>

									</ul>
								</div>								
							</div>
						</div>
					</div>
				</div>
            </div>
        </div>

        <div class="footer">
            <div class="copyright">
                <p>Created by <a href="dashboard.php" target="_blank">Money Mate IT Developer</a> © 2024 All rights reserved.</p>
            </div>
        </div>
	</div>

    <script src="vendor/global/global.min.js"></script>
	<script src="vendor/chart.js/Chart.bundle.min.js"></script>
	<script src="vendor/jquery-nice-select/js/jquery.nice-select.min.js"></script>
	<script src="vendor/apexchart/apexchart.js"></script>
	<script src="vendor/nouislider/nouislider.min.js"></script>
	<script src="vendor/wnumb/wNumb.js"></script>
	<script src="js/dashboard/dashboard-1.js"></script>
    <script src="js/custom.min.js"></script>
	<script src="js/dlabnav-init.js"></script>
	<script src="js/demo.js"></script>
    <script src="js/styleSwitcher.js"></script>
	
</body>
</html>