<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GuestController as AdminGuestController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\TableController as AdminTableController;
use App\Http\Controllers\GuestInvitationController;
use App\Http\Controllers\RsvpController;
use App\Models\Setting;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome', [
        'showKidsMessage' => Setting::flag('show_kids_message'),
    ]);
});

Route::middleware('guest')->group(function () {
    Route::get('/admin/getin', [AuthController::class, 'show'])->name('admin.login');
    Route::post('/admin/getin', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/admin/api/guests', [AdminGuestController::class, 'index']);
    Route::post('/admin/api/guests', [AdminGuestController::class, 'store']);
    Route::post('/admin/api/guests/bulk', [AdminGuestController::class, 'bulkStore']);
    Route::get('/admin/api/guests-export', [AdminGuestController::class, 'export']);
    Route::patch('/admin/api/guests/{guest:id}', [AdminGuestController::class, 'update']);
    Route::delete('/admin/api/guests/{guest:id}', [AdminGuestController::class, 'destroy']);

    Route::get('/admin/api/settings', [AdminSettingController::class, 'index']);
    Route::patch('/admin/api/settings', [AdminSettingController::class, 'update']);

    Route::get('/admin/api/tables', [AdminTableController::class, 'index']);
    Route::post('/admin/api/tables', [AdminTableController::class, 'store']);
    Route::patch('/admin/api/tables/seating', [AdminTableController::class, 'seat']);
    Route::get('/admin/api/tables-export', [AdminTableController::class, 'export']);
    Route::patch('/admin/api/tables/{table}', [AdminTableController::class, 'update']);
    Route::delete('/admin/api/tables/{table}', [AdminTableController::class, 'destroy']);
});

Route::post('/rsvp/{guest:slug}', [RsvpController::class, 'store'])->name('rsvp.store');

Route::get('/{guest:slug}', [GuestInvitationController::class, 'show'])->name('guest.show');
