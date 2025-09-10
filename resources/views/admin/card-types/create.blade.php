@extends('layouts.admin')

@section('title', 'Add New Card Type')

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
                    <a href="{{ route('admin.card-types.index') }}" class="ms-1 text-sm font-medium text-gray-700 hover:text-[#efa13c] md:ms-2">Card Types</a>
                </div>
            </li>
            <li aria-current="page">
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2">Add New Card Type</span>
                </div>
            </li>
        </ol>
    </nav>

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Add New Card Type</h1>
            <p class="mt-1 text-sm text-gray-600">Create a new card type for the system</p>
        </div>

        <a href="{{ route('admin.card-types.index') }}"
           class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-100">
            <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.793 2.293a1 1 0 0 1 0 1.414L4.414 7H17a1 1 0 1 1 0 2H4.414l3.379 3.293a1 1 0 1 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0Z" clip-rule="evenodd"/>
            </svg>
            Back to Card Types
        </a>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <form action="{{ route('admin.card-types.store') }}" method="POST" class="divide-y divide-gray-200">
            @csrf

            <!-- Basic Information Section -->
            <div class="px-6 py-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div class="grid grid-cols-1 gap-6">
                    <!-- Card Type Name -->
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                            Card Type Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text"
                               id="name"
                               name="name"
                               value="{{ old('name') }}"
                               class="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('name') ? 'border-red-300' : 'border-gray-300' }}"
                               placeholder="e.g., Visa, Mastercard, GPN">
                        @error('name')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea id="description"
                                  name="description"
                                  rows="3"
                                  class="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('description') ? 'border-red-300' : 'border-gray-300' }}"
                                  placeholder="Brief description of the card type">{{ old('description') }}</textarea>
                        @error('description')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Brand Information Section -->
            <div class="px-6 py-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Brand Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Brand Name -->
                    <div>
                        <label for="brand_name" class="block text-sm font-medium text-gray-700 mb-2">
                            Brand Name
                        </label>
                        <input type="text"
                               id="brand_name"
                               name="brand_name"
                               value="{{ old('brand_name') }}"
                               class="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('brand_name') ? 'border-red-300' : 'border-gray-300' }}"
                               placeholder="e.g., Visa Inc., Mastercard">
                        @error('brand_name')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Brand Color -->
                    <div>
                        <label for="brand_color" class="block text-sm font-medium text-gray-700 mb-2">
                            Brand Color
                        </label>
                        <div class="flex space-x-2">
                            <input type="color"
                                   id="brand_color"
                                   name="brand_color"
                                   value="{{ old('brand_color', '#1f2937') }}"
                                   class="h-10 w-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c]">
                            <input type="text"
                                   id="brand_color_text"
                                   value="{{ old('brand_color', '#1f2937') }}"
                                   class="flex-1 px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('brand_color') ? 'border-red-300' : 'border-gray-300' }}"
                                   placeholder="#1f2937">
                        </div>
                        @error('brand_color')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-sm text-gray-500">Choose a color that represents the card type brand</p>
                    </div>
                </div>
            </div>

            <!-- Display Settings Section -->
            <div class="px-6 py-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
                <div class="grid grid-cols-1 gap-6">
                    <!-- Logo URL -->
                    <div>
                        <label for="logo_url" class="block text-sm font-medium text-gray-700 mb-2">
                            Logo URL
                        </label>
                        <input type="url"
                               id="logo_url"
                               name="logo_url"
                               value="{{ old('logo_url') }}"
                               class="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#efa13c] focus:border-[#efa13c] {{ $errors->has('logo_url') ? 'border-red-300' : 'border-gray-300' }}"
                               placeholder="https://example.com/logo.png">
                        @error('logo_url')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-sm text-gray-500">Optional: URL to the card type's logo image</p>
                    </div>

                    <!-- Status -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div class="flex items-center">
                            <input type="hidden" name="is_active" value="0">
                            <input type="checkbox"
                                   id="is_active"
                                   name="is_active"
                                   value="1"
                                   {{ old('is_active', '1') ? 'checked' : '' }}
                                   class="h-4 w-4 text-[#efa13c] focus:ring-[#efa13c] border-gray-300 rounded">
                            <label for="is_active" class="ml-2 block text-sm text-gray-700">
                                Active (available for selection)
                            </label>
                        </div>
                        @error('is_active')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
                <a href="{{ route('admin.card-types.index') }}"
                   class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-100">
                    Cancel
                </a>
                <button type="submit"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#efa13c] border border-transparent rounded-lg hover:bg-[#d4901f] focus:z-10 focus:ring-4 focus:ring-[#efa13c]/25">
                    <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    Create Card Type
                </button>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Sync color picker with text input
    const colorPicker = document.getElementById('brand_color');
    const colorText = document.getElementById('brand_color_text');

    if (colorPicker && colorText) {
        colorPicker.addEventListener('input', function() {
            colorText.value = this.value;
        });

        colorText.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                colorPicker.value = this.value;
            }
        });
    }
});
</script>
@endsection
