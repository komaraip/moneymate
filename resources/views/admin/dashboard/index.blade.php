@extends('layouts.admin')

@section('title', 'Admin Dashboard - MoneyMate')
@section('page-title', 'Dashboard')

@section('content')
<div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100">
                    <i class="fas fa-users text-blue-600 text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Users</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_users'] }}</p>
                </div>
            </div>
        </div>

        <!-- Total Admins -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-red-100">
                    <i class="fas fa-user-shield text-red-600 text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Admins</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_admins'] }}</p>
                </div>
            </div>
        </div>

        <!-- Total Transactions -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100">
                    <i class="fas fa-exchange-alt text-green-600 text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_transactions'] }}</p>
                </div>
            </div>
        </div>

        <!-- Total Currencies -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100">
                    <i class="fas fa-coins text-yellow-600 text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Currencies</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_currencies'] }}</p>
                </div>
            </div>
        </div>

        <!-- Income Categories -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-emerald-100">
                    <i class="fas fa-arrow-up text-emerald-600 text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Income Categories</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_income_categories'] }}</p>
                </div>
            </div>
        </div>

        <!-- Outcome Categories -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-rose-100">
                    <i class="fas fa-arrow-down text-rose-600 text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Outcome Categories</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_outcome_categories'] }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Users -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Recent Users</h3>
            </div>
            <div class="p-6">
                @if($recent_users->count() > 0)
                    <div class="space-y-4">
                        @foreach($recent_users as $user)
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-medium">
                                        {{ substr($user->name, 0, 1) }}
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm font-medium text-gray-900">{{ $user->name }}</p>
                                        <p class="text-sm text-gray-500">{{ $user->email }}</p>
                                    </div>
                                </div>
                                <div class="text-sm text-gray-500">
                                    {{ $user->created_at->diffForHumans() }}
                                </div>
                            </div>
                        @endforeach
                    </div>
                    <div class="mt-6">
                        <a href="{{ route('admin.users.index') }}" class="text-[#efa13c] hover:text-[#d68a2e] font-medium text-sm">
                            View all users →
                        </a>
                    </div>
                @else
                    <p class="text-gray-500 text-sm">No users found.</p>
                @endif
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>
            <div class="p-6">
                @if($recent_transactions->count() > 0)
                    <div class="space-y-4">
                        @foreach($recent_transactions as $transaction)
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 rounded-full {{ $transaction->type === 'income' ? 'bg-green-100' : 'bg-red-100' }} flex items-center justify-center">
                                        <i class="fas {{ $transaction->type === 'income' ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600' }}"></i>
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm font-medium text-gray-900">{{ $transaction->category }}</p>
                                        <p class="text-sm text-gray-500">{{ $transaction->user->name }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-medium {{ $transaction->type === 'income' ? 'text-green-600' : 'text-red-600' }}">
                                        {{ $transaction->type === 'income' ? '+' : '-' }}{{ $transaction->user->currency }} {{ number_format($transaction->balance, 2) }}
                                    </p>
                                    <p class="text-sm text-gray-500">{{ $transaction->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-gray-500 text-sm">No transactions found.</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
