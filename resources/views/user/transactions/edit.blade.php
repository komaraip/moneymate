@extends('layouts.user')

@section('title', 'MoneyMate - Edit Transaction')
@section('page-title', 'Edit Transaction')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold leading-tight text-gray-900">Edit Transaction</h1>
            <p class="mt-2 text-sm text-gray-600">Update the transaction details</p>
        </div>
        <div class="flex space-x-3">
            <a href="{{ route('user.transactions.show', $transaction) }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View Transaction
            </a>
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
                <form method="POST" action="{{ route('user.transactions.update', $transaction) }}" class="space-y-6">
                    @csrf
                    @method('PUT')

                    <!-- Transaction Type -->
                    <div>
                        <fieldset>
                            <legend class="text-sm font-medium text-gray-900">Transaction Type</legend>
                            <div class="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                <div class="flex items-center">
                                    <input id="type_income" name="type" type="radio" value="income" {{ old('type', $transaction->type) == 'income' ? 'checked' : '' }} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
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
                                    <input id="type_expense" name="type" type="radio" value="expense" {{ old('type', $transaction->type) == 'expense' ? 'checked' : '' }} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
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
                                <input type="number" name="balance" id="balance" step="0.01" min="0.01" value="{{ old('balance', $transaction->balance) }}" required class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm rounded-md {{ $errors->has('balance') ? 'border-red-300' : 'border-gray-300' }}" placeholder="0.00">
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
                                    <optgroup label="Income Categories" id="income-categories" style="display: {{ $transaction->type == 'income' ? 'block' : 'none' }};">
                                        @foreach($incomeCategories as $category)
                                            <option value="{{ $category->id }}" {{ old('category', $transaction->category) == $category->id ? 'selected' : '' }}>
                                                {{ $category->name }}
                                            </option>
                                        @endforeach
                                    </optgroup>
                                    <optgroup label="Expense Categories" id="expense-categories" style="display: {{ $transaction->type == 'expense' ? 'block' : 'none' }};">
                                        @foreach($outcomeCategories as $category)
                                            <option value="{{ $category->id }}" {{ old('category', $transaction->category) == $category->id ? 'selected' : '' }}>
                                                {{ $category->name }}
                                            </option>
                                        @endforeach
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
                                <input type="date" name="transaction_date" id="transaction_date" value="{{ old('transaction_date', $transaction->transaction_date->format('Y-m-d')) }}" required class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md {{ $errors->has('transaction_date') ? 'border-red-300' : 'border-gray-300' }}">
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
                            <textarea name="description" id="description" rows="3" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border rounded-md {{ $errors->has('description') ? 'border-red-300' : 'border-gray-300' }}" placeholder="Optional description for this transaction...">{{ old('description', $transaction->description) }}</textarea>
                        </div>
                        <p class="mt-2 text-sm text-gray-500">Add any additional notes or details about this transaction.</p>
                        @error('description')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <a href="{{ route('user.transactions.show', $transaction) }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </a>
                        <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Update Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function updateCategoryOptions(type) {
    const incomeCategories = document.getElementById('income-categories');
    const expenseCategories = document.getElementById('expense-categories');
    const categorySelect = document.getElementById('category');

    // Reset category selection if changing types
    if ((type === 'income' && expenseCategories.style.display !== 'none') ||
        (type === 'expense' && incomeCategories.style.display !== 'none')) {
        categorySelect.value = '';
    }

    if (type === 'income') {
        incomeCategories.style.display = 'block';
        expenseCategories.style.display = 'none';
    } else if (type === 'expense') {
        incomeCategories.style.display = 'none';
        expenseCategories.style.display = 'block';
    } else {
        incomeCategories.style.display = 'none';
        expenseCategories.style.display = 'none';
    }
}

// Add event listeners for transaction type radio buttons
document.addEventListener('DOMContentLoaded', function() {
    const typeRadios = document.querySelectorAll('input[name="type"]');
    typeRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            updateCategoryOptions(this.value);
        });
    });

    // Initialize based on current selection
    const checkedType = document.querySelector('input[name="type"]:checked');
    if (checkedType) {
        updateCategoryOptions(checkedType.value);
    }
});
</script>
@endsection
