@extends('layouts.app')

@section('title', 'MoneyMate - Login')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/login.css') }}">
@endpush

@section('content')
<div class="logo">
    <a href="{{ route('home') }}" class="logo">
        <img src="{{ asset('assets/image/logo.png') }}" alt="Logo">
    </a>
</div>

<div class="container">
    <div class="box">
        <h2>Log in</h2>

        @if($errors->any())
            <div class="alert alert-danger">
                <ul style="margin: 0; padding: 0; list-style: none;">
                    @foreach($errors->all() as $error)
                        <li style="color: red; margin-bottom: 5px;">{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('auth.login.post') }}" method="post">
            @csrf
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" required>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <div class="button">
                <button type="submit">
                    LOG IN
                </button>
            </div>
        </form>

        <div class="register-link">
            <p>Don't have an account yet? <a href="{{ route('auth.register') }}">Register</a></p>
        </div>
    </div>
</div>
@endsection
