<?php

use Illuminate\Support\Facades\Route;

// Home page
Route::get('/', function () {
    return view('home');
})->name('home');

// Include route files
require __DIR__.'/auth.php';
require __DIR__.'/user.php';
require __DIR__.'/admin.php';

// Legacy route redirects for backward compatibility
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('user.dashboard');
    })->name('dashboard');

    Route::get('/dashboard/financial', function () {
        return redirect()->route('user.dashboard.financial');
    })->name('dashboard.financial');

    Route::get('/dashboard/account', function () {
        return redirect()->route('user.dashboard.account');
    })->name('dashboard.account');

    Route::get('/transactions', function () {
        return redirect()->route('user.transactions.index');
    })->name('transactions.index');
});
