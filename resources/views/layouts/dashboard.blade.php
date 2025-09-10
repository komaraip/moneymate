<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Icon CSS -->
    <link rel="stylesheet" href="{{ asset('assets/member/icons/font-awesome/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/member/icons/flaticon/flaticon.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/member/icons/themify-icons/css/themify-icons.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/member/icons/bootstrap-icons/font/bootstrap-icons.css') }}">

    <!-- Main Dashboard CSS -->
    <link href="{{ asset('assets/css/dashboard.css') }}" rel="stylesheet">

    <!-- Custom Dashboard Overrides -->
    <style>
        .main-wrapper {
            display: flex;
            min-height: 100vh;
        }

        .nav-header {
            width: 260px;
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            position: fixed;
            height: 100vh;
            z-index: 1000;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .brand-logo {
            display: block;
            padding: 25px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .brand-logo img {
            max-width: 120px;
            height: auto;
            filter: brightness(0) invert(1);
        }

        .header {
            margin-left: 260px;
            background: #fff;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            position: fixed;
            width: calc(100% - 260px);
            z-index: 999;
            height: 80px;
        }

        .header-content {
            padding: 0 30px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .dashboard_bar {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin: 0;
        }

        .dlabnav {
            width: 260px;
            position: fixed;
            top: 0;
            height: 100vh;
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            overflow-y: auto;
            padding-top: 140px;
        }

        .dlabnav-scroll {
            padding: 0;
        }

        .metismenu {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .metismenu li {
            margin: 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .metismenu a {
            display: flex;
            align-items: center;
            padding: 18px 25px;
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .metismenu a:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
            padding-left: 35px;
        }

        .metismenu a.active {
            background: rgba(255,255,255,0.2);
            color: #fff;
            border-right: 4px solid #fff;
        }

        .metismenu i {
            width: 20px;
            font-size: 18px;
        }

        .nav-text {
            margin-left: 15px;
            font-weight: 500;
        }

        .content-body {
            margin-left: 260px;
            margin-top: 80px;
            padding: 30px;
            width: calc(100% - 260px);
            min-height: calc(100vh - 80px);
            background: #f8f9fa;
        }

        .card {
            background: #fff;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            margin-bottom: 30px;
            overflow: hidden;
            border: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .card-header {
            padding: 25px 30px;
            border-bottom: 1px solid #eee;
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            color: #fff;
        }

        .card-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #fff;
        }

        .card-body {
            padding: 30px;
        }

        .stat-widget-one {
            padding: 25px;
            border-radius: 15px;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
        }

        .stat-icon {
            width: 70px;
            height: 70px;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-right: 20px;
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            color: #fff;
        }

        .stat-content {
            vertical-align: top;
        }

        .stat-text {
            font-size: 16px;
            color: #6c757d;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .stat-digit {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
        }

        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            color: #fff;
            box-shadow: 0 4px 15px rgba(91, 207, 197, 0.3);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #38bfb3 0%, #217069 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(91, 207, 197, 0.4);
        }

        .navbar-nav .dropdown-menu {
            border: none;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-radius: 10px;
        }

        .header-profile img {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #5bcfc5;
        }

        .header-info {
            text-align: right;
            margin-right: 15px;
        }

        .header-info span {
            display: block;
            color: #2c3e50;
        }

        .header-info small {
            color: #6c757d;
            font-size: 13px;
        }

        .table {
            border-radius: 10px;
            overflow: hidden;
        }

        .table th {
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            color: #fff;
            font-weight: 600;
            border: none;
            padding: 15px;
        }

        .table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
        }

        .badge {
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-success {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: #fff;
        }

        .badge-danger {
            background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
            color: #fff;
        }

        .alert {
            border: none;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
        }

        .alert-success {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            color: #155724;
        }

        #preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #5bcfc5 0%, #38bfb3 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }

        #preloader img {
            width: 120px;
            height: auto;
            filter: brightness(0) invert(1);
            margin-bottom: 30px;
        }

        .waviy span {
            font-size: 48px;
            font-weight: 700;
            color: #fff;
            text-transform: uppercase;
            animation: waviy 1s infinite;
            animation-delay: calc(.1s * var(--i));
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        @keyframes waviy {
            0%,40%,100% {
                transform: translateY(0)
            }
            20% {
                transform: translateY(-20px)
            }
        }
    </style>

    <title>@yield('title', 'MoneyMate - Dashboard')</title>
    @stack('styles')
</head>
<body>
    <div id="preloader">
        <img src="{{ asset('assets/image/logo1.png') }}" alt="">
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

    <div class="main-wrapper">
        <!-- Nav header start -->
        <div class="nav-header">
            <a href="{{ route('dashboard') }}" class="brand-logo">
                <img class="logo-abbr" src="{{ asset('assets/image/logo1.png') }}" alt="">
                <img class="logo-compact" src="{{ asset('assets/image/logo.png') }}" alt="">
                <img class="brand-title" src="{{ asset('assets/image/logo.png') }}" alt="">
            </a>

            <div class="nav-control">
                <div class="hamburger">
                    <span class="line"></span><span class="line"></span><span class="line"></span>
                </div>
            </div>
        </div>
        <!-- Nav header end -->

        <!-- Header start -->
        <div class="header">
            <div class="header-content">
                <nav class="navbar navbar-expand">
                    <div class="collapse navbar-collapse justify-content-between">
                        <div class="header-left">
                            <div class="dashboard_bar">
                                @yield('page-title', 'Dashboard')
                            </div>
                        </div>

                        <ul class="navbar-nav header-right">
                            <li class="nav-item dropdown header-profile">
                                <a class="nav-link" href="#" role="button" data-bs-toggle="dropdown">
                                    <div class="header-info ms-3">
                                        <span class="font-w600">Hi,<b> {{ Auth::user()->fullname }}</b></span>
                                        <small class="text-end font-w400">{{ Auth::user()->email }}</small>
                                    </div>
                                    <img src="{{ Auth::user()->profile ?? asset('assets/image/logo1.png') }}" width="20" alt="">
                                </a>
                                <div class="dropdown-menu dropdown-menu-end">
                                    <a href="{{ route('dashboard.account') }}" class="dropdown-item ai-icon">
                                        <i class="flaticon-381-settings-2"></i>
                                        <span class="ms-2">Account Setting</span>
                                    </a>
                                    <form method="POST" action="{{ route('auth.logout') }}">
                                        @csrf
                                        <button type="submit" class="dropdown-item ai-icon">
                                            <i class="flaticon-381-exit"></i>
                                            <span class="ms-2">Logout</span>
                                        </button>
                                    </form>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
        <!-- Header end -->

        <!-- Sidebar start -->
        <div class="dlabnav">
            <div class="dlabnav-scroll">
                <ul class="metismenu" id="menu">
                    <li><a href="{{ route('dashboard') }}" class="ai-icon" aria-expanded="false">
                        <i class="flaticon-381-networking"></i>
                        <span class="nav-text">Dashboard</span>
                    </a></li>

                    <li><a href="{{ route('dashboard.financial') }}" class="ai-icon" aria-expanded="false">
                        <i class="flaticon-381-controls-3"></i>
                        <span class="nav-text">Financial</span>
                    </a></li>

                    <li><a href="{{ route('transactions.index') }}" class="ai-icon" aria-expanded="false">
                        <i class="flaticon-381-notebook-1"></i>
                        <span class="nav-text">Transactions</span>
                    </a></li>

                    <li><a href="{{ route('transactions.create') }}" class="ai-icon" aria-expanded="false">
                        <i class="flaticon-381-add"></i>
                        <span class="nav-text">Add Transaction</span>
                    </a></li>

                    <li><a href="{{ route('dashboard.account') }}" class="ai-icon" aria-expanded="false">
                        <i class="flaticon-381-settings-2"></i>
                        <span class="nav-text">Account</span>
                    </a></li>
                </ul>
            </div>
        </div>
        <!-- Sidebar end -->

        <!-- Content body start -->
        <div class="content-body">
            <div class="container-fluid">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                @yield('content')
            </div>
        </div>
        <!-- Content body end -->
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/member/vendor/global/global.min.js') }}"></script>

    @stack('scripts')

    <script>
        // Preloader
        setTimeout(function() {
            document.getElementById('preloader').style.display = 'none';
        }, 2000);

        // Sidebar toggle functionality
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const content = document.querySelector('.content-body');

            if (sidebar && content) {
                sidebar.classList.toggle('collapsed');
                content.classList.toggle('expanded');
            }
        }

        // Auto-hide alerts after 5 seconds
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                const alertInstance = new bootstrap.Alert(alert);
                alertInstance.close();
            });
        }, 5000);
    </script>
</body>
</html>
