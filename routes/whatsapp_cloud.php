<?php

use App\Http\Controllers\WhatsAppCloud\InternalOptinController;
use App\Http\Controllers\WhatsAppCloud\InternalSendController;
use App\Http\Controllers\WhatsAppCloud\WebhookController;
use App\Http\Middleware\AuthenticateInternalProduct;
use Illuminate\Support\Facades\Route;

/*
| WhatsApp Cloud API (Meta). Grupo "api": sin sesión, sin CSRF y sin auditoría HTTP
| (AuditHttpRequests guardaría el cuerpo de los mensajes).
*/

Route::get('/webhooks/whatsapp', [WebhookController::class, 'verify'])
    ->name('webhooks.whatsapp.verify');

Route::post('/webhooks/whatsapp', [WebhookController::class, 'receive'])
    ->name('webhooks.whatsapp');

Route::middleware([AuthenticateInternalProduct::class, 'throttle:300,1'])
    ->prefix('internal/whatsapp')
    ->name('internal.whatsapp.')
    ->group(function () {
        Route::post('send', InternalSendController::class)->name('send');
        Route::post('optins', [InternalOptinController::class, 'store'])->name('optins.store');
        Route::delete('optins', [InternalOptinController::class, 'destroy'])->name('optins.destroy');
    });
