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
            $_SESSION['balance'] = $row['balance'];
            $_SESSION['balance_limit'] = $row['balance_limit'];
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
								Dashboard
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

									<a class="all-notification" href="#">See all notifications <i class="ti-arrow-right"></i></a>
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
						<a class="nav-link" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" method="post">
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
						<a href="logout.php" aria-expanded="false">
							<i class="flaticon-381-exit-1"></i>
							<span class="nav-text">Logout</span>
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div class="content-body">
			<div class="container-fluid">
				<div class="row invoice-card-row">
					<div class="col-xl-3 col-xxl-3 col-sm-6 ">
						<div class="card bg-warning invoice-card box-shadow-none">
							<div class="card-body d-flex">
								<div>
									<h2 class="text-white invoice-num">8,350,000</h2>
									<span class="text-white fs-18">Income this Month</span>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-xxl-3 col-sm-6">
						<div class="card bg-success invoice-card box-shadow-none">
							<div class="card-body d-flex">
								<div>
									<h2 class="text-white invoice-num">2,150,000</h2>
									<span class="text-white fs-18">Outcome this Month</span>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-xxl-3 col-sm-6">
						<div class="card bg-info invoice-card box-shadow-none">
							<div class="card-body d-flex">
								<div>
									<h2 class="text-white invoice-num">+20%</h2>
									<span class="text-white fs-18">Saving this Month</span>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-xxl-3 col-sm-6">
						<div class="card bg-secondary invoice-card box-shadow-none">
							<div class="card-body d-flex">
								<div>
									<h2 class="text-white invoice-num">625</h2>
									<span class="text-white fs-18">Total Transaction</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				

				<div class="row">
					<div class="col-xl-9 col-xxl-9">
						<div class="card box-shadow-none">
							<div class="card-body">
								<div class="row align-items-center">
									<div class="col-xl-6">
										<div class="card-bx bg-blue">
											<img class="pattern-img" src="images/pattern/pattern6.png" alt="">
											<div class="card-info text-white">
												<img src="images/pattern/circle.png" class="mb-4" alt="">
												<h2 class="text-white card-balance"><?=$_SESSION['balance'];?></h2>
												<p class="fs-16">
													<?=$_SESSION['cardnumber'];?> -
													<?=$_SESSION['card'];?></p>
												<p class="fs-16"><?=$_SESSION['currency'];?> Currency</p>
											</div>
											<a class="change-btn" href="javascript:void(0);"><i class="fa fa-caret-up up-ico"></i>Change<span class="reload-icon"><i class="fas fa-sync-alt reload active"></i></span></a>
										</div>
									</div>

									<div class="col-xl-6">
										<div class="row  mt-xl-0 mt-4">
											<div class="col-md-6">
												<h4 class="card-title">Expense Categories</h4>
								
												<ul class="card-list mt-4">
													<li><span class="bg-blue circle"></span>Restaurant<span>35%</span></li>
													<li><span class="bg-success circle"></span>Entertaiment<span>25%</span></li>
													<li><span class="bg-warning circle"></span>Fashion<span>20%</span></li>
													<li><span class="bg-light circle"></span>Others<span>20%</span></li>
												</ul>
											</div>

											<div class="col-md-6">
												<canvas id="polarChart"></canvas>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-xxl-3" >
						<div class="card box-shadow-none">
							<div class="card-body">
								<h4 class="card-title">Allowance Limit</h4>
							
								<div class="d-flex align-items-center">
									<div class="me-auto">
										<p class="fs-16 mb-0 mt-2"> Your limit <span class="text-danger"><?=$_SESSION['balance_limit'];?></span></p>
										
										<div class="progress mt-4" style="height:10px;">
											<div class="progress-bar bg-blue progress-animated" style="width: 80%; height:10px;" role="progressbar">
												<span class="sr-only">80%</span>
											</div>
										</div>
										
										<br>
										<p class="fs-16 mb-0 mt-2">You have not reached the limit for this month.</p>
										<br>
										
										<div class="card-footer border-0 pt-0">
								            <a href="account.php" class="btn btn-primary d-block btn-lg">Change</a>
							            </div>
									</div>
							
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-6 col-xxl-5">
						<div class="card box-shadow-none">
							<div class="card-header border-0 pb-0">
								<div>
									<h4 class="card-title mb-2">Spendings</h4>
								</div>
							</div>
							
							<div class="card-body">	
								<div class="progress default-progress">
                                    <div class="progress-bar bg-gradient-1 progress-animated" style="width: 35%; height:20px;" role="progressbar">
                                        <span class="sr-only">35%</span>
                                    </div>
                                </div>

								<div class="d-flex align-items-end mt-2 pb-3 justify-content-between">
									<span>Restaurant</span>
									<span class="fs-18"><span class="text-black pe-2">IDR 1,925,000</span></span>
								</div>

								<div class="progress default-progress mt-4">
                                    <div class="progress-bar bg-gradient-2 progress-animated" style="width: 25%; height:20px;" role="progressbar">
                                        <span class="sr-only">25%</span>
                                    </div>
                                </div>

								<div class="d-flex align-items-end mt-2 pb-3 justify-content-between">
									<span>Entertaiment</span>
									<span class="fs-18"><span class="text-black pe-2">IDR 1,375,000</span></span>
								</div>

								<div class="progress default-progress mt-4">
                                    <div class="progress-bar bg-gradient-3 progress-animated" style="width: 20%; height:20px;" role="progressbar">
                                        <span class="sr-only">20%</span>
                                    </div>
                                </div>

								<div class="d-flex align-items-end mt-2 pb-3 justify-content-between">
									<span>Fashion</span>
									<span class="fs-18"><span class="text-black pe-2">IDR 1,100,000</span></span>
								</div>

								<div class="progress default-progress mt-4">
                                    <div class="progress-bar bg-gradient-4 progress-animated" style="width: 20%; height:20px;" role="progressbar">
                                        <span class="sr-only">20%</span>
                                    </div>
                                </div>

								<div class="d-flex align-items-end mt-2 justify-content-between">
									<span>Others</span>
									<span class="fs-18"><span class="text-black pe-2">IDR 1,100,000</span></span>
								</div>
							</div>

							<div class="card-footer border-0 pt-0">
								<a href="financial.php" class="btn btn-primary d-block btn-lg">View More</a>
							</div>
						</div>
					</div>				

					<div class="col-xl-6 col-xxl-7">
						<div class="card box-shadow-none">
							<div class="card-header d-block d-sm-flex border-0">
								<div class="me-3">
									<h4 class="card-title mb-2">Previous Transactions</h4>
								</div>
							</div>
							
							<div class="card-body tab-content p-0">
								<div class="tab-pane active show fade" role="tabpanel">
									<div class="table-responsive">
										<table class="table table-responsive-md card-table transactions-table">
											<tbody>
												<tr>
													<td>
														<svg class="tr-icon" width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
															<g><path d="M35.2219 19.0125C34.8937 19.6906 35.1836 20.5109 35.8617 20.8391C37.7484 21.7469 39.3453 23.1578 40.4828 24.9242C41.6476 26.7344 42.2656 28.8344 42.2656 31C42.2656 37.2125 37.2125 42.2656 31 42.2656C24.7875 42.2656 19.7344 37.2125 19.7344 31C19.7344 28.8344 20.3523 26.7344 21.5117 24.9187C22.6437 23.1523 24.2461 21.7414 26.1328 20.8336C26.8109 20.5055 27.1008 19.6906 26.7726 19.007C26.4445 18.3289 25.6297 18.0391 24.9461 18.3672C22.6 19.4937 20.6148 21.2437 19.2094 23.4422C17.7656 25.6953 17 28.3094 17 31C17 34.7406 18.4547 38.257 21.1015 40.8984C23.743 43.5453 27.2594 45 31 45C34.7406 45 38.257 43.5453 40.8984 40.8984C43.5453 38.2516 45 34.7406 45 31C45 28.3094 44.2344 25.6953 42.7851 23.4422C41.3742 21.2492 39.389 19.4937 37.0484 18.3672C36.3648 18.0445 35.55 18.3289 35.2219 19.0125Z" fill="#FF2E2E"></path><path d="M36.3211 30.2726C36.589 30.0047 36.7203 29.6547 36.7203 29.3047C36.7203 28.9547 36.589 28.6047 36.3211 28.3367L32.8812 24.8969C32.3781 24.3937 31.7109 24.1203 31.0055 24.1203C30.3 24.1203 29.6273 24.3992 29.1297 24.8969L25.6898 28.3367C25.1539 28.8726 25.1539 29.7367 25.6898 30.2726C26.2258 30.8086 27.0898 30.8086 27.6258 30.2726L29.6437 28.2547L29.6437 36.0258C29.6437 36.7804 30.2562 37.3929 31.0109 37.3929C31.7656 37.3929 32.3781 36.7804 32.3781 36.0258L32.3781 28.2492L34.3961 30.2672C34.9211 30.8031 35.7851 30.8031 36.3211 30.2726Z" fill="#FF2E2E"></path></g>
														</svg>
													</td>
													
													<td>
														<h6 class="fs-16 font-w600 mb-0"><a href="javascript:void(0);" class="text-black">Uniqlo</a></h6>
														<span class="fs-14">Transfer</span>
													</td>

													<td>
														<h6 class="fs-16 text-black font-w600 mb-0">30 May 2024</h6>
														<span class="fs-14">05:34:45 AM</span>
													</td>

													<td><span class="fs-16 text-black font-w600">250,000</span></td>
													<td><span class="text-success fs-16 font-w500 text-end d-block">Fashion</span></td>
												</tr>

												<tr>
													<td>
														<svg class="tr-icon" width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
															<g><path d="M35.2219 19.0125C34.8937 19.6906 35.1836 20.5109 35.8617 20.8391C37.7484 21.7469 39.3453 23.1578 40.4828 24.9242C41.6476 26.7344 42.2656 28.8344 42.2656 31C42.2656 37.2125 37.2125 42.2656 31 42.2656C24.7875 42.2656 19.7344 37.2125 19.7344 31C19.7344 28.8344 20.3523 26.7344 21.5117 24.9187C22.6437 23.1523 24.2461 21.7414 26.1328 20.8336C26.8109 20.5055 27.1008 19.6906 26.7726 19.007C26.4445 18.3289 25.6297 18.0391 24.9461 18.3672C22.6 19.4937 20.6148 21.2437 19.2094 23.4422C17.7656 25.6953 17 28.3094 17 31C17 34.7406 18.4547 38.257 21.1015 40.8984C23.743 43.5453 27.2594 45 31 45C34.7406 45 38.257 43.5453 40.8984 40.8984C43.5453 38.2516 45 34.7406 45 31C45 28.3094 44.2344 25.6953 42.7851 23.4422C41.3742 21.2492 39.389 19.4937 37.0484 18.3672C36.3648 18.0445 35.55 18.3289 35.2219 19.0125Z" fill="#FF2E2E"></path><path d="M36.3211 30.2726C36.589 30.0047 36.7203 29.6547 36.7203 29.3047C36.7203 28.9547 36.589 28.6047 36.3211 28.3367L32.8812 24.8969C32.3781 24.3937 31.7109 24.1203 31.0055 24.1203C30.3 24.1203 29.6273 24.3992 29.1297 24.8969L25.6898 28.3367C25.1539 28.8726 25.1539 29.7367 25.6898 30.2726C26.2258 30.8086 27.0898 30.8086 27.6258 30.2726L29.6437 28.2547L29.6437 36.0258C29.6437 36.7804 30.2562 37.3929 31.0109 37.3929C31.7656 37.3929 32.3781 36.7804 32.3781 36.0258L32.3781 28.2492L34.3961 30.2672C34.9211 30.8031 35.7851 30.8031 36.3211 30.2726Z" fill="#FF2E2E"></path></g>
														</svg>
													</td>

													<td>
														<h6 class="fs-16 font-w600 mb-0"><a href="javascript:void(0);" class="text-black">Ancol Beach</a></h6>
														<span class="fs-14">Transfer</span>
													</td>

													<td>
														<h6 class="fs-16 text-black font-w600 mb-0">26 May 2024</h6>
														<span class="fs-14">05:34:45 AM</span>
													</td>

													<td><span class="fs-16 text-black font-w600">110,000</span></td>
													<td><span class="text-danger fs-16 font-w500 text-end d-block">Entertaiment</span></td>
												</tr>

												<tr>
													<td>
														<svg class="tr-icon" width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
															<g><path d="M35.2219 19.0125C34.8937 19.6906 35.1836 20.5109 35.8617 20.8391C37.7484 21.7469 39.3453 23.1578 40.4828 24.9242C41.6476 26.7344 42.2656 28.8344 42.2656 31C42.2656 37.2125 37.2125 42.2656 31 42.2656C24.7875 42.2656 19.7344 37.2125 19.7344 31C19.7344 28.8344 20.3523 26.7344 21.5117 24.9187C22.6437 23.1523 24.2461 21.7414 26.1328 20.8336C26.8109 20.5055 27.1008 19.6906 26.7726 19.007C26.4445 18.3289 25.6297 18.0391 24.9461 18.3672C22.6 19.4937 20.6148 21.2437 19.2094 23.4422C17.7656 25.6953 17 28.3094 17 31C17 34.7406 18.4547 38.257 21.1015 40.8984C23.743 43.5453 27.2594 45 31 45C34.7406 45 38.257 43.5453 40.8984 40.8984C43.5453 38.2516 45 34.7406 45 31C45 28.3094 44.2344 25.6953 42.7851 23.4422C41.3742 21.2492 39.389 19.4937 37.0484 18.3672C36.3648 18.0445 35.55 18.3289 35.2219 19.0125Z" fill="#FF2E2E"></path><path d="M36.3211 30.2726C36.589 30.0047 36.7203 29.6547 36.7203 29.3047C36.7203 28.9547 36.589 28.6047 36.3211 28.3367L32.8812 24.8969C32.3781 24.3937 31.7109 24.1203 31.0055 24.1203C30.3 24.1203 29.6273 24.3992 29.1297 24.8969L25.6898 28.3367C25.1539 28.8726 25.1539 29.7367 25.6898 30.2726C26.2258 30.8086 27.0898 30.8086 27.6258 30.2726L29.6437 28.2547L29.6437 36.0258C29.6437 36.7804 30.2562 37.3929 31.0109 37.3929C31.7656 37.3929 32.3781 36.7804 32.3781 36.0258L32.3781 28.2492L34.3961 30.2672C34.9211 30.8031 35.7851 30.8031 36.3211 30.2726Z" fill="#FF2E2E"></path></g>
														</svg>
													</td>

													<td>
														<h6 class="fs-16 font-w600 mb-0"><a href="javascript:void(0);" class="text-black">Solaria</a></h6>
														<span class="fs-14">Transfer</span>
													</td>

													<td>
														<h6 class="fs-16 text-black font-w600 mb-0">25 May 2024</h6>
														<span class="fs-14">05:34:45 AM</span>
													</td>

													<td><span class="fs-16 text-black font-w600">200,000</span></td>
													<td><span class="text-danger fs-16 font-w500 text-end d-block">Restaurant</span></td>
												</tr>

												<tr>
													<td>
														<svg class="tr-icon" width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
															<g><path d="M35.2219 19.0125C34.8937 19.6906 35.1836 20.5109 35.8617 20.8391C37.7484 21.7469 39.3453 23.1578 40.4828 24.9242C41.6476 26.7344 42.2656 28.8344 42.2656 31C42.2656 37.2125 37.2125 42.2656 31 42.2656C24.7875 42.2656 19.7344 37.2125 19.7344 31C19.7344 28.8344 20.3523 26.7344 21.5117 24.9187C22.6437 23.1523 24.2461 21.7414 26.1328 20.8336C26.8109 20.5055 27.1008 19.6906 26.7726 19.007C26.4445 18.3289 25.6297 18.0391 24.9461 18.3672C22.6 19.4937 20.6148 21.2437 19.2094 23.4422C17.7656 25.6953 17 28.3094 17 31C17 34.7406 18.4547 38.257 21.1015 40.8984C23.743 43.5453 27.2594 45 31 45C34.7406 45 38.257 43.5453 40.8984 40.8984C43.5453 38.2516 45 34.7406 45 31C45 28.3094 44.2344 25.6953 42.7851 23.4422C41.3742 21.2492 39.389 19.4937 37.0484 18.3672C36.3648 18.0445 35.55 18.3289 35.2219 19.0125Z" fill="#FF2E2E"></path><path d="M36.3211 30.2726C36.589 30.0047 36.7203 29.6547 36.7203 29.3047C36.7203 28.9547 36.589 28.6047 36.3211 28.3367L32.8812 24.8969C32.3781 24.3937 31.7109 24.1203 31.0055 24.1203C30.3 24.1203 29.6273 24.3992 29.1297 24.8969L25.6898 28.3367C25.1539 28.8726 25.1539 29.7367 25.6898 30.2726C26.2258 30.8086 27.0898 30.8086 27.6258 30.2726L29.6437 28.2547L29.6437 36.0258C29.6437 36.7804 30.2562 37.3929 31.0109 37.3929C31.7656 37.3929 32.3781 36.7804 32.3781 36.0258L32.3781 28.2492L34.3961 30.2672C34.9211 30.8031 35.7851 30.8031 36.3211 30.2726Z" fill="#FF2E2E"></path></g>
														</svg>
													</td>

													<td>
														<h6 class="fs-16 font-w600 mb-0"><a href="javascript:void(0);" class="text-black">3Second</a></h6>
														<span class="fs-14">Transfer</span>
													</td>

													<td>
														<h6 class="fs-16 text-black font-w600 mb-0">22 May 2024</h6>
														<span class="fs-14">05:34:45 AM</span>
													</td>

													<td><span class="fs-16 text-black font-w600">325,000</span></td>
													<td><span class="text-success fs-16 font-w500 text-end d-block">Fashion</span></td>
												</tr>
												<tr>
													<td>
														<svg class="tr-icon" width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
															<g><path d="M35.2219 19.0125C34.8937 19.6906 35.1836 20.5109 35.8617 20.8391C37.7484 21.7469 39.3453 23.1578 40.4828 24.9242C41.6476 26.7344 42.2656 28.8344 42.2656 31C42.2656 37.2125 37.2125 42.2656 31 42.2656C24.7875 42.2656 19.7344 37.2125 19.7344 31C19.7344 28.8344 20.3523 26.7344 21.5117 24.9187C22.6437 23.1523 24.2461 21.7414 26.1328 20.8336C26.8109 20.5055 27.1008 19.6906 26.7726 19.007C26.4445 18.3289 25.6297 18.0391 24.9461 18.3672C22.6 19.4937 20.6148 21.2437 19.2094 23.4422C17.7656 25.6953 17 28.3094 17 31C17 34.7406 18.4547 38.257 21.1015 40.8984C23.743 43.5453 27.2594 45 31 45C34.7406 45 38.257 43.5453 40.8984 40.8984C43.5453 38.2516 45 34.7406 45 31C45 28.3094 44.2344 25.6953 42.7851 23.4422C41.3742 21.2492 39.389 19.4937 37.0484 18.3672C36.3648 18.0445 35.55 18.3289 35.2219 19.0125Z" fill="#FF2E2E"></path><path d="M36.3211 30.2726C36.589 30.0047 36.7203 29.6547 36.7203 29.3047C36.7203 28.9547 36.589 28.6047 36.3211 28.3367L32.8812 24.8969C32.3781 24.3937 31.7109 24.1203 31.0055 24.1203C30.3 24.1203 29.6273 24.3992 29.1297 24.8969L25.6898 28.3367C25.1539 28.8726 25.1539 29.7367 25.6898 30.2726C26.2258 30.8086 27.0898 30.8086 27.6258 30.2726L29.6437 28.2547L29.6437 36.0258C29.6437 36.7804 30.2562 37.3929 31.0109 37.3929C31.7656 37.3929 32.3781 36.7804 32.3781 36.0258L32.3781 28.2492L34.3961 30.2672C34.9211 30.8031 35.7851 30.8031 36.3211 30.2726Z" fill="#FF2E2E"></path></g>
														</svg>
													</td>

													<td>
														<h6 class="fs-16 font-w600 mb-0"><a href="javascript:void(0);" class="text-black">Ichiban</a></h6>
														<span class="fs-14">Transfer</span>
													</td>

													<td>
														<h6 class="fs-16 text-black font-w600 mb-0">20 May 2024</h6>
														<span class="fs-14">05:34:45 AM</span>
													</td>

													<td><span class="fs-16 text-black font-w600">120,000</span></td>
													<td><span class="text-danger fs-16 font-w500 text-end d-block">Restaurant</span></td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-12 col-xxl-12">
						<div class="card box-shadow-none">
							<div class="card-header d-flex flex-wrap border-0 pb-0">
								<div class="me-auto mb-sm-0 mb-3">
									<h4 class="card-title mb-2">Daily Transaction</h4>
								</div>
							</div>

							<div class="card-body pb-2">
								<div class="d-sm-flex d-block">
									<ul class="card-list d-flex mt-sm-0 mt-3">
										<li class="me-3"><span class="bg-success circle"></span>Income</li>
										<li><span class="bg-danger circle"></span>Outcome</li>
									</ul>
								</div>

								<div id="chartBar2" class="bar-chart"></div>
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