<?php

use App\Http\Controllers\InterviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/dashboard', function () {
    $role = auth()->user()->role->code;

    return match ($role) {
        'admin' => redirect()->route('admin.dashboard'),
        'koordinator' => redirect()->route('koordinator.dashboard'),
        'surveyor' => redirect()->route('surveyor.dashboard'),
        default => abort(403, 'Unauthorized access'),
    };
})->middleware('auth')->name('dashboard');

// Admin Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard Admin
    Route::get('/dashboard', fn() => Inertia::render('Dashboard/Admin'))->name('dashboard');

    // Users Management
    Route::prefix('users')->name('users.')->group(function () {

        // List users
        Route::get('/', [UserManagementController::class, 'index'])->name('index');

        // Create user
        Route::post('/', [UserManagementController::class, 'store'])->name('store');

        // Update user
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');

        Route::post('/{user}/reset-password', [UserManagementController::class, 'sendResetPassword'])->name('reset-password');

        // Activate/deactivate user
        Route::put('/{user}/toggle', [UserManagementController::class, 'toggleStatus'])->name('toggle');

        // Soft Delete
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
    });
});

// Koordinator Routes
Route::middleware(['auth', 'role:koordinator'])->prefix('koordinator')->name('koordinator.')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard/Koordinator'))->name('dashboard');
});

// Surveyor Routes
Route::middleware(['auth', 'role:surveyor'])->prefix('surveyor')->name('surveyor.')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard/Surveyor'))->name('dashboard');
    Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');
    Route::get('/interviews/create', [InterviewController::class, 'create'])->name('interviews.create');
});

// Profile Routes (Shared for all authenticated users)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
