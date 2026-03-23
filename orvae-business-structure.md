# Orvae — Estructura de Negocio

> Documento interno de estrategia · v1.0 · 2026  
> Fundador: Ing. Rodrigo · Chiclayo, Perú

---

## Índice

1. [Visión y misión](#1-visión-y-misión)
2. [El problema que resolvemos](#2-el-problema-que-resolvemos)
3. [Propuesta de valor](#3-propuesta-de-valor)
4. [Productos y catálogo](#4-productos-y-catálogo)
5. [Modelos de venta](#5-modelos-de-venta)
6. [Estructura de precios](#6-estructura-de-precios)
7. [Mercados objetivo](#7-mercados-objetivo)
8. [Canales de venta y marketing](#8-canales-de-venta-y-marketing)
9. [Estructura operativa](#9-estructura-operativa)
10. [Plataforma de comercialización](#10-plataforma-de-comercialización)
11. [Pasarelas de pago](#11-pasarelas-de-pago)
12. [Métricas clave de negocio](#12-métricas-clave-de-negocio)
13. [Hoja de ruta de crecimiento](#13-hoja-de-ruta-de-crecimiento)
14. [Riesgos y mitigaciones](#14-riesgos-y-mitigaciones)
15. [Proyección financiera inicial](#15-proyección-financiera-inicial)

---

## 1. Visión y misión

### Visión

Ser la empresa peruana de software empresarial de mayor confianza en LATAM — reconocida no por ser la más barata, sino por ser la que mejor entiende la realidad operativa de las empresas de la región.

### Misión

Desarrollar y comercializar sistemas ERP y software de gestión empresarial de calidad internacional, con soporte local en español, adaptados a la normativa peruana, y accesibles para empresas medianas, municipalidades, MYPEs y sectores industriales que hoy no tienen acceso a herramientas de ese nivel.

### Valores

- **Confiabilidad** — El software funciona. El soporte responde. La palabra se cumple.
- **Claridad** — Sin letra pequeña. El cliente sabe exactamente qué está comprando y qué recibe.
- **Progresividad** — Empezamos pequeño con cada cliente y crecemos juntos.
- **Proximidad** — Soporte en español, conocimiento de la realidad peruana, respuesta local.

---

## 2. El problema que resolvemos

### El mercado peruano de software empresarial tiene tres problemas centrales:

**Problema 1 — El software extranjero no entiende el contexto local**  
SAP, Oracle, y los grandes ERP están diseñados para mercados europeos o norteamericanos. No tienen integración SUNAT nativa, no manejan la estructura de empresas con sedes regionales dispersas, y su soporte es en inglés o con intermediarios costosos.

**Problema 2 — El software local carece de calidad enterprise**  
Las alternativas peruanas son frecuentemente desarrolladas por equipos pequeños sin arquitectura escalable, sin actualizaciones consistentes, y con soporte deficiente. Las empresas terminan atrapadas en sistemas obsoletos.

**Problema 3 — El precio de los buenos sistemas es inaccesible**  
Una licencia SAP Business One cuesta entre $3,000 y $10,000 USD solo de implementación, más suscripción mensual. Las empresas medianas y MYPEs no pueden pagarlo, y quedan sin herramientas o usan Excel.

### El espacio que ocupa Orvae

Orvae se posiciona exactamente en el espacio vacío entre el software extranjero caro y el software local de baja calidad. Calidad enterprise, precio LATAM, soporte peruano.

---

## 3. Propuesta de valor

### Para el cliente, Orvae significa:

| Lo que otros ofrecen | Lo que Orvae ofrece |
|---|---|
| Implementación de 6 meses | Listo en días o semanas |
| Soporte en inglés | Soporte en español, zona horaria Perú |
| Contrato anual sin salida | Empieza mensual, escala o cancela |
| Caja negra — no entiendes qué tienes | Documentación clara, código propio |
| Consultor externo para todo cambio | Panel admin para configurar sin consultor |
| Precio opaco por negociación | Precio público en el sitio web |

### Diferenciador central: **confiabilidad demostrable**

No decimos que somos confiables — lo demostramos con:
- SLA documentado con penalidades reales
- Uptime público en `status.orvae.com`
- Historial de versiones y changelog público
- Soporte con tiempo de respuesta comprometido por escrito
- Contratos simples en español sin cláusulas ocultas

---

## 4. Productos y catálogo

### Suite principal

**Orvae ERP** — Sistema de gestión empresarial integrado. Cubre los procesos críticos de una organización mediana: activos fijos, inventario TI, licencias de software, proveedores, reportes multi-zona. Construido con Laravel 12 + React 19 + PostgreSQL 16.

### Módulos independientes (vendibles por separado)

| Módulo | Descripción | Sector principal |
|---|---|---|
| **Orvae Assets** | Gestión de activos fijos tecnológicos y no tecnológicos | Todos |
| **Orvae Zones** | Control multi-zonal y reportería en tiempo real | Telcos, manufactura |
| **Orvae Vault** | Licencias de software, contratos, renovaciones | TI corporativo |
| **Orvae Stock** | Inventario y almacenes | Manufactura, MYPE |
| **Orvae People** | Gestión básica de personal y asistencia | Todos |
| **Orvae Docs** | Gestión documental y flujos de aprobación | Municipalidades |
| **Orvae Obras** (futuro) | Control de obras y proyectos de infraestructura | Municipalidades |

### Principio de catálogo

Cada módulo puede venderse standalone o como parte del ERP completo. El cliente paga solo por lo que usa. Esto reduce la barrera de entrada — una MYPE puede empezar con solo Orvae Assets por $29/mes y escalar después.

---

## 5. Modelos de venta

Orvae opera con cuatro modelos simultáneos. Cada cliente elige el que mejor se adapta a su situación:

### Modelo 1 — Suscripción SaaS (mensual o anual)

El cliente accede al software en la nube de Orvae. Orvae se encarga de la infraestructura, actualizaciones, backups y seguridad. El cliente no instala nada.

- **Ideal para:** MYPEs, empresas sin área TI, primeros clientes
- **Ventaja para Orvae:** Ingreso recurrente predecible (MRR)
- **Descuento anual:** 20% sobre el precio mensual × 12

### Modelo 2 — Licencia perpetua (pago único)

El cliente compra el derecho de uso permanente de la versión actual. Las actualizaciones mayores tienen costo adicional. Las correcciones de bugs son gratuitas por 12 meses.

- **Ideal para:** Empresas con área TI propia, clientes que prefieren no suscripciones
- **Precio:** 12× el precio mensual del plan equivalente
- **Incluye:** 12 meses de soporte técnico y actualizaciones menores

### Modelo 3 — Alquiler de código fuente (temporal)

El cliente accede al código fuente por un período determinado (3, 6 o 12 meses). Puede desplegarlo en su propio servidor y modificarlo. Al vencer el período, el código sigue funcionando pero no recibe actualizaciones ni soporte.

- **Ideal para:** Empresas con desarrolladores propios que quieren personalizar
- **Precio:** 8× el precio mensual por 3 meses, con descuentos por períodos mayores
- **Restricción:** No puede redistribuir ni revender el código

### Modelo 4 — Módulos sueltos

El cliente compra módulos individuales en cualquiera de las modalidades anteriores. Puede combinar: Assets en SaaS + Vault en licencia perpetua.

---

## 6. Estructura de precios

### Criterios de fijación de precio

- **Referencia inferior:** precio de software local de baja calidad (~$20-50/mes)
- **Referencia superior:** precio de SAP B1 o sistemas similares (~$300-800/mes)
- **Posición Orvae:** segmento medio-alto con calidad enterprise (~$49-299/mes)
- **Sensibilidad:** el mercado peruano es precio-sensible — los primeros clientes requieren valor demostrable antes de comprometerse

### Tabla de precios base (USD)

| Plan | Usuarios | Módulos | SaaS mensual | SaaS anual | Perpetua |
|---|---|---|---|---|---|
| **Starter** | Hasta 10 | 2 módulos | $49/mes | $470/año | $588 |
| **Pro** | Hasta 50 | 5 módulos | $99/mes | $950/año | $1,188 |
| **Business** | Hasta 200 | Todos | $199/mes | $1,910/año | $2,388 |
| **Enterprise** | Ilimitado | Todos + source | $299/mes | $2,870/año | Cotización |

### Precio en soles (PEN)

Para clientes en Perú que prefieren pagar en soles, usar el tipo de cambio del día con spread del 3%. Facturar en PEN con IGV incluido.

### Política de descuentos

- **ONGs y asociaciones civiles:** 30% de descuento permanente
- **Municipalidades distritales:** 25% de descuento (volumen bajo, impacto social alto)
- **Primeros 50 clientes (early adopters):** precio congelado de por vida
- **Pago anual adelantado:** 20% de descuento
- **Referidos:** 10% del primer año del referido como crédito en cuenta

---

## 7. Mercados objetivo

### Mercado 1 — Telecomunicaciones (prioridad alta)

**Por qué:** Es el sector donde el fundador tiene experiencia directa y conocimiento profundo del flujo operativo. Los sistemas existentes son obsoletos o mal adaptados. Las empresas de telecomunicaciones medianas en Perú tienen presupuesto de TI pero no acceso a herramientas adecuadas.

**Perfil del cliente:** Empresa telco de 50-500 empleados, operaciones en 2-4 regiones, área TI de 3-10 personas, presupuesto de software de $500-3,000/mes.

**Módulos más relevantes:** Orvae Zones, Orvae Assets, Orvae Vault, Orvae ERP completo.

**Ticket promedio estimado:** $199-299/mes (plan Business o Enterprise).

**Cómo llegar:** Red de contactos existente del fundador, LinkedIn sectorial, eventos de telecomunicaciones (Osiptel, eventos de SUTEL).

---

### Mercado 2 — Municipalidades y gobierno local

**Por qué:** Las municipalidades distritales y provinciales de Perú están obligadas por ley a sistematizar sus procesos pero tienen presupuestos limitados y dependencia de software desactualizado. El acceso a licitaciones públicas (SEACE) puede ser un canal de ventas potente a mediano plazo.

**Perfil del cliente:** Municipalidad distrital de 20-200 trabajadores, presupuesto institucional asignado a TI, necesidad de gestión documental y control de bienes del estado.

**Módulos más relevantes:** Orvae Assets (control de bienes del estado), Orvae Docs (gestión documental), Orvae People (personal).

**Ticket promedio estimado:** $49-99/mes (plan Starter o Pro) con posibilidad de licencia perpetua financiada por presupuesto institucional.

**Cómo llegar:** Contacto directo con gerentes de TI municipales, colegios de ingenieros regionales, consultoras que trabajan con el estado.

**Consideración importante:** Las contrataciones con el estado requieren RUC activo, estar habilitado en RNP (Registro Nacional de Proveedores), y potencialmente participar en licitaciones SEACE. Este canal tiene mayor fricción pero tickets más grandes y contratos más largos.

---

### Mercado 3 — Empresas medianas de servicios

**Por qué:** Empresas de 20-500 empleados en sectores como logística, salud, educación privada, retail y servicios profesionales necesitan sistemas pero no tienen el presupuesto ni el interés de implementar SAP.

**Perfil del cliente:** Empresa con área administrativa de 5-30 personas, algún nivel de digitalización (usan Office 365 o Google Workspace), frustradas con Excel o sistemas heredados.

**Módulos más relevantes:** Orvae ERP completo, Orvae Stock, Orvae People.

**Ticket promedio estimado:** $99-199/mes.

**Cómo llegar:** LinkedIn, contenido educativo (YouTube, blog), alianzas con estudios contables y consultoras administrativas.

---

### Mercado 4 — Manufactura e industria

**Por qué:** Las plantas de manufactura medianas en Perú (textil, agroindustria, metalmecánica) tienen flujos de activos e inventario complejos que se gestionan en hojas de cálculo o sistemas legacy.

**Perfil del cliente:** Planta de 50-300 trabajadores, gerente de operaciones como decisor, necesidad de trazabilidad de equipos y materiales.

**Módulos más relevantes:** Orvae Assets, Orvae Stock, Orvae Zones.

**Ticket promedio estimado:** $99-199/mes.

---

### Mercado 5 — MYPEs (micro y pequeñas empresas)

**Por qué:** Son el segmento de mayor volumen en Perú. Tienen presupuesto muy limitado pero alta necesidad de digitalización. Son el canal de adquisición masiva que financia el crecimiento.

**Perfil del cliente:** Negocio de 1-20 personas, dueño como decisor, busca simplicidad y precio bajo.

**Módulos más relevantes:** Orvae Assets (básico), Orvae Stock, módulos sueltos del plan Starter.

**Ticket promedio estimado:** $29-49/mes.

**Estrategia específica:** Plan freemium o trial gratuito de 30 días para reducir la barrera de entrada. El objetivo no es maximizar ticket sino volumen y viralidad.

---

## 8. Canales de venta y marketing

### Fase 1 (meses 1-6): Ventas directas

El fundador es el único vendedor. El objetivo es conseguir los primeros 10-20 clientes de pago que validen el producto y generen testimonios reales.

**Acciones concretas:**
- Contacto directo con red profesional existente (contactos de la telco actual)
- LinkedIn outreach personalizado a gerentes de TI en sectores objetivo
- Demos en video por Zoom o Google Meet
- Propuesta comercial con la marca Orvae, precios claros, contrato simple

**Meta:** 10 clientes de pago al final del mes 6.

---

### Fase 2 (meses 7-18): Contenido y comunidad

Con los primeros clientes y casos de éxito documentados, construir presencia digital que genere inbound.

**Acciones concretas:**
- Blog técnico en `orvae.com/blog` sobre gestión de activos, ERP, TI para empresas peruanas
- Canal de YouTube con tutoriales del sistema y contenido educativo para gerentes de TI
- LinkedIn personal del fundador como voz de la marca (thought leadership)
- SEO para términos como "software ERP Perú", "gestión de activos Chiclayo", "sistema de inventario MYPE Perú"

---

### Fase 3 (mes 18+): Canal de partners y resellers

Una vez que el producto esté maduro y haya casos de éxito documentados, construir una red de partners que vendan Orvae a cambio de comisión.

**Perfil del partner ideal:**
- Consultoras de TI en regiones (Arequipa, Trujillo, Lima)
- Estudios contables que asesoran MYPEs
- Integradores de sistemas que ya venden a municipalidades

**Modelo de comisión:** 20% del primer año de cada cliente que traigan.

---

## 9. Estructura operativa

### Fase actual: fundador único

En la fase inicial, el fundador cubre todos los roles. Esto es viable con 1-20 clientes y con la plataforma automatizando la mayor parte de la operación.

| Función | Quién | Herramienta |
|---|---|---|
| Desarrollo de producto | Fundador | Cursor + Claude + Laravel/React |
| Ventas y demos | Fundador | LinkedIn, Zoom, email |
| Soporte técnico | Fundador | Panel de tickets Orvae |
| Facturación y cobros | Automatizado | Plataforma Orvae + Culqi/PayPal |
| Marketing de contenidos | Fundador | Blog, LinkedIn, YouTube |
| Infraestructura | Semi-automatizado | VPS Elástika + Docker + Mailcow |

### Cuándo contratar el primer colaborador

El primer colaborador debe ser un **técnico de soporte junior** cuando:
- Se superen 30 clientes activos, o
- El tiempo de soporte supere 3 horas diarias

El segundo colaborador debe ser un **desarrollador junior** cuando:
- Los ingresos superen $3,000/mes, o
- Haya más de 5 solicitudes de personalización en cola

### Herramientas operativas del día a día

| Área | Herramienta | Costo estimado |
|---|---|---|
| Correo corporativo | Servidor propio (Mailcow en VPS) | $0 (ya incluido) |
| Videollamadas | Google Meet o Zoom Free | $0 |
| Propuestas comerciales | PDF generado desde plantilla Orvae | $0 |
| Contratos | Plantilla Word + firma manuscrita | $0 |
| Contabilidad | Contador externo mensual | ~S/. 300/mes |
| Diseño gráfico | Claude + Canva | $0-15/mes |
| Gestión de tareas | Notion o Linear | $0-16/mes |

---

## 10. Plataforma de comercialización

La plataforma Orvae es el sistema central que automatiza toda la operación comercial. Sin ella, el negocio no escala. Con ella, el fundador puede manejar 100+ clientes solo.

### Componentes de la plataforma

**Storefront público (`orvae.com`)**  
Página de marketing + catálogo de productos + precios públicos + checkout. El cliente puede comprar sin hablar con nadie.

**Panel del cliente (`app.orvae.com`)**  
Donde el cliente gestiona sus licencias, descarga el software, ve facturas, abre tickets de soporte, y gestiona su suscripción.

**Panel de administración (`admin.orvae.com`)**  
Dashboard del fundador con métricas de negocio, gestión de clientes, aprobación de pagos por transferencia, gestión de licencias, y configuración del catálogo.

**Motor de licenciamiento**  
Sistema que genera claves únicas, valida acceso, controla expiración, y registra activaciones. Es el corazón de la seguridad del negocio.

**API pública**  
Endpoint que los sistemas instalados on-premise consultan para validar la licencia en tiempo real.

### Stack tecnológico de la plataforma

- **Backend:** Laravel 12
- **Frontend:** React 19 + Inertia.js 2
- **Base de datos:** PostgreSQL 16
- **Cache / colas:** Redis
- **Infraestructura:** Docker en VPS Elástika (32 GB RAM, 640 GB SSD)
- **Correo:** Mailcow en el mismo VPS
- **Storage:** Cloudflare R2 (para ZIPs de código y PDFs de facturas)

---

## 11. Pasarelas de pago

### Culqi (prioridad para clientes peruanos)

- Pasarela peruana líder — acepta tarjetas Visa, Mastercard, Amex en soles y dólares
- Comisión: ~3.99% + S/. 1.00 por transacción exitosa
- Requiere RUC activo y cuenta bancaria peruana
- Soporta cargos recurrentes para suscripciones
- Integración via API REST bien documentada

### PayPal (clientes internacionales y LATAM)

- Para clientes fuera de Perú o que prefieren no usar tarjeta peruana
- Comisión: 5.4% + $0.30 USD por transacción
- Ventaja: reconocimiento mundial, no requiere tarjeta de crédito (puede usar saldo PayPal)
- Desventaja: comisión más alta y conversión de divisa con spread

### Tarjeta de crédito/débito internacional

- Integrado via Culqi o Stripe (Stripe está disponible en Perú desde 2024)
- Para clientes que pagan en USD con tarjeta extranjera

### Transferencia bancaria manual

- Para clientes institucionales (municipalidades, empresas que no pagan con tarjeta)
- Flujo: cliente sube comprobante → admin aprueba manualmente → sistema activa licencia
- Banco principal: BCP o Interbank (mayor presencia en regiones)
- Tiempo de activación: máximo 24 horas hábiles tras confirmación

### Política de reembolsos

- SaaS mensual: reembolso completo en los primeros 7 días si el cliente no está satisfecho
- SaaS anual: reembolso proporcional por meses no usados si se cancela en los primeros 30 días
- Licencia perpetua: sin reembolso después de la entrega del código
- Alquiler de código: sin reembolso después de la primera descarga

---

## 12. Métricas clave de negocio

### Métricas de ingresos

**MRR (Monthly Recurring Revenue)**  
Ingresos recurrentes mensuales de suscripciones activas. Meta año 1: $2,000 MRR. Meta año 2: $8,000 MRR. Meta año 3: $20,000 MRR.

**ARR (Annual Recurring Revenue)**  
MRR × 12. Métrica de referencia para valoración del negocio.

**ARPU (Average Revenue Per User)**  
MRR ÷ número de clientes activos. Objetivo: mantener ARPU > $80/mes.

---

### Métricas de clientes

**Churn rate mensual**  
Porcentaje de clientes que cancelan en un mes. Objetivo: mantener < 3% mensual. Si supera 5%, hay un problema de producto o soporte que resolver antes de crecer.

**LTV (Lifetime Value)**  
ARPU ÷ churn rate mensual. Si ARPU = $99 y churn = 3%, LTV = $3,300 por cliente.

**CAC (Customer Acquisition Cost)**  
Costo total de conseguir un cliente (tiempo + publicidad + herramientas). Objetivo: CAC < LTV × 0.3.

**NPS (Net Promoter Score)**  
Encuesta trimestral: "¿Recomendarías Orvae a un colega?" Escala 0-10. Objetivo: NPS > 50.

---

### Métricas operativas

**Tiempo de respuesta a tickets:** Objetivo < 4 horas hábiles.  
**Uptime del sistema:** Objetivo 99.9% mensual.  
**Tiempo de activación de licencia:** Objetivo < 5 minutos automático, < 24 horas para transferencias.  
**Tickets resueltos en primer contacto:** Objetivo > 70%.

---

## 13. Hoja de ruta de crecimiento

### Año 1 — Validación (2026)

**Objetivo:** Validar que hay mercado dispuesto a pagar y construir los primeros casos de éxito documentados.

**Q1 (ene-mar):**
- Terminar plataforma de comercialización (storefront + panel cliente + motor de licencias)
- Integrar Culqi y PayPal
- Lanzar con 3-5 clientes beta (precio reducido a cambio de feedback y testimonios)

**Q2 (abr-jun):**
- Lanzamiento público de `orvae.com`
- Primeras 10 ventas de pago
- Primer caso de éxito documentado con logo del cliente
- Ajustes de producto basados en feedback real

**Q3 (jul-sep):**
- Alcanzar $1,000 MRR
- Lanzar módulo Orvae Assets de forma independiente
- Iniciar proceso de inscripción en RNP para ventas al estado
- Primeros artículos de blog y presencia en LinkedIn

**Q4 (oct-dic):**
- Alcanzar $2,000 MRR
- 20 clientes activos
- Primer cliente municipalidad
- Evaluar si contratar técnico de soporte junior

---

### Año 2 — Crecimiento (2027)

- Alcanzar $8,000 MRR (80-100 clientes)
- Contratar primer desarrollador junior
- Lanzar canal de partners (3-5 resellers activos)
- Primer cliente en sector manufactura
- Lanzar Orvae Obras (módulo para municipalidades)
- Participar en al menos una licitación SEACE

---

### Año 3 — Escala (2028)

- Alcanzar $20,000 MRR
- Equipo de 3-5 personas
- Presencia en Lima, Arequipa, Trujillo, Chiclayo
- Evaluar expansión a Ecuador o Bolivia
- Considerar levantar inversión o bootstrapear con flujo propio

---

## 14. Riesgos y mitigaciones

### Riesgo 1 — Competencia de soluciones gratuitas (Odoo, ERPNext)

**Probabilidad:** Alta  
**Impacto:** Medio  
**Descripción:** Odoo Community y ERPNext son gratuitos y tienen módulos similares. Algunos clientes pueden preferirlos.  
**Mitigación:** Orvae no compite en precio con lo gratuito — compite en soporte local, facilidad de uso, y adaptación al contexto peruano. Odoo requiere implementación técnica costosa. Orvae está listo en días.

---

### Riesgo 2 — Cliente no paga o hace chargeback

**Probabilidad:** Media  
**Impacto:** Medio  
**Descripción:** Cliente disputa el cobro con su banco o simplemente no paga la transferencia.  
**Mitigación:** Motor de licencias que revoca acceso automáticamente ante pago fallido. Contratos simples firmados. Transferencias solo se activan tras confirmación bancaria. Política de reembolsos clara y documentada.

---

### Riesgo 3 — Copia del código o piratería

**Probabilidad:** Media  
**Impacto:** Alto  
**Descripción:** Cliente on-premise copia el código y lo redistribuye o usa en más instalaciones de las contratadas.  
**Mitigación:** Licencias atadas a dominio y fingerprint del servidor. El sistema hace ping periódico a la API de validación. Sin ping → suspensión automática. Código ofuscado para entregas on-premise. Contratos con cláusula de auditoría.

---

### Riesgo 4 — El fundador es el único punto de falla

**Probabilidad:** Alta a corto plazo  
**Impacto:** Crítico  
**Descripción:** Si el fundador se enferma, viaja, o tiene un imprevisto, el soporte y el desarrollo se detienen.  
**Mitigación:** Documentación exhaustiva de todos los procesos. Automatización máxima de la plataforma. Contratar técnico de soporte junior en cuanto el MRR lo permita. Mantener un mes de operación documentado y preparado para ser delegado.

---

### Riesgo 5 — Cambios regulatorios de SUNAT o MEF

**Probabilidad:** Media  
**Impacto:** Medio  
**Descripción:** SUNAT cambia el formato de comprobantes electrónicos o el MEF modifica requisitos de sistemas para el estado.  
**Mitigación:** Suscripción a boletines de SUNAT y MEF. Arquitectura modular que permite actualizar el módulo de facturación sin afectar el resto del sistema. Contador externo que alerta cambios normativos relevantes.

---

## 15. Proyección financiera inicial

> Escenario conservador · Solo ingresos recurrentes SaaS · Sin licencias perpetuas

### Supuestos

- Crecimiento de 3-5 nuevos clientes por mes
- ARPU promedio: $89/mes (mezcla de planes Starter, Pro y Business)
- Churn mensual: 4% en año 1, 3% en año 2
- Costos fijos mensuales bajos (modelo bootstrapped)

### Proyección de MRR

| Mes | Clientes activos | MRR estimado |
|---|---|---|
| 3 | 5 | $445 |
| 6 | 12 | $1,068 |
| 9 | 20 | $1,780 |
| 12 | 28 | $2,492 |
| 18 | 55 | $4,895 |
| 24 | 90 | $8,010 |

### Costos fijos mensuales estimados (año 1)

| Concepto | Costo mensual |
|---|---|
| VPS Elástika (ya contratado) | S/. 150-300 |
| Dominio orvae.com | S/. 8 (anual ÷ 12) |
| Cloudflare R2 storage | ~$5 USD |
| Contador externo | S/. 300 |
| Herramientas (Notion, etc.) | $15 |
| **Total estimado** | **~$120-150 USD/mes** |

### Punto de equilibrio

Con ARPU de $89 y costos fijos de ~$150/mes, el punto de equilibrio es de **2 clientes activos**. A partir del tercer cliente todo es margen.

### Primer objetivo financiero

**$1,000 MRR = 12 clientes activos** — Este es el umbral psicológico y práctico que valida el negocio y justifica invertir tiempo completo.

---

## Notas finales del fundador

Este documento es un mapa, no una ley. La realidad del mercado va a corregir supuestos, cambiar prioridades, y abrir oportunidades que hoy no vemos.

Lo que no cambia:

- La decisión de construir con calidad desde el día uno, no parchear después
- El compromiso de soporte real, no soporte de correo que responde en 5 días
- La transparencia de precios — el cliente siempre sabe qué paga y por qué
- El foco en el mercado peruano antes de pensar en expandirse

El software ya existe. Los sistemas están construidos. La ventaja competitiva es real.  
Lo que falta es la plataforma de comercialización y la ejecución comercial.

**El momento de empezar es ahora.**

---

*Orvae — Enterprise software, refined.*  
*Chiclayo, Perú · 2026*
