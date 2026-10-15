# OpenWA · Vínculos línea ↔ SaaS — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que los SaaS asignables a una línea OpenWA salgan de las integraciones conectadas y se vinculen arrastrando en un tablero visual.

**Architecture:** `SaasDirectory` lee `config/services.php`; el controlador expone `products` con flag `connected` y un endpoint `PUT {line}/productos`. En React, `OpenWaLinkBoard` dibuja curvas SVG entre puertos medidos con `ResizeObserver` y guarda con Inertia.

**Tech Stack:** Laravel 13, Pest 4, Inertia React + TypeScript, Tailwind v4.

## Global Constraints
- Responder/UI en español. Sin commits ni push (preferencia del usuario).
- No tocar el envío de tenants por `wa.vetsaas` (`OpenWaClient`, `config/openwa.php`).
- Tests: `$env:DB_CONNECTION='pgsql'; $env:DB_DATABASE='orvae_testing'; php artisan test --compact tests/Feature/OpenWaLines` y luego `Remove-Item Env:DB_CONNECTION, Env:DB_DATABASE`.
- Sin librerías nuevas de npm.

---

### Task 1: Directorio dinámico de SaaS + endpoint de vínculos

**Files:**
- Create: `app/Services/OpenWaLines/SaasDirectory.php`
- Modify: `config/services.php` (agregar `label` a aulavirtual, vetsaas, tallersaas, sendsaas)
- Modify: `config/openwa_lines.php` (quitar `products`)
- Modify: `app/Http/Controllers/Admin/OpenWaLinesController.php`
- Modify: `routes/web.php` (ruta `panel.operacion-openwa.productos`)
- Test: `tests/Feature/OpenWaLines/OpenWaLinesPanelTest.php`

**Interfaces:**
- Produces: `SaasDirectory::connected(): array<string,string>`, `SaasDirectory::options(iterable $assigned): list<array{key:string,label:string,connected:bool}>`; prop `products` con `connected`; `line.routes.productos`.

- [ ] **Step 1: Tests que fallan**

```php
beforeEach: config([
    'services.vetsaas' => ['label' => 'VetSaaS', 'enabled' => true, 'provision_url' => 'https://vet.test/p'],
    'services.tallersaas' => ['label' => 'TallerSaaS', 'enabled' => true, 'provision_url' => 'https://taller.test/p'],
    'services.aulavirtual' => ['label' => 'Aula Virtual', 'enabled' => true, 'provision_url' => 'https://aula.test/p'],
    'services.sendsaas' => ['label' => 'SendSaaS', 'enabled' => false, 'provision_url' => null],
]);

test('el panel lista los SaaS conectados y los huérfanos asignados', ...)
    // makeLine(['productos' => ['vetsaas', 'foodsaas']]) → products: aulavirtual, vetsaas, tallersaas (connected) + foodsaas (connected=false); sin sendsaas
test('vincular SaaS conectados guarda la lista', ...)        // PUT productos ['vetsaas','aulavirtual'] → guardado
test('no se puede vincular un SaaS no conectado', ...)       // PUT ['sendsaas'] → error productos.0
test('un huérfano ya asignado se puede conservar o quitar', ...) // línea con foodsaas: PUT ['foodsaas','vetsaas'] ok; PUT [] ok
```

- [ ] **Step 2:** correr tests → FAIL (ruta/clase inexistente).
- [ ] **Step 3: Implementar** `SaasDirectory` (itera `config('services')`, entradas array con clave `provision_url`; conectado = `enabled` y `provision_url` lleno; label = `label` o `Str::headline($key)`), endpoint `productos` con regla `Rule::in(connected ∪ $line->productos)`, quitar `productos` de store/update, `products` = `options(OpenWaLine::pluck('productos')->flatten())`.
- [ ] **Step 4:** correr tests → PASS (actualizar tests previos que usaban `productos` en store y `has('products', 3)`).

### Task 2: Tablero de vínculos (React)

**Files:**
- Create: `resources/js/components/operacion/openwa/OpenWaLinkBoard.tsx`
- Create: `resources/js/components/operacion/openwa/saasColors.ts`
- Modify: `types.ts` (`OpenWaProduct.connected`, `routes.productos`), `OperacionOpenWaIndex.tsx`, `OpenWaLineFormDialog.tsx` (quitar fieldset), `OpenWaLineCard.tsx` (chips huérfanos atenuados)

**Interfaces:**
- Consumes: `products: {key,label,connected}[]`, `line.routes.productos`, `line.productos`.

- [ ] **Step 1:** `saasColors.ts`: color por clave (vetsaas teal, tallersaas naranja, aulavirtual violeta, sendsaas verde, resto ámbar).
- [ ] **Step 2:** `OpenWaLinkBoard`: grid 2 columnas; puertos con `data-line-port` / `data-product-key`; `ResizeObserver` sobre el contenedor calcula coordenadas en su callback; overlay SVG `pointer-events-none` salvo paths de vínculo (hit area ancha, clic = quitar); arrastre con `onPointerDown` en puerto + listeners `pointermove/pointerup` en `window`, destino por `document.elementFromPoint(...).closest('[data-product-key]')`; modo tap (puerto seleccionado + clic en SaaS); `pending` muestra curva punteada; guarda con `router.put(line.routes.productos, {productos}, {preserveScroll: true, only: ['lines','products']})`.
- [ ] **Step 3:** integrar en `OperacionOpenWaIndex` debajo de las tarjetas; quitar SaaS del modal; chips huérfanos en la tarjeta.
- [ ] **Step 4:** `npx eslint resources/js/components/operacion/openwa` y `npx tsc --noEmit | Select-String openwa` sin errores; `php artisan wayfinder:generate --with-form`.

### Task 3: Verificación final
- [ ] Tests de `tests/Feature/OpenWaLines` y `tests/Feature/WhatsAppCloud` en verde.
- [ ] Revisión visual en el navegador del tablero (arrastrar, quitar, huérfano).
