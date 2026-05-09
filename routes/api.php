<?php

use App\Http\Controllers\Api\BackendResourceController;
use Illuminate\Support\Facades\Route;

Route::prefix('backend')->group(function (): void {
    Route::get('/resources', [BackendResourceController::class, 'resources']);
    Route::get('/{resource}', [BackendResourceController::class, 'index']);
    Route::post('/{resource}', [BackendResourceController::class, 'store']);
    Route::get('/{resource}/{record}', [BackendResourceController::class, 'show'])->whereNumber('record');
    Route::match(['put', 'patch'], '/{resource}/{record}', [BackendResourceController::class, 'update'])->whereNumber('record');
    Route::delete('/{resource}/{record}', [BackendResourceController::class, 'destroy'])->whereNumber('record');
});
