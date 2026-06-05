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
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(fn () => route('dashboard'));

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isBackendApi = static fn (Request $request): bool => $request->is('api/backend/*');
        $friendlyErrorStatuses = [400, 401, 403, 404, 405, 409, 419, 429, 500, 503];

        $exceptions->render(function (ValidationException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Authentication is required for this request.',
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'You are not allowed to perform this action.',
            ], 403);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Resource not found.',
            ], 404);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => $exception->getStatusCode() === 404 ? 'Resource not found.' : ($exception->getMessage() ?: 'Request failed.'),
            ], $exception->getStatusCode());
        });

        $exceptions->render(function (QueryException $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'The resource could not be persisted because of a database constraint.',
            ], 409);
        });

        $exceptions->render(function (\Throwable $exception, Request $request) use ($isBackendApi) {
            if (! $isBackendApi($request)) {
                return null;
            }

            return response()->json([
                'message' => 'An unexpected server error occurred.',
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
