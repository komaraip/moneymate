<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::where('role', 'user')
                    ->withCount('transactions')
                    ->latest()
                    ->paginate(15);

        return view('admin.users.index', compact('users'));
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load('transactions');
        $recentTransactions = $user->transactions()
                                  ->latest()
                                  ->take(10)
                                  ->get();

        $totalIncome = $user->transactions()
                           ->where('type', 'income')
                           ->sum('balance');

        $totalOutcome = $user->transactions()
                            ->where('type', 'expense')
                            ->sum('balance');

        return view('admin.users.show', compact('user', 'recentTransactions', 'totalIncome', 'totalOutcome'));
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return redirect()->route('admin.users.index')
                           ->with('error', 'Cannot delete admin users.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
                       ->with('success', 'User deleted successfully.');
    }

    /**
     * Display user's transactions.
     */
    public function transactions(User $user)
    {
        $transactions = $user->transactions()
                            ->with(['incomeCategory', 'outcomeCategory'])
                            ->latest()
                            ->paginate(20);

        return view('admin.users.transactions', compact('user', 'transactions'));
    }
}
