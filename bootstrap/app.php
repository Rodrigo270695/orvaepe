<?php

use App\Http\Middleware\AuditHttpRequests;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Spatie\Permission\Middleware\RoleMiddleware;
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
            'webhooks/paypal',
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            AuditHttpRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Respaldo: si storage/logs no es escribible o LOG_CHANNEL no usa single/daily,
        // el error igual queda en el log del sistema (p. ej. journalctl -u php*-fpm).
        $exceptions->reportable(function (Throwable $e): void {
            if ($e instanceof ValidationException) {
                return;
            }

            error_log(sprintf(
                '[ORVAE] %s: %s (%s:%d)',
                $e::class,
                $e->getMessage(),
                $e->getFile(),
                $e->getLine()
            ));

            $path = storage_path('logs/orvae-fallback.log');
            @file_put_contents(
                $path,
                sprintf("[%s] %s\n%s\n\n", now()->toIso8601String(), $e::class, (string) $e),
                FILE_APPEND | LOCK_EX
            );
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            // En modo debug dejamos que Laravel renderice la excepción completa.
            if (config('app.debug')) {
                return null;
            }

            // ValidationException no implementa HttpExceptionInterface; si no la excluimos,
            // el código de abajo asume status 500 y rompe el flujo 422 de Inertia (login, forms, etc.).
            if ($e instanceof ValidationException) {
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

            // Siempre que pintamos la página de error Inertia, dejamos rastro aquí:
            // report() a veces no escribe (LOG_CHANNEL, permisos) y reportable puede no ejecutarse.
            if ($status === 500) {
                $payload = sprintf(
                    "[%s] HTTP 500 (render handler) | %s: %s | %s:%d\n%s\n\n",
                    now()->toIso8601String(),
                    $e::class,
                    $e->getMessage(),
                    $e->getFile(),
                    $e->getLine(),
                    $e->getTraceAsString()
                );
                error_log('[ORVAE render-500] '.$e::class.': '.$e->getMessage().' @ '.$e->getFile().':'.$e->getLine());
                @file_put_contents(storage_path('logs/orvae-fallback.log'), $payload, FILE_APPEND | LOCK_EX);
            }

            try {
                return Inertia::render("errors/{$status}")
                    ->toResponse($request)
                    ->setStatusCode($status);
            } catch (Throwable $nested) {
                error_log(sprintf(
                    '[ORVAE] Fallo al renderizar errors/%s: %s (%s:%d)',
                    $status,
                    $nested::class,
                    $nested->getFile(),
                    $nested->getLine()
                ));

                $title = $status === 500 ? 'Error interno del sistema' : 'Error';

                return response(
                    '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
                    .'<meta name="viewport" content="width=device-width, initial-scale=1">'
                    .'<title>'.e($title).'</title></head><body style="font-family:system-ui;padding:2rem">'
                    .'<h1>'.e($title).'</h1>'
                    .'<p>No se pudo cargar la vista de error completa. Revisa los permisos de <code>storage/logs</code>, '
                    .'el canal <code>LOG_CHANNEL</code> en <code>.env</code> y el log de PHP-FPM.</p>'
                    .'</body></html>',
                    $status
                )->header('Content-Type', 'text/html; charset=UTF-8');
            }
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
