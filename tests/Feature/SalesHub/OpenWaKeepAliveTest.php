<?php

use App\Models\OpenWaLine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['openwa_lines.enabled' => true, 'openwa_lines.api_key' => 'wa-key', 'openwa_lines.api_url' => 'https://wa.test']);
});

function lineaOpenWa(array $attrs = []): OpenWaLine
{
    return OpenWaLine::query()->create(array_merge([
        'nombre' => 'VENTAS ORVAE',
        'session_name' => 'ventas-orvae',
        'openwa_session_id' => 'sess-1',
        'status' => OpenWaLine::STATUS_READY,
        'connected_at' => now()->subDay(),
    ], $attrs));
}

test('levanta la sesión vinculada que OpenWA dejó apagada tras reiniciarse', function () {
    Http::fake([
        'wa.test/api/sessions/sess-1' => Http::response(['id' => 'sess-1', 'status' => 'disconnected', 'phone' => '51976809804', 'connectedAt' => now()->subDay()->toIso8601String(), 'engineLoaded' => false]),
        'wa.test/api/sessions/sess-1/start' => Http::response(['id' => 'sess-1', 'status' => 'initializing', 'connectedAt' => now()->subDay()->toIso8601String()]),
    ]);
    $line = lineaOpenWa();

    $this->artisan('openwa-lines:keepalive')->expectsOutput('VENTAS ORVAE: iniciada')->assertSuccessful();

    Http::assertSent(fn (Request $r) => $r->method() === 'POST' && str_ends_with($r->url(), '/sess-1/start'));
    expect($line->fresh()->status)->toBe('initializing');
});

test('no toca sesiones que están corriendo ni líneas que nunca se vincularon', function () {
    Http::fake([
        'wa.test/api/sessions/sess-1' => Http::response(['id' => 'sess-1', 'status' => 'ready', 'connectedAt' => now()->toIso8601String(), 'engineLoaded' => true]),
        'wa.test/api/sessions/sess-2' => Http::response(['id' => 'sess-2', 'status' => 'created', 'engineLoaded' => false]),
    ]);
    lineaOpenWa();
    lineaOpenWa(['nombre' => 'NUEVA', 'session_name' => 'nueva', 'openwa_session_id' => 'sess-2', 'status' => 'created', 'connected_at' => null]);

    $this->artisan('openwa-lines:keepalive')
        ->expectsOutput('NUEVA: sin_vincular')
        ->expectsOutput('VENTAS ORVAE: ok')
        ->assertSuccessful();

    Http::assertNotSent(fn (Request $r) => str_ends_with($r->url(), '/start'));
});
