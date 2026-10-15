<?php

use App\Http\Controllers\Integrations\OpenWaLineWebhookController;
use App\Http\Controllers\Integrations\SaasKnowledgeRefreshController;
use App\Http\Controllers\Integrations\TallerSaaSMarketingRefreshController;
use App\Http\Middleware\VerifyProductSignature;
use Illuminate\Support\Facades\Route;

/*
| Llamadas server-to-server de los productos hacia Orvae (grupo "api": sin sesión ni CSRF).
*/

Route::post('/api/internal/tallersaas/marketing/refresh', TallerSaaSMarketingRefreshController::class)
    ->middleware([VerifyProductSignature::class.':tallersaas', 'throttle:30,1'])
    ->name('integrations.tallersaas.marketing.refresh');

Route::post('/api/internal/saas/{producto}/knowledge/refresh', SaasKnowledgeRefreshController::class)
    ->middleware([VerifyProductSignature::class.':route', 'throttle:30,1'])
    ->name('integrations.saas.knowledge.refresh');

Route::post('/api/webhooks/openwa-lines/{line}', OpenWaLineWebhookController::class)
    ->whereUuid('line')
    ->middleware('throttle:600,1')
    ->name('integrations.openwa-lines.webhook');
