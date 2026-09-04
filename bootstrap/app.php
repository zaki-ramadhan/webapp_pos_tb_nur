<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(fn () => route('dashboard'));

        $middleware->web(append: [
            HandleInertiaRequests::class,
            \App\Http\Middleware\SecureHeaders::class,
            \App\Http\Middleware\SanitizeRequestInput::class,
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\SanitizeRequestInput::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isBackendApi = static fn (Request $request): bool => $request->is('api/*');
        $friendlyErrorStatuses = [400, 401, 403, 404, 405, 409, 419, 429, 500, 503];

        $exceptions->render(function (ValidationException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Data yang dimasukkan tidak valid atau belum lengkap.',
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Sesi login Anda telah berakhir. Silakan login kembali.',
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => $exception->getMessage() ?: 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.',
            ], 403);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Data yang diminta tidak ditemukan.',
            ], 404);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            $status = $exception->getStatusCode();
            $defaultMessage = match ($status) {
                403 => 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.',
                404 => 'Data atau halaman yang diminta tidak ditemukan.',
                419 => 'Sesi Anda telah kedaluwarsa. Silakan muat ulang halaman.',
                429 => 'Terlalu banyak permintaan. Mohon tunggu beberapa saat sebelum mencoba kembali.',
                default => $exception->getMessage() ?: 'Permintaan tidak dapat diproses.',
            };

            return response()->json([
                'message' => $defaultMessage,
            ], $status);
        });

        $exceptions->render(function (QueryException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Data tidak dapat disimpan karena masih terhubung dengan data lain atau nomor dokumen sudah digunakan.',
            ], 409);
        });

        $exceptions->render(function (\Throwable $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            \Illuminate\Support\Facades\Log::error('Backend API Throwable: ' . $exception->getMessage(), [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'message' => config('app.debug') ? $exception->getMessage() : 'Terjadi kendala pada sistem. Silakan coba beberapa saat lagi.',
            ], 500);
        });

        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) use ($isBackendApi, $friendlyErrorStatuses) {
            if ($isBackendApi($request) || $request->expectsJson()) {
                return $response;
            }

            $status = $response->getStatusCode();

            if (! in_array($status, $friendlyErrorStatuses, true)) {
                return $response;
            }

            return Inertia::render('ErrorPage', [
                'status' => $status,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
