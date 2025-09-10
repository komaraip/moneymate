@extends('layouts.admin')

@section('title', 'Add Currency - Admin Panel')
@section('page-title', 'Add Currency')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-4">
        <a href="{{ route('admin.currencies.index') }}" class="text-gray-600 hover:text-gray-900">
            <i class="fas fa-arrow-left text-xl"></i>
        </a>
        <div>
            <h2 class="text-2xl font-bold text-gray-900">Add New Currency</h2>
            <p class="text-gray-600">Create a new currency for the system</p>
        </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-lg shadow">
        <form action="{{ route('admin.currencies.store') }}" method="POST" class="p-6 space-y-6">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Currency Code -->
                <div>
                    <label for="code" class="block text-sm font-medium text-gray-700 mb-2">Currency Code</label>
                    <input type="text" name="code" id="code" maxlength="3" value="{{ old('code') }}" required
                           class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('code') ? 'border-red-300' : 'border-gray-300' }}"
                           placeholder="USD, EUR, IDR">
                    @error('code')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-sm text-gray-500">3-letter currency code (e.g., USD, EUR, IDR)</p>
                </div>

                <!-- Currency Symbol -->
                <div>
                    <label for="symbol" class="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                    <input type="text" name="symbol" id="symbol" maxlength="10" value="{{ old('symbol') }}" required
                           class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('symbol') ? 'border-red-300' : 'border-gray-300' }}"
                           placeholder="$, €, Rp">
                    @error('symbol')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-sm text-gray-500">Currency symbol (e.g., $, €, Rp)</p>
                </div>
            </div>

            <!-- Currency Name -->
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Currency Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" required
                       class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('name') ? 'border-red-300' : 'border-gray-300' }}"
                       placeholder="US Dollar, Euro, Indonesian Rupiah">
                @error('name')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
                <p class="mt-1 text-sm text-gray-500">Full name of the currency</p>
            </div>

            <!-- Status -->
            <div>
                <div class="flex items-center">
                    <input type="checkbox" name="is_active" id="is_active" value="1" {{ old('is_active', true) ? 'checked' : '' }}
                           class="h-4 w-4 text-[#efa13c] focus:ring-[#efa13c] border-gray-300 rounded">
                    <label for="is_active" class="ml-2 block text-sm text-gray-900">
                        Active
                    </label>
                </div>
                <p class="mt-1 text-sm text-gray-500">Active currencies are available for users to select</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <a href="{{ route('admin.currencies.index') }}" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    Cancel
                </a>
                <button type="submit" class="px-4 py-2 bg-[#efa13c] text-white rounded-md hover:bg-[#d68a2e] transition-colors duration-200">
                    <i class="fas fa-save mr-2"></i>Create Currency
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
