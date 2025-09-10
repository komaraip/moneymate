@extends('layouts.app')

@section('title', 'MoneyMate - Login')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
    <div class="mb-8">
        <a href="{{ route('home') }}">
            <img src="{{ asset('assets/image/logo.png') }}" alt="Logo" class="h-12 md:h-16">
        </a>
    </div>

    <div class="w-full max-w-md bg-[#1b1c30] rounded-xl shadow-2xl p-8">
        <h2 class="text-3xl font-bold text-white text-center mb-8">Log in</h2>

        @if($errors->any())
            <div class="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <ul class="space-y-1">
                    @foreach($errors->all() as $error)
                        <li class="text-red-300 text-sm">{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('auth.login.post') }}" method="post" class="space-y-6">
            @csrf

            <div>
                <label for="email" class="block text-sm font-medium text-white mb-2">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value="{{ old('email') }}"
                    required
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                >
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-white mb-2">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                >
            </div>

            <div class="pt-4">
                <button
                    type="submit"
                    class="w-full py-3 px-4 bg-[#1b1c30] border border-purple-600 text-white font-semibold rounded-lg hover:bg-[#efa13c] hover:text-gray-900 hover:border-[#efa13c] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                >
                    LOG IN
                </button>
            </div>
        </form>

        <div class="mt-6 text-center">
            <p class="text-white">
                Don't have an account yet?
                <a href="{{ route('auth.register') }}" class="text-[#efa13c] hover:text-[#d68a2e] font-medium hover:underline transition-colors duration-200">
                    Register
                </a>
            </p>
        </div>
    </div>
</div>

@include('components.footer')
@endsection
