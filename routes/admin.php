<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\IncomeCategoryController;
use App\Http\Controllers\Admin\OutcomeCategoryController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\CardNameCategoryController;
use App\Http\Controllers\Admin\CountryCategoryController;
use App\Http\Controllers\Admin\CardTypeCategoryController;
use Illuminate\Support\Facades\Route;

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Currency management
    Route::resource('currencies', CurrencyController::class);

    // Income category management
    Route::resource('income-categories', IncomeCategoryController::class);

    // Outcome category management
    Route::resource('outcome-categories', OutcomeCategoryController::class);

    // Card name management (Banks)
    Route::resource('card-names', CardNameCategoryController::class);

    // Country management
    Route::resource('countries', CountryCategoryController::class);

    // Card type management (Visa, Mastercard, etc.)
    Route::resource('card-types', CardTypeCategoryController::class);

    // User management
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserManagementController::class, 'show'])->name('users.show');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    Route::get('/users/{user}/transactions', [UserManagementController::class, 'transactions'])->name('users.transactions');
});
