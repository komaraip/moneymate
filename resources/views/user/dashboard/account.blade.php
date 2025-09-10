@extends('layouts.user')

@section('title', 'MoneyMate - Account Settings')
@section('page-title', 'Account Settings')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold leading-tight text-gray-900">Account Settings</h1>
        <p class="mt-2 text-sm text-gray-600">Manage your profile and account preferences</p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-">
        <!-- Profile Photo -->
        <div class="lg:col-span-1">
            <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Profile Photo</h3>
                    <p class="mt-1 text-sm text-gray-500">Update your profile photo to personalize your account.</p>

                    <div class="mt-6 flex items-center space-x-6">
                        <div class="flex-shrink-0">
                            @if(auth()->user()->profile)
                                <img class="h-20 w-20 rounded-full object-cover" src="{{ asset('storage/' . auth()->user()->profile) }}" alt="Profile photo">
                            @else
                                <div class="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span class="text-xl font-medium text-white">{{ substr(auth()->user()->name, 0, 1) }}</span>
                                </div>
                            @endif
                        </div>
                        <div class="flex-1">
                            <form method="POST" action="{{ route('user.dashboard.account.photo') }}" enctype="multipart/form-data">
                                @csrf
                                @method('PUT')
                                <div class="space-y-4">
                                    <div>
                                        <label for="profile_photo" class="block text-sm font-medium text-gray-700">Choose new photo</label>
                                        <div class="mt-1">
                                            <input type="file" name="profile_photo" id="profile_photo" accept="image/*" onchange="previewImage(this)" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 @error('profile_photo') border-red-300 @enderror">
                                        </div>
                                        <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                        @error('profile_photo')
                                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                        @enderror
                                    </div>
                                    <div class="flex space-x-3">
                                        <button type="submit" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Upload
                                        </button>
                                        @if(auth()->user()->profile)
                                            <button type="button" onclick="if(confirm('Are you sure you want to remove your profile photo?')) { document.getElementById('remove-photo-form').submit(); }" class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Remove
                                            </button>
                                        @endif
                                    </div>
                                </div>
                            </form>
                            @if(auth()->user()->profile)
                                <form id="remove-photo-form" method="POST" action="{{ route('user.dashboard.account.photo.remove') }}" style="display: none;">
                                    @csrf
                                    @method('DELETE')
                                </form>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Profile Information -->
        <div class="lg:col-span-2 flex">
            <div class="bg-white shadow rounded-lg flex-1">
                <div class="px-4 py-5 sm:p-6 h-full flex flex-col">
                    <div class="flex-shrink-0">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                        <p class="mt-1 text-sm text-gray-500">Update your personal information and email address.</p>
                    </div>

                    <form method="POST" action="{{ route('user.dashboard.account.update') }}" class="mt-6 space-y-6 flex-1 flex flex-col">
                        @csrf
                        @method('PUT')

                        <div class="flex-1 space-y-6">
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div class="mt-1">
                                        <input type="text" name="name" id="name" value="{{ old('name', auth()->user()->name) }}" required class="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('name') ? 'border-red-300' : 'border-gray-300' }}">
                                    </div>
                                    @error('name')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                                    <div class="mt-1">
                                        <input type="email" name="email" id="email" value="{{ old('email', auth()->user()->email) }}" required class="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('email') ? 'border-red-300' : 'border-gray-300' }}">
                                    </div>
                                    @error('email')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
                                    <div class="mt-1">
                                        <select name="currency" id="currency" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('currency') ? 'border-red-300' : 'border-gray-300' }}">
                                            <option value="">Select Currency</option>
                                            @foreach($currencies as $currency)
                                                <option value="{{ $currency->code }}" {{ auth()->user()->currency == $currency->code ? 'selected' : '' }}>
                                                    {{ $currency->name }} ({{ $currency->symbol }})
                                                </option>
                                            @endforeach
                                            <!-- Fallback options for backward compatibility -->
                                            @if(!$currencies->where('code', auth()->user()->currency)->count() && auth()->user()->currency)
                                                <option value="{{ auth()->user()->currency }}" selected>{{ auth()->user()->currency }}</option>
                                            @endif
                                        </select>
                                    </div>
                                    @error('currency')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="balance_limit" class="block text-sm font-medium text-gray-700">Balance Limit</label>
                                    <div class="mt-1">
                                        <input type="number" name="balance_limit" id="balance_limit" step="0.01" min="0" value="{{ old('balance_limit', auth()->user()->balance_limit) }}" class="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('balance_limit') ? 'border-red-300' : 'border-gray-300' }}">
                                    </div>
                                    {{-- <p class="mt-1 text-sm text-gray-500">Set a warning limit for your account balance</p> --}}
                                    @error('balance_limit')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>

                            <!-- New Category Fields -->
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
                                    <div class="mt-1">
                                        <select name="country" id="country" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('country') ? 'border-red-300' : 'border-gray-300' }}">
                                            <option value="">Select Country</option>
                                            @foreach($countries as $country)
                                                <option value="{{ $country->id }}" {{ auth()->user()->country == $country->id ? 'selected' : '' }}>
                                                    {{ $country->name }}
                                                    @if($country->currency_code)
                                                        ({{ $country->currency_code }})
                                                    @endif
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    @error('country')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="card_type" class="block text-sm font-medium text-gray-700">Card Type</label>
                                    <div class="mt-1">
                                        <select name="card_type" id="card_type" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('card_type') ? 'border-red-300' : 'border-gray-300' }}">
                                            <option value="">Select Card Type</option>
                                            @foreach($cardTypes as $cardType)
                                                <option value="{{ $cardType->id }}" {{ auth()->user()->card_type == $cardType->id ? 'selected' : '' }}>
                                                    {{ $cardType->name }}
                                                    @if($cardType->brand_name)
                                                        ({{ $cardType->brand_name }})
                                                    @endif
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    @error('card_type')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label for="cardnumber" class="block text-sm font-medium text-gray-700">Card Number</label>
                                    <div class="mt-1">
                                        <input type="text" name="cardnumber" id="cardnumber" value="{{ old('cardnumber', auth()->user()->cardnumber) }}" placeholder="Enter your card number" maxlength="19" class="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('cardnumber') ? 'border-red-300' : 'border-gray-300' }}">
                                    </div>
                                    <p class="mt-1 text-sm text-gray-500">Enter your card number (will be masked for security)</p>
                                    @error('cardnumber')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="card_name" class="block text-sm font-medium text-gray-700">Card Name (Bank)</label>
                                    <div class="mt-1">
                                        <select name="card_name" id="card_name" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('card_name') ? 'border-red-300' : 'border-gray-300' }}">
                                            <option value="">Select Bank/Card Name</option>
                                            @foreach($cardNames as $cardName)
                                                <option value="{{ $cardName->id }}" {{ auth()->user()->card_name == $cardName->id ? 'selected' : '' }}>
                                                    {{ $cardName->name }}
                                                    @if($cardName->bank_type)
                                                        ({{ $cardName->bank_type }})
                                                    @endif
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    @error('card_name')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4 border-t border-gray-200">
                            <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Account Overview -->
        <div class="lg:col-span-1">
            <div class="bg-white shadow rounded-lg h-full">
                <div class="px-4 py-5 sm:p-6 h-full flex flex-col">
                    <div class="flex-shrink-0">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Account Overview</h3>
                    </div>
                    <dl class="mt-6 space-y-4 flex-1">
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Current Balance</dt>
                            <dd class="mt-1 text-lg font-semibold text-gray-900">{{ auth()->user()->currency }} {{ number_format(auth()->user()->balance, 2) }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Balance Limit</dt>
                            <dd class="mt-1 text-lg font-semibold text-gray-900">{{ auth()->user()->currency }} {{ number_format(auth()->user()->balance_limit, 2) }}</dd>
                        </div>
                        @if(auth()->user()->country)
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Country</dt>
                                <dd class="mt-1 text-sm text-gray-900">
                                    @php
                                        $userCountry = $countries->find(auth()->user()->country);
                                    @endphp
                                    {{ $userCountry ? $userCountry->name : 'Not specified' }}
                                </dd>
                            </div>
                        @endif
                        @if(auth()->user()->card_type)
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Card Type</dt>
                                <dd class="mt-1 text-sm text-gray-900">
                                    @php
                                        $userCardType = $cardTypes->find(auth()->user()->card_type);
                                    @endphp
                                    {{ $userCardType ? $userCardType->name : 'Not specified' }}
                                </dd>
                            </div>
                        @endif
                        @if(auth()->user()->card_name)
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Bank/Card Name</dt>
                                <dd class="mt-1 text-sm text-gray-900">
                                    @php
                                        $userCardName = $cardNames->find(auth()->user()->card_name);
                                    @endphp
                                    {{ $userCardName ? $userCardName->name : 'Not specified' }}
                                </dd>
                            </div>
                        @endif
                        @if(auth()->user()->cardnumber)
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Card Number</dt>
                                <dd class="mt-1 text-sm text-gray-900 font-mono">
                                    @php
                                        $cardNumber = auth()->user()->cardnumber;
                                        $maskedNumber = '****-****-****-' . substr($cardNumber, -4);
                                    @endphp
                                    {{ $maskedNumber }}
                                </dd>
                            </div>
                        @endif
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Member Since</dt>
                            <dd class="mt-1 text-sm text-gray-900">{{ auth()->user()->created_at->format('F j, Y') }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                            <dd class="mt-1 text-sm text-gray-900">{{ auth()->user()->updated_at->format('F j, Y g:i A') }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    </div>

    <!-- Change Password -->
    <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
            <p class="mt-1 text-sm text-gray-500">Update your password to keep your account secure.</p>

            <form method="POST" action="{{ route('user.dashboard.account.password') }}" class="mt-6">
                @csrf
                @method('PUT')

                <div class="space-y-6">
                    <div>
                        <label for="current_password" class="block text-sm font-medium text-gray-700">Current Password</label>
                        <div class="mt-1">
                            <input type="password" name="current_password" id="current_password" required class="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('current_password') ? 'border-red-300' : 'border-gray-300' }}">
                        </div>
                        @error('current_password')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
                        <div class="mt-1">
                            <input type="password" name="password" id="password" required class="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('password') ? 'border-red-300' : 'border-gray-300' }}">
                        </div>
                        @error('password')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div class="mt-1">
                            <input type="password" name="password_confirmation" id="password_confirmation" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Danger Zone -->

</div>

@push('scripts')
<script>
function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            // Find the profile photo container and update the image
            var photoContainer = input.closest('.bg-white').querySelector('.flex-shrink-0');

            // Check if there's already an image or if it's the default avatar
            var existingImg = photoContainer.querySelector('img');
            var defaultAvatar = photoContainer.querySelector('div');

            if (existingImg) {
                existingImg.src = e.target.result;
            } else if (defaultAvatar) {
                // Replace the default avatar with the new image
                photoContainer.innerHTML = '<img class="w-[30px] rounded-full object-cover" src="' + e.target.result + '" alt="Profile photo preview">';
            }
        }

        reader.readAsDataURL(input.files[0]);
    }
}

// Enhanced user experience for category selection
document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const currencySelect = document.getElementById('currency');

    // Auto-select currency based on country selection
    if (countrySelect && currencySelect) {
        countrySelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                // Extract currency code from option text (if available)
                const optionText = selectedOption.textContent;
                const currencyMatch = optionText.match(/\(([A-Z]{3})\)/);

                if (currencyMatch) {
                    const currencyCode = currencyMatch[1];
                    // Try to select the matching currency
                    const currencyOptions = currencySelect.options;
                    for (let i = 0; i < currencyOptions.length; i++) {
                        if (currencyOptions[i].value === currencyCode) {
                            currencySelect.value = currencyCode;
                            break;
                        }
                    }
                }
            }
        });
    }

    // Add visual feedback for form changes
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.classList.contains('border-red-300')) {
                this.classList.remove('border-red-300');
                this.classList.add('border-gray-300');
            }
        });
    });

    // Card number formatting
    const cardNumberInput = document.getElementById('cardnumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join('-') || value;
            if (formattedValue !== e.target.value) {
                e.target.value = formattedValue;
            }
        });

        // Prevent non-numeric characters except backspace, delete, tab, and arrow keys
        cardNumberInput.addEventListener('keydown', function(e) {
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
            const isNumber = (e.key >= '0' && e.key <= '9');

            if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey) {
                e.preventDefault();
            }
        });
    }
});
</script>
@endpush

@endsection
