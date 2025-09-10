<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the dashboard.
     */
    public function index()
    {
        $user = Auth::user();

        // Get user's transactions
        $transactions = $user->transactions()
            ->orderBy('transaction_date', 'desc')
            ->take(10)
            ->get();

        // Get spending by category
        $spendingByCategory = $user->transactions()
            ->select('category', DB::raw('SUM(balance) as total_balance'))
            ->where('type', 'expense')
            ->groupBy('category')
            ->get();

        // Calculate total income and expenses
        $totalIncome = $user->transactions()
            ->where('type', 'income')
            ->sum('balance');

        $totalExpense = $user->transactions()
            ->where('type', 'expense')
            ->sum('balance');

        return view('dashboard.index-modern', compact(
            'user',
            'transactions',
            'spendingByCategory',
            'totalIncome',
            'totalExpense'
        ));
    }

    /**
     * Show the financial overview.
     */
    public function financial()
    {
        $user = Auth::user();

        // Get recent transactions
        $recentTransactions = $user->transactions()
            ->orderBy('transaction_date', 'desc')
            ->take(10)
            ->get();

        // Get spending statistics
        $spendingByCategory = $user->transactions()
            ->select('category', DB::raw('SUM(balance) as total_balance'))
            ->where('type', 'expense')
            ->groupBy('category')
            ->get();

        // Calculate totals
        $totalIncome = $user->transactions()
            ->where('type', 'income')
            ->sum('balance');

        $totalExpense = $user->transactions()
            ->where('type', 'expense')
            ->sum('balance');

        // Get monthly data
        $monthlyData = $user->transactions()
            ->select(
                DB::raw('DATE_FORMAT(transaction_date, "%Y-%m") as month_year'),
                DB::raw('SUM(CASE WHEN type = "income" THEN balance ELSE 0 END) as total_income'),
                DB::raw('SUM(CASE WHEN type = "expense" THEN balance ELSE 0 END) as total_expense')
            )
            ->groupBy('month_year')
            ->orderBy('month_year', 'desc')
            ->take(12)
            ->get();

        return view('dashboard.financial-modern', compact(
            'user',
            'recentTransactions',
            'spendingByCategory',
            'totalIncome',
            'totalExpense',
            'monthlyData'
        ));
    }

    /**
     * Show the account settings.
     */
    public function account()
    {
        $user = Auth::user();
        return view('dashboard.account-modern', compact('user'));
    }

    /**
     * Update user account information.
     */
    public function updateAccount(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'currency' => 'required|string',
            'balance_limit' => 'nullable|numeric|min:0',
        ]);

        $user->update($request->only([
            'name',
            'email',
            'currency',
            'balance_limit'
        ]));

        return back()->with('success', 'Account updated successfully!');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Check if current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return back()->with('success', 'Password updated successfully!');
    }

    /**
     * Delete all user transactions.
     */
    public function deleteAllTransactions()
    {
        $user = Auth::user();

        // Delete all transactions for the current user
        $deletedCount = $user->transactions()->count();
        $user->transactions()->delete();

        return back()->with('success', "Successfully deleted {$deletedCount} transactions.");
    }

    /**
     * Update user profile photo.
     */
    public function updatePhoto(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Delete old profile photo if exists
        if ($user->profile && Storage::disk('public')->exists($user->profile)) {
            Storage::disk('public')->delete($user->profile);
        }

        // Store new profile photo
        $path = $request->file('profile_photo')->store('profile-photos', 'public');

        // Update user profile path
        $user->update(['profile' => $path]);

        return back()->with('success', 'Profile photo updated successfully!');
    }

    /**
     * Remove user profile photo.
     */
    public function removePhoto()
    {
        $user = Auth::user();

        // Delete profile photo file if exists
        if ($user->profile && Storage::disk('public')->exists($user->profile)) {
            Storage::disk('public')->delete($user->profile);
        }

        // Remove profile path from database
        $user->update(['profile' => null]);

        return back()->with('success', 'Profile photo removed successfully!');
    }
}
