<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Surveyor\SurveyorDashboardController;
use App\Http\Controllers\Interview\DocumentationPhotoController;
use App\Http\Controllers\Interview\InventoryItemController;
use App\Http\Controllers\Interview\LandDetailController;
use App\Http\Controllers\Interview\ParcelController;
use App\Http\Controllers\Interview\RespondentController;
use App\Http\Controllers\ProfileController;
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

    // Dashboard Surveyor
    // Dashboard Surveyor
    Route::get('/dashboard', SurveyorDashboardController::class)->name('dashboard');

    // Interview Module / Parcel
    Route::prefix('interviews')->name('interviews.')->group(function () {

        Route::get('/', [ParcelController::class, 'index'])->name('index');
        Route::get('/create', [ParcelController::class, 'create'])->name('create');
        Route::post('/', [ParcelController::class, 'store'])->name('store');
        Route::get('/{parcel}/edit', [ParcelController::class, 'edit'])->name('edit');
        Route::put('/{parcel}', [ParcelController::class, 'update'])->name('update');
        Route::post('/{parcel}/submit', [ParcelController::class, 'submit'])->name('submit');
        Route::delete('/{id}', [ParcelController::class, 'destroy'])->name('destroy');

        Route::post('/{parcel}/respondents', [RespondentController::class, 'store'])
            ->name('respondents.store');
        Route::put('/respondents/{respondent}', [RespondentController::class, 'update'])
            ->name('respondents.update');
        Route::delete('/respondents/{respondent}', [RespondentController::class, 'destroy'])
            ->name('respondents.destroy');

        Route::post('/{parcel}/land-details', [LandDetailController::class, 'store'])
            ->name('land-details.store');
        Route::delete('/{parcel}/land-details', [LandDetailController::class, 'destroy'])
            ->name('land-details.destroy');

        Route::post('/{parcel}/inventory-items', [InventoryItemController::class, 'store'])->name('inventory-items.store');
        Route::put('/inventory-items/{inventoryItem}', [InventoryItemController::class, 'update'])->name('inventory-items.update');
        Route::delete('/inventory-items/{inventoryItem}', [InventoryItemController::class, 'destroy'])->name('inventory-items.destroy');

        Route::post('/{parcel}/documentation-photos', [DocumentationPhotoController::class, 'store'])->name('documentation-photos.store');
        Route::delete('/documentation-photos/{photo}', [DocumentationPhotoController::class, 'destroy'])->name('documentation-photos.destroy');
    });
});

// Profile Routes (Shared for all authenticated users)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
