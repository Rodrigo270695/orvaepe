<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->validateCsrfTokens(except: [
            'webhooks/mercadopago',
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, Request $request) {
            // En modo debug dejamos que Laravel renderice la excepción completa.
            if (config('app.debug')) {
                return null;
            }

            if ($request->expectsJson()) {
                return null;
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $handledStatuses = [403, 404, 500];

            if (! in_array($status, $handledStatuses, true)) {
                return null;
            }

            return Inertia::render("errors/{$status}")
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Mantenimiento de trabajos fallidos (tabla failed_jobs). Ajusta la frecuencia si lo necesitas.
        $schedule->command('queue:prune-failed')->daily();
        $schedule->command('alerts:expiring-access')->dailyAt('09:00');

        // Añade aquí más tareas programadas (backups, reportes, etc.).
        // El worker de colas no va aquí: debe ejecutarse con Supervisor (ver deploy/supervisor/).
    })
    ->create();
