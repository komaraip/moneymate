@extends('layouts.admin')

@section('title', 'Card Type Details')

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
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2">{{ $cardType->name }}</span>
                </div>
            </li>
        </ol>
    </nav>

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
            @if($cardType->logo_url)
                <img class="h-10 w-15 mr-4 object-contain rounded border" src="{{ $cardType->logo_url }}" alt="{{ $cardType->name }} logo">
            @else
                <div class="h-10 w-15 mr-4 bg-gray-200 rounded border flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 2h12v2H4V6Zm0 4h12v4H4v-4Z"/>
                    </svg>
                </div>
            @endif
            <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ $cardType->name }}</h1>
                <p class="mt-1 text-sm text-gray-600">Card type details and information</p>
            </div>
        </div>

        <div class="flex items-center space-x-3">
            <a href="{{ route('admin.card-types.edit', $cardType) }}"
               class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#efa13c] border border-transparent rounded-lg hover:bg-[#d4901f] focus:z-10 focus:ring-4 focus:ring-[#efa13c]/25">
                <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m13.835 7.578-.005.007-7.137 7.137 2.139 2.138 7.143-7.142-2.14-2.14Zm-10.696 3.59 2.139 2.14 7.138-7.137.007-.005-2.141-2.141-7.143 7.143Zm1.433 4.261L2 12.852.051 18.684a1 1 0 0 0 1.265 1.264L7.147 18l-2.575-2.571Zm14.249-14.25a4.03 4.03 0 0 0-5.693 0L11.7 2.611 17.389 8.3l1.432-1.432a4.029 4.029 0 0 0 0-5.689Z"/>
                </svg>
                Edit Card Type
            </a>
            <a href="{{ route('admin.card-types.index') }}"
               class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-100">
                <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.793 2.293a1 1 0 0 1 0 1.414L4.414 7H17a1 1 0 1 1 0 2H4.414l3.379 3.293a1 1 0 1 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0Z" clip-rule="evenodd"/>
                </svg>
                Back to Card Types
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card Type Information -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information Card -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
                </div>
                <div class="px-6 py-4">
                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Card Type Name</dt>
                            <dd class="mt-1 text-sm text-gray-900">{{ $cardType->name }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Status</dt>
                            <dd class="mt-1">
                                @if($cardType->is_active)
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <svg class="w-2 h-2 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                        </svg>
                                        Active
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <svg class="w-2 h-2 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                                        </svg>
                                        Inactive
                                    </span>
                                @endif
                            </dd>
                        </div>
                        @if($cardType->description)
                            <div class="md:col-span-2">
                                <dt class="text-sm font-medium text-gray-500">Description</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ $cardType->description }}</dd>
                            </div>
                        @endif
                    </dl>
                </div>
            </div>

            <!-- Brand Information Card -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Brand Information</h3>
                </div>
                <div class="px-6 py-4">
                    @if($cardType->brand_name || $cardType->brand_color)
                        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            @if($cardType->brand_name)
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Brand Name</dt>
                                    <dd class="mt-1 text-sm text-gray-900">{{ $cardType->brand_name }}</dd>
                                </div>
                            @endif
                            @if($cardType->brand_color)
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Brand Color</dt>
                                    <dd class="mt-1 flex items-center space-x-2">
                                        <div class="w-6 h-6 rounded border" style="background-color: {{ $cardType->brand_color }}"></div>
                                        <span class="text-sm text-gray-900 font-mono">{{ $cardType->brand_color }}</span>
                                    </dd>
                                </div>
                            @endif
                        </dl>
                    @else
                        <div class="text-center py-6">
                            <svg class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm0 0V6m0 8v2"/>
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h8M8 12a4 4 0 1 1 8 0M8 12a4 4 0 0 0 8 0"/>
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">No brand information</h3>
                            <p class="mt-1 text-sm text-gray-500">Brand details have not been set for this card type.</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Logo Information Card -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Logo Information</h3>
                </div>
                <div class="px-6 py-4">
                    @if($cardType->logo_url)
                        <div class="flex items-start space-x-4">
                            <img src="{{ $cardType->logo_url }}"
                                 alt="{{ $cardType->name }} logo"
                                 class="h-16 w-24 object-contain rounded border">
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Logo URL</dt>
                                <dd class="mt-1 text-sm text-gray-900 break-all">
                                    <a href="{{ $cardType->logo_url }}"
                                       target="_blank"
                                       class="text-[#efa13c] hover:text-[#d4901f]">
                                        {{ $cardType->logo_url }}
                                    </a>
                                </dd>
                            </div>
                        </div>
                    @else
                        <div class="text-center py-6">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 2h12v2H4V6Zm0 4h12v4H4v-4Z"/>
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">No logo image</h3>
                            <p class="mt-1 text-sm text-gray-500">Logo image has not been set for this card type.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Statistics Card -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Statistics</h3>
                </div>
                <div class="px-6 py-4">
                    <dl class="space-y-4">
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Total Users</dt>
                            <dd class="mt-1 text-2xl font-bold text-gray-900">{{ $cardType->users_count ?? 0 }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Created</dt>
                            <dd class="mt-1 text-sm text-gray-900">{{ $cardType->created_at->format('M j, Y \a\t g:i A') }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                            <dd class="mt-1 text-sm text-gray-900">{{ $cardType->updated_at->format('M j, Y \a\t g:i A') }}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <!-- Brand Preview Card -->
            @if($cardType->brand_color)
                <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Brand Preview</h3>
                    </div>
                    <div class="px-6 py-4">
                        <div class="rounded-lg p-4 text-white" style="background-color: {{ $cardType->brand_color }}">
                            <div class="flex items-center justify-between">
                                @if($cardType->logo_url)
                                    <img src="{{ $cardType->logo_url }}" alt="{{ $cardType->name }}" class="h-8 w-12 object-contain">
                                @else
                                    <div class="text-white font-bold text-lg">{{ $cardType->name }}</div>
                                @endif
                                <div class="text-right">
                                    <div class="text-xs opacity-75">{{ $cardType->brand_name ?? $cardType->name }}</div>
                                </div>
                            </div>
                            <div class="mt-4">
                                <div class="text-xs opacity-75">Card Type</div>
                                <div class="font-semibold">{{ $cardType->name }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Actions Card -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Actions</h3>
                </div>
                <div class="px-6 py-4 space-y-3">
                    <a href="{{ route('admin.card-types.edit', $cardType) }}"
                       class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#efa13c] border border-transparent rounded-lg hover:bg-[#d4901f] focus:z-10 focus:ring-4 focus:ring-[#efa13c]/25">
                        <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="m13.835 7.578-.005.007-7.137 7.137 2.139 2.138 7.143-7.142-2.14-2.14Zm-10.696 3.59 2.139 2.14 7.138-7.137.007-.005-2.141-2.141-7.143 7.143Zm1.433 4.261L2 12.852.051 18.684a1 1 0 0 0 1.265 1.264L7.147 18l-2.575-2.571Zm14.249-14.25a4.03 4.03 0 0 0-5.693 0L11.7 2.611 17.389 8.3l1.432-1.432a4.029 4.029 0 0 0 0-5.689Z"/>
                        </svg>
                        Edit Card Type
                    </a>

                    <form action="{{ route('admin.card-types.destroy', $cardType) }}"
                          method="POST"
                          onsubmit="return confirm('Are you sure you want to delete this card type? This action cannot be undone.')">
                        @csrf
                        @method('DELETE')
                        <button type="submit"
                                class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:z-10 focus:ring-4 focus:ring-red-100">
                            <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"/>
                            </svg>
                            Delete Card Type
                        </button>
                    </form>
                </div>
            </div>

            @if($cardType->users_count > 0)
                <!-- Usage Warning Card -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex">
                        <svg class="flex-shrink-0 w-5 h-5 text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-blue-800">Card Type in Use</h3>
                            <p class="mt-1 text-sm text-blue-700">
                                This card type is currently being used by {{ $cardType->users_count }} user(s).
                                Deleting this card type may affect these users' profiles.
                            </p>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
