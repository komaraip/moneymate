@extends('layouts.admin')

@section('title', 'Edit Currency')

@section('content')
<div class="p-6">
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li class="inline-flex items-center">
                <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-[#efa13c]">
                    <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L9 3.414V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2H9V3.414l6.293 6.293a1 1 0 0 0 1.414-1.414Z"/>
                    </svg>
                    Dashboard
                </a>
            </li>
            <li>
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <a href="{{ route('admin.currencies.index') }}" class="ms-1 text-sm font-medium text-gray-700 hover:text-[#efa13c] md:ms-2">Currencies</a>
                </div>
            </li>
            <li aria-current="page">
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2">Edit Currency</span>
                </div>
            </li>
        </ol>
    </nav>

    <!-- Page Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Edit Currency</h1>
        <p class="mt-1 text-sm text-gray-600">Update currency information</p>
    </div>

    <!-- Edit Form -->
    <div class="bg-white rounded-lg shadow">
        <form action="{{ route('admin.currencies.update', $currency) }}" method="POST" class="p-6">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Currency Code -->
                <div>
                    <label for="currency_code" class="block text-sm font-medium text-gray-900 mb-2">
                        Currency Code <span class="text-red-500">*</span>
                    </label>
                    <input type="text"
                           id="currency_code"
                           name="currency_code"
                           value="{{ old('currency_code', $currency->currency_code) }}"
                           class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('currency_code') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                           placeholder="e.g., USD, EUR, IDR"
                           maxlength="3"
                           required>
                    @error('currency_code')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Currency Name -->
                <div>
                    <label for="currency_name" class="block text-sm font-medium text-gray-900 mb-2">
                        Currency Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text"
                           id="currency_name"
                           name="currency_name"
                           value="{{ old('currency_name', $currency->currency_name) }}"
                           class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('currency_name') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                           placeholder="e.g., US Dollar, Euro, Indonesian Rupiah"
                           required>
                    @error('currency_name')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Currency Symbol -->
                <div>
                    <label for="currency_symbol" class="block text-sm font-medium text-gray-900 mb-2">
                        Currency Symbol <span class="text-red-500">*</span>
                    </label>
                    <input type="text"
                           id="currency_symbol"
                           name="currency_symbol"
                           value="{{ old('currency_symbol', $currency->currency_symbol) }}"
                           class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('currency_symbol') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                           placeholder="e.g., $, €, Rp"
                           maxlength="5"
                           required>
                    @error('currency_symbol')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Exchange Rate -->
                <div>
                    <label for="exchange_rate" class="block text-sm font-medium text-gray-900 mb-2">
                        Exchange Rate to USD <span class="text-red-500">*</span>
                    </label>
                    <input type="number"
                           id="exchange_rate"
                           name="exchange_rate"
                           value="{{ old('exchange_rate', $currency->exchange_rate) }}"
                           step="0.000001"
                           min="0"
                           class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('exchange_rate') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                           placeholder="e.g., 1.0, 0.85, 15000"
                           required>
                    @error('exchange_rate')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-gray-500">1 USD = ? of this currency</p>
                </div>

                <!-- Status -->
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-900 mb-2">Status</label>
                    <div class="flex items-center">
                        <input type="checkbox"
                               id="is_active"
                               name="is_active"
                               value="1"
                               {{ old('is_active', $currency->is_active) ? 'checked' : '' }}
                               class="w-4 h-4 text-[#efa13c] bg-gray-100 border-gray-300 rounded focus:ring-[#efa13c] focus:ring-2">
                        <label for="is_active" class="ms-2 text-sm font-medium text-gray-900">Active Currency</label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Only active currencies will be available for users</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <a href="{{ route('admin.currencies.index') }}"
                   class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-100">
                    <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                    Cancel
                </a>

                <button type="submit"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#efa13c] border border-transparent rounded-lg hover:bg-[#d4901f] focus:z-10 focus:ring-4 focus:ring-[#efa13c]/25">
                    <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7.824 5.937a1 1 0 0 0 .726-.312 2.042 2.042 0 0 1 2.835-.065 1 1 0 0 0 1.388-1.441 3.994 3.994 0 0 0-5.674.13 1 1 0 0 0 .725 1.688Z"/>
                        <path d="M17 7A7 7 0 1 0 3 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1V7a5 5 0 1 1 10 0v7.083A2.919 2.919 0 0 1 12.083 17H12a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 1.732-1h.351a4.917 4.917 0 0 0 4.917-4.917V10A3 3 0 0 0 17 7Z"/>
                    </svg>
                    Update Currency
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
