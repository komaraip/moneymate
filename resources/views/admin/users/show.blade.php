@extends('layouts.admin')

@section('title', 'User Details - MoneyMate Admin')
@section('page-title', 'User Details')

@section('content')
    <div class="space-y-6">
        <!-- User Profile Card -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    <div class="flex items-center">
                        @if ($user->profile)
                            <img src="{{ asset('storage/' . $user->profile) }}" alt="{{ $user->name }}"
                                class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover">
                        @else
                            <div
                                class="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                                {{ substr($user->name, 0, 1) }}
                            </div>
                        @endif
                        <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                            <h2 class="text-lg sm:text-2xl font-bold text-gray-900 truncate">{{ $user->name }}</h2>
                            <p class="text-sm sm:text-base text-gray-600 truncate">{{ $user->email }}</p>
                            <div class="flex flex-col sm:flex-row sm:items-center mt-2 space-y-2 sm:space-y-0 sm:space-x-4">
                                <span class="text-xs sm:text-sm text-gray-500">
                                    Joined {{ $user->created_at->format('M d, Y') }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <a href="{{ route('admin.users.transactions', $user) }}"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center">
                            <i class="fas fa-list mr-2"></i>
                            <span class="hidden sm:inline sm">View Transactions</span>
                            <span class="sm:hidden sm:mb-4">View Transactions</span>
                        </a>
                        <a href="{{ route('admin.users.index') }}"
                            class="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center">
                            <i class="fas fa-arrow-left mr-2"></i>
                            <span class="hidden sm:inline">Back to Users</span>
                            <span class="sm:hidden">Back to Users</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- User Stats -->
            <div class="px-4 sm:px-6 py-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div class="bg-green-50 p-3 sm:p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                <i class="fas fa-arrow-up text-green-600 text-sm sm:text-base"></i>
                            </div>
                            <div class="ml-3 min-w-0 flex-1">
                                <p class="text-xs sm:text-sm font-medium text-gray-600">Total Income</p>
                                <p class="text-lg sm:text-2xl font-bold text-green-600 truncate">
                                    ${{ number_format($totalIncome, 2) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-red-50 p-3 sm:p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-red-100 rounded-lg flex-shrink-0">
                                <i class="fas fa-arrow-down text-red-600 text-sm sm:text-base"></i>
                            </div>
                            <div class="ml-3 min-w-0 flex-1">
                                <p class="text-xs sm:text-sm font-medium text-gray-600">Total Expenses</p>
                                <p class="text-lg sm:text-2xl font-bold text-red-600 truncate">
                                    ${{ number_format($totalOutcome, 2) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                        <div class="flex items-center">
                            <div class="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <i class="fas fa-exchange-alt text-blue-600 text-sm sm:text-base"></i>
                            </div>
                            <div class="ml-3 min-w-0 flex-1">
                                <p class="text-xs sm:text-sm font-medium text-gray-600">Total Transactions</p>
                                <p class="text-lg sm:text-2xl font-bold text-blue-600">{{ $user->transactions->count() }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h3 class="text-base sm:text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <a href="{{ route('admin.users.transactions', $user) }}"
                        class="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                        View All Transactions
                    </a>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($recentTransactions as $transaction)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $transaction->transaction_date->format('M d, Y') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">{{ $transaction->description }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    @if ($transaction->type === 'income')
                                        {{ $transaction->incomeCategory->name ?? 'N/A' }}
                                    @else
                                        {{ $transaction->outcomeCategory->name ?? 'N/A' }}
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {{ $transaction->type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                        {{ ucfirst($transaction->type) }}
                                    </span>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-medium {{ $transaction->type === 'income' ? 'text-green-600' : 'text-red-600' }}">
                                    {{ $transaction->type === 'income' ? '+' : '-' }}${{ number_format($transaction->balance, 2) }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                                    <i class="fas fa-receipt text-3xl mb-2 text-gray-300"></i>
                                    <p>No transactions found for this user</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection
