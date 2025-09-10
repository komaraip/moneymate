<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'MoneyMate - Admin Panel')</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased bg-gray-50">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0" id="sidebar">
            <div class="flex items-center justify-center h-16 bg-gray-800">
                <img src="{{ asset('assets/image/logo.png') }}" alt="MoneyMate" class="h-8 w-auto">
                <span class="ml-2 text-white font-bold text-lg">Admin Panel</span>
            </div>

            <nav class="mt-8">
                <div class="px-4">
                    <p class="text-gray-400 text-xs uppercase tracking-wider font-semibold">Main</p>
                </div>

                <a href="{{ route('admin.dashboard') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.dashboard') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-tachometer-alt mr-3"></i>
                    Dashboard
                </a>

                <div class="px-4 mt-6">
                    <p class="text-gray-400 text-xs uppercase tracking-wider font-semibold">Management</p>
                </div>

                <a href="{{ route('admin.currencies.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.currencies.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-coins mr-3"></i>
                    Currencies
                </a>

                <a href="{{ route('admin.countries.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.countries.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-globe mr-3"></i>
                    Countries
                </a>

                <a href="{{ route('admin.card-types.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.card-types.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-credit-card mr-3"></i>
                    Card Types
                </a>

                <a href="{{ route('admin.card-names.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.card-names.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-university mr-3"></i>
                    Banks/Card Names
                </a>

                <a href="{{ route('admin.income-categories.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.income-categories.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-arrow-up mr-3 text-green-400"></i>
                    Income Categories
                </a>

                <a href="{{ route('admin.outcome-categories.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.outcome-categories.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-arrow-down mr-3 text-red-400"></i>
                    Outcome Categories
                </a>

                <a href="{{ route('admin.users.index') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.users.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-users mr-3"></i>
                    Users
                </a>

                <div class="px-4 mt-6">
                    <p class="text-gray-400 text-xs uppercase tracking-wider font-semibold">Account</p>
                </div>

                <a href="{{ route('home') }}" class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
                    <i class="fas fa-globe mr-3"></i>
                    View Site
                </a>

                <form method="POST" action="{{ route('auth.logout') }}" class="mt-2">
                    @csrf
                    <button type="submit" class="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 text-left">
                        <i class="fas fa-sign-out-alt mr-3"></i>
                        Logout
                    </button>
                </form>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 lg:ml-0">
            <!-- Top Navigation -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center">
                        <button class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900" id="sidebar-toggle">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                        <h1 class="text-xl font-semibold text-gray-900 lg:ml-0 ml-4">@yield('page-title', 'Dashboard')</h1>
                    </div>

                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-medium mr-2">
                                {{ substr(auth()->user()->name, 0, 1) }}
                            </div>
                            <span class="text-gray-700 font-medium">{{ auth()->user()->name }}</span>
                            <span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Admin</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="p-6">
                <!-- Success/Error Messages -->
                @if(session('success'))
                    <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
                        <i class="fas fa-check-circle mr-2"></i>
                        {{ session('success') }}
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        {{ session('error') }}
                    </div>
                @endif

                @yield('content')
            </main>
        </div>
    </div>

    <!-- Sidebar toggle script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sidebarToggle = document.getElementById('sidebar-toggle');
            const sidebar = document.getElementById('sidebar');

            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function() {
                    sidebar.classList.toggle('-translate-x-full');
                });
            }
        });
    </script>
</body>
</html>
