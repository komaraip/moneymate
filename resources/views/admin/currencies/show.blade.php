@extends('layouts.admin')

@section('title', 'Currency Details')

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
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2">{{ $currency->currency_code }}</span>
                </div>
            </li>
        </ol>
    </nav>

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Currency Details</h1>
            <p class="mt-1 text-sm text-gray-600">View detailed information about this currency</p>
        </div>

        <div class="flex items-center space-x-3">
            <a href="{{ route('admin.currencies.edit', $currency) }}"
               class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#efa13c] border border-transparent rounded-lg hover:bg-[#d4901f] focus:z-10 focus:ring-4 focus:ring-[#efa13c]/25">
                <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m13.835 7.578-.005.007-7.137 7.137 2.139 2.138 7.143-7.142-2.14-2.14Zm-10.696 3.59 2.139 2.14 7.138-7.137.007-.005-2.141-2.141-7.143 7.143Zm1.433 4.261L2 12.852.051 18.684a1 1 0 0 0 1.265 1.264L7.147 18l-2.575-2.571Zm14.249-14.25a4.03 4.03 0 0 0-5.693 0L11.7 2.611 17.389 8.3l1.432-1.432a4.029 4.029 0 0 0 0-5.689Z"/>
                </svg>
                Edit Currency
            </a>

            <a href="{{ route('admin.currencies.index') }}"
               class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-100">
                <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                </svg>
                Back to List
            </a>
        </div>
    </div>

    <!-- Currency Details Card -->
    <div class="bg-white rounded-lg shadow">
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                    <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Currency Code</label>
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#efa13c] text-white">
                                {{ $currency->currency_code }}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Currency Name</label>
                        <p class="text-sm text-gray-900">{{ $currency->currency_name }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Currency Symbol</label>
                        <p class="text-lg font-bold text-gray-900">{{ $currency->currency_symbol }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                        @if($currency->is_active)
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
                    </div>
                </div>

                <!-- Exchange Information -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Exchange Information</h3>

                    <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Exchange Rate to USD</label>
                        <p class="text-lg font-semibold text-gray-900">{{ number_format($currency->exchange_rate, 6) }}</p>
                        <p class="text-xs text-gray-500 mt-1">1 USD = {{ number_format($currency->exchange_rate, 6) }} {{ $currency->currency_code }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">USD Equivalent</label>
                        <p class="text-lg font-semibold text-gray-900">{{ number_format(1 / $currency->exchange_rate, 6) }}</p>
                        <p class="text-xs text-gray-500 mt-1">1 {{ $currency->currency_code }} = {{ number_format(1 / $currency->exchange_rate, 6) }} USD</p>
                    </div>
                </div>
            </div>

            <!-- Usage Statistics -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="w-8 h-8 text-[#efa13c]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <dt class="text-sm font-medium text-gray-500">Users Using</dt>
                                <dd class="text-2xl font-bold text-gray-900">{{ $currency->users_count ?? 0 }}</dd>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="w-8 h-8 text-[#efa13c]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <dt class="text-sm font-medium text-gray-500">Total Transactions</dt>
                                <dd class="text-2xl font-bold text-gray-900">{{ $currency->transactions_count ?? 0 }}</dd>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="w-8 h-8 text-[#efa13c]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 0C4.612 0 0 4.336 0 9.667 0 17 10 20 10 20s10-3 10-10.333C20 4.336 15.388 0 10 0Zm0 14.556a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
                                    <path d="M10 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <dt class="text-sm font-medium text-gray-500">Created</dt>
                                <dd class="text-sm font-bold text-gray-900">{{ $currency->created_at->format('M d, Y') }}</dd>
                                <dd class="text-xs text-gray-500">{{ $currency->created_at->diffForHumans() }}</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metadata -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <label class="block font-medium text-gray-500 mb-1">Created At</label>
                        <p class="text-gray-900">{{ $currency->created_at->format('F j, Y \a\t g:i A') }}</p>
                    </div>

                    <div>
                        <label class="block font-medium text-gray-500 mb-1">Last Updated</label>
                        <p class="text-gray-900">{{ $currency->updated_at->format('F j, Y \a\t g:i A') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
