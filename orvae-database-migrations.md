# Orvae Platform — Esquema de base de datos (tablas y campos)

> **Solo referencia de modelo:** nombres de tablas, orden sugerido y listado de campos.  
> **No incluye** código de migraciones Laravel ni SQL ejecutable completo.

**Stack objetivo:** PostgreSQL 16 · UUID en tablas de negocio (recomendado) · JSONB donde aporta flexibilidad.

---

## Notas rápidas antes de migrar

1. **Extensión UUID (PostgreSQL):** `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` (o equivalente en tu primera migración).
2. **Clave de `users`:** Si hoy usas `id` entero (Laravel por defecto), las FK `user_id` deben ser **bigint** coherentes con `users.id`. Si migras todo a UUID, unifica `users.id` y todas las FK.
3. **Tres líneas de ingreso** en el modelo:
   - **Software propio:** venta de **código fuente** y/o **alquiler/acceso temporal** al proyecto.
   - **Licencias de terceros:** OEM/retail (Windows, Office, Canva, etc.) — catálogo y entrega distinta al software propio.
   - **Servicios:** correo corporativo, desarrollo a medida, VPS, integraciones (ej. SUNAT) — muchos son **suscripción** o **por proyecto**.
4. **Apagar un servicio** (ej. integración SUNAT): no depende solo de “una tabla”; se modela con **derecho de uso** (`entitlements`) + **credenciales** (`entitlement_secrets` o `service_credentials`) con `expires_at` / `revoked_at` / `status`, y el producto valida contra eso (y opcionalmente contra `subscriptions`).

---

## SUNAT — Qué necesitas para generar factura (u otro CPE) automático al comprar

> Resumen práctico; la norma detallada está en SUNAT (CPE / Orientación). Tu app debe **orquestar** datos + XML + envío; SUNAT **autoriza** el correlativo y devuelve **CDR**.

### 1) Calidad de **emisor electrónico** (tu empresa, no el cliente)

Según orientación SUNAT, entre otros requisitos:

- RUC **activo**, sin suspensión temporal de actividades ni baja, y domicilio fiscal **habido**.
- Afecto al régimen que corresponda (p. ej. renta de tercera categoría, según tu caso).
- Trámite en **SUNAT Operaciones en Línea** (Clave SOL): dar de alta emisión electrónica.
- **Certificado digital** (.pfx) vigente asociado al RUC y **correo** de notificación; **o** contratar un **PSE/OSE** (proveedor u operador que reciba tus XML firmados y los canalice a SUNAT).

Sin esto no puedes emitir comprobantes electrónicos válidos desde sistema propio.

### 2) **Autorización de comprobantes** (series y correlativos)

- SUNAT autoriza **tipo** de comprobante (factura, boleta, nota de crédito, etc.), **serie** (ej. `F001`), **correlativo** y datos del **establecimiento**.
- Tu sistema debe usar **solo** secuencias autorizadas y **no repetir** número enviado a SUNAT.

### 3) **Contenido del comprobante (UBL)**

- XML en formato **UBL 2.1** (factura/boleta/nota) con datos del **emisor** (tú) y **adquirente** (cliente: RUC o documento según tipo).
- **IGV** y estructura de líneas acorde a catálogos SUNAT (tipo afectación, códigos de producto SUNAT cuando aplique, etc.).
- **Firma digital** del XML con el certificado del contribuyente emisor.

### 4) **Envío y respuesta**

- Envío a **SUNAT** (según modalidad que habilites) o a **OSE/PSE** que tú contrates.
- Plazos: SUNAT indica envío en la fecha de emisión o en un margen de días posteriores según tipo de comprobante y canal — **respétalo en jobs** (cola + reintentos).
- Respuesta tipo **CDR** (constancia de recepción) y códigos de observación/rechazo: debes **guardarlos** y permitir **reenvío / nota de crédito** según el caso.

### 5) **Boletas de venta**

- Si vendes con **boleta electrónica**, además de la emisión unitaria puede exigirse **resumen diario** de boletas (según modalidad y normativa vigente). Planifica tabla o job de “resúmenes” si aplicas boletas masivas.

### 6) **Representación impresa / PDF**

- El PDF que ves el cliente **no sustituye** al XML firmado; es **representación impresa** del CPE. Guárdales coherencia (serie-número, QR si aplica según especificación).

### 7) Flujo típico “al pagar” en tu plataforma

1. `orders` / `payments` confirman cobro.  
2. Construyes borrador fiscal desde `billing_snapshot` + `order_lines` + datos del **emisor** (`company_legal_profiles` + config SUNAT).  
3. Asignas **correlativo** atómico (`invoice_document_sequences`).  
4. Generas XML UBL → firmas → envías → guardas resultado en `sunat_submission_logs` + rutas a XML/CDR.  
5. Marcas `invoices` como aceptada/rechazada y notificas al cliente (email + PDF).

---

## Emisor (tu empresa) vs cliente (`users` / `user_profiles`)

- **`company_legal_profiles`** (+ tablas SUNAT): datos de **Orvae** (o tu razón social) para **emitir** facturas/boletas desde tu web.
- **`user_profiles`**: datos **del cliente** para **facturarle** (RUC, razón social, dirección fiscal). Si ya guardas DNI/RUC en `users`, evita duplicar: o mueves lo fiscal a `user_profiles` o mantienes una sola fuente y documentas la regla.

---

## Cómo ordenar la venta de “sistemas” (categorías)

- Una sola jerarquía **`catalog_categories`** con ámbito `software_system` evita duplicar tablas.
- Ejemplos de ramas: `Contabilidad`, `Recursos humanos`, `Inventario`, `Ventas`, etc.; puedes anidar (`parent_id`) para `Contabilidad > NIIF`, `RRHH > Asistencia`.
- Cada **producto** de sistema (`catalog_products` con `revenue_line = software_system`) apunta a **una categoría** (o varias vía tabla puente si necesitas cross-listing).

**Tabla puente opcional** `catalog_product_categories` (N:N) si un mismo sistema debe aparecer en varias categorías sin duplicar filas de producto.

---

## Pasarelas de pago (Perú y más)

En **`payments.gateway`** (o tabla `payment_gateways` si prefieres catálogo en BD) contempla al menos:

| Código sugerido | Uso |
|-----------------|-----|
| `culqi` | Tarjetas, algunos flujos locales |
| `paypal` | Internacional / LATAM |
| `yape` | Pagos vía Yape (según integración disponible: pasarela agregadora, link de pago, etc.) |
| `bank_transfer` | Transferencia bancaria con comprobante |
| `cash` / `agent` | Efectivo / agente (si aplica) |
| `manual` | Registro manual por admin |

Los detalles de cada transacción van en JSONB (`raw_payload`, `metadata`) para no acoplar el esquema a cada API.

---

## Orden de creación (poco a poco, por fases)

Ejecuta en este orden para minimizar problemas de FK. Dentro de cada fase puedes dividir en varias migraciones.

### Fase 0 — Ya suele existir en Laravel

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 0.1 | `users` | Identidad del cliente y staff. |
| 0.2 | `password_reset_tokens` / `sessions` | Estándar Laravel (si las usas). |
| 0.3 | `roles`, `permissions`, pivotes | Si usas Spatie u otro RBAC. |

### Fase 1 — Tu empresa (emisor) + perfil fiscal del cliente

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 1.1 | `company_legal_profiles` | **Tu** razón social, RUC, domicilio fiscal, ubigeo, nombre comercial — quien **emite** los CPE. |
| 1.2 | `digital_certificates` | Referencia al certificado .pfx (storage/KMS), vigencia, huella; **no** guardar passphrase en claro. |
| 1.3 | `sunat_emitter_settings` | Modo de envío (directo SUNAT vs OSE/PSE), IDs de integración, URLs, flags; secretos en vault/env referenciados por id. |
| 1.4 | `invoice_document_sequences` | Series y **correlativo** autorizados por SUNAT (factura, boleta, NCR…), código de establecimiento. |
| 1.5 | `user_profiles` | Datos fiscales del **cliente** para facturarle (complementa `users` si separas identidad vs facturación). |
| 1.6 | `addresses` *(opcional)* | Múltiples direcciones del cliente (envío / fiscal). |

**Orden estricto de FK:** `company_legal_profiles` → `digital_certificates` / `sunat_emitter_settings` / `invoice_document_sequences` (todas referencian el perfil emisor). Luego, en **Fase 4**, `invoices` referencia `company_legal_profile_id` y, si aplica, `invoice_document_sequence_id`.

### Fase 2 — Catálogo unificado (las 3 líneas de negocio)

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 2.1 | `catalog_categories` | Categorías jerárquicas; filtradas por “ámbito” o línea de negocio. |
| 2.2 | `catalog_products` | Producto lógico: un sistema, una licencia OEM, o un servicio. |
| 2.3 | `catalog_product_categories` *(opcional)* | N:M producto ↔ categorías. |
| 2.4 | `catalog_skus` | Ofertas concretas: “código fuente”, “alquiler 90 días”, “Office 365 anual”, “VPS M”, etc. |
| 2.5 | `catalog_media` *(opcional)* | Imágenes/PDFs por producto. |
| 2.6 | `coupons` | Descuentos reutilizables en checkout. |

### Fase 3 — Versiones y entregables (software propio)

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 3.1 | `software_releases` | Versiones semver, changelog, artefacto (ZIP) en R2/S3, hash, `is_latest`. |
| 3.2 | `software_release_assets` *(opcional)* | Varios archivos por release (full, patch, docs). |

*Solo aplica a `catalog_products` donde `revenue_line = software_system` (enlazas por `catalog_product_id`).*

### Fase 4 — Ventas, pagos y facturas

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 4.1 | `orders` | Pedido/cotización aceptada; totales y snapshot fiscal. |
| 4.2 | `order_lines` | Líneas: qué SKU, cantidad, precio unitario, impuestos. |
| 4.3 | `payments` | Intentos y cobros: Culqi, PayPal, Yape, transferencia, etc. |
| 4.4 | `payment_refunds` *(opcional)* | Devoluciones parciales/totales ligadas a `payments`. |
| 4.5 | `invoices` | Comprobantes; enlace al emisor, tipo SUNAT, serie/número, estado de envío, rutas XML/CDR/PDF. |
| 4.6 | `invoice_lines` *(opcional)* | Detalle fiscal por ítem (incl. códigos SUNAT por línea si aplica). |
| 4.7 | `sunat_submission_logs` | Historial de cada envío a SUNAT/OSE: ticket, códigos, XML/CDR, reintentos, errores. |
| 4.8 | `sunat_boleta_daily_summaries` *(opcional)* | Si emites **boletas** y tu modalidad exige **resumen diario**: fecha, estado envío, zip/xml, ticket. |

### Fase 5 — Suscripciones y derechos (apagar servicios, SUNAT, SaaS)

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 5.1 | `subscriptions` | Suscripción comercial (estado, periodo actual, cancel_at_period_end). |
| 5.2 | `subscription_items` | Ítems dentro de la suscripción (SKU + cantidad + precio acordado). |
| 5.3 | `entitlements` | **Derecho de uso** efectivo post-compra: hasta cuándo puede usar el servicio o descargar; base para **apagar** al vencer o revocar. |
| 5.4 | `entitlement_secrets` | Credenciales rotativas: API key, token, referencia a certificado; **nunca** guardar secreto en claro (hash o cifrado + metadata). |

*Pedidos únicos (compra única de código) pueden crear `entitlement` sin fila en `subscriptions`, o con `subscription` de un solo periodo — tú eliges consistencia; lo documentado abajo permite ambos.*

### Fase 6 — Licencias (software propio instalado) y activaciones

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 6.1 | `license_keys` | Claves para productos **propios** on-premise / validación offline-friendly. |
| 6.2 | `license_activations` | Dominio, fingerprint, último ping, límite de activaciones. |

*Para licencias **OEM/de terceros** (Windows, etc.) usa más bien `order_lines` + entrega en `entitlements` o tabla `license_deliveries` con código de proveedor, sin mezclar con `license_keys` de tu motor propio si quieres reportes claros.*

### Fase 7 — Post-venta, webhooks, auditoría

| # | Tabla | Para qué sirve |
|---|--------|----------------|
| 7.1 | `webhook_events` | Idempotencia y trazabilidad Culqi/PayPal/otros. |
| 7.2 | `support_tickets` / `support_ticket_messages` | Soporte posventa. |
| 7.3 | `audit_logs` | Cambios sensibles (precios, revocaciones, roles). |
| 7.4 | `notifications` | In-app / email programático. |
| 7.5 | `personal_access_tokens` | API tokens de usuarios (si expones API). |

---

## Campos por tabla

Tipos indicativos: `uuid` | `string` | `text` | `boolean` | `integer` | `decimal` | `timestamp` | `jsonb` | `enum` (en PG suele ser `varchar` + check o tipo nativo).

### `company_legal_profiles` *(tu empresa — emisor de facturas)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `slug` | string | Único, ej. `orvae-principal` |
| `legal_name` | string | Razón social |
| `trade_name` | string | Nullable, nombre comercial |
| `ruc` | string(11) | RUC emisor |
| `tax_regime` | string | Nullable, régimen relevante para leyendas en CPE |
| `address_line` | text | Dirección fiscal (vía / número) |
| `district` | string | Nullable |
| `province` | string | Nullable |
| `department` | string | Nullable |
| `ubigeo` | string(6) | Nullable, código INEI 6 dígitos |
| `country` | string(2) | Default `PE` |
| `phone` | string | Nullable |
| `support_email` | string | Nullable |
| `website` | string | Nullable |
| `logo_path` | string | Nullable, para PDF/UI |
| `is_default_issuer` | boolean | Default false; un solo default para facturación |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

### `digital_certificates` *(firma de XML — emisor)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `company_legal_profile_id` | uuid | FK → `company_legal_profiles` |
| `label` | string | Ej. `SUNAT 2026` |
| `storage_disk` | string | ej. `s3`, `local` |
| `storage_path` | string | Ruta al .pfx o referencia KMS; **cifrado en reposo** |
| `certificate_thumbprint` | string | Nullable, SHA-1/256 para auditoría |
| `serial_number` | string | Nullable, del certificado |
| `issuer_cn` | string | Nullable |
| `valid_from`, `valid_until` | timestamp | Vigencia |
| `is_active` | boolean | Default true |
| `created_at`, `updated_at` | timestamp | |

*Passphrase del .pfx: **nunca** en BD; usa secret manager / env.*

### `sunat_emitter_settings` *(integración SUNAT / OSE / PSE)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `company_legal_profile_id` | uuid | FK, único 1:1 recomendado |
| `emission_mode` | string | `sunat_direct` \| `ose` \| `pse` (según implementes) |
| `ose_provider_code` | string | Nullable, si aplica |
| `api_base_url` | string | Nullable, endpoint proveedor |
| `sunat_username_hint` | string | Nullable, últimos caracteres SOL (no el password completo) |
| `credentials_secret_ref` | string | Nullable, id en vault para client_id/secret/tokens OSE |
| `default_certificate_id` | uuid | Nullable FK → `digital_certificates` |
| `environment` | string | `beta` \| `production` |
| `options` | jsonb | Timeouts, versión UBL, mapeos extra |
| `is_active` | boolean | Default true |
| `created_at`, `updated_at` | timestamp | |

### `invoice_document_sequences` *(series correlativas SUNAT)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `company_legal_profile_id` | uuid | FK |
| `document_type_code` | string | Catálogo SUNAT: `01` factura, `03` boleta, `07` nota crédito, etc. |
| `serie` | string | Ej. `F001`, `B001` |
| `establishment_code` | string | Código de establecimiento autorizado |
| `next_correlative` | integer | Siguiente número a usar (incremento **transaccional** al emitir) |
| `correlative_from`, `correlative_to` | integer | Nullable, si SUNAT acotó rango |
| `authorization_metadata` | jsonb | Nullable, resolución/fechas si las guardas |
| `is_active` | boolean | Default true |
| `created_at`, `updated_at` | timestamp | |

*Índice único sugerido: (`company_legal_profile_id`, `document_type_code`, `serie`, `establishment_code`).*

### `user_profiles`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | FK → `users` |
| `company_name` | string | Nullable |
| `legal_name` | string | Nullable, razón social |
| `ruc` | string(11) | Nullable |
| `tax_status` | string | Nullable (ej. afecto/exonerado si aplica) |
| `billing_email` | string | Nullable |
| `phone` | string | Nullable |
| `country` | string(2) | Default `PE` |
| `city` | string | Nullable |
| `address` | text | Nullable |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

*Implementado: migración `2026_03_21_103000_create_user_profiles_table`, modelo `UserProfile`, `user_id` único (1:1 con `users`), FK `onDelete('cascade')`, relación `User::profile()`.*

*UI: portal de cliente en `/cliente` (diseño claro, tipografía legible), formulario de datos fiscales en `/cliente/facturacion`. Roles: `superadmin` → panel interno (`/dashboard`, `/panel/*`); `client` → portal (`/cliente`).*

### `addresses` *(opcional)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | FK |
| `type` | string | `billing`, `shipping`, etc. |
| `line1`, `line2` | string | |
| `district`, `city`, `region`, `postal_code` | string | Nullable |
| `country` | string(2) | |
| `is_default` | boolean | |
| `created_at`, `updated_at` | timestamp | |

### `catalog_categories`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `parent_id` | uuid | Nullable, auto-FK |
| `slug` | string | Único por “ámbito” o global |
| `name` | string | |
| `description` | text | Nullable |
| `revenue_line` | string | `software_system` \| `oem_license` \| `service` (filtra dónde se usa) |
| `sort_order` | integer | Default 0 |
| `is_active` | boolean | Default true |
| `created_at`, `updated_at` | timestamp | |

### `catalog_products`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `category_id` | uuid | Nullable FK → `catalog_categories` |
| `slug` | string | Único |
| `name` | string | |
| `tagline` | string | Nullable |
| `description` | text | |
| `highlights` | jsonb | Lista de bullets para storefront |
| `specs` | jsonb | Requisitos, stack, etc. |
| `is_active` | boolean | Default true |
| `deleted_at` | timestamp | Nullable, soft delete opcional |
| `created_at`, `updated_at` | timestamp | |

> `revenue_line` no se almacena en `catalog_products`; se deriva desde `catalog_categories.revenue_line` a través de `category_id` para evitar redundancia.

### `catalog_product_categories` *(opcional, N:M)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `catalog_product_id` | uuid | FK |
| `catalog_category_id` | uuid | FK |
| PK compuesta | | |

### `catalog_skus`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `catalog_product_id` | uuid | FK → `catalog_products` |
| `code` | string | Código interno único |
| `name` | string | Etiqueta en checkout |
| `sale_model` | string | Ver tabla de valores abajo |
| `billing_interval` | string | Nullable: `one_time`, `monthly`, `annual`, `custom` |
| `rental_days` | integer | Nullable, para alquiler de código/proyecto |
| `list_price` | decimal(12,2) | |
| `currency` | string(3) | `PEN`, `USD` |
| `tax_included` | boolean | Si el precio ya incluye IGV |
| `limits` | jsonb | Usuarios, módulos, GB, etc. |
| `fulfillment_type` | string | `download`, `manual_provision`, `saas_url`, `external_vendor`, etc. |
| `metadata` | jsonb | Default `{}` |
| `is_active` | boolean | Default true |
| `sort_order` | integer | Default 0 |
| `created_at`, `updated_at` | timestamp | |

**Valores sugeridos para `sale_model`:**

| Valor | Uso |
|-------|-----|
| `source_perpetual` | Compra única del código fuente |
| `source_rental` | Alquiler del proyecto / acceso al repo por tiempo |
| `saas_subscription` | Software como servicio (tu hosting) |
| `oem_license_one_time` | Licencia de terceros pago único |
| `oem_license_subscription` | Licencia tipo Microsoft 365 / Canva Pro |
| `service_project` | Servicio por proyecto (dev a medida, implementación) |
| `service_subscription` | Servicio recurrente (correo, VPS, SUNAT API, soporte) |

### `catalog_media` *(opcional)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `catalog_product_id` | uuid | FK |
| `kind` | string | `image`, `pdf`, `video` |
| `url` o `storage_path` | string | |
| `sort_order` | integer | |
| `created_at`, `updated_at` | timestamp | |

### `coupons`

Migración Laravel: `2026_03_21_130000_create_coupons_table.php` · modelo `App\Models\Coupon`.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `code` | string | Único |
| `discount_type` | string | `percent`, `fixed` |
| `discount_value` | decimal | |
| `max_uses` | integer | Nullable |
| `used_count` | integer | Default 0 |
| `applicable_sku_ids` | jsonb | Nullable; null = todos; `[]` = ningún SKU |
| `starts_at`, `expires_at` | timestamp | Nullable |
| `is_active` | boolean | |
| `created_at`, `updated_at` | timestamp | |

### `software_releases`

Migración Laravel: `2026_03_21_140000_create_software_releases_table.php` · modelo `App\Models\SoftwareRelease` · panel `panel/catalogo-releases` (solo productos cuya categoría tiene `revenue_line = software_system`).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `catalog_product_id` | uuid | FK, solo productos `software_system` |
| `version` | string | Semver |
| `changelog` | text | |
| `artifact_path` | string | Nullable, R2/S3 |
| `artifact_sha256` | string | Nullable |
| `min_php_version` | string | Nullable |
| `is_latest` | boolean | Default false |
| `released_at` | timestamp | |
| `created_at`, `updated_at` | timestamp | |

### `software_release_assets`

Migración Laravel: `2026_03_21_150000_create_software_release_assets_table.php` · modelo `App\Models\SoftwareReleaseAsset` · panel `panel/catalogo-releases/{software_release}/assets` (botón de archivos en la fila de cada release).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `software_release_id` | uuid | FK |
| `label` | string | |
| `path` | string | |
| `sha256` | string | Nullable |
| `created_at`, `updated_at` | timestamp | |

### `orders`

Migración Laravel: `2026_03_22_100000_create_orders_table.php` · modelo `App\Models\Order` · panel `panel/ventas-ordenes` (listado) y `panel/ventas-ordenes/{order}` (detalle con líneas).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `order_number` | string | Único, humano (ej. ORV-2026-00001) |
| `user_id` | bigint | FK `users` (Laravel `id` incremental) |
| `status` | string | `draft`, `pending_payment`, `paid`, `cancelled`, `refunded`, … |
| `currency` | string(3) | |
| `subtotal` | decimal | |
| `discount_total` | decimal | Default 0 |
| `tax_total` | decimal | Default 0 |
| `grand_total` | decimal | |
| `coupon_id` | uuid | Nullable |
| `billing_snapshot` | jsonb | Copia fiscal al momento de compra |
| `notes_internal` | text | Nullable |
| `placed_at` | timestamp | Nullable |
| `created_at`, `updated_at` | timestamp | |

### `order_lines`

Migración Laravel: `2026_03_22_101000_create_order_lines_table.php` · modelo `App\Models\OrderLine`.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `order_id` | uuid | FK |
| `catalog_sku_id` | uuid | FK |
| `product_name_snapshot` | string | Denormalizado |
| `sku_name_snapshot` | string | Denormalizado |
| `quantity` | integer | Default 1 |
| `unit_price` | decimal | Precio congelado |
| `line_discount` | decimal | Default 0 |
| `tax_amount` | decimal | Default 0 |
| `line_total` | decimal | |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

### `payments`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `order_id` | uuid | FK |
| `user_id` | uuid o bigint | FK |
| `gateway` | string | `culqi`, `paypal`, `yape`, `bank_transfer`, `manual`, … |
| `gateway_payment_id` | string | Nullable, único si aplica |
| `amount` | decimal | |
| `currency` | string(3) | |
| `status` | string | `pending`, `authorized`, `captured`, `failed`, `refunded`, … |
| `raw_request` | jsonb | Nullable |
| `raw_response` | jsonb | Nullable |
| `failure_message` | text | Nullable |
| `paid_at` | timestamp | Nullable |
| `approved_by_user_id` | uuid o bigint | Nullable, transferencias manuales |
| `transfer_proof_path` | string | Nullable |
| `created_at`, `updated_at` | timestamp | |

### `payment_refunds` *(opcional)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `payment_id` | uuid | FK |
| `amount` | decimal | |
| `reason` | text | Nullable |
| `gateway_refund_id` | string | Nullable |
| `status` | string | |
| `created_at`, `updated_at` | timestamp | |

### `invoices`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `company_legal_profile_id` | uuid | FK → emisor (tu empresa) |
| `invoice_document_sequence_id` | uuid | Nullable FK, secuencia usada para serie/correlativo |
| `invoice_number` | string | Único en tu negocio (ej. legado interno `FAC-2026-00001`) |
| `sunat_document_type_code` | string | `01`, `03`, `07`, … |
| `sunat_serie` | string | Copiado al emitir |
| `sunat_correlative` | string | Correlativo de ancho fijo (ej. 8 dígitos) |
| `sunat_filing_status` | string | `pending`, `queued`, `submitted`, `accepted`, `rejected`, `voided` |
| `order_id` | uuid | FK |
| `user_id` | uuid o bigint | FK cliente |
| `status` | string | `draft`, `issued`, `paid`, `void` (comercial / cobro) |
| `subtotal`, `tax_total`, `grand_total` | decimal | |
| `currency` | string(3) | |
| `pdf_path` | string | Nullable, representación impresa |
| `xml_unsigned_path` | string | Nullable |
| `xml_signed_path` | string | Nullable |
| `cdr_path` | string | Nullable, constancia SUNAT/OSE |
| `sunat_response_code` | string | Nullable |
| `sunat_response_description` | text | Nullable |
| `issued_at`, `due_at` | timestamp | |
| `paid_at` | timestamp | Nullable |
| `buyer_snapshot` | jsonb | Nullable, copia RUC/razón social/dirección del adquirente al emitir |
| `sunat_metadata` | jsonb | Nullable, QR, hash, campos extensibles |
| `created_at`, `updated_at` | timestamp | |

### `invoice_lines` *(opcional)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `invoice_id` | uuid | FK |
| `description` | string | |
| `quantity` | decimal | |
| `unit_price` | decimal | |
| `tax_rate` | decimal | Nullable, ej. 18% IGV |
| `line_total` | decimal | |
| `sunat_product_code` | string | Nullable, catálogo SUNAT si aplica |
| `igv_affectation_code` | string | Nullable, tipo afectación IGV |
| `metadata` | jsonb | Default `{}` |

### `sunat_submission_logs`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `invoice_id` | uuid | FK → `invoices` |
| `attempt` | integer | 1, 2, 3… |
| `channel` | string | `sunat`, `ose`, `pse` |
| `request_hash` | string | Nullable, integridad del payload enviado |
| `http_status` | integer | Nullable |
| `sunat_ticket` | string | Nullable, si el flujo usa ticket |
| `response_code` | string | Nullable |
| `response_message` | text | Nullable |
| `cdr_storage_path` | string | Nullable |
| `xml_signed_storage_path` | string | Nullable |
| `raw_request_ref` | string | Nullable, path a blob audit |
| `raw_response_ref` | string | Nullable |
| `success` | boolean | |
| `created_at` | timestamp | |

### `sunat_boleta_daily_summaries` *(opcional — boletas + resumen diario)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `company_legal_profile_id` | uuid | FK |
| `summary_date` | date | Día del resumen |
| `status` | string | `draft`, `submitted`, `accepted`, `rejected` |
| `line_count` | integer | Nullable |
| `ticket` | string | Nullable |
| `zip_storage_path` | string | Nullable |
| `cdr_path` | string | Nullable |
| `response_payload` | jsonb | Nullable |
| `created_at`, `updated_at` | timestamp | |

### `subscriptions`

Migración Laravel: `2026_03_24_100000_create_subscriptions_table.php` · modelo `App\Models\Subscription` · panel `panel/ventas-suscripciones` (listado).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | FK |
| `status` | string | `trialing`, `active`, `past_due`, `paused`, `cancelled` |
| `gateway_customer_id` | string | Nullable |
| `gateway_subscription_id` | string | Nullable |
| `current_period_start`, `current_period_end` | timestamp | |
| `cancel_at_period_end` | boolean | Default false |
| `cancelled_at` | timestamp | Nullable |
| `trial_ends_at` | timestamp | Nullable |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

### `subscription_items`

Migración Laravel: `2026_03_24_101000_create_subscription_items_table.php` · modelo `App\Models\SubscriptionItem`.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `subscription_id` | uuid | FK |
| `catalog_sku_id` | uuid | FK |
| `quantity` | integer | Default 1 |
| `unit_price` | decimal | |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

### `entitlements`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | FK |
| `catalog_product_id` | uuid | FK |
| `catalog_sku_id` | uuid | Nullable FK |
| `order_id` | uuid | Nullable FK |
| `order_line_id` | uuid | Nullable FK |
| `subscription_id` | uuid | Nullable FK |
| `status` | string | `pending`, `active`, `expired`, `suspended`, `revoked` |
| `starts_at` | timestamp | |
| `ends_at` | timestamp | Nullable (null = sin fin acordado / perpetuo según negocio) |
| `suspended_at` | timestamp | Nullable |
| `revoked_at` | timestamp | Nullable |
| `revoke_reason` | text | Nullable |
| `feature_flags` | jsonb | Qué módulos o endpoints tiene activos (ej. `sunat_sync: true`) |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

**Apagar servicio:** job o middleware pone `status = expired` o `suspended` cuando `ends_at < now()` o cuando falla el pago; opcionalmente revoca filas en `entitlement_secrets`. Las integraciones (SUNAT) consultan `entitlements` + secretos vigentes.

### `entitlement_secrets`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `entitlement_id` | uuid | FK → `entitlements` |
| `kind` | string | `api_key`, `hmac_secret`, `oauth_refresh`, `certificate`, `custom` |
| `label` | string | Nullable, para UI |
| `public_ref` | string | Nullable, últimos caracteres o id público |
| `secret_ciphertext` o `secret_hash` | text | Según estrategia: cifrado reversible (KMS) o solo hash si no necesitas leer el valor |
| `expires_at` | timestamp | Nullable |
| `rotated_at` | timestamp | Nullable |
| `revoked_at` | timestamp | Nullable |
| `last_used_at` | timestamp | Nullable |
| `metadata` | jsonb | Default `{}` |
| `created_at`, `updated_at` | timestamp | |

### `license_keys` (producto propio)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `key` | string | Único, formato legible o hash del secreto |
| `user_id` | uuid o bigint | FK |
| `order_id` | uuid | FK |
| `catalog_sku_id` | uuid | FK |
| `software_release_id` | uuid | Nullable |
| `entitlement_id` | uuid | Nullable, si unificas con derechos |
| `status` | string | `active`, `expired`, `revoked` |
| `max_activations` | integer | Default 1 |
| `activation_count` | integer | Default 0 |
| `expires_at` | timestamp | Nullable |
| `created_at`, `updated_at` | timestamp | |

### `license_activations`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `license_key_id` | uuid | FK → `license_keys` |
| `domain` | string | |
| `server_fingerprint` | string | Nullable |
| `ip_address` | string | |
| `last_ping_at` | timestamp | |
| `is_active` | boolean | Default true |
| `created_at`, `updated_at` | timestamp | |

### `oem_license_deliveries` *(opcional, licencias Windows/Office/Canva)*

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `order_line_id` | uuid | FK |
| `vendor` | string | Microsoft, Adobe, etc. |
| `license_code` o `activation_payload` | text | Cifrado o almacén externo |
| `delivered_at` | timestamp | Nullable |
| `expires_at` | timestamp | Nullable |
| `status` | string | `pending`, `delivered`, `revoked` |
| `metadata` | jsonb | |
| `created_at`, `updated_at` | timestamp | |

### `webhook_events`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `gateway` | string | |
| `gateway_event_id` | string | Único |
| `event_type` | string | |
| `payload` | jsonb | |
| `processed` | boolean | Default false |
| `processed_at` | timestamp | Nullable |
| `error` | text | Nullable |
| `attempts` | integer | Default 0 |
| `created_at`, `updated_at` | timestamp | |

### `support_tickets` / `support_ticket_messages`

Soporte posventa: conversación **asíncrona** (ticket + mensajes; no exige chat en vivo). Puede incluir respuestas con **`sender_type = ai`**. **Campos detallados:** [anexo al final del documento](#anexo-soporte-tickets-y-mensajes-incl-ia).

### `audit_logs`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | Nullable |
| `action` | string | |
| `entity_type` | string | |
| `entity_id` | uuid | |
| `old_values`, `new_values` | jsonb | Nullable |
| `ip_address` | string | Nullable |
| `user_agent` | text | Nullable |
| `created_at` | timestamp | |

### `notifications`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | FK |
| `type` | string | |
| `channel` | string | `email`, `in_app` |
| `data` | jsonb | |
| `read_at` | timestamp | Nullable |
| `created_at`, `updated_at` | timestamp | |

### `personal_access_tokens` (API)

Si ya existe en Laravel con `tokenable_id` bigint, respétalo; si creas propia con UUID, alinea con tu `users.id`.

---

## Resumen de flujo por tipo de ingreso

| Línea | Catálogo | Compra | Post-pago |
|-------|----------|--------|-----------|
| **Sistema propio** | `catalog_products` + `catalog_skus` (`source_*`, `saas_*`) + `software_releases` | `orders` / `order_lines` | Descarga por release; `license_keys` si on-prem; `entitlements` si acceso SaaS |
| **Licencias OEM** | `revenue_line = oem_license`, SKUs `oem_*` | Igual | `oem_license_deliveries` o `entitlements` con metadata del código |
| **Servicios** | `revenue_line = service`, SKUs `service_*` | Igual | `subscriptions` + `entitlements` + `entitlement_secrets` para APIs (SUNAT, etc.) |

---

## Índices recomendados (cuando implementes migraciones)

- `catalog_products (revenue_line, is_active)`, `catalog_products (slug)` único.  
- `catalog_skus (catalog_product_id, is_active)`.  
- `company_legal_profiles (ruc)` único o `(slug)` único.  
- `invoice_document_sequences` único compuesto según negocio (perfil + tipo + serie + establecimiento).  
- `invoices (sunat_filing_status, issued_at)`, `invoices (order_id)`.  
- `sunat_submission_logs (invoice_id, attempt)`.  
- `orders (user_id, status)`, `order_lines (order_id)`.  
- `payments (order_id, status)`, `payments (gateway, gateway_payment_id)` único parcial.  
- `entitlements (user_id, status)`, `entitlements (ends_at)` donde `status = active`.  
- `webhook_events (processed, created_at)` parcial donde `processed = false`.  
- `showcase_clients (is_published, sort_order)`, `showcase_clients (sector)`.  

---

## Marketing — vitrina de clientes (`showcase_clients`)

Empresas autorizadas para mostrar en la web (logos, enlace opcional). Consulta pública típica: `is_published = true` ordenado por `sort_order`.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `legal_name` | string | Razón social |
| `display_name` | string | Nullable; nombre corto en UI si difiere de la razón social |
| `slug` | string | Nullable, único; por si más adelante hay ficha `/clientes/{slug}` |
| `logo_path` | string | Nullable; ruta bajo `storage` o convención `public` |
| `website_url` | string | Nullable; URL pública del cliente |
| `sector` | string | Nullable; filtro vitrina (ej. retail, logistics) |
| `is_published` | boolean | Si entra en la vitrina |
| `sort_order` | unsigned int | Orden manual |
| `admin_notes` | text | Nullable; solo backoffice |
| `authorized_at` | timestamp | Nullable; referencia de autorización de uso de marca |
| `created_at`, `updated_at` | timestamp | |

Índices: `(is_published, sort_order)`, `sector`.

---

## Anexo: soporte (tickets y mensajes, incl. IA)

Un **ticket** es el contenedor del caso; los **mensajes** forman el hilo (cliente, staff o IA). Índices recomendados: `support_tickets (user_id, status)`, `support_ticket_messages (support_ticket_id, created_at)`.

### `support_tickets`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid o bigint | FK → `users` (cliente que abre el ticket) |
| `subject` | string | Asunto del caso |
| `status` | string | ej. `open`, `pending`, `waiting_customer`, `resolved`, `closed` |
| `priority` | string | ej. `low`, `normal`, `high` |
| `assigned_to` | uuid o bigint | Nullable, FK → `users` (staff asignado) |
| `last_activity_at` | timestamp | Nullable |
| `metadata` | jsonb | Nullable (origen, idioma, canal, etc.) |
| `created_at`, `updated_at` | timestamp | |

### `support_ticket_messages`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `support_ticket_id` | uuid | FK → `support_tickets` (recomendado `cascadeOnDelete`) |
| `sender_type` | string | `user`, `staff`, `ai` — distingue cliente, humano e IA |
| `sender_id` | uuid o bigint | Nullable, FK → `users` cuando `sender_type` es `user` o `staff`; null si la IA no usa usuario sistema |
| `body` | text | Contenido del mensaje |
| `attachments` | jsonb | Nullable; URLs o metadatos de ficheros |
| `is_internal` | boolean | Default false; notas solo visibles para staff |
| `metadata` | jsonb | Nullable (modelo IA, tokens, ids de proveedor, etc.) |
| `created_at` | timestamp | |


*Documento alineado a tres líneas de negocio, pasarelas (Culqi, PayPal, Yape, transferencia), **emisión electrónica SUNAT** (emisor, certificado, secuencias, logs) y corte/apagado de servicios vía `entitlements` + secretos con vencimiento.*

*Enlaces útiles oficiales: [Orientación SUNAT — emisor electrónico](https://orientacion.sunat.gob.pe/01condiciones-para-ser-emisor-electronico-y-para-emitir-comprobantes-electronicos), [CPE — información general / OSE](https://cpe.sunat.gob.pe/informacion_general/operador_servicios_electronicos).*

