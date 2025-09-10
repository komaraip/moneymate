@extends('layouts.app')

@section('title', 'MoneyMate - Register')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/register.css') }}">
@endpush

@section('content')
<div class="logo">
    <a href="{{ route('home') }}">
        <img src="{{ asset('assets/image/logo.png') }}" alt="Logo">
    </a>
</div>

<div class="container">
    <h1>Register</h1>

    <div class="regform">
        @if($errors->any())
            <div class="alert alert-danger">
                <ul style="margin: 0; padding: 0; list-style: none;">
                    @foreach($errors->all() as $error)
                        <li style="color: red; margin-bottom: 5px;">{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('auth.register.post') }}" method="post">
            @csrf
            <div class="form-row">
                <div class="form-group">
                    <label for="fullname">Full Name</label>
                    <input type="text" id="fullname" name="fullname" value="{{ old('fullname') }}" required>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <div class="form-group">
                    <label for="country">Country</label>
                    <select id="country" name="country" required>
                        <option value="">-</option>
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

            <div class="form-row">
                <div class="form-group">
                    <label for="card">Card Type</label>
                    <select id="card" name="card" required>
                        <option value="">-</option>
                        <option value="BCA" {{ old('card') == 'BCA' ? 'selected' : '' }}>BCA</option>
                        <option value="Mandiri" {{ old('card') == 'Mandiri' ? 'selected' : '' }}>Mandiri</option>
                        <option value="BRI" {{ old('card') == 'BRI' ? 'selected' : '' }}>BRI</option>
                        <option value="BSI" {{ old('card') == 'BSI' ? 'selected' : '' }}>BSI</option>
                        <option value="GoPay" {{ old('card') == 'GoPay' ? 'selected' : '' }}>GoPay</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="cardnumber">Card Number</label>
                    <input type="text" id="cardnumber" name="cardnumber" value="{{ old('cardnumber') }}" required>
                </div>
            </div>

            <div class="button-1">
                <button type="submit" name="register">
                    REGISTER
                </button>
            </div>
        </form>

        <div class="login-link">
            <p>Already have an account? <a href="{{ route('auth.login') }}">Login</a></p>
        </div>
    </div>
</div>
@endsection
