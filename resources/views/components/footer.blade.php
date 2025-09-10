<!-- Footer -->
<footer class="bg-[#1b1c30] text-white">
    <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Company Info -->
            <div class="lg:col-span-2">
                <div class="mb-6">
                    <img src="{{ asset('assets/image/logo.png') }}" alt="MoneyMate Logo" class="h-10 mb-4">
                </div>
                <p class="text-white mb-6 leading-relaxed">
                    Track your savings and spendings, customize your own personal allowance, set your financial future
                    towards the bright path with MoneyMate. Your trusted partner in financial management.
                </p>
                <div class="flex space-x-4">
                    <a href="#"
                        class="w-10 h-10 bg-[#efa13c] rounded-lg flex items-center justify-center hover:bg-[#d68a2e] transition-colors duration-200">
                        <i class="fab fa-facebook-f text-slate-900"></i>
                    </a>
                    <a href="#"
                        class="w-10 h-10 bg-[#efa13c] rounded-lg flex items-center justify-center hover:bg-[#d68a2e] transition-colors duration-200">
                        <i class="fab fa-twitter text-slate-900"></i>
                    </a>
                    <a href="#"
                        class="w-10 h-10 bg-[#efa13c] rounded-lg flex items-center justify-center hover:bg-[#d68a2e] transition-colors duration-200">
                        <i class="fab fa-instagram text-slate-900"></i>
                    </a>
                    <a href="#"
                        class="w-10 h-10 bg-[#efa13c] rounded-lg flex items-center justify-center hover:bg-[#d68a2e] transition-colors duration-200">
                        <i class="fab fa-linkedin-in text-slate-900"></i>
                    </a>
                </div>
            </div>

            <!-- Quick Links -->
            <div>
                <h3 class="text-lg font-semibold mb-6 text-[#efa13c]">Quick Links</h3>
                <ul class="space-y-3">
                    <li>
                        <a href="{{ route('home') }}"
                            class="text-white hover:text-[#efa13c] transition-colors duration-200">
                            <i class="fas fa-home mr-2"></i>Home
                        </a>
                    </li>
                    @auth
                        <li>
                            <a href="{{ route('dashboard') }}"
                                class="text-white hover:text-[#efa13c] transition-colors duration-200">
                                <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('transactions.index') }}"
                                class="text-white hover:text-[#efa13c] transition-colors duration-200">
                                <i class="fas fa-exchange-alt mr-2"></i>Transactions
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('dashboard.financial') }}"
                                class="text-white hover:text-[#efa13c] transition-colors duration-200">
                                <i class="fas fa-chart-line mr-2"></i>Financial Reports
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('dashboard.account') }}"
                                class="text-white hover:text-[#efa13c] transition-colors duration-200">
                                <i class="fas fa-user-cog mr-2"></i>Account Settings
                            </a>
                        </li>
                    @else
                        <li>
                            <a href="{{ route('auth.login') }}"
                                class="text-white hover:text-[#efa13c] transition-colors duration-200">
                                <i class="fas fa-sign-in-alt mr-2"></i>Login
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('auth.register') }}"
                                class="text-white hover:text-[#efa13c] transition-colors duration-200">
                                <i class="fas fa-user-plus mr-2"></i>Register
                            </a>
                        </li>
                    @endauth
                </ul>
            </div>

            <!-- Contact Info -->
            <div>
                <h3 class="text-lg font-semibold mb-6 text-[#efa13c]">Contact Info</h3>
                <ul class="space-y-4">
                    <li class="flex items-center">
                        <i class="fas fa-map-marker-alt text-[#efa13c] mr-3"></i>
                        <span class="text-white">Jakarta, Indonesia</span>
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-phone text-[#efa13c] mr-3"></i>
                        <span class="text-white">+62 123 456 789</span>
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-envelope text-[#efa13c] mr-3"></i>
                        <span class="text-white">contact@moneymate.com</span>
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-clock text-[#efa13c] mr-3"></i>
                        <span class="text-white">24/7 Support</span>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-gray-700 mt-12 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-400 mb-4 md:mb-0">
                    © {{ date('Y') }} MoneyMate. All rights reserved.
                </p>
                <div class="flex space-x-6">
                    <a href="#" class="text-gray-400 hover:text-[#efa13c] transition-colors duration-200">
                        Privacy Policy
                    </a>
                    <a href="#" class="text-gray-400 hover:text-[#efa13c] transition-colors duration-200">
                        Terms of Service
                    </a>
                    <a href="#" class="text-gray-400 hover:text-[#efa13c] transition-colors duration-200">
                        Support
                    </a>
                </div>
            </div>
        </div>
    </div>
</footer>
