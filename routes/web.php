<?php

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/register', RegisterController::class)->name('register');
Route::get('/dashboard/{sample?}', DashboardController::class)->name('dashboard');
