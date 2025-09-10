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
        <!-- Sidebar Overlay (Mobile) -->
        <div class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden hidden" id="sidebar-overlay"></div>

        <!-- Sidebar -->
        <div class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform -translate-x-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0" id="sidebar">
            <div class="flex items-center justify-center h-16 bg-gray-800">
                <img src="{{ asset('assets/image/logo.png') }}" alt="MoneyMate" class="h-8 w-auto sm:h-8">
            </div>

            <nav class="mt-8 px-2">
                <div class="px-2">
                    <p class="text-gray-400 text-xs uppercase tracking-wider font-semibold">Main</p>
                </div>

                <a href="{{ route('admin.dashboard') }}" class="flex items-center px-4 py-3 mx-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.dashboard') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-tachometer-alt mr-3 text-sm"></i>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>

                <div class="px-2 mt-6">
                    <p class="text-gray-400 text-xs uppercase tracking-wider font-semibold">Management</p>
                </div>

                <a href="{{ route('admin.currencies.index') }}" class="flex items-center px-4 py-3 mx-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.currencies.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-coins mr-3 text-sm"></i>
                    <span class="text-sm font-medium">Currencies</span>
                </a>

                <a href="{{ route('admin.countries.index') }}" class="flex items-center px-4 py-3 mx-2 mt-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.countries.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-globe mr-3 text-sm"></i>
                    <span class="text-sm font-medium">Countries</span>
                </a>

                <a href="{{ route('admin.card-types.index') }}" class="flex items-center px-4 py-3 mx-2 mt-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.card-types.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-credit-card mr-3 text-sm"></i>
                    <span class="text-sm font-medium">Card Types</span>
                </a>

                <a href="{{ route('admin.card-names.index') }}" class="flex items-center px-4 py-3 mx-2 mt-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.card-names.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-university mr-3 text-sm"></i>
                    <span class="text-sm font-medium">Banks/Card Names</span>
                </a>

                <a href="{{ route('admin.income-categories.index') }}" class="flex items-center px-4 py-3 mx-2 mt-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.income-categories.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-arrow-up mr-3 text-sm text-green-400"></i>
                    <span class="text-sm font-medium">Income Categories</span>
                </a>

                <a href="{{ route('admin.outcome-categories.index') }}" class="flex items-center px-4 py-3 mx-2 mt-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.outcome-categories.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-arrow-down mr-3 text-sm text-red-400"></i>
                    <span class="text-sm font-medium">Outcome Categories</span>
                </a>

                <a href="{{ route('admin.users.index') }}" class="flex items-center px-4 py-3 mx-2 mt-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg {{ request()->routeIs('admin.users.*') ? 'bg-gray-700 text-white border-r-3 border-[#efa13c]' : '' }}">
                    <i class="fas fa-users mr-3 text-sm"></i>
                    <span class="text-sm font-medium">Users</span>
                </a>

                <div class="px-2 mt-6">
                    <p class="text-gray-400 text-xs uppercase tracking-wider font-semibold">Account</p>
                </div>

                <a href="{{ route('home') }}" class="flex items-center px-4 py-3 mx-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg">
                    <i class="fas fa-globe mr-3 text-sm"></i>
                    <span class="text-sm font-medium">View Site</span>
                </a>

                <form method="POST" action="{{ route('auth.logout') }}" class="mx-2 mt-1">
                    @csrf
                    <button type="submit" class="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 text-left rounded-lg">
                        <i class="fas fa-sign-out-alt mr-3 text-sm"></i>
                        <span class="text-sm font-medium">Logout</span>
                    </button>
                </form>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- Top Navigation -->
            <header class="bg-white shadow-sm border-b border-gray-200 lg:pl-0">
                <div class="flex items-center justify-between px-4 sm:px-6 py-4">
                    <div class="flex items-center min-w-0 flex-1">
                        <button class="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 mr-3" id="sidebar-toggle">
                            <i class="fas fa-bars text-xl"></i>
                        </button>

                        <!-- Breadcrumbs -->
                        <nav class="flex items-center space-x-2 text-sm text-gray-500" aria-label="Breadcrumb">
                            <a href="{{ route('admin.dashboard') }}" class="hover:text-gray-700 transition-colors duration-200">
                                <i class="fas fa-home text-gray-400"></i>
                            </a>

                            @if(request()->routeIs('admin.dashboard'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <span class="text-gray-900 font-medium">Dashboard</span>
                            @elseif(request()->routeIs('admin.currencies.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.currencies.index') }}" class="hover:text-gray-700 transition-colors duration-200">Currencies</a>
                                @if(request()->routeIs('admin.currencies.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.currencies.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.currencies.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @endif
                            @elseif(request()->routeIs('admin.countries.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.countries.index') }}" class="hover:text-gray-700 transition-colors duration-200">Countries</a>
                                @if(request()->routeIs('admin.countries.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.countries.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.countries.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @endif
                            @elseif(request()->routeIs('admin.card-types.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.card-types.index') }}" class="hover:text-gray-700 transition-colors duration-200">Card Types</a>
                                @if(request()->routeIs('admin.card-types.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.card-types.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.card-types.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @endif
                            @elseif(request()->routeIs('admin.card-names.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.card-names.index') }}" class="hover:text-gray-700 transition-colors duration-200">Banks/Card Names</a>
                                @if(request()->routeIs('admin.card-names.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.card-names.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.card-names.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @endif
                            @elseif(request()->routeIs('admin.income-categories.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.income-categories.index') }}" class="hover:text-gray-700 transition-colors duration-200">Income Categories</a>
                                @if(request()->routeIs('admin.income-categories.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.income-categories.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.income-categories.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @endif
                            @elseif(request()->routeIs('admin.outcome-categories.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.outcome-categories.index') }}" class="hover:text-gray-700 transition-colors duration-200">Outcome Categories</a>
                                @if(request()->routeIs('admin.outcome-categories.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.outcome-categories.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.outcome-categories.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @endif
                            @elseif(request()->routeIs('admin.users.*'))
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <a href="{{ route('admin.users.index') }}" class="hover:text-gray-700 transition-colors duration-200">Users</a>
                                @if(request()->routeIs('admin.users.create'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Add New</span>
                                @elseif(request()->routeIs('admin.users.edit'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">Edit</span>
                                @elseif(request()->routeIs('admin.users.show'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">View Details</span>
                                @elseif(request()->routeIs('admin.users.transactions'))
                                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                    <span class="text-gray-900 font-medium">User Transactions</span>
                                @endif
                            @else
                                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                                <span class="text-gray-900 font-medium">@yield('page-title', 'Dashboard')</span>
                            @endif
                        </nav>
                    </div>

                    <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-medium">
                                {{ substr(auth()->user()->name, 0, 1) }}
                            </div>
                            <span class="ml-2 text-gray-700 font-medium text-sm sm:text-base">{{ auth()->user()->name }}</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Heading -->
            @yield('header')

            <!-- Page Content -->
            <main class="flex-1 p-4 sm:p-6 overflow-auto">
                <!-- Success/Error Messages -->
                @if(session('success'))
                    <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span class="text-sm sm:text-base">{{ session('success') }}</span>
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span class="text-sm sm:text-base">{{ session('error') }}</span>
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
            const sidebarOverlay = document.getElementById('sidebar-overlay');

            // Toggle sidebar on mobile
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function() {
                    sidebar.classList.toggle('-translate-x-full');
                    sidebarOverlay.classList.toggle('hidden');
                });
            }

            // Close sidebar when clicking overlay
            if (sidebarOverlay) {
                sidebarOverlay.addEventListener('click', function() {
                    sidebar.classList.add('-translate-x-full');
                    sidebarOverlay.classList.add('hidden');
                });
            }

            // Close sidebar on window resize to large screens
            window.addEventListener('resize', function() {
                if (window.innerWidth >= 1024) { // lg breakpoint
                    sidebar.classList.remove('-translate-x-full');
                    sidebarOverlay.classList.add('hidden');
                }
            });

            // Handle escape key to close sidebar
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
                    sidebar.classList.add('-translate-x-full');
                    sidebarOverlay.classList.add('hidden');
                }
            });
        });
    </script>
</body>
</html>
