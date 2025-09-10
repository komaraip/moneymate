@extends('layouts.admin')

@section('title', 'User Transactions - MoneyMate Admin')
@section('page-title', 'User Transactions')

@section('content')
    <div class="space-y-6">
        <!-- User Header -->
        <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div class="flex items-center">
                    @if ($user->profile)
                        <img src="{{ asset('storage/' . $user->profile) }}" alt="{{ $user->name }}"
                            class="h-8 w-8 rounded-full object-cover">
                    @else
                        <div
                            class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {{ substr($user->name, 0, 1) }}
                        </div>
                    @endif
                    <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                        <h2 class="text-lg sm:text-xl font-bold text-gray-900 truncate">{{ $user->name }}'s Transactions
                        </h2>
                        <p class="text-sm sm:text-base text-gray-600 truncate">{{ $user->email }}</p>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <a href="{{ route('admin.users.show', $user) }}"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center">
                        <i class="fas fa-user mr-2"></i>
                        <span class="hidden sm:inline">View Profile</span>
                        <span class="sm:hidden">View Profile</span>
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

        <!-- Transactions Table -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h3 class="text-base sm:text-lg font-semibold text-gray-900">All Transactions</h3>
                        <p class="text-xs sm:text-sm text-gray-600 mt-1">Complete transaction history for this user</p>
                    </div>
                    <div class="text-xs sm:text-sm text-gray-500">
                        Total: {{ $transactions->total() }} transactions
                    </div>
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
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($transactions as $transaction)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ $transaction->transaction_date->format('M d, Y') }}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        {{ $transaction->transaction_date->format('l') }}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm font-medium text-gray-900">{{ $transaction->description }}</div>
                                    @if ($transaction->note)
                                        <div class="text-sm text-gray-500 mt-1">{{ Str::limit($transaction->note, 50) }}
                                        </div>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        @if ($transaction->type === 'income')
                                            {{ $transaction->incomeCategory->name ?? 'N/A' }}
                                        @else
                                            {{ $transaction->outcomeCategory->name ?? 'N/A' }}
                                        @endif
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {{ $transaction->type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                        <i
                                            class="fas fa-{{ $transaction->type === 'income' ? 'arrow-up' : 'arrow-down' }} mr-1"></i>
                                        {{ ucfirst($transaction->type) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div
                                        class="text-sm font-bold {{ $transaction->type === 'income' ? 'text-green-600' : 'text-red-600' }}">
                                        {{ $transaction->type === 'income' ? '+' : '-' }}${{ number_format($transaction->balance, 2) }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">{{ $transaction->created_at->format('M d, Y') }}
                                    </div>
                                    <div class="text-sm text-gray-500">{{ $transaction->created_at->format('H:i') }}</div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-4 sm:px-6 py-8 sm:py-12 text-center">
                                    <div class="text-gray-500">
                                        <i class="fas fa-receipt text-3xl sm:text-4xl mb-3 sm:mb-4 text-gray-300"></i>
                                        <p class="text-base sm:text-lg font-medium">No transactions found</p>
                                        <p class="text-xs sm:text-sm">This user hasn't made any transactions yet.</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if ($transactions->hasPages())
                <div class="px-4 sm:px-6 py-4 border-t border-gray-200">
                    {{ $transactions->links() }}
                </div>
            @endif
        </div>
    </div>
@endsection
