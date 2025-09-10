@extends('layouts.admin')

@section('title', 'Create Income Category')

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
                    <a href="{{ route('admin.income-categories.index') }}" class="ms-1 text-sm font-medium text-gray-700 hover:text-[#efa13c] md:ms-2">Income Categories</a>
                </div>
            </li>
            <li aria-current="page">
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2">Create Category</span>
                </div>
            </li>
        </ol>
    </nav>

    <!-- Page Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Create Income Category</h1>
        <p class="mt-1 text-sm text-gray-600">Add a new income category for user transactions</p>
    </div>

    <!-- Create Form -->
    <div class="bg-white rounded-lg shadow">
        <form action="{{ route('admin.income-categories.store') }}" method="POST" class="p-6">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Category Name -->
                <div class="md:col-span-2">
                    <label for="name" class="block text-sm font-medium text-gray-900 mb-2">
                        Category Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text"
                           id="name"
                           name="name"
                           value="{{ old('name') }}"
                           class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('name') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                           placeholder="e.g., Salary, Freelancing, Investment, Business Income"
                           required>
                    @error('name')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Description -->
                <div class="md:col-span-2">
                    <label for="description" class="block text-sm font-medium text-gray-900 mb-2">
                        Description
                    </label>
                    <textarea id="description"
                              name="description"
                              rows="4"
                              class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('description') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                              placeholder="Provide a brief description of this income category...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-gray-500">Optional: Help users understand when to use this category</p>
                </div>

                <!-- Icon -->
                <div>
                    <label for="icon" class="block text-sm font-medium text-gray-900 mb-2">
                        Icon
                    </label>
                    <input type="text"
                           id="icon"
                           name="icon"
                           value="{{ old('icon', 'fas fa-coins') }}"
                           class="block w-full px-4 py-3 text-gray-900 border {{ $errors->has('icon') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 text-sm focus:ring-[#efa13c] focus:bg-white"
                           placeholder="e.g., fas fa-wallet, fas fa-coins">
                    @error('icon')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-gray-500">FontAwesome icon class (optional)</p>
                </div>

                <!-- Color -->
                <div>
                    <label for="color" class="block text-sm font-medium text-gray-900 mb-2">
                        Color
                    </label>
                    <input type="color"
                           id="color"
                           name="color"
                           value="{{ old('color', '#10B981') }}"
                           class="block w-full h-12 px-2 py-1 text-gray-900 border {{ $errors->has('color') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#efa13c]' }} rounded-lg bg-gray-50 focus:ring-[#efa13c] focus:bg-white">
                    @error('color')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-gray-500">Category display color</p>
                </div>

                <!-- Status -->
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-900 mb-2">Status</label>
                    <div class="flex items-center">
                        <input type="checkbox"
                               id="is_active"
                               name="is_active"
                               value="1"
                               {{ old('is_active', true) ? 'checked' : '' }}
                               class="w-4 h-4 text-[#efa13c] bg-gray-100 border-gray-300 rounded focus:ring-[#efa13c] focus:ring-2">
                        <label for="is_active" class="ms-2 text-sm font-medium text-gray-900">Active Category</label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Only active categories will be available for users to select</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <a href="{{ route('admin.income-categories.index') }}"
                   class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-100">
                    <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                    Cancel
                </a>

                <button type="submit"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#efa13c] border border-transparent rounded-lg hover:bg-[#d4901f] focus:z-10 focus:ring-4 focus:ring-[#efa13c]/25">
                    <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    Create Category
                </button>
            </div>
        </form>
    </div>

    <!-- Help Section -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                </svg>
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">Income Category Guidelines</h3>
                <div class="mt-2 text-sm text-blue-700">
                    <ul class="list-disc list-inside space-y-1">
                        <li>Use clear, descriptive names that users will easily understand</li>
                        <li>Consider common income sources: Salary, Freelancing, Investment, Business, etc.</li>
                        <li>Add descriptions to help users choose the right category</li>
                        <li>Only active categories will appear in user transaction forms</li>
                        <li>You can always edit or deactivate categories later</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
