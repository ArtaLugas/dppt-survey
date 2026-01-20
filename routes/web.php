<?php

use App\Http\Controllers\InterviewController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use PHPUnit\Framework\MockObject\Stub\ReturnArgument;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/dashboard', function () {
    $role = auth()->user()->role->code;

    return match ($role) {
        'admin' => redirect('/admin'),
        'koordinator' => redirect('/koordinator'),
        'surveyor' => redirect('/surveyor'),
        default => abort(403),
    };
})->middleware('auth')->name('dashboard');

Route::middleware(['auth', 'role:admin'])
    ->get('/admin', fn() => Inertia::render('Dashboard/Admin'));

Route::middleware(['auth', 'role:koordinator'])
    ->get('/koordinator', fn() => Inertia::render('Dashboard/Koordinator'));

Route::middleware(['auth', 'role:surveyor'])->group(function () {
    Route::get('/surveyor', fn() => Inertia::render('Dashboard/Surveyor'));
    Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');
    Route::get('/interviews/create', [InterviewController::class, 'create'])->name('interviews.create');

});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
