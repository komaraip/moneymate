<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Currency;
use App\Models\IncomeCategory;
use App\Models\OutcomeCategory;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index()
    {
        $stats = [
            'total_users' => User::users()->count(),
            'total_admins' => User::admins()->count(),
            'total_transactions' => Transaction::count(),
            'total_currencies' => Currency::count(),
            'total_income_categories' => IncomeCategory::count(),
            'total_outcome_categories' => OutcomeCategory::count(),
        ];

        $recent_users = User::users()->latest()->take(5)->get();
        $recent_transactions = Transaction::with('user')->latest()->take(10)->get();

        return view('admin.dashboard.index', compact('stats', 'recent_users', 'recent_transactions'));
    }
}
