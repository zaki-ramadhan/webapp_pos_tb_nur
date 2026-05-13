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

Route::middleware('guest')->group(function (): void {
    Route::get('/', HomeController::class)->name('home');
    Route::get('/auth/google', [GoogleLoginController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleLoginController::class, 'callback'])->name('auth.google.callback');
    Route::post('/login', LoginController::class)->name('login.store');
    Route::post('/forgot-password', ForgotPasswordLinkController::class)->name('password.email');
    Route::get('/register', RegisterController::class)->name('register');
    Route::post('/register', RegisterUserController::class)->name('register.store');
    Route::get('/reset-password/{token}', ResetPasswordController::class)->name('password.reset');
    Route::post('/reset-password', UpdatePasswordController::class)->name('password.update');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard/{sample?}', DashboardController::class)->name('dashboard');
    Route::post('/logout', LogoutController::class)->name('logout');
});
