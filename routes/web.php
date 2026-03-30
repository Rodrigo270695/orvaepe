<?php

use App\Http\Controllers\Admin\AuditLogsController;
use App\Http\Controllers\Admin\ClientUsersController;
use App\Http\Controllers\Admin\EntitlementsController;
use App\Http\Controllers\Admin\EntitlementSecretsController;
use App\Http\Controllers\Admin\InformesController;
use App\Http\Controllers\Admin\LicenseActivationsController;
use App\Http\Controllers\Admin\LicenseKeyExtrasController;
use App\Http\Controllers\Admin\LicenseKeysController;
use App\Http\Controllers\Admin\NotificationsController;
use App\Http\Controllers\Admin\OemLicenseDeliveriesController;
use App\Http\Controllers\Admin\ShowcaseClientsController;
use App\Http\Controllers\Admin\SubscriptionsController;
use App\Http\Controllers\Admin\VentasPagosController;
use App\Http\Controllers\Admin\WebhookEventsController;
use App\Http\Controllers\Catalog\CatalogCategoriesController;
use App\Http\Controllers\Catalog\CatalogProductMediaController;
use App\Http\Controllers\Catalog\CatalogProductsController;
use App\Http\Controllers\Catalog\CatalogProductSpecsController;
use App\Http\Controllers\Catalog\CatalogSkuExtrasController;
use App\Http\Controllers\Catalog\CatalogSkusController;
use App\Http\Controllers\Catalog\CouponsController;
use App\Http\Controllers\Catalog\SoftwareReleaseAssetsController;
use App\Http\Controllers\Catalog\SoftwareReleasesController;
use App\Http\Controllers\Checkout\CheckoutMercadoPagoController;
use App\Http\Controllers\Checkout\CheckoutPayPalController;
use App\Http\Controllers\Client\ClientPortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Marketing\MarketingCartController;
use App\Http\Controllers\Marketing\MarketingContactController;
use App\Http\Controllers\Marketing\MarketingLicensesController;
use App\Http\Controllers\Marketing\MarketingServiceDetailController;
use App\Http\Controllers\Marketing\MarketingServicesController;
use App\Http\Controllers\Marketing\MarketingSoftwareController;
use App\Http\Controllers\Marketing\MarketingSoftwareDetailController;
use App\Http\Controllers\Marketing\ResolveCartSkuPricesController;
use App\Http\Controllers\Marketing\ValidateMarketingCouponController;
use App\Http\Controllers\Sales\OrdersController;
use App\Http\Controllers\Seo\RobotsController;
use App\Http\Controllers\Seo\SitemapController;
use App\Http\Controllers\Sunat\CompanyLegalProfilesController;
use App\Http\Controllers\Sunat\DigitalCertificatesController;
use App\Http\Controllers\Sunat\InvoiceDocumentSequencesController;
use App\Http\Controllers\Sunat\SunatEmitterSettingsController;
use App\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectClientUsersFromStaffArea;
use App\Models\ShowcaseClient;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

$canRegister = Features::enabled(Features::registration());

/*
 * Sin HandleInertiaRequests: evita consultas a catálogo en cada petición y permite que
 * Google obtenga XML/texto aunque haya problemas puntuales con datos compartidos de Inertia.
 */
Route::withoutMiddleware([
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
])->group(function () {
    Route::get('/sitemap.xml', SitemapController::class)->name('seo.sitemap');
    Route::get('/robots.txt', RobotsController::class)->name('seo.robots');
});

Route::get('/', function () use ($canRegister) {
    $showcaseClients = ShowcaseClient::query()
        ->published()
        ->get()
        ->map(fn (ShowcaseClient $c) => [
            'id' => $c->id,
            'name' => $c->publicName(),
            'logo' => $c->logo_public_url,
            'website_url' => $c->website_url,
            'sector' => $c->sector,
        ])
        ->values()
        ->all();

    return Inertia::render('welcome', [
        'canRegister' => $canRegister,
        'showcaseClients' => $showcaseClients,
    ]);
})->name('home');

Route::get('/software', MarketingSoftwareController::class)->name('marketing-software');
Route::get('/carrito', MarketingCartController::class)->name('marketing-cart');
Route::post('/carrito/validar-cupon', ValidateMarketingCouponController::class)
    ->name('marketing.validate-coupon');
Route::post('/carrito/precios-skus', ResolveCartSkuPricesController::class)
    ->name('marketing.cart-sku-prices');
Route::get('/software/{system}', [MarketingSoftwareDetailController::class, 'show'])
    ->where('system', '[A-Za-z0-9-]+')
    ->name('software-detail');
Route::get('/servicios', MarketingServicesController::class)->name('marketing-services');
Route::get('/servicios/{service}', [MarketingServiceDetailController::class, 'show'])
    ->where('service', '[A-Za-z0-9-]+')
    ->name('marketing-service-detail');
Route::get('/contacto', [MarketingContactController::class, 'show'])->name('marketing-contact');
Route::post('/contacto', [MarketingContactController::class, 'store'])->name('marketing-contact.store');
Route::get('/licencias', MarketingLicensesController::class)->name('marketing-licenses');

Route::match(['GET', 'POST'], '/webhooks/mercadopago', [CheckoutMercadoPagoController::class, 'webhook'])
    ->name('webhooks.mercadopago');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/checkout/mercadopago', [CheckoutMercadoPagoController::class, 'store'])->name('checkout.mercadopago.store');
    Route::get('/checkout/mercadopago/return', [CheckoutMercadoPagoController::class, 'handleReturn'])->name('checkout.mercadopago.return');
    Route::get('/checkout/mercadopago/cancel', [CheckoutMercadoPagoController::class, 'cancel'])->name('checkout.mercadopago.cancel');

    Route::post('/checkout/paypal', [CheckoutPayPalController::class, 'store'])->name('checkout.paypal.store');
    Route::post('/checkout/paypal/simulate', [CheckoutPayPalController::class, 'simulateStore'])->name('checkout.paypal.simulate');
    Route::get('/checkout/paypal/simulate-return/{order}', [CheckoutPayPalController::class, 'simulateApprove'])
        ->middleware('signed')
        ->name('checkout.paypal.simulate_return');
    Route::get('/checkout/paypal/return', [CheckoutPayPalController::class, 'handleReturn'])->name('checkout.paypal.return');
    Route::get('/checkout/paypal/cancel', [CheckoutPayPalController::class, 'cancel'])->name('checkout.paypal.cancel');

    // Portal cliente (diseño claro; staff puede entrar para revisar)
    Route::middleware(['role:superadmin|client'])->prefix('cliente')->name('cliente.')->group(function () {
        Route::get('/', [ClientPortalController::class, 'home'])->name('home');
        Route::get('/pagos', [ClientPortalController::class, 'payments'])->name('payments');
        Route::get('/facturacion', [ClientPortalController::class, 'billing'])->name('billing');
        Route::patch('/facturacion', [ClientPortalController::class, 'updateBilling'])->name('billing.update');
        Route::get('/servicios', [ClientPortalController::class, 'servicios'])->name('servicios');
        Route::get('/software', [ClientPortalController::class, 'software'])->name('software');
        Route::get('/licencias', [ClientPortalController::class, 'licenses'])->name('licenses');
        Route::get('/facturas', [ClientPortalController::class, 'facturas'])->name('facturas');
        Route::get('/soporte', [ClientPortalController::class, 'soporte'])->name('soporte');
        Route::get('/perfil', [ClientPortalController::class, 'profile'])->name('profile');
        Route::patch('/perfil', [ClientPortalController::class, 'updateProfile'])->name('profile.update');
        Route::get('/seguridad', [ClientPortalController::class, 'security'])->name('security');
    });

    // Panel interno (solo staff)
    Route::middleware([RedirectClientUsersFromStaffArea::class, 'role:superadmin'])->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // SUNAT / Emisión - Emisor (company_legal_profiles)
        Route::get('panel/sunat-emisor', [CompanyLegalProfilesController::class, 'index'])
            ->name('panel.sunat-emisor.index');

        // Singleton: crear si no existe y actualizar si ya existe
        Route::patch('panel/sunat-emisor', [CompanyLegalProfilesController::class, 'upsert'])
            ->name('panel.sunat-emisor.upsert');

        Route::post('panel/sunat-emisor/digital-certificates', [DigitalCertificatesController::class, 'store'])
            ->name('panel.sunat-emisor.digital-certificates.store');

        Route::patch('panel/sunat-emisor/digital-certificates/{digital_certificate}', [DigitalCertificatesController::class, 'update'])
            ->name('panel.sunat-emisor.digital-certificates.update');

        Route::delete('panel/sunat-emisor/digital-certificates/{digital_certificate}', [DigitalCertificatesController::class, 'destroy'])
            ->name('panel.sunat-emisor.digital-certificates.destroy');

        Route::patch('panel/sunat-emisor/emitter-settings', [SunatEmitterSettingsController::class, 'upsert'])
            ->name('panel.sunat-emisor.emitter-settings.upsert');

        Route::post('panel/sunat-emisor/invoice-sequences', [InvoiceDocumentSequencesController::class, 'store'])
            ->name('panel.sunat-emisor.invoice-sequences.store');

        Route::patch('panel/sunat-emisor/invoice-sequences/{invoice_document_sequence}', [InvoiceDocumentSequencesController::class, 'update'])
            ->name('panel.sunat-emisor.invoice-sequences.update');

        Route::delete('panel/sunat-emisor/invoice-sequences/{invoice_document_sequence}', [InvoiceDocumentSequencesController::class, 'destroy'])
            ->name('panel.sunat-emisor.invoice-sequences.destroy');

        // Catálogo - Categorías (catalog_categories)
        Route::get('panel/catalogo-categorias', [CatalogCategoriesController::class, 'index'])
            ->name('panel.catalogo-categorias.index');

        Route::post('panel/catalogo-categorias', [CatalogCategoriesController::class, 'store'])
            ->name('panel.catalogo-categorias.store');

        Route::patch('panel/catalogo-categorias/{catalog_category}', [CatalogCategoriesController::class, 'update'])
            ->name('panel.catalogo-categorias.update');

        Route::delete('panel/catalogo-categorias/{catalog_category}', [CatalogCategoriesController::class, 'destroy'])
            ->name('panel.catalogo-categorias.destroy');

        // Catálogo - Productos (catalog_products)
        Route::get('panel/catalogo-productos', [CatalogProductsController::class, 'index'])
            ->name('panel.catalogo-productos.index');

        Route::post('panel/catalogo-productos', [CatalogProductsController::class, 'store'])
            ->name('panel.catalogo-productos.store');

        Route::patch('panel/catalogo-productos/{catalog_product}', [CatalogProductsController::class, 'update'])
            ->name('panel.catalogo-productos.update');

        Route::delete('panel/catalogo-productos/{catalog_product}', [CatalogProductsController::class, 'destroy'])
            ->name('panel.catalogo-productos.destroy');

        // Catálogo - Medios por producto (catalog_media)
        Route::get('panel/catalogo-productos/{catalog_product}/medios', [CatalogProductMediaController::class, 'index'])
            ->name('panel.catalogo-productos.medios.index');

        Route::post('panel/catalogo-productos/{catalog_product}/medios', [CatalogProductMediaController::class, 'store'])
            ->name('panel.catalogo-productos.medios.store');

        // Subida de imágenes desde el panel de "Especificaciones" (specs -> imágenes)
        Route::post(
            'panel/catalogo-productos/{catalog_product}/medios/specs-images',
            [CatalogProductMediaController::class, 'storeManyForSpecs']
        );

        Route::delete('panel/catalogo-productos/{catalog_product}/medios/{catalog_media}', [CatalogProductMediaController::class, 'destroy'])
            ->name('panel.catalogo-productos.medios.destroy');

        // Catálogo - Especificaciones (specs) por producto
        Route::get('panel/catalogo-productos/{catalog_product}/specs', [CatalogProductSpecsController::class, 'index'])
            ->name('panel.catalogo-productos.specs.index');

        Route::patch('panel/catalogo-productos/{catalog_product}/specs', [CatalogProductSpecsController::class, 'update'])
            ->name('panel.catalogo-productos.specs.update');

        // Catálogo - SKUs (catalog_skus)
        Route::get('panel/catalogo-skus', [CatalogSkusController::class, 'index'])
            ->name('panel.catalogo-skus.index');

        Route::post('panel/catalogo-skus', [CatalogSkusController::class, 'store'])
            ->name('panel.catalogo-skus.store');

        Route::patch('panel/catalogo-skus/{catalog_sku}', [CatalogSkusController::class, 'update'])
            ->name('panel.catalogo-skus.update');

        Route::delete('panel/catalogo-skus/{catalog_sku}', [CatalogSkusController::class, 'destroy'])
            ->name('panel.catalogo-skus.destroy');

        // SKUs — límites y metadata (JSON) en vista aparte
        Route::get('panel/catalogo-skus/{catalog_sku}/extras', [CatalogSkuExtrasController::class, 'index'])
            ->name('panel.catalogo-skus.extras.index');

        Route::patch('panel/catalogo-skus/{catalog_sku}/extras', [CatalogSkuExtrasController::class, 'update'])
            ->name('panel.catalogo-skus.extras.update');

        Route::post(
            'panel/catalogo-skus/{catalog_sku}/extras/imagenes',
            [CatalogSkuExtrasController::class, 'storeManyForExtrasImages']
        );

        // Catálogo — Cupones (coupons)
        Route::get('panel/catalogo-cupones', [CouponsController::class, 'index'])
            ->name('panel.catalogo-cupones.index');

        Route::post('panel/catalogo-cupones', [CouponsController::class, 'store'])
            ->name('panel.catalogo-cupones.store');

        Route::patch('panel/catalogo-cupones/{coupon}', [CouponsController::class, 'update'])
            ->name('panel.catalogo-cupones.update');

        Route::delete('panel/catalogo-cupones/{coupon}', [CouponsController::class, 'destroy'])
            ->name('panel.catalogo-cupones.destroy');

        // Catálogo — Versiones (software_releases), solo productos categoría "Sistemas"
        Route::get('panel/catalogo-releases', [SoftwareReleasesController::class, 'index'])
            ->name('panel.catalogo-releases.index');

        Route::post('panel/catalogo-releases', [SoftwareReleasesController::class, 'store'])
            ->name('panel.catalogo-releases.store');

        Route::patch('panel/catalogo-releases/{software_release}', [SoftwareReleasesController::class, 'update'])
            ->name('panel.catalogo-releases.update');

        Route::delete('panel/catalogo-releases/{software_release}', [SoftwareReleasesController::class, 'destroy'])
            ->name('panel.catalogo-releases.destroy');

        // Archivos adicionales por release (software_release_assets)
        Route::get('panel/catalogo-releases/{software_release}/assets', [SoftwareReleaseAssetsController::class, 'index'])
            ->name('panel.catalogo-releases.assets.index');

        Route::post('panel/catalogo-releases/{software_release}/assets', [SoftwareReleaseAssetsController::class, 'store'])
            ->name('panel.catalogo-releases.assets.store');

        Route::patch('panel/catalogo-releases/{software_release}/assets/{software_release_asset}', [SoftwareReleaseAssetsController::class, 'update'])
            ->name('panel.catalogo-releases.assets.update');

        Route::delete('panel/catalogo-releases/{software_release}/assets/{software_release_asset}', [SoftwareReleaseAssetsController::class, 'destroy'])
            ->name('panel.catalogo-releases.assets.destroy');

        // Ventas — Órdenes (orders + order_lines)
        Route::get('panel/ventas-ordenes', [OrdersController::class, 'index'])
            ->name('panel.ventas-ordenes.index');

        Route::get('panel/ventas-ordenes/create', [OrdersController::class, 'create'])
            ->name('panel.ventas-ordenes.create');

        Route::post('panel/ventas-ordenes', [OrdersController::class, 'store'])
            ->name('panel.ventas-ordenes.store');

        Route::delete('panel/ventas-ordenes/{order}', [OrdersController::class, 'destroy'])
            ->name('panel.ventas-ordenes.destroy');

        Route::get('panel/ventas-ordenes/{order}', [OrdersController::class, 'show'])
            ->name('panel.ventas-ordenes.show');

        // Ventas — Pagos (pasarela; tabla `payments` cuando se integre el gateway)
        Route::get('panel/ventas-pagos', [VentasPagosController::class, 'index'])
            ->name('panel.ventas-pagos.index');

        Route::get('panel/ventas-suscripciones', [SubscriptionsController::class, 'index'])
            ->name('panel.ventas-suscripciones.index');

        Route::get('panel/ventas-suscripciones/create', [SubscriptionsController::class, 'create'])
            ->name('panel.ventas-suscripciones.create');

        Route::post('panel/ventas-suscripciones', [SubscriptionsController::class, 'store'])
            ->name('panel.ventas-suscripciones.store');

        Route::get('panel/ventas-suscripciones/{subscription}/edit', [SubscriptionsController::class, 'edit'])
            ->name('panel.ventas-suscripciones.edit');

        Route::patch('panel/ventas-suscripciones/{subscription}', [SubscriptionsController::class, 'update'])
            ->name('panel.ventas-suscripciones.update');

        Route::post('panel/ventas-suscripciones/{subscription}/cancel', [SubscriptionsController::class, 'cancel'])
            ->name('panel.ventas-suscripciones.cancel');

        // Acceso — Entitlements y secretos (derechos de uso / credenciales técnicas)
        Route::get('panel/acceso-clientes', [ClientUsersController::class, 'index'])
            ->name('panel.acceso-clientes.index');

        Route::get('panel/marketing-vitrina', [ShowcaseClientsController::class, 'index'])
            ->name('panel.marketing-vitrina.index');
        Route::post('panel/marketing-vitrina', [ShowcaseClientsController::class, 'store'])
            ->name('panel.marketing-vitrina.store');
        Route::patch('panel/marketing-vitrina/{showcase_client}', [ShowcaseClientsController::class, 'update'])
            ->name('panel.marketing-vitrina.update');
        Route::delete('panel/marketing-vitrina/{showcase_client}', [ShowcaseClientsController::class, 'destroy'])
            ->name('panel.marketing-vitrina.destroy');

        Route::get('panel/acceso-entitlements', [EntitlementsController::class, 'index'])
            ->name('panel.acceso-entitlements.index');

        Route::get('panel/acceso-credenciales', [EntitlementSecretsController::class, 'index'])
            ->name('panel.acceso-credenciales.index');

        Route::get('panel/acceso-licencias', [LicenseKeysController::class, 'index'])
            ->name('panel.acceso-licencias.index');

        Route::post('panel/acceso-licencias', [LicenseKeysController::class, 'store'])
            ->name('panel.acceso-licencias.store');

        Route::patch('panel/acceso-licencias/{license_key}', [LicenseKeysController::class, 'update'])
            ->name('panel.acceso-licencias.update');

        Route::get('panel/acceso-licencias/{license_key}/extras', [LicenseKeyExtrasController::class, 'index'])
            ->name('panel.acceso-licencias.extras.index');

        Route::patch('panel/acceso-licencias/{license_key}/extras', [LicenseKeyExtrasController::class, 'update'])
            ->name('panel.acceso-licencias.extras.update');

        Route::post('panel/acceso-licencias/{license_key}/extras/evidencia-imagen', [LicenseKeyExtrasController::class, 'storeEvidenceImage'])
            ->name('panel.acceso-licencias.extras.evidence-image.store');

        Route::delete('panel/acceso-licencias/{license_key}', [LicenseKeysController::class, 'destroy'])
            ->name('panel.acceso-licencias.destroy');

        Route::get('panel/acceso-activaciones', [LicenseActivationsController::class, 'index'])
            ->name('panel.acceso-activaciones.index');

        Route::get('panel/acceso-entregas-oem', [OemLicenseDeliveriesController::class, 'index'])
            ->name('panel.acceso-entregas-oem.index');

        Route::get('panel/acceso-notificaciones', [NotificationsController::class, 'index'])
            ->name('panel.acceso-notificaciones.index');

        Route::get('panel/acceso-notificaciones/unread-count', [NotificationsController::class, 'unreadCount'])
            ->name('panel.acceso-notificaciones.unread-count');

        Route::patch('panel/acceso-notificaciones/{notification}/read', [NotificationsController::class, 'markAsRead'])
            ->name('panel.acceso-notificaciones.read');

        Route::get('panel/operacion-webhooks', [WebhookEventsController::class, 'index'])
            ->name('panel.operacion-webhooks.index');

        Route::get('panel/operacion-auditoria', [AuditLogsController::class, 'index'])
            ->name('panel.operacion-auditoria.index');

        Route::get('panel/informes-resumen', [InformesController::class, 'resumen'])
            ->name('panel.informes-resumen.index');

        Route::get('panel/informes-lineas', [InformesController::class, 'lineas'])
            ->name('panel.informes-lineas.index');

        Route::get('panel/{section}', function (string $section) {
            return Inertia::render('admin/coming-soon/index', [
                'section' => $section,
            ]);
        })
            ->where('section', '[a-z0-9-]+')
            ->name('panel.section');
    });
});

require __DIR__.'/settings.php';
