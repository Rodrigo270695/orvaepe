<?php

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

Route::post('/internal/whatsapp/send', InternalSendController::class)
    ->middleware([AuthenticateInternalProduct::class, 'throttle:300,1'])
    ->name('internal.whatsapp.send');
