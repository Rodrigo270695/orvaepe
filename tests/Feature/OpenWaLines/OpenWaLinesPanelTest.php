<?php

use App\Models\Notification;
use App\Models\OpenWaLine;
use App\Models\User;
use App\Services\Notifications\NotificationSender;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'openwa_lines.enabled' => true,
        'openwa_lines.api_url' => 'https://wa.test',
        'openwa_lines.api_key' => 'owa_test_key',
        'services.vetsaas' => ['label' => 'VetSaaS', 'enabled' => true, 'provision_url' => 'https://vet.test/provision'],
        'services.tallersaas' => ['label' => 'TallerSaaS', 'enabled' => true, 'provision_url' => 'https://taller.test/provision'],
        'services.aulavirtual' => ['label' => 'Aula Virtual', 'enabled' => true, 'provision_url' => 'https://aula.test/provision'],
        'services.sendsaas' => ['label' => 'SendSaaS', 'enabled' => false, 'provision_url' => null],
    ]);

    $this->seed(RoleSeeder::class);
    $this->actingAs(User::factory()->superadmin()->create());
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function owaSession(array $overrides = []): array
{
    return array_merge([
        'id' => 'sess-uuid-1',
        'name' => 'orvae-ventas',
        'status' => 'created',
        'phone' => null,
        'pushName' => null,
        'connectedAt' => null,
        'lastError' => null,
        'engineLoaded' => false,
    ], $overrides);
}

/**
 * Responde según "MÉTODO /ruta"; lo no declarado devuelve 404.
 *
 * @param  array<string, mixed>  $routes
 */
function fakeOpenWa(array $routes): void
{
    Http::fake(function (Request $request) use ($routes) {
        $key = $request->method().' '.parse_url($request->url(), PHP_URL_PATH);

        if (! array_key_exists($key, $routes)) {
            return Http::response(['message' => 'Not found'], 404);
        }

        $route = $routes[$key];

        return is_array($route) && isset($route['__status'])
            ? Http::response($route['body'] ?? null, $route['__status'])
            : Http::response($route, 200);
    });
}

function makeLine(array $attributes = []): OpenWaLine
{
    return OpenWaLine::query()->create(array_merge([
        'nombre' => 'ORVAE Ventas',
        'session_name' => 'orvae-ventas',
        'openwa_session_id' => 'sess-uuid-1',
        'productos' => ['vetsaas', 'tallersaas'],
    ], $attributes));
}

test('el panel muestra las líneas y los SaaS disponibles', function () {
    makeLine();

    $this->get(route('panel.operacion-openwa.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/operacion-openwa/index')
            ->where('configured', true)
            ->where('gatewayHost', 'wa.test')
            ->has('products', 3)
            ->has('lines', 1)
            ->where('lines.0.session_name', 'orvae-ventas')
            ->where('lines.0.productos', ['vetsaas', 'tallersaas']));
});

test('los SaaS salen de las integraciones conectadas y los asignados sin conexión quedan marcados', function () {
    makeLine(['productos' => ['vetsaas', 'foodsaas']]);

    $this->get(route('panel.operacion-openwa.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('products', [
                ['key' => 'aulavirtual', 'label' => 'Aula Virtual', 'connected' => true],
                ['key' => 'vetsaas', 'label' => 'VetSaaS', 'connected' => true],
                ['key' => 'tallersaas', 'label' => 'TallerSaaS', 'connected' => true],
                ['key' => 'foodsaas', 'label' => 'Foodsaas', 'connected' => false],
            ]));
});

test('vincular SaaS conectados guarda la lista de la línea', function () {
    $line = makeLine(['productos' => []]);

    $this->put(route('panel.operacion-openwa.productos', $line), [
        'productos' => ['vetsaas', 'aulavirtual'],
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect($line->fresh()->productos)->toBe(['vetsaas', 'aulavirtual']);
});

test('no se puede vincular un SaaS sin conexión', function () {
    $line = makeLine(['productos' => []]);

    $this->put(route('panel.operacion-openwa.productos', $line), [
        'productos' => ['sendsaas'],
    ])->assertSessionHasErrors('productos.0');

    expect($line->fresh()->productos)->toBe([]);
});

test('un SaaS sin conexión ya asignado se puede conservar o quitar', function () {
    $line = makeLine(['productos' => ['foodsaas']]);

    $this->put(route('panel.operacion-openwa.productos', $line), [
        'productos' => ['foodsaas', 'vetsaas'],
    ])->assertSessionHasNoErrors();
    expect($line->fresh()->productos)->toBe(['foodsaas', 'vetsaas']);

    $this->put(route('panel.operacion-openwa.productos', $line), ['productos' => []])
        ->assertSessionHasNoErrors();
    expect($line->fresh()->productos)->toBe([]);
});

test('crear una línea registra la sesión en OpenWA', function () {
    fakeOpenWa([
        'GET /api/sessions' => [],
        'POST /api/sessions' => owaSession(),
    ]);

    $this->post(route('panel.operacion-openwa.store'), [
        'nombre' => 'ORVAE Ventas',
        'session_name' => 'orvae-ventas',
    ])->assertRedirect();

    $line = OpenWaLine::query()->sole();
    expect($line->openwa_session_id)->toBe('sess-uuid-1')
        ->and($line->status)->toBe('created')
        ->and($line->productos)->toBe([]);

    Http::assertSent(fn (Request $r) => $r->method() === 'POST'
        && str_ends_with($r->url(), '/api/sessions')
        && $r['name'] === 'orvae-ventas'
        && $r->header('X-API-Key') === ['owa_test_key']);
});

test('valida el identificador', function () {
    $this->post(route('panel.operacion-openwa.store'), [
        'nombre' => 'Ventas',
        'session_name' => 'Ventas ORVAE',
    ])->assertSessionHasErrors(['session_name']);

    expect(OpenWaLine::query()->count())->toBe(0);
});

test('vincular inicia la sesión cuando no tiene motor', function () {
    makeLine();
    fakeOpenWa([
        'GET /api/sessions/sess-uuid-1' => owaSession(),
        'POST /api/sessions/sess-uuid-1/start' => owaSession(['status' => 'initializing', 'engineLoaded' => true]),
    ]);

    $this->getJson(route('panel.operacion-openwa.connection', makeLineId()))
        ->assertOk()
        ->assertJson(['status' => 'initializing', 'ready' => false, 'qr_code' => null]);

    Http::assertSent(fn (Request $r) => str_ends_with($r->url(), '/sess-uuid-1/start'));
});

test('devuelve el QR cuando la sesión lo tiene listo', function () {
    makeLine();
    fakeOpenWa([
        'GET /api/sessions/sess-uuid-1' => owaSession(['status' => 'qr_ready', 'engineLoaded' => true]),
        'GET /api/sessions/sess-uuid-1/qr' => ['qrCode' => 'data:image/png;base64,QR', 'status' => 'qr_ready'],
    ]);

    $this->getJson(route('panel.operacion-openwa.connection', makeLineId()))
        ->assertOk()
        ->assertJson(['status' => 'qr_ready', 'ready' => false, 'qr_code' => 'data:image/png;base64,QR']);
});

test('marca la línea como conectada cuando OpenWA está listo', function () {
    makeLine();
    fakeOpenWa([
        'GET /api/sessions/sess-uuid-1' => owaSession([
            'status' => 'ready',
            'engineLoaded' => true,
            'phone' => '51976709811',
            'pushName' => 'ORVAE',
            'connectedAt' => '2026-10-14T20:00:00.000Z',
        ]),
    ]);

    $this->getJson(route('panel.operacion-openwa.connection', makeLineId()))
        ->assertOk()
        ->assertJson(['ready' => true, 'phone' => '51976709811']);

    expect(OpenWaLine::query()->sole())
        ->status->toBe('ready')
        ->push_name->toBe('ORVAE');
});

test('si el id guardado ya no existe busca la sesión por nombre', function () {
    makeLine(['openwa_session_id' => 'sess-viejo']);
    fakeOpenWa([
        'GET /api/sessions' => [owaSession(['status' => 'qr_ready', 'engineLoaded' => true])],
        'GET /api/sessions/sess-uuid-1/qr' => ['qrCode' => 'data:image/png;base64,QR'],
    ]);

    $this->getJson(route('panel.operacion-openwa.connection', makeLineId()))
        ->assertOk()
        ->assertJson(['qr_code' => 'data:image/png;base64,QR']);

    expect(OpenWaLine::query()->sole()->openwa_session_id)->toBe('sess-uuid-1');
});

test('desvincular hace logout en OpenWA y limpia el número', function () {
    makeLine(['status' => 'ready', 'phone' => '51976709811']);
    fakeOpenWa([
        'GET /api/sessions/sess-uuid-1' => owaSession(['status' => 'ready', 'engineLoaded' => true, 'phone' => '51976709811']),
        'POST /api/sessions/sess-uuid-1/logout' => owaSession(['status' => 'disconnected']),
    ]);

    $this->post(route('panel.operacion-openwa.logout', makeLineId()))->assertRedirect();

    expect(OpenWaLine::query()->sole())
        ->status->toBe('disconnected')
        ->phone->toBeNull();
});

test('eliminar borra la sesión remota y la línea', function () {
    makeLine();
    fakeOpenWa([
        'DELETE /api/sessions/sess-uuid-1' => ['__status' => 204],
    ]);

    $this->delete(route('panel.operacion-openwa.destroy', makeLineId()))->assertRedirect();

    expect(OpenWaLine::query()->count())->toBe(0);
    Http::assertSent(fn (Request $r) => $r->method() === 'DELETE');
});

test('sin configuración no consulta OpenWA', function () {
    config(['openwa_lines.api_key' => '']);
    makeLine();
    Http::fake();

    $this->getJson(route('panel.operacion-openwa.connection', makeLineId()))->assertStatus(503);

    Http::assertNothingSent();
});

test('un invitado no puede entrar al panel', function () {
    auth()->logout();

    $this->get(route('panel.operacion-openwa.index'))->assertRedirect();
});

test('la primera línea creada queda marcada para notificaciones', function () {
    fakeOpenWa([
        'GET /api/sessions' => [],
        'POST /api/sessions' => owaSession(),
    ]);

    $this->post(route('panel.operacion-openwa.store'), [
        'nombre' => 'ORVAE Ventas',
        'session_name' => 'orvae-ventas',
    ])->assertRedirect();

    expect(OpenWaLine::query()->sole()->envia_notificaciones)->toBeTrue();
});

test('marcar una línea para notificaciones desmarca las demás', function () {
    $old = makeLine(['envia_notificaciones' => true]);
    $new = makeLine(['nombre' => 'Cobros', 'session_name' => 'orvae-cobros', 'openwa_session_id' => 'sess-2']);

    $this->put(route('panel.operacion-openwa.update', $new), [
        'nombre' => 'Cobros',
        'envia_notificaciones' => true,
    ])->assertRedirect();

    expect($old->fresh()->envia_notificaciones)->toBeFalse()
        ->and($new->fresh()->envia_notificaciones)->toBeTrue();
});

test('las notificaciones de WhatsApp salen por la línea marcada', function () {
    makeLine(['nombre' => 'Otra', 'session_name' => 'orvae-otra', 'openwa_session_id' => 'sess-otra', 'status' => 'ready']);
    makeLine(['status' => 'ready', 'envia_notificaciones' => true]);
    fakeOpenWa([
        'POST /api/sessions/sess-uuid-1/messages/send-text' => ['messageId' => 'msg-1'],
    ]);

    $notification = Notification::query()->create([
        'user_id' => auth()->id(),
        'type' => 'order.paid.admin',
        'channel' => 'whatsapp',
        'subject' => 'Nueva compra',
        'message' => 'Pedido pagado',
        'data' => ['whatsapp_to' => '976709811'],
        'status' => 'pending',
    ]);

    app(NotificationSender::class)->send($notification);

    expect($notification->fresh())->status->toBe('sent');
    Http::assertSent(fn (Request $r) => str_ends_with($r->url(), '/sess-uuid-1/messages/send-text')
        && $r['chatId'] === '51976709811@c.us'
        && $r['text'] === "Nueva compra\n\nPedido pagado");
    Http::assertNotSent(fn (Request $r) => str_contains($r->url(), 'sess-otra'));
});

test('si la línea de notificaciones no está conectada la notificación falla con un mensaje claro', function () {
    makeLine(['envia_notificaciones' => true]);
    fakeOpenWa([
        'GET /api/sessions/sess-uuid-1' => owaSession(['status' => 'disconnected']),
    ]);

    $notification = Notification::query()->create([
        'user_id' => auth()->id(),
        'type' => 'order.paid.admin',
        'channel' => 'whatsapp',
        'message' => 'Pedido pagado',
        'data' => ['whatsapp_to' => '976709811'],
        'status' => 'pending',
    ]);

    app(NotificationSender::class)->send($notification);

    expect($notification->fresh())
        ->status->toBe('failed')
        ->error->toContain('no está conectada');
    Http::assertNotSent(fn (Request $r) => str_contains($r->url(), 'send-text'));
});

test('la ruta vieja del módulo WhatsApp redirige a OpenWA', function () {
    $this->get('/panel/operacion-whatsapp')->assertRedirect('/panel/operacion-openwa');
});

function makeLineId(): string
{
    return OpenWaLine::query()->value('id');
}
