<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'MoneyMate - Dashboard')</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased bg-gray-100">
    <div class="min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="{{ route('user.dashboard') }}" class="flex-shrink-0">
                            <img src="{{ asset('assets/image/logo.png') }}" alt="MoneyMate" class="h-8 w-auto">
                        </a>
                        <div class="hidden md:ml-10 md:flex md:space-x-8">
                            <a href="{{ route('user.dashboard') }}" class="text-gray-900 hover:text-[#efa13c] px-3 py-2 text-sm font-medium {{ request()->routeIs('user.dashboard') ? 'text-[#efa13c] border-b-2 border-[#efa13c]' : '' }}">
                                Dashboard
                            </a>
                            <a href="{{ route('user.transactions.index') }}" class="text-gray-900 hover:text-[#efa13c] px-3 py-2 text-sm font-medium {{ request()->routeIs('user.transactions.*') ? 'text-[#efa13c] border-b-2 border-[#efa13c]' : '' }}">
                                Transactions
                            </a>
                            <a href="{{ route('user.dashboard.financial') }}" class="text-gray-900 hover:text-[#efa13c] px-3 py-2 text-sm font-medium {{ request()->routeIs('user.dashboard.financial') ? 'text-[#efa13c] border-b-2 border-[#efa13c]' : '' }}">
                                Financial Reports
                            </a>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4">
                        <!-- User dropdown -->
                        <div class="relative">
                            <button type="button" class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#efa13c]" id="user-menu-button">
                                <span class="sr-only">Open user menu</span>
                                <div class="h-8 w-8 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-medium">
                                    {{ substr(auth()->user()->name, 0, 1) }}
                                </div>
                                <span class="ml-2 text-gray-700 font-medium">{{ auth()->user()->name }}</span>
                                <i class="fas fa-chevron-down ml-2 text-gray-500 text-xs"></i>
                            </button>

                            <div class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" id="user-menu">
                                <div class="py-1">
                                    <a href="{{ route('user.dashboard.account') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i class="fas fa-user-cog mr-2"></i>Account Settings
                                    </a>
                                    <form method="POST" action="{{ route('auth.logout') }}" class="block">
                                        @csrf
                                        <button type="submit" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Page Heading -->
        @yield('header')

        <!-- Page Content -->
        <main>
            @yield('content')
        </main>
    </div>

    <!-- User menu toggle script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const menuButton = document.getElementById('user-menu-button');
            const menu = document.getElementById('user-menu');

            menuButton.addEventListener('click', function() {
                menu.classList.toggle('hidden');
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!menuButton.contains(event.target) && !menu.contains(event.target)) {
                    menu.classList.add('hidden');
                }
            });
        });
    </script>
</body>
</html>
