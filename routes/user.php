<?php

use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\TransactionController;
use Illuminate\Support\Facades\Route;

// User routes (require authentication)
Route::middleware('auth')->prefix('user')->name('user.')->group(function () {
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/financial', [DashboardController::class, 'financial'])->name('dashboard.financial');
    Route::get('/dashboard/account', [DashboardController::class, 'account'])->name('dashboard.account');
    Route::put('/dashboard/account', [DashboardController::class, 'updateAccount'])->name('dashboard.account.update');
    Route::put('/dashboard/account/password', [DashboardController::class, 'updatePassword'])->name('dashboard.account.password');
    Route::put('/dashboard/account/photo', [DashboardController::class, 'updatePhoto'])->name('dashboard.account.photo');
    Route::delete('/dashboard/account/photo', [DashboardController::class, 'removePhoto'])->name('dashboard.account.photo.remove');
    Route::delete('/dashboard/account/delete-transactions', [DashboardController::class, 'deleteAllTransactions'])->name('dashboard.account.delete-transactions');

    // Transaction routes
    Route::resource('transactions', TransactionController::class);
});
