<?php

use App\Http\Controllers\Api\BackendResourceController;
use Illuminate\Support\Facades\Route;

Route::prefix('backend')->middleware(['web', 'auth', 'throttle:api'])->group(function (): void {
    Route::post('/attachments/upload', [\App\Http\Controllers\Api\AttachmentUploadController::class, 'upload']);
    Route::post('/currencies/sync', [BackendResourceController::class, 'syncCurrencies']);
    Route::get('/banks', function (): \Illuminate\Http\JsonResponse {
        try {
            $banks = \Illuminate\Support\Facades\Cache::rememberForever('indonesian_banks_list', function (): array {
                // Ambil daftar bank dari API
                $response = \Illuminate\Support\Facades\Http::timeout(10)
                    ->get('https://raw.githubusercontent.com/riod94/list-bank-indonesia/master/bank.json');

                if ($response->successful()) {
                    $data = $response->json();
                    if (is_array($data)) {
                        return array_map(static function (array $item): array {
                            return [
                                'name' => $item['name'] ?? '',
                                'code' => $item['code'] ?? '',
                            ];
                        }, $data);
                    }
                }

                // Daftar bank fallback
                return [
                    ['name' => 'Bank Mandiri', 'code' => '008'],
                    ['name' => 'Bank Central Asia (BCA)', 'code' => '014'],
                    ['name' => 'Bank Rakyat Indonesia (BRI)', 'code' => '002'],
                    ['name' => 'Bank Negara Indonesia (BNI)', 'code' => '009'],
                    ['name' => 'Bank Syariah Indonesia (BSI)', 'code' => '451'],
                    ['name' => 'Bank Tabungan Negara (BTN)', 'code' => '200'],
                    ['name' => 'Bank CIMB Niaga', 'code' => '022'],
                    ['name' => 'Bank Danamon', 'code' => '011'],
                    ['name' => 'Bank Permata', 'code' => '013'],
                    ['name' => 'Bank Maybank Indonesia', 'code' => '016'],
                ];
            });

            return response()->json($banks);
        } catch (\Throwable $e) {
            // Fallback terakhir
            return response()->json([
                ['name' => 'Bank Mandiri', 'code' => '008'],
                ['name' => 'Bank Central Asia (BCA)', 'code' => '014'],
                ['name' => 'Bank Rakyat Indonesia (BRI)', 'code' => '002'],
                ['name' => 'Bank Negara Indonesia (BNI)', 'code' => '009'],
            ]);
        }
    });
    Route::get('/resources', [BackendResourceController::class, 'resources']);
    Route::post('/bank-reconciliations/reconcile', [BackendResourceController::class, 'reconcileDocuments']);
    Route::post('/{resource}/import', [BackendResourceController::class, 'import']);
    Route::get('/{resource}', [BackendResourceController::class, 'index']);
    Route::post('/{resource}', [BackendResourceController::class, 'store']);
    Route::get('/{resource}/{record}', [BackendResourceController::class, 'show'])->whereNumber('record');
    Route::match(['put', 'patch'], '/{resource}/{record}', [BackendResourceController::class, 'update'])->whereNumber('record');
    Route::delete('/{resource}/{record}', [BackendResourceController::class, 'destroy'])->whereNumber('record');
});
