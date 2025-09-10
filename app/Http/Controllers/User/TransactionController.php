<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\IncomeCategory;
use App\Models\OutcomeCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = $user->transactions();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('category', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->paginate(15);

        // Get categories for filter dropdown
        $categories = $user->transactions()
            ->select('category')
            ->distinct()
            ->pluck('category')
            ->sort();

        // Calculate totals
        $totalIncome = $user->transactions()
            ->where('type', 'income')
            ->sum('balance');

        $totalExpenses = $user->transactions()
            ->where('type', 'expense')
            ->sum('balance');

        return view('user.transactions.index', compact(
            'transactions',
            'categories',
            'totalIncome',
            'totalExpenses'
        ));
    }

    /**
     * Show the form for creating a new transaction.
     */
    public function create()
    {
        $incomeCategories = IncomeCategory::active()->get();
        $outcomeCategories = OutcomeCategory::active()->get();

        return view('user.transactions.create', compact('incomeCategories', 'outcomeCategories'));
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:income,expense',
            'transaction_date' => 'required|date',
        ]);

        $user = Auth::user();

        $transaction = $user->transactions()->create($request->all());

        // Update user balance
        if ($request->type === 'income') {
            $user->increment('balance', $request->balance);
        } else {
            $user->decrement('balance', $request->balance);
        }

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction added successfully!');
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction)
    {
        // Ensure user can only view their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        // Get related transactions (same category and type)
        $relatedTransactions = Auth::user()->transactions()
            ->where('category', $transaction->category)
            ->where('type', $transaction->type)
            ->where('id', '!=', $transaction->id)
            ->orderBy('transaction_date', 'desc')
            ->take(5)
            ->get();

        return view('user.transactions.show', compact('transaction', 'relatedTransactions'));
    }

    /**
     * Show the form for editing the specified transaction.
     */
    public function edit(Transaction $transaction)
    {
        // Ensure user can only edit their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $incomeCategories = IncomeCategory::active()->get();
        $outcomeCategories = OutcomeCategory::active()->get();

        return view('user.transactions.edit', compact('transaction', 'incomeCategories', 'outcomeCategories'));
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        // Ensure user can only update their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'category' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:income,expense',
            'transaction_date' => 'required|date',
        ]);

        $user = Auth::user();

        // Revert the old transaction from balance
        if ($transaction->type === 'income') {
            $user->decrement('balance', $transaction->balance);
        } else {
            $user->increment('balance', $transaction->balance);
        }

        // Update transaction
        $transaction->update($request->all());

        // Apply the new transaction to balance
        if ($request->type === 'income') {
            $user->increment('balance', $request->balance);
        } else {
            $user->decrement('balance', $request->balance);
        }

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction updated successfully!');
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(Transaction $transaction)
    {
        // Ensure user can only delete their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $user = Auth::user();

        // Revert the transaction from balance
        if ($transaction->type === 'income') {
            $user->decrement('balance', $transaction->balance);
        } else {
            $user->increment('balance', $transaction->balance);
        }

        $transaction->delete();

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction deleted successfully!');
    }
}
