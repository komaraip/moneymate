@extends('layouts.app')

@section('title', 'MoneyMate - Home')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <div class="absolute top-0 right-0">
        <img src="{{ asset('assets/image/right.png') }}" alt="" class="w-96 lg:w-[450px] opacity-60">
    </div>

    <header id="navbar" class="fixed top-0 left-0 w-full z-50 bg-transparent transition-all duration-300">
        <nav class="flex items-center justify-between max-w-7xl mx-auto px-4 py-5">
            <h2 class="text-2xl font-bold">
                <a href="{{ route('home') }}">
                    <img src="{{ asset('assets/image/logo.png') }}" alt="MoneyMate Logo" class="h-10 mt-2">
                </a>
            </h2>

            <div class="flex items-center space-x-6">
                @auth
                    <a href="{{ route('dashboard') }}" class="px-5 py-2 border border-white text-white rounded-md hover:bg-[#efa13c] hover:text-slate-900 hover:border-[#efa13c] transition-all duration-200 font-medium">
                        DASHBOARD
                    </a>
                    <form method="POST" action="{{ route('auth.logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="px-5 py-2 border border-white text-white rounded-md hover:bg-[#efa13c] hover:text-slate-900 hover:border-[#efa13c] transition-all duration-200 font-medium">
                            LOGOUT
                        </button>
                    </form>
                @else
                    <a href="{{ route('auth.login') }}" class="px-5 py-2 border border-white text-white rounded-md hover:bg-[#efa13c] hover:text-slate-900 hover:border-[#efa13c] transition-all duration-200 font-medium">
                        LOGIN
                    </a>
                @endauth
            </div>
        </nav>
    </header>

    <section class="flex flex-col lg:flex-row justify-between items-center min-h-screen px-4 pt-24 max-w-7xl mx-auto">
        <div class="lg:w-1/2 text-center lg:text-left">
            <h2 class="text-4xl lg:text-5xl font-bold text-[#efa13c] mb-6 leading-tight">
                Save More, Spend Less, Live Better.
            </h2>
            <p class="text-xl text-white mb-8 leading-relaxed">
                Track your savings and spendings, customize your own personal allowance, set your financial future towards the bright path with MoneyMate.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                @guest
                    <a href="{{ route('auth.register') }}" class="px-6 py-3 border border-white text-white rounded-md hover:bg-[#efa13c] hover:text-slate-900 hover:border-[#efa13c] transition-all duration-200 font-semibold">
                        REGISTER
                    </a>
                @else
                    <a href="{{ route('dashboard') }}" class="px-6 py-3 border border-white text-white rounded-md hover:bg-[#efa13c] hover:text-slate-900 hover:border-[#efa13c] transition-all duration-200 font-semibold">
                        GO TO DASHBOARD
                    </a>
                @endguest
            </div>
        </div>

        <div class="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
            <img src="{{ asset('assets/image/card.png') }}" alt="hero image" class="w-full max-w-md lg:max-w-2xl" />
        </div>
    </section>
</div>

@include('components.footer')

<script>
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.remove('bg-transparent');
        navbar.classList.add('bg-[#1b1c30]', 'backdrop-blur-sm');
    } else {
        navbar.classList.remove('bg-[#1b1c30]', 'backdrop-blur-sm');
        navbar.classList.add('bg-transparent');
    }
});
</script>
@endsection
