<?php

use App\Http\Controllers\Integrations\TallerSaaSMarketingRefreshController;
use App\Http\Middleware\VerifyProductSignature;
use Illuminate\Support\Facades\Route;

/*
| Llamadas server-to-server de los productos hacia Orvae (grupo "api": sin sesión ni CSRF).
*/

Route::post('/api/internal/tallersaas/marketing/refresh', TallerSaaSMarketingRefreshController::class)
    ->middleware([VerifyProductSignature::class.':tallersaas', 'throttle:30,1'])
    ->name('integrations.tallersaas.marketing.refresh');
