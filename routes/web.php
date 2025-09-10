<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

// Home page
Route::get('/', function () {
    return view('home');
})->name('home');

// Authentication routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('auth.login');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login.post');
Route::get('/register', [AuthController::class, 'showRegister'])->name('auth.register');
Route::post('/register', [AuthController::class, 'register'])->name('auth.register.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

// Protected routes (require authentication)
Route::middleware('auth')->group(function () {
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
