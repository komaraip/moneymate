@extends('layouts.app')
                <form method="POST" action="{{ route('auth.logout') }}" style="display: inline;">
                    @csrf
                    <button type="submit" class="logout" style="background: none; border: none; color: inherit; cursor: pointer;">LOGOUT</button>
                </form>ction('title', 'MoneyMate - Home')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/home.css') }}" />
@endpush

@section('content')
<div class="gradien-r">
    <img src="{{ asset('assets/image/right.png') }}" alt="">
</div>

<header class="header">
    <nav class="navbar">
        <h2 class="logo">
            <a href="{{ route('home') }}">
                <img src="{{ asset('assets/image/logo.png') }}" alt="">
            </a>
        </h2>

        <div class="buttons">
            @auth
                <a href="{{ route('dashboard') }}" class="signup">DASHBOARD</a>
                <form method="POST" action="{{ route('logout') }}" style="display: inline;">
                    @csrf
                    <button type="submit" class="signup" style="background: none; border: none; color: inherit; cursor: pointer;">LOGOUT</button>
                </form>
            @else
                <a href="{{ route('auth.login') }}" class="signup">LOGIN</a>
            @endauth
        </div>
    </nav>
</header>

<section class="hero-section">
    <div class="hero">
        <h2>Save More, Spend Less, Live Better.</h2>
        <p>
            Track your savings and spendings, customize your own personal allowance, set your financial future towards the bright path with MoneyMate.
        </p>

        <div class="buttons">
            @guest
                <a href="{{ route('auth.register') }}" class="learn">REGISTER</a>
            @else
                <a href="{{ route('dashboard') }}" class="learn">GO TO DASHBOARD</a>
            @endguest
        </div>
    </div>

    <div class="poster">
        <img src="{{ asset('assets/image/card.png') }}" alt="hero image" />
    </div>
</section>

<section class="boxs">
    <div class="cards">
        <div class="card">
            <img src="{{ asset('assets/image/bca.png') }}" alt="" />
        </div>
        <div class="card">
            <img src="{{ asset('assets/image/mandiri.png') }}" alt="" />
        </div>
        <div class="card">
            <img src="{{ asset('assets/image/bri.png') }}" alt="" />
        </div>
        <div class="card">
            <img src="{{ asset('assets/image/bsi.png') }}" alt="" />
        </div>
        <div class="card">
            <img src="{{ asset('assets/image/gopay.png') }}" alt="" />
        </div>
    </div>
</section>
@endsection
