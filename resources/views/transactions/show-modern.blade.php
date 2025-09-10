@extends('layouts.dashboard-modern')

@section('title', 'MoneyMate - Transaction Details')
@section('page-title', 'Transaction Details')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold leading-tight text-gray-900">Transaction Details</h1>
            <p class="mt-2 text-sm text-gray-600">View transaction information</p>
        </div>
        <div class="flex space-x-3">
            <a href="{{ route('transactions.edit', $transaction) }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Transaction
            </a>
            <a href="{{ route('transactions.index') }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Back to Transactions
            </a>
        </div>
    </div>

    <!-- Transaction Card -->
    <div class="max-w-4xl">
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Header Section -->
            <div class="px-4 py-5 sm:px-6 {{ $transaction->type == 'income' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400' }}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="h-10 w-10 rounded-full {{ $transaction->type == 'income' ? 'bg-green-100' : 'bg-red-100' }} flex items-center justify-center">
                                @if($transaction->type == 'income')
                                    <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076M21.75 18L18 14.25l-4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076" />
                                    </svg>
                                @else
                                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
                                    </svg>
                                @endif
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">{{ ucfirst($transaction->type) }} Transaction</h3>
                            <p class="mt-1 text-sm text-gray-500">{{ $transaction->category }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold {{ $transaction->type == 'income' ? 'text-green-600' : 'text-red-600' }}">
                            {{ $transaction->type == 'income' ? '+' : '-' }}{{ auth()->user()->currency }} {{ number_format($transaction->balance, 2) }}
                        </div>
                        <div class="text-sm text-gray-500">{{ $transaction->transaction_date->format('F j, Y') }}</div>
                    </div>
                </div>
            </div>

            <!-- Details Section -->
            <div class="px-4 py-5 sm:p-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                        <dt class="text-sm font-medium text-gray-500">Transaction ID</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-mono">#{{ str_pad($transaction->id, 6, '0', STR_PAD_LEFT) }}</dd>
                    </div>

                    <div>
                        <dt class="text-sm font-medium text-gray-500">Type</dt>
                        <dd class="mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $transaction->type == 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                @if($transaction->type == 'income')
                                    <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Income
                                @else
                                    <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Expense
                                @endif
                            </span>
                        </dd>
                    </div>

                    <div>
                        <dt class="text-sm font-medium text-gray-500">Category</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $transaction->category }}</dd>
                    </div>

                    <div>
                        <dt class="text-sm font-medium text-gray-500">Amount</dt>
                        <dd class="mt-1 text-sm font-semibold {{ $transaction->type == 'income' ? 'text-green-600' : 'text-red-600' }}">
                            {{ $transaction->type == 'income' ? '+' : '-' }}{{ auth()->user()->currency }} {{ number_format($transaction->balance, 2) }}
                        </dd>
                    </div>

                    <div>
                        <dt class="text-sm font-medium text-gray-500">Date</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $transaction->transaction_date->format('l, F j, Y') }}</dd>
                    </div>

                    <div>
                        <dt class="text-sm font-medium text-gray-500">Time Created</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $transaction->created_at->format('F j, Y g:i A') }}</dd>
                    </div>

                    @if($transaction->description)
                    <div class="sm:col-span-2">
                        <dt class="text-sm font-medium text-gray-500">Description</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $transaction->description }}</dd>
                    </div>
                    @endif
                </dl>
            </div>

            <!-- Actions Section -->
            <div class="bg-gray-50 px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-500">
                        Last updated {{ $transaction->updated_at->diffForHumans() }}
                    </div>
                    <div class="flex space-x-3">
                        <a href="{{ route('transactions.edit', $transaction) }}" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                        </a>
                        <form method="POST" action="{{ route('transactions.destroy', $transaction) }}" onsubmit="return confirm('Are you sure you want to delete this transaction? This action cannot be undone.')" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Delete
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Related Transactions -->
    @if($relatedTransactions->count() > 0)
    <div class="max-w-4xl">
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Similar Transactions</h3>
                <p class="mt-1 text-sm text-gray-500">Other {{ $transaction->type }} transactions in the {{ $transaction->category }} category</p>
            </div>
            <div class="border-t border-gray-200">
                <ul role="list" class="divide-y divide-gray-200">
                    @foreach($relatedTransactions as $related)
                    <li class="px-4 py-4 hover:bg-gray-50">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="h-8 w-8 rounded-full {{ $related->type == 'income' ? 'bg-green-100' : 'bg-red-100' }} flex items-center justify-center">
                                        @if($related->type == 'income')
                                            <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076M21.75 18L18 14.25l-4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076" />
                                            </svg>
                                        @else
                                            <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
                                            </svg>
                                        @endif
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-900">{{ $related->description ?? 'No description' }}</p>
                                    <p class="text-sm text-gray-500">{{ $related->transaction_date->format('M d, Y') }}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="text-sm font-semibold {{ $related->type == 'income' ? 'text-green-600' : 'text-red-600' }}">
                                    {{ $related->type == 'income' ? '+' : '-' }}{{ auth()->user()->currency }} {{ number_format($related->balance, 2) }}
                                </div>
                                <a href="{{ route('transactions.show', $related) }}" class="text-indigo-600 hover:text-indigo-500">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </li>
                    @endforeach
                </ul>
            </div>
        </div>
    </div>
    @endif
</div>
@endsection
