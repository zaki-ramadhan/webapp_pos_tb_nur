<?php

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ForgotPasswordLinkController;
use App\Http\Controllers\Web\GoogleLoginController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\LoginController;
use App\Http\Controllers\Web\LogoutController;
use App\Http\Controllers\Web\RegisterController;
use App\Http\Controllers\Web\RegisterUserController;
use App\Http\Controllers\Web\ResetPasswordController;
use App\Http\Controllers\Web\UpdatePasswordController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::get('/auth/google', [GoogleLoginController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleLoginController::class, 'callback'])->name('auth.google.callback');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', HomeController::class)->name('login');
    Route::post('/login', LoginController::class)->name('login.store')->middleware('throttle:5,1');
    Route::post('/forgot-password', ForgotPasswordLinkController::class)->name('password.email')->middleware('throttle:5,1');
    Route::get('/register', RegisterController::class)->name('register');
    Route::post('/register', RegisterUserController::class)->name('register.store')->middleware('throttle:10,1');
    Route::get('/reset-password/{token}', ResetPasswordController::class)->name('password.reset');
    Route::post('/reset-password', UpdatePasswordController::class)->name('password.update')->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard/{sample?}', DashboardController::class)->name('dashboard');
    Route::post('/logout', LogoutController::class)->name('logout');
    Route::get('/{sample}', DashboardController::class)
        ->whereIn('sample', collect(\App\Support\Presentation\PosBlueprint::navigationModules())
            ->flatMap(fn ($module) => collect($module['items'])->pluck('id'))
            ->all());
});
