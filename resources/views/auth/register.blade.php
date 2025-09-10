@extends('layouts.app')

@section('title', 'MoneyMate - Register')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-8">
    <div class="mb-8">
        <a href="{{ route('home') }}">
            <img src="{{ asset('assets/image/logo.png') }}" alt="Logo" class="h-12 md:h-16">
        </a>
    </div>

    <div class="w-full max-w-2xl bg-[#1b1c30] rounded-xl shadow-2xl p-8">
        <h1 class="text-3xl font-bold text-white text-center mb-8">Register</h1>

        @if($errors->any())
            <div class="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <ul class="space-y-1">
                    @foreach($errors->all() as $error)
                        <li class="text-red-300 text-sm">{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('auth.register.post') }}" method="post" class="space-y-6">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="fullname" class="block text-sm font-medium text-white mb-2">Full Name</label>
                    <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        value="{{ old('fullname') }}"
                        required
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                    >
                </div>

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
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                    <label for="country" class="block text-sm font-medium text-white mb-2">Country</label>
                    <select
                        id="country"
                        name="country"
                        required
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="">Select Country</option>
                        <option value="Indonesia" {{ old('country') == 'Indonesia' ? 'selected' : '' }}>Indonesia</option>
                        <option value="Malaysia" {{ old('country') == 'Malaysia' ? 'selected' : '' }}>Malaysia</option>
                        <option value="Singapore" {{ old('country') == 'Singapore' ? 'selected' : '' }}>Singapore</option>
                        <option value="Thailand" {{ old('country') == 'Thailand' ? 'selected' : '' }}>Thailand</option>
                        <option value="Japan" {{ old('country') == 'Japan' ? 'selected' : '' }}>Japan</option>
                        <option value="China" {{ old('country') == 'China' ? 'selected' : '' }}>China</option>
                        <option value="England" {{ old('country') == 'England' ? 'selected' : '' }}>England</option>
                        <option value="United States America" {{ old('country') == 'United States America' ? 'selected' : '' }}>United States America</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="card" class="block text-sm font-medium text-white mb-2">Card Type</label>
                    <select
                        id="card"
                        name="card"
                        required
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="">Select Card Type</option>
                        <option value="BCA" {{ old('card') == 'BCA' ? 'selected' : '' }}>BCA</option>
                        <option value="Mandiri" {{ old('card') == 'Mandiri' ? 'selected' : '' }}>Mandiri</option>
                        <option value="BRI" {{ old('card') == 'BRI' ? 'selected' : '' }}>BRI</option>
                        <option value="BSI" {{ old('card') == 'BSI' ? 'selected' : '' }}>BSI</option>
                        <option value="GoPay" {{ old('card') == 'GoPay' ? 'selected' : '' }}>GoPay</option>
                    </select>
                </div>

                <div>
                    <label for="cardnumber" class="block text-sm font-medium text-white mb-2">Card Number</label>
                    <input
                        type="text"
                        id="cardnumber"
                        name="cardnumber"
                        value="{{ old('cardnumber') }}"
                        required
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your card number"
                    >
                </div>
            </div>

            <div class="pt-4">
                <button
                    type="submit"
                    name="register"
                    class="w-full py-3 px-4 bg-[#1b1c30] border border-purple-600 text-white font-semibold rounded-lg hover:bg-[#efa13c] hover:text-gray-900 hover:border-[#efa13c] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                >
                    REGISTER
                </button>
            </div>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
            <p class="text-white">
                Already have an account?
                <a href="{{ route('auth.login') }}" class="text-[#efa13c] hover:text-[#d68a2e] font-medium hover:underline transition-colors duration-200">
                    Login
                </a>
            </p>
        </div>
    </div>
</div>

<!-- Footer -->
@include('components.footer')
@endsection
