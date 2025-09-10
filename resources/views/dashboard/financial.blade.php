@extends('layouts.dashboard')

@section('title', 'MoneyMate - Financial Report')
@section('page-title', 'Financial Report')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold leading-tight text-gray-900">Financial Report</h1>
        <p class="mt-2 text-sm text-gray-600">Comprehensive overview of your financial performance</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total Balance -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500">
                            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Current Balance</dt>
                            <dd class="text-lg font-semibold text-gray-900">{{ auth()->user()->currency }} {{ number_format(auth()->user()->balance, 2) }}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Income -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076M21.75 18L18 14.25l-4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                            <dd class="text-lg font-semibold text-green-600">{{ auth()->user()->currency }} {{ number_format($totalIncome, 2) }}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Expenses -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-red-500">
                            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                            <dd class="text-lg font-semibold text-red-600">{{ auth()->user()->currency }} {{ number_format($totalExpense, 2) }}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <!-- Net Amount -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Net Amount</dt>
                            <dd class="text-lg font-semibold {{ ($totalIncome - $totalExpense) >= 0 ? 'text-green-600' : 'text-red-600' }}">
                                {{ auth()->user()->currency }} {{ number_format($totalIncome - $totalExpense, 2) }}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts and Analytics -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Income vs Expense Chart -->
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Income vs Expenses</h3>
                <div class="mt-6 flex justify-center">
                    <div class="flex flex-col items-center space-y-4">
                        <!-- Simple visual representation -->
                        <div class="w-64 h-64 relative">
                            @php
                                $total = $totalIncome + $totalExpense;
                                $incomePercentage = $total > 0 ? ($totalIncome / $total) * 100 : 50;
                                $expensePercentage = $total > 0 ? ($totalExpense / $total) * 100 : 50;
                            @endphp

                            <!-- Donut Chart Simulation -->
                            <div class="w-full h-full rounded-full border-8 relative flex items-center justify-center" style="border-color: #10b981 #ef4444 #10b981 #ef4444;">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-gray-900">{{ $totalIncome + $totalExpense > 0 ? number_format($incomePercentage, 1) : '0' }}%</div>
                                    <div class="text-sm text-gray-500">Income</div>
                                </div>
                            </div>
                        </div>

                        <div class="flex space-x-6">
                            <div class="flex items-center">
                                <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                <div class="text-sm">
                                    <div class="font-medium text-gray-900">Income</div>
                                    <div class="text-gray-500">{{ auth()->user()->currency }} {{ number_format($totalIncome, 2) }}</div>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                <div class="text-sm">
                                    <div class="font-medium text-gray-900">Expenses</div>
                                    <div class="text-gray-500">{{ auth()->user()->currency }} {{ number_format($totalExpense, 2) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Spending by Category -->
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Spending by Category</h3>

                @if($spendingByCategory->count() > 0)
                    <div class="mt-6 space-y-4">
                        @foreach($spendingByCategory as $index => $spending)
                            @php
                                $colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                                $color = $colors[$index % count($colors)];
                                $percentage = $totalExpense > 0 ? ($spending->total_balance / $totalExpense) * 100 : 0;
                            @endphp
                            <div>
                                <div class="flex items-center justify-between text-sm">
                                    <div class="flex items-center">
                                        <div class="w-3 h-3 {{ $color }} rounded-full mr-3"></div>
                                        <span class="font-medium text-gray-900">{{ $spending->category }}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-gray-500">{{ number_format($percentage, 1) }}%</span>
                                        <span class="font-semibold text-gray-900">{{ auth()->user()->currency }} {{ number_format($spending->total_balance, 2) }}</span>
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="{{ $color }} h-2 rounded-full" style="width: {{ $percentage }}%"></div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="mt-6 text-center">
                        <div class="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                        </div>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No expense data</h3>
                        <p class="mt-1 text-sm text-gray-500">Add some expenses to see category breakdown.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Recent Financial Activity -->
    <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Financial Activity</h3>
                <a href="{{ route('transactions.index') }}" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all transactions</a>
            </div>

            @if($recentTransactions->count() > 0)
                <div class="mt-6 flow-root">
                    <ul role="list" class="-my-5 divide-y divide-gray-200">
                        @foreach($recentTransactions as $transaction)
                        <li class="py-4">
                            <div class="flex items-center space-x-4">
                                <div class="flex-shrink-0">
                                    <div class="h-8 w-8 rounded-full {{ $transaction->type == 'income' ? 'bg-green-100' : 'bg-red-100' }} flex items-center justify-center">
                                        @if($transaction->type == 'income')
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
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 truncate">{{ $transaction->category }}</p>
                                            <p class="text-sm text-gray-500 truncate">{{ $transaction->description ?? 'No description' }} • {{ $transaction->transaction_date->format('M d, Y') }}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-sm font-semibold {{ $transaction->type == 'income' ? 'text-green-600' : 'text-red-600' }}">
                                                {{ $transaction->type == 'income' ? '+' : '-' }}{{ auth()->user()->currency }} {{ number_format($transaction->balance, 2) }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        @endforeach
                    </ul>
                </div>
            @else
                <div class="mt-6 text-center">
                    <div class="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by adding your first transaction.</p>
                    <div class="mt-6">
                        <a href="{{ route('transactions.create') }}" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Transaction
                        </a>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- Monthly Summary -->
    <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Monthly Summary</h3>

            @if($monthlyData->count() > 0)
                <div class="mt-6 overflow-hidden">
                    <div class="flow-root">
                        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table class="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Month</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Income</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expenses</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Net Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        @foreach($monthlyData as $month)
                                        <tr>
                                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                {{ $month->month_year }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-green-600 font-semibold">
                                                {{ auth()->user()->currency }} {{ number_format($month->total_income, 2) }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-red-600 font-semibold">
                                                {{ auth()->user()->currency }} {{ number_format($month->total_expense, 2) }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold {{ ($month->total_income - $month->total_expense) >= 0 ? 'text-green-600' : 'text-red-600' }}">
                                                {{ auth()->user()->currency }} {{ number_format($month->total_income - $month->total_expense, 2) }}
                                            </td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            @else
                <div class="mt-6 text-center">
                    <div class="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No monthly data</h3>
                    <p class="mt-1 text-sm text-gray-500">Add transactions to see monthly breakdown.</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
