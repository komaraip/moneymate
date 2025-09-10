@extends('layouts.dashboard')

@section('title', 'MoneyMate - Add Transaction')
@section('page-title', 'Add New Transaction')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold leading-tight text-gray-900">Add New Transaction</h1>
            <p class="mt-2 text-sm text-gray-600">Record a new income or expense transaction</p>
        </div>
        <div>
            <a href="{{ route('transactions.index') }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Back to Transactions
            </a>
        </div>
    </div>

    <!-- Form -->
    <div class="max-w-3xl">
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
                <form method="POST" action="{{ route('transactions.store') }}" class="space-y-6">
                    @csrf

                    <!-- Transaction Type -->
                    <div>
                        <fieldset>
                            <legend class="text-sm font-medium text-gray-900">Transaction Type</legend>
                            <div class="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                <div class="flex items-center">
                                    <input id="type_income" name="type" type="radio" value="income" {{ old('type', 'income') == 'income' ? 'checked' : '' }} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                                    <label for="type_income" class="ml-3 block text-sm font-medium text-gray-700">
                                        <span class="flex items-center">
                                            <svg class="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076M21.75 18L18 14.25l-4.306 4.307a11.95 11.95 0 010 5.814m3.444.183c.149-1.018.149-2.058 0-3.076" />
                                            </svg>
                                            Income
                                        </span>
                                    </label>
                                </div>
                                <div class="flex items-center">
                                    <input id="type_expense" name="type" type="radio" value="expense" {{ old('type') == 'expense' ? 'checked' : '' }} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                                    <label for="type_expense" class="ml-3 block text-sm font-medium text-gray-700">
                                        <span class="flex items-center">
                                            <svg class="mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
                                            </svg>
                                            Expense
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                        @error('type')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <!-- Amount -->
                        <div>
                            <label for="balance" class="block text-sm font-medium text-gray-700">Amount</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">{{ auth()->user()->currency }}</span>
                                </div>
                                <input type="number" name="balance" id="balance" step="0.01" min="0.01" value="{{ old('balance') }}" required class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm rounded-md {{ $errors->has('balance') ? 'border-red-300' : 'border-gray-300' }}" placeholder="0.00">
                            </div>
                            @error('balance')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Category -->
                        <div>
                            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                            <div class="mt-1">
                                <select name="category" id="category" required class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {{ $errors->has('category') ? 'border-red-300' : 'border-gray-300' }}">
                                    <option value="">Select a category</option>
                                    <optgroup label="Income Categories">
                                        <option value="Salary" {{ old('category') == 'Salary' ? 'selected' : '' }}>Salary</option>
                                        <option value="Freelance" {{ old('category') == 'Freelance' ? 'selected' : '' }}>Freelance</option>
                                        <option value="Business" {{ old('category') == 'Business' ? 'selected' : '' }}>Business</option>
                                        <option value="Investment" {{ old('category') == 'Investment' ? 'selected' : '' }}>Investment</option>
                                        <option value="Gift" {{ old('category') == 'Gift' ? 'selected' : '' }}>Gift</option>
                                        <option value="Other Income" {{ old('category') == 'Other Income' ? 'selected' : '' }}>Other Income</option>
                                    </optgroup>
                                    <optgroup label="Expense Categories">
                                        <option value="Food & Dining" {{ old('category') == 'Food & Dining' ? 'selected' : '' }}>Food & Dining</option>
                                        <option value="Transportation" {{ old('category') == 'Transportation' ? 'selected' : '' }}>Transportation</option>
                                        <option value="Shopping" {{ old('category') == 'Shopping' ? 'selected' : '' }}>Shopping</option>
                                        <option value="Entertainment" {{ old('category') == 'Entertainment' ? 'selected' : '' }}>Entertainment</option>
                                        <option value="Bills & Utilities" {{ old('category') == 'Bills & Utilities' ? 'selected' : '' }}>Bills & Utilities</option>
                                        <option value="Healthcare" {{ old('category') == 'Healthcare' ? 'selected' : '' }}>Healthcare</option>
                                        <option value="Education" {{ old('category') == 'Education' ? 'selected' : '' }}>Education</option>
                                        <option value="Travel" {{ old('category') == 'Travel' ? 'selected' : '' }}>Travel</option>
                                        <option value="Personal Care" {{ old('category') == 'Personal Care' ? 'selected' : '' }}>Personal Care</option>
                                        <option value="Housing" {{ old('category') == 'Housing' ? 'selected' : '' }}>Housing</option>
                                        <option value="Insurance" {{ old('category') == 'Insurance' ? 'selected' : '' }}>Insurance</option>
                                        <option value="Other Expense" {{ old('category') == 'Other Expense' ? 'selected' : '' }}>Other Expense</option>
                                    </optgroup>
                                </select>
                            </div>
                            @error('category')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Date -->
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="transaction_date" class="block text-sm font-medium text-gray-700">Transaction Date</label>
                            <div class="mt-1">
                                <input type="date" name="transaction_date" id="transaction_date" value="{{ old('transaction_date', date('Y-m-d')) }}" required class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md {{ $errors->has('transaction_date') ? 'border-red-300' : 'border-gray-300' }}">
                            </div>
                            @error('transaction_date')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                        <div class="mt-1">
                            <textarea name="description" id="description" rows="3" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border rounded-md {{ $errors->has('description') ? 'border-red-300' : 'border-gray-300' }}" placeholder="Optional description for this transaction...">{{ old('description') }}</textarea>
                        </div>
                        <p class="mt-2 text-sm text-gray-500">Add any additional notes or details about this transaction.</p>
                        @error('description')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <a href="{{ route('transactions.index') }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </a>
                        <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Save Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Quick Add Suggestions -->
    <div class="max-w-3xl">
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Quick Add Suggestions</h3>
                <p class="mt-1 text-sm text-gray-500">Click on any of these common transactions to pre-fill the form.</p>

                <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <!-- Common Income -->
                    <div class="border border-green-200 rounded-lg p-4 hover:bg-green-50 cursor-pointer" onclick="fillQuickTransaction('income', 'Salary', '')">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Monthly Salary</p>
                                <p class="text-sm text-gray-500">Income • Salary</p>
                            </div>
                        </div>
                    </div>

                    <!-- Common Expenses -->
                    <div class="border border-red-200 rounded-lg p-4 hover:bg-red-50 cursor-pointer" onclick="fillQuickTransaction('expense', 'Food & Dining', 'Lunch')">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Food & Dining</p>
                                <p class="text-sm text-gray-500">Expense • Lunch</p>
                            </div>
                        </div>
                    </div>

                    <div class="border border-red-200 rounded-lg p-4 hover:bg-red-50 cursor-pointer" onclick="fillQuickTransaction('expense', 'Transportation', 'Gas')">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v9.75zM3.75 12h.007v.008H3.75V12zm6.75 0h.008v.008h-.008V12zm5.25 0h.008v.008h-.008V12z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Transportation</p>
                                <p class="text-sm text-gray-500">Expense • Gas</p>
                            </div>
                        </div>
                    </div>

                    <div class="border border-red-200 rounded-lg p-4 hover:bg-red-50 cursor-pointer" onclick="fillQuickTransaction('expense', 'Shopping', 'Groceries')">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Shopping</p>
                                <p class="text-sm text-gray-500">Expense • Groceries</p>
                            </div>
                        </div>
                    </div>

                    <div class="border border-red-200 rounded-lg p-4 hover:bg-red-50 cursor-pointer" onclick="fillQuickTransaction('expense', 'Bills & Utilities', 'Electricity Bill')">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Bills & Utilities</p>
                                <p class="text-sm text-gray-500">Expense • Electricity</p>
                            </div>
                        </div>
                    </div>

                    <div class="border border-red-200 rounded-lg p-4 hover:bg-red-50 cursor-pointer" onclick="fillQuickTransaction('expense', 'Entertainment', 'Movie')">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 0A2.25 2.25 0 015.625 3.375h4.5c.621 0 1.125.504 1.125 1.125v2.25m-9.75 0V8.25m0 0h7.5m-7.5 0a1.5 1.5 0 001.5-1.5m0 0c0-.621.504-1.125 1.125-1.125h4.5a1.5 1.5 0 001.5 1.5m0 0v3.75m0 0h7.5m-7.5 0a1.5 1.5 0 001.5 1.5m0 0c.621 0 1.125.504 1.125 1.125v2.25m-7.5 0h7.5" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Entertainment</p>
                                <p class="text-sm text-gray-500">Expense • Movie</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function fillQuickTransaction(type, category, description) {
    // Set transaction type
    document.querySelector(`input[name="type"][value="${type}"]`).checked = true;

    // Set category
    document.getElementById('category').value = category;

    // Set description if provided
    if (description) {
        document.getElementById('description').value = description;
    }

    // Focus on amount input
    document.getElementById('balance').focus();
}
</script>
@endsection
