# ORVAE Platform — Diseño de Interfaces UI/UX

> Especificación de diseño completa · v1.0 · 2026  
> Stack: React 19 + Inertia.js 2 + Tailwind CSS 4  
> Marca: ORVAE · Guía de marca v1.0

---

## Índice

1. [Design tokens — colores, tipografía, espaciado](#1-design-tokens)
2. [Componentes base](#2-componentes-base)
3. [Pantallas públicas — Storefront](#3-pantallas-públicas--storefront)
4. [Autenticación — Login y Register](#4-autenticación--login-y-register)
5. [Panel del cliente — Customer Portal](#5-panel-del-cliente--customer-portal)
6. [Panel de administración — Admin](#6-panel-de-administración--admin)
7. [Flujo de checkout y pago](#7-flujo-de-checkout-y-pago)
8. [Emails transaccionales](#8-emails-transaccionales)
9. [Estados y feedback visual](#9-estados-y-feedback-visual)
10. [Responsive — Mobile](#10-responsive--mobile)

---

## 1. Design tokens

### Variables CSS — copiar en `resources/css/app.css`

```css
:root {
  /* ── COLORES ORVAE ── */
  --o-void:       #0E0B08;   /* Fondo más oscuro — hero, sidebars */
  --o-dark:       #1C1410;   /* Fondo principal oscuro */
  --o-dark2:      #261C14;   /* Superficies elevadas oscuras */
  --o-dark3:      #32241A;   /* Hover state en dark */

  --o-amber:      #D28C3C;   /* Color de marca principal */
  --o-amber2:     #E8A84E;   /* Amber hover / estado activo */
  --o-amber3:     #7A4E18;   /* Amber oscuro — texto sobre fondo claro */
  --o-amber-pale: rgba(210,140,60,0.12); /* Fondo de badges amber */

  --o-cream:      #F5ECD8;   /* Texto principal sobre fondos oscuros */
  --o-cream2:     #FAF5EC;   /* Fondo principal claro */
  --o-cream3:     #F0E8D4;   /* Superficie clara elevada */

  --o-warm:       #8A7060;   /* Texto secundario / muted */
  --o-warm2:      #6A5040;   /* Texto terciario / placeholder */
  --o-warm3:      #B8A898;   /* Borders en modo claro */

  --o-border:     rgba(210,140,60,0.20); /* Border amber en oscuro */
  --o-border2:    rgba(210,140,60,0.08); /* Border sutil en oscuro */
  --o-border3:    rgba(210,140,60,0.04); /* Separadores muy sutiles */

  /* Semánticos */
  --o-success:    #4A8C5C;
  --o-success-bg: rgba(74,140,92,0.12);
  --o-error:      #C04040;
  --o-error-bg:   rgba(192,64,64,0.12);
  --o-warning:    #C08030;
  --o-warning-bg: rgba(192,128,48,0.12);
  --o-info:       #4080C0;
  --o-info-bg:    rgba(64,128,192,0.12);

  /* ── TIPOGRAFÍA ── */
  --font-display: 'Syne', sans-serif;      /* Títulos, wordmark, headings */
  --font-body:    'DM Sans', sans-serif;   /* Cuerpo, UI, párrafos */
  --font-mono:    'DM Mono', monospace;    /* Labels técnicos, código, badges */

  /* ── ESPACIADO ── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ── RADIOS ── */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;

  /* ── SOMBRAS ── */
  --shadow-sm:  0 1px 3px rgba(14,11,8,0.3);
  --shadow-md:  0 4px 12px rgba(14,11,8,0.4);
  --shadow-lg:  0 8px 24px rgba(14,11,8,0.5);

  /* ── TRANSICIONES ── */
  --transition: 150ms ease;
  --transition-slow: 300ms ease;
}
```

### Tailwind config — `tailwind.config.js`

```js
export default {
  theme: {
    extend: {
      colors: {
        orvae: {
          void:    '#0E0B08',
          dark:    '#1C1410',
          dark2:   '#261C14',
          amber:   '#D28C3C',
          amber2:  '#E8A84E',
          amber3:  '#7A4E18',
          cream:   '#F5ECD8',
          cream2:  '#FAF5EC',
          warm:    '#8A7060',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      }
    }
  }
}
```

---

## 2. Componentes base

### Botones

```jsx
// Botón primario — amber sobre oscuro
// Usar para: CTA principal, confirmar compra, guardar cambios
<button className="
  bg-orvae-amber hover:bg-orvae-amber2
  text-orvae-void font-display font-800
  text-sm tracking-widest uppercase
  px-6 py-3 rounded-sm
  transition-colors duration-150
  border border-transparent
">
  Comprar ahora
</button>

// Botón secundario — outline amber
// Usar para: acción secundaria, cancelar con intención
<button className="
  bg-transparent hover:bg-orvae-amber/10
  text-orvae-amber font-body font-500
  text-sm tracking-wide
  px-6 py-3 rounded-sm
  border border-orvae-amber/30 hover:border-orvae-amber/60
  transition-all duration-150
">
  Ver detalles
</button>

// Botón ghost — sin borde
// Usar para: acciones terciarias, links funcionales
<button className="
  bg-transparent hover:bg-orvae-dark2
  text-orvae-warm hover:text-orvae-cream
  font-body font-400 text-sm
  px-4 py-2 rounded-sm
  transition-all duration-150
">
  Cancelar
</button>

// Botón destructivo — error state
// Usar para: eliminar, revocar licencia
<button className="
  bg-transparent hover:bg-red-500/10
  text-red-400 hover:text-red-300
  font-body font-500 text-sm
  px-6 py-3 rounded-sm
  border border-red-500/30 hover:border-red-500/60
  transition-all duration-150
">
  Revocar licencia
</button>
```

---

### Inputs y formularios

```jsx
// Input base
// Fondo oscuro, borde amber sutil, focus con amber visible
<div className="flex flex-col gap-1.5">
  <label className="
    font-mono text-xs text-orvae-amber/70
    tracking-widest uppercase
  ">
    Correo electrónico
  </label>
  <input
    type="email"
    placeholder="rodrigo@empresa.com"
    className="
      w-full bg-orvae-dark2 text-orvae-cream
      font-body text-sm
      px-4 py-3 rounded-sm
      border border-orvae-border2
      focus:border-orvae-amber/50 focus:outline-none
      placeholder:text-orvae-warm2
      transition-colors duration-150
    "
  />
  // Mensaje de error debajo
  <span className="font-mono text-xs text-red-400 tracking-wide">
    Este campo es requerido
  </span>
</div>

// Select
<select className="
  w-full bg-orvae-dark2 text-orvae-cream
  font-body text-sm
  px-4 py-3 rounded-sm
  border border-orvae-border2
  focus:border-orvae-amber/50 focus:outline-none
  transition-colors duration-150
  appearance-none cursor-pointer
">
  <option>Suscripción mensual</option>
  <option>Suscripción anual</option>
  <option>Licencia perpetua</option>
</select>

// Textarea
<textarea
  rows={4}
  className="
    w-full bg-orvae-dark2 text-orvae-cream
    font-body text-sm resize-none
    px-4 py-3 rounded-sm
    border border-orvae-border2
    focus:border-orvae-amber/50 focus:outline-none
    placeholder:text-orvae-warm2
    transition-colors duration-150
  "
/>
```

---

### Cards

```jsx
// Card base — superficie elevada
<div className="
  bg-orvae-dark border border-orvae-border2
  rounded-sm p-6
  hover:border-orvae-border
  transition-colors duration-200
">
  {children}
</div>

// Card con acento amber arriba — para KPIs y métricas
<div className="
  bg-orvae-dark border border-orvae-border2
  rounded-sm p-6
  relative overflow-hidden
  before:absolute before:top-0 before:left-0 before:right-0
  before:h-px before:bg-orvae-amber
">
  {children}
</div>

// Card clickeable — productos, planes
<div className="
  bg-orvae-dark border border-orvae-border2
  rounded-sm p-6 cursor-pointer
  hover:border-orvae-amber/40
  hover:bg-orvae-dark2
  transition-all duration-200
  group
">
  {children}
</div>
```

---

### Badges y pills

```jsx
// Badge amber — estado activo, destacado
<span className="
  bg-orvae-amber/10 text-orvae-amber
  font-mono text-xs tracking-widest uppercase
  px-2.5 py-1 rounded-sm
  border border-orvae-amber/20
">
  Activo
</span>

// Badge success — pagado, aprobado
<span className="bg-green-500/10 text-green-400 font-mono text-xs tracking-wide px-2.5 py-1 rounded-sm border border-green-500/20">
  Pagado
</span>

// Badge error — expirado, revocado
<span className="bg-red-500/10 text-red-400 font-mono text-xs tracking-wide px-2.5 py-1 rounded-sm border border-red-500/20">
  Expirado
</span>

// Badge warning — pendiente, por vencer
<span className="bg-yellow-500/10 text-yellow-400 font-mono text-xs tracking-wide px-2.5 py-1 rounded-sm border border-yellow-500/20">
  Pendiente
</span>

// Badge muted — cancelado, inactivo
<span className="bg-orvae-warm/10 text-orvae-warm font-mono text-xs tracking-wide px-2.5 py-1 rounded-sm border border-orvae-warm/20">
  Cancelado
</span>
```

---

### Sidebar navigation item

```jsx
// Item inactivo
<a className="
  flex items-center gap-3
  text-orvae-warm hover:text-orvae-cream
  font-body text-sm font-400
  px-4 py-2.5 rounded-sm
  hover:bg-orvae-dark2
  transition-all duration-150
  group
">
  <IconAssets className="w-4 h-4 opacity-60 group-hover:opacity-100" />
  Activos
</a>

// Item activo
<a className="
  flex items-center gap-3
  text-orvae-amber
  font-body text-sm font-500
  px-4 py-2.5 rounded-sm
  bg-orvae-amber/8
  border-l-2 border-orvae-amber
">
  <IconDashboard className="w-4 h-4" />
  Dashboard
</a>
```

---

### Tabla de datos

```jsx
// Estructura base de tabla
<div className="w-full overflow-hidden border border-orvae-border2 rounded-sm">
  <table className="w-full">
    <thead>
      <tr className="border-b border-orvae-border2 bg-orvae-dark2">
        <th className="
          text-left px-4 py-3
          font-mono text-xs text-orvae-amber/60
          tracking-widest uppercase font-400
        ">
          Cliente
        </th>
        {/* más columnas */}
      </tr>
    </thead>
    <tbody>
      <tr className="
        border-b border-orvae-border2/50
        hover:bg-orvae-dark2
        transition-colors duration-100
      ">
        <td className="px-4 py-3 text-orvae-cream font-body text-sm">
          Empresa ABC
        </td>
        {/* más celdas */}
      </tr>
    </tbody>
  </table>
</div>
```

---

## 3. Pantallas públicas — Storefront

### 3.1 Landing page — `orvae.com`

**Layout:** Full-width · Fondo `--o-void` · Navbar fija top

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                       │
│ [ORVAE logo] .............. [Productos] [Precios] [Contacto]│
│                                              [Iniciar sesión]│
│                                              [Empezar gratis]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HERO SECTION — min-height: 100vh                            │
│                                                             │
│  ·  ·  ·  ·  ·  ·  ·  ·  dot pattern background            │
│                                                             │
│  ┌─ Eyebrow ────────────────────────────────────────────┐   │
│  │  ── SOFTWARE EMPRESARIAL PARA PERÚ Y LATAM ──        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  [ORVAE icon 96px]  ORVAE                                  │
│                     (Syne 800, cream, letter-spacing 16px)  │
│                                                             │
│  Software empresarial que entiende tu realidad.             │
│  (DM Sans 300 italic, warm, tracking 0.12em)               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  Ver productos   │  │  Solicitar demo              │    │
│  │  [BTN PRIMARY]   │  │  [BTN SECONDARY]             │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│                                                             │
│  ──────────────────────────────────────── amber line ───    │
│  Clientes activos: 48  ·  Uptime: 99.9%  ·  Desde 2026    │
│  (DM Mono xs, warm/60)                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN PROBLEMA — bg: --o-dark                             │
│                                                             │
│  ── EL PROBLEMA ──                                         │
│  Por qué el software que usas hoy te está frenando         │
│  (Syne 800 38px, cream)                                    │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Software    │  │ Soporte en  │  │ Precio      │        │
│  │ extranjero  │  │ inglés o    │  │ inaccesible │        │
│  │ que no      │  │ sin         │  │ para        │        │
│  │ entiende    │  │ respuesta   │  │ medianas    │        │
│  │ el contexto │  │             │  │             │        │
│  │ peruano     │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  (Cards border-orvae-border2, íconos SVG amber)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN PRODUCTOS — bg: --o-void                            │
│                                                             │
│  ── PRODUCTOS ──                                           │
│  Todo lo que necesitas. Solo lo que usas.                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ORVAE ERP                          [Suite principal] │  │
│  │ Sistema de gestión empresarial integrado             │  │
│  │                                                      │  │
│  │  ✓ Activos fijos    ✓ Control TI    ✓ Multi-zonal   │  │
│  │  ✓ Proveedores      ✓ Licencias     ✓ Reportes      │  │
│  │                                          [Ver más →] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ORVAE Assets │  │ ORVAE Zones  │  │ ORVAE Vault  │     │
│  │ Módulo       │  │ Módulo       │  │ Módulo       │     │
│  │ [Ver →]      │  │ [Ver →]      │  │ [Ver →]      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN PRECIOS — bg: --o-dark                              │
│ (ver detalle en sección 3.3)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN TESTIMONIOS — bg: --o-void                          │
│                                                             │
│  ── CLIENTES ──                                            │
│  Empresas que confían en ORVAE                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ "ORVAE nos permitió gestionar nuestros 2,400        │  │
│  │ activos en 4 regiones desde un solo panel.          │  │
│  │ El soporte responde en horas, no en días."          │  │
│  │                                                     │  │
│  │  [Avatar]  Jorge Ramirez                            │  │
│  │            Jefe de TI · Empresa Telco, Lima         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CTA FINAL — bg: --o-dark                                    │
│                                                             │
│  [ORVAE icon grande, opacity 0.06, centrado de fondo]      │
│                                                             │
│  ¿Listo para empezar?                                      │
│  Prueba ORVAE gratis 30 días. Sin tarjeta de crédito.      │
│                                                             │
│  [  Crear cuenta gratis  ]  [  Hablar con ventas  ]        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER — bg: --o-void                                       │
│                                                             │
│ ORVAE (amber)          Productos    Empresa    Legal        │
│ Enterprise software.   ERP          Nosotros   Términos     │
│                        Assets       Blog       Privacidad   │
│ orvae.com              Zones        Contacto   SLA          │
│                        Vault                               │
│ ─────────────────────────────────────────────────────────  │
│ © 2026 ORVAE · Chiclayo, Perú    DM Mono xs · warm/40     │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 Página de producto — `/productos/orvae-erp`

```
┌─────────────────────────────────────────────────────────────┐
│ HERO DEL PRODUCTO                                           │
│                                                             │
│  [BADGE: Suite principal]                                   │
│                                                             │
│  ORVAE ERP                                                  │
│  (Syne 800 64px, cream)                                    │
│                                                             │
│  Software de gestión empresarial diseñado para              │
│  la complejidad real de las organizaciones peruanas.        │
│  (DM Sans 300 italic 18px, warm)                           │
│                                                             │
│  [  Ver planes y precios  ]  [  Demo en vivo  ]            │
│                                                             │
│  ── amber line ──                                           │
│  Compatible con: Windows · Linux · MacOS · Docker           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MÓDULOS INCLUIDOS                                           │
│ Grid 3 columnas de features con iconos amber SVG            │
│ + descripción corta en DM Sans 14px warm                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SCREENSHOT / MOCKUP                                         │
│ Frame del panel del sistema con borde amber sutil           │
│ bg: --o-dark, shadow-lg                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLA COMPARATIVA DE MODALIDADES                            │
│                                                             │
│            SaaS       On-premise   Código fuente            │
│  Hosting   ORVAE      Tuyo         Tuyo                     │
│  Updates   Auto       Manual       Manual                   │
│  Precio    Mensual    Perpetuo     Temporal                 │
│  Acceso    Browser    Browser      Código                   │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.3 Página de precios — `/precios`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│                                                             │
│  Precios claros. Sin sorpresas.                             │
│  (Syne 800 48px, cream)                                    │
│                                                             │
│  ┌─────────────────────────────────────────┐               │
│  │  [Mensual]  ──●──  [Anual · 20% off]   │               │
│  └─────────────────────────────────────────┘               │
│  (Toggle switch amber)                                      │
└─────────────────────────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────────────┐  ┌────────┐
│ STARTER  │  │  PRO     │  │    BUSINESS      │  │ENTERP. │
│          │  │[POPULAR] │  │                  │  │        │
│ $49/mes  │  │ $99/mes  │  │    $199/mes      │  │ $299   │
│          │  │          │  │                  │  │  /mes  │
│ 10 users │  │ 50 users │  │   200 users      │  │Ilimit. │
│ 2 módulos│  │ 5 módulos│  │   Todos          │  │Todo +  │
│          │  │          │  │                  │  │source  │
│[Empezar] │  │[Empezar] │  │   [Empezar]      │  │[Cotiz.]│
└──────────┘  └──────────┘  └──────────────────┘  └────────┘

Notas visuales:
- Card PRO: border 1px amber/60, badge "Más popular" amber
- Resto: border orvae-border2
- Check list: ✓ amber, features en DM Sans 13px cream/80
- Features no incluidas: — orvae-warm/40, tachadas
```

**Specs de la card de precio:**
```
Card estructura:
┌─────────────────────────┐
│ [BADGE tipo]             │  ← DM Mono 10px, amber/70, uppercase
│                          │
│ STARTER                  │  ← Syne 800 20px, cream
│ Para empresas pequeñas   │  ← DM Sans 13px, warm
│                          │
│ $49                      │  ← Syne 800 48px, amber
│  /mes                    │  ← DM Sans 13px, warm
│ ≈ S/. 187/mes            │  ← DM Mono 11px, warm/50
│                          │
│ ──── amber line ────     │
│                          │
│ ✓ 10 usuarios            │  ← ✓ amber · texto DM Sans 13px cream
│ ✓ 2 módulos              │
│ ✓ Soporte por email      │
│ — Módulos adicionales    │  ← — warm/30 · texto warm/40
│ — API access             │
│ — On-premise             │
│                          │
│ [   Empezar ahora   ]    │  ← BTN PRIMARY full-width
│ [  Ver todos los    ]    │  ← BTN GHOST "detalles"
│ [  detalles         ]    │
└─────────────────────────┘
```

---

### 3.4 Página de contacto — `/contacto`

```
┌─────────────────────────────────────────────────────────────┐
│ SPLIT LAYOUT: 40% info | 60% formulario                     │
│                                                             │
│  LEFT:                          RIGHT:                      │
│  ── CONTACTO ──                ┌─────────────────────────┐  │
│  Hablemos.                     │ Nombre                  │  │
│  (Syne 800 38px)               │ [input]                 │  │
│                                │                         │  │
│  [icon] +51 9XX XXX XXX        │ Correo                  │  │
│  [icon] rodrigo@orvae.com      │ [input]                 │  │
│  [icon] Chiclayo, Perú         │                         │  │
│                                │ Empresa                 │  │
│  Respuesta en                  │ [input]                 │  │
│  menos de 24 horas.            │                         │  │
│  (DM Sans 14px, warm)          │ Mensaje                 │  │
│                                │ [textarea 4 rows]       │  │
│  ── ── ── ── ── ──             │                         │  │
│  También puedes:               │ [  Enviar mensaje  ]    │  │
│  · Agendar demo →              └─────────────────────────┘  │
│  · Ver documentación →                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Autenticación — Login y Register

### 4.1 Login — `/login`

**Concepto visual:** Pantalla dividida 50/50. Lado izquierdo: branding ORVAE con dot pattern y logo grande. Lado derecho: formulario limpio sobre fondo `--o-dark`.

```
┌─────────────────────────┬─────────────────────────────────┐
│                         │                                 │
│   DOT PATTERN BG        │   bg: --o-dark                  │
│   --o-void              │                                 │
│                         │   ── INICIAR SESIÓN ──          │
│   [ORVAE icon 80px]     │   (DM Mono 11px, amber, upper)  │
│                         │                                 │
│   ORVAE                 │   Bienvenido de vuelta.         │
│   (Syne 800 48px        │   (Syne 800 28px, cream)        │
│    amber letter-sp 8px) │                                 │
│                         │   ─────────────────────────     │
│   Enterprise software,  │                                 │
│   refined.              │   Correo electrónico            │
│   (DM Sans 300 italic   │   [  rodrigo@empresa.com  ]     │
│    warm)                │                                 │
│                         │   Contraseña                    │
│   ─────────────────     │   [  ••••••••••••  ] [ojo]      │
│                         │                                 │
│   [status.orvae.com]    │   [  Olvidé mi contraseña  ]   │
│   Sistema operativo     │                                           │
│   99.9% uptime          │   [    Iniciar sesión    ]      │
│   (DM Mono 10px,        │   (BTN PRIMARY full-width)      │
│    warm/40)             │                                 │
│                         │   ─────────────────────────     │
│                         │                                 │
│                         │   ¿No tienes cuenta?            │
│                         │   [Crear cuenta gratis →]       │
│                         │   (DM Sans 13px, amber)         │
│                         │                                 │
└─────────────────────────┴─────────────────────────────────┘
```

**Estados del botón de login:**
```
Normal:    bg-amber, text-void, "Iniciar sesión"
Loading:   bg-amber/60, spinner amber, "Verificando..."
Error:     borde rojo en inputs, mensaje error debajo
Success:   check verde, "Redirigiendo..."
```

**Mensaje de error de credenciales:**
```jsx
// Aparece sobre los inputs, no debajo
<div className="
  bg-red-500/10 border border-red-500/20
  text-red-400 font-mono text-xs tracking-wide
  px-4 py-3 rounded-sm mb-4
">
  Correo o contraseña incorrectos. Intenta de nuevo.
</div>
```

---

### 4.2 Register — `/register`

**Layout:** Mismo split 50/50. Formulario de 2 pasos.

```
PASO 1 — Datos personales:
┌─────────────────────────────────────────────────────────────┐
│ Paso 1 de 2 ────────────────────────── ─ (progress bar)    │
│                                                             │
│ Crear tu cuenta                                             │
│ (Syne 800 28px, cream)                                     │
│                                                             │
│ Nombre completo                                             │
│ [                                    ]                      │
│                                                             │
│ Correo electrónico                                          │
│ [                                    ]                      │
│                                                             │
│ Contraseña                                                  │
│ [                                    ]                      │
│ ████████░░░░ Seguridad: Media                              │
│ (barra de fuerza: rojo/amarillo/verde según complejidad)   │
│                                                             │
│ Confirmar contraseña                                        │
│ [                                    ]                      │
│                                                             │
│ [        Continuar →        ]                               │
│                                                             │
│ ¿Ya tienes cuenta? [Iniciar sesión]                        │
└─────────────────────────────────────────────────────────────┘

PASO 2 — Datos de empresa:
┌─────────────────────────────────────────────────────────────┐
│ Paso 2 de 2 ──────────────────────────── (progress bar)    │
│                                                             │
│ Datos de tu empresa                                         │
│ (Syne 800 28px, cream)                                     │
│                                                             │
│ Nombre de la empresa (opcional)                             │
│ [                                    ]                      │
│                                                             │
│ RUC (opcional)                                              │
│ [                                    ]                      │
│ Requerido para facturación en Perú                          │
│ (DM Mono 10px, warm/50)                                    │
│                                                             │
│ País                                                        │
│ [Perú                              ▼]                       │
│                                                             │
│ Teléfono (opcional)                                         │
│ [+51                               ]                        │
│                                                             │
│ Al continuar aceptas los [Términos] y [Privacidad]          │
│                                                             │
│ [        Crear cuenta        ]                              │
│ (BTN PRIMARY full-width)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3 Recuperar contraseña — `/forgot-password`

```
┌─────────────────────────────────────────────────────────────┐
│ [← Volver al login]                                         │
│                                                             │
│ Recuperar acceso                                            │
│ (Syne 800 28px, cream)                                     │
│                                                             │
│ Ingresa tu correo y te enviaremos                           │
│ un enlace para restablecer tu contraseña.                   │
│ (DM Sans 14px, warm)                                       │
│                                                             │
│ Correo electrónico                                          │
│ [                                    ]                      │
│                                                             │
│ [    Enviar enlace de recuperación    ]                     │
│                                                             │
│ ─────────────────────────────────────                       │
│                                                             │
│ [Revisa spam si no lo ves en 5 min]                        │
│ (DM Mono 10px, warm/40)                                    │
└─────────────────────────────────────────────────────────────┘

ESTADO SUCCESS (mismo componente, formulario reemplazado):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [✓ icon amber, 48px]                                        │
│                                                             │
│ Revisa tu correo                                            │
│ (Syne 800 28px, cream)                                     │
│                                                             │
│ Enviamos un enlace a rodrigo@empresa.com                    │
│ Válido por 60 minutos.                                      │
│ (DM Sans 14px, warm)                                       │
│                                                             │
│ [← Volver al login]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Panel del cliente — Customer Portal

**URL:** `app.orvae.com`  
**Layout:** Sidebar fijo izquierdo (240px) + Content area  
**Fondo general:** `--o-void`

### 5.1 Layout base del portal

```
┌──────────────────────────────────────────────────────────────┐
│ TOPBAR — height: 56px — bg: --o-dark — border-b orvae-border2│
│                                                              │
│ [ORVAE icon + wordmark]    [Buscar...]    [🔔] [Avatar ▼]   │
└──────────────────────────────────────────────────────────────┘
┌───────────────┬──────────────────────────────────────────────┐
│ SIDEBAR       │ CONTENT AREA                                 │
│ 240px         │ flex-1, overflow-y-auto, padding 32px        │
│ bg: --o-dark  │ bg: --o-void                                 │
│ border-r      │                                              │
│               │                                              │
│ NAVEGACIÓN:   │                                              │
│               │                                              │
│ ● Dashboard   │                                              │
│   Mis licencias│                                             │
│   Suscripciones│                                             │
│   Facturas    │                                              │
│   Descargas   │                                              │
│   Soporte     │                                              │
│   ─────────── │                                              │
│   Mi perfil   │                                              │
│   Facturación │                                              │
│   ─────────── │                                              │
│ ⎋ Cerrar      │                                              │
│   sesión      │                                              │
│               │                                              │
│ ─────────────  │                                             │
│ Plan: Pro      │                                             │
│ [Actualizar →] │                                             │
└───────────────┴──────────────────────────────────────────────┘
```

---

### 5.2 Dashboard del cliente — `/app/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                 │
│ Hola, Rodrigo.               DM Mono 10px · ── DASHBOARD── │
│ (DM Sans 500 24px, cream)    (amber, uppercase, tracking)   │
└─────────────────────────────────────────────────────────────┘

┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐
│ Licencias  │  │ Próximo    │  │ Tickets    │  │ Versión  │
│ activas    │  │ pago       │  │ abiertos   │  │ actual   │
│            │  │            │  │            │  │          │
│     3      │  │ 15 días    │  │     1      │  │  1.4.2   │
│ (Syne 800  │  │ (Syne 800  │  │ (Syne 800  │  │(Syne 800 │
│  32px      │  │  32px      │  │  32px      │  │ 32px     │
│  amber)    │  │  amber)    │  │  amber)    │  │ amber)   │
│            │  │            │  │            │  │          │
│ [badge]    │  │ $99 USD    │  │ [badge]    │  │ [Latest] │
│ Activo     │  │ DM Mono xs │  │ Abierto    │  │ badge    │
└────────────┘  └────────────┘  └────────────┘  └──────────┘
(Grid 4 cols · Cards con amber top-border · padding 24px)

┌─────────────────────────────────────────────────┬───────────┐
│ MIS LICENCIAS                                   │ ACTIVIDAD │
│                                                 │ RECIENTE  │
│ ┌────────────────────────────────────────────┐  │           │
│ │ ORVAE ERP · Plan Pro              [Activa] │  │ Hoy 14:32 │
│ │ Vence: 15 Mar 2027                         │  │ Pago apr. │
│ │ Modalidad: SaaS · Usuarios: 50             │  │ $99 USD   │
│ │ [Ver detalles] [Descargar invoice]          │  │           │
│ └────────────────────────────────────────────┘  │ Ayer      │
│                                                 │ Ticket    │
│ ┌────────────────────────────────────────────┐  │ #TKT-0012 │
│ │ ORVAE Assets · Módulo           [Activa]   │  │ resuelto  │
│ │ Vence: 15 Mar 2027                         │  │           │
│ │ Modalidad: SaaS · Usuarios: 50             │  │ 14 Mar    │
│ │ [Ver detalles] [Descargar invoice]          │  │ Nueva ver.│
│ └────────────────────────────────────────────┘  │ 1.4.2     │
│                                                 │ disponible│
│ [+ Agregar licencia]                            │           │
└─────────────────────────────────────────────────┴───────────┘
```

---

### 5.3 Detalle de licencia — `/app/licencias/{id}`

```
┌─────────────────────────────────────────────────────────────┐
│ [← Mis licencias]                                           │
│                                                             │
│ ORVAE ERP — Plan Pro                     [ACTIVA]           │
│ (Syne 800 28px, cream)                   (badge amber)     │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────┬─────────────────────────────┐
│ DETALLES DE LICENCIA          │ ACCIONES RÁPIDAS            │
│                               │                             │
│ Clave de licencia:            │ [Descargar ZIP]             │
│ ORVAE-A3F2-B7C1-D4E8          │ [Ver changelog]             │
│ (DM Mono 14px, cream/80)      │ [Abrir ticket]              │
│ [Copiar]                      │ [Cancelar suscripción]      │
│                               │ (link rojo, pequeño)        │
│ Modalidad:  SaaS              │                             │
│ Plan:       Pro               │ ─────────────────────────   │
│ Versión:    1.4.2             │                             │
│ Usuarios:   50 máx.           │ SOPORTE INCLUIDO            │
│ Zonas:      4 máx.            │ ✓ Email < 4h hábiles       │
│ Inicio:     15 Mar 2026       │ ✓ Chat en vivo              │
│ Vence:      15 Mar 2027       │ ✓ Actualizaciones           │
│ Renovación: Automática        │                             │
│                               │ [Abrir chat de soporte]     │
│ Dominio autorizado:           │                             │
│ erp.miempresa.com             │                             │
│ [Editar dominios]             │                             │
└───────────────────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ACTIVACIONES                                                │
│                                                             │
│  Dominio                   IP            Último ping       │
│  ──────────────────────────────────────────────────────    │
│  erp.miempresa.com         190.XX.XX.XX  Hace 2 min        │
│                                          [Activa] [Remover] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HISTORIAL DE PAGOS                                          │
│                                                             │
│  #       Fecha          Monto    Estado    Acción           │
│  ──────────────────────────────────────────────────────    │
│  FAC-001  15 Mar 2026   $99 USD  [Pagado]  [PDF]           │
│  FAC-002  15 Abr 2026   $99 USD  [Pagado]  [PDF]           │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.4 Mis facturas — `/app/facturas`

```
┌─────────────────────────────────────────────────────────────┐
│ ── FACTURAS ──                                              │
│ Historial de compras e invoices                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FILTROS                                                     │
│ [Año: 2026 ▼]  [Estado: Todos ▼]  [Producto: Todos ▼]      │
└─────────────────────────────────────────────────────────────┘

Número      Fecha        Producto        Monto     Estado    .
──────────────────────────────────────────────────────────────
FAC-2026-001  15 Mar 26  ORVAE ERP Pro  $99 USD  [Pagado] [↓]
FAC-2026-002  15 Abr 26  ORVAE ERP Pro  $99 USD  [Pagado] [↓]
FAC-2026-003  15 May 26  ORVAE ERP Pro  $99 USD  [Pagado] [↓]

(Tabla: th DM Mono 10px amber/60 uppercase · td DM Sans 13px)
([↓] = descargar PDF · abre en nueva pestaña)
```

---

### 5.5 Soporte — `/app/soporte`

```
┌─────────────────────────────────────────────────────────────┐
│ ── SOPORTE ──                           [Nuevo ticket →]    │
│ Centro de ayuda                                             │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────┐
│ TICKETS ABIERTOS                 │ RECURSOS                 │
│                                  │                          │
│ ┌──────────────────────────────┐ │ [📖 Documentación]       │
│ │ TKT-0012              [Open] │ │ [▶ Tutoriales video]     │
│ │ Error al activar licencia    │ │ [💬 Chat con soporte]    │
│ │ Hace 2 horas · Alta prioridad│ │ [📧 soporte@orvae.com]  │
│ │ [Ver conversación →]         │ │                          │
│ └──────────────────────────────┘ │ ──────────────────────   │
│                                  │                          │
│ TICKETS RESUELTOS                │ SLA CONTRATADO           │
│                                  │ ✓ Respuesta < 4h        │
│ TKT-0011  [Resuelto]             │ ✓ Chat en vivo           │
│ TKT-0010  [Resuelto]             │ Plan: Pro                │
└──────────────────────────────────┴──────────────────────────┘
```

**Modal nuevo ticket:**
```
┌─────────────────────────────────────────────────────────────┐
│ Nuevo ticket de soporte                    [×]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Producto afectado                                           │
│ [ORVAE ERP — Licencia #ORVAE-A3F2   ▼]                     │
│                                                             │
│ Prioridad                                                   │
│ [○ Baja  ○ Media  ● Alta  ○ Crítica]                       │
│                                                             │
│ Asunto                                                      │
│ [                                    ]                      │
│                                                             │
│ Descripción del problema                                    │
│ [                                    ]                      │
│ [                                    ]                      │
│ [                                    ]                      │
│                                                             │
│ Adjuntos (capturas, logs)                                   │
│ [────────── Arrastra o haz clic ──────────]                │
│                                                             │
│               [Cancelar]  [Crear ticket]                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.6 Mi perfil — `/app/perfil`

```
┌─────────────────────────────────────────────────────────────┐
│ ── PERFIL ──                                                │
│ Información personal y de facturación                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────┐
│ DATOS PERSONALES                 │ SEGURIDAD                │
│                                  │                          │
│ [Avatar iniciales — 64px]        │ Contraseña               │
│ [Cambiar foto]                   │ Actualizada hace 30 días │
│                                  │ [Cambiar contraseña]     │
│ Nombre                           │                          │
│ [Rodrigo Apellido     ]          │ ──────────────────────   │
│                                  │                          │
│ Correo electrónico               │ Autenticación 2FA        │
│ [rodrigo@empresa.com  ]          │ [No configurado]         │
│                                  │ [Activar 2FA →]          │
│ Zona horaria                     │                          │
│ [America/Lima         ▼]         │ ──────────────────────   │
│                                  │                          │
│ [Guardar cambios]                │ Sesiones activas         │
│                                  │ Chrome · Win · Ahora     │
│ ─────────────────────────────    │ Chrome · Android · Ayer  │
│                                  │ [Cerrar otras sesiones]  │
│ DATOS DE FACTURACIÓN             │                          │
│                                  │                          │
│ Empresa: [                    ]  │                          │
│ RUC:     [                    ]  │                          │
│ Dirección: [                  ]  │                          │
│ Ciudad:  [                    ]  │                          │
│ País:    [Perú              ▼]   │                          │
│                                  │                          │
│ [Guardar datos de facturación]   │                          │
└──────────────────────────────────┴──────────────────────────┘
```

---

## 6. Panel de administración — Admin

**URL:** `admin.orvae.com`  
**Acceso:** Solo rol `admin`  
**Layout:** Sidebar más ancho (260px) + topbar + content

### 6.1 Sidebar admin

```
┌──────────────────────────────────────────────────────────────┐
│ TOPBAR — bg: --o-dark                                        │
│ [ORVAE]  [admin]    ── Buscar clientes, licencias ──  [R ▼] │
└──────────────────────────────────────────────────────────────┘
┌─────────────────┐
│ SIDEBAR ADMIN   │
│ bg: --o-dark    │
│ 260px           │
│                 │
│ ── OVERVIEW ──  │
│ ● Dashboard     │
│   Analytics     │
│                 │
│ ── COMERCIAL ── │
│   Clientes      │
│   Órdenes       │
│   Pagos         │
│   Licencias     │
│   Suscripciones │
│                 │
│ ── CATÁLOGO ─── │
│   Productos     │
│   Planes        │
│   Cupones       │
│                 │
│ ── SOPORTE ──── │
│   Tickets       │
│   Notificaciones│
│                 │
│ ── SISTEMA ──── │
│   Configuración │
│   Webhooks      │
│   Audit logs    │
│   ────────────  │
│ ⎋ Cerrar sesión │
└─────────────────┘
```

---

### 6.2 Dashboard admin — `/admin/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│ ── DASHBOARD ──                              Mar 2026       │
│ Vista general del negocio          DM Mono 10px, amber      │
└─────────────────────────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   MRR    │  │ Clientes │  │  Churn   │  │   ARR    │
│          │  │ activos  │  │ mensual  │  │          │
│  $2,480  │  │    28    │  │   2.8%   │  │ $29,760  │
│          │  │          │  │          │  │          │
│ ↑ +$380  │  │ ↑ +3 mes │  │ ↓ -0.2% │  │          │
│ vs mes   │  │ anterior │  │ mejora   │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

(Syne 800 32px amber · DM Mono 10px subtítulos · flecha color)

┌─────────────────────────────────────┬───────────────────────┐
│ MRR ÚLTIMOS 12 MESES               │ ÚLTIMAS ÓRDENES       │
│                                     │                       │
│  $3k ─┐                ·─·         │ ORV-2026-028 · $199   │
│       │         ·─·──·             │ Empresa XYZ · Pagada  │
│  $2k ─┤  ·─·──·                    │ [Abrir]               │
│       │·                           │                       │
│  $1k ─┘                            │ ORV-2026-027 · $99    │
│       └────────────────────────    │ MYPE ABC · Pendiente  │
│       Mar  Jun  Sep  Dec  Mar      │ [Aprobar pago]        │
│                                     │                       │
│ (Line chart, color: amber)          │ ORV-2026-026 · $49   │
│                                     │ Empresa 123 · Pagada  │
│                                     │                       │
│                                     │ [Ver todas las →]     │
└─────────────────────────────────────┴───────────────────────┘

┌─────────────────────────────────────┬───────────────────────┐
│ TICKETS PENDIENTES                  │ LICENCIAS POR VENCER  │
│                                     │ (próximos 30 días)    │
│ TKT-0015  Alta  Hace 1h             │                       │
│ Error activación · Jorge R.         │ ORVAE-A3F2 · 8 días  │
│ [Asignar] [Abrir]                   │ Empresa XYZ          │
│                                     │ [Notificar cliente]   │
│ TKT-0014  Media  Hace 4h            │                       │
│ Pregunta sobre módulos              │ ORVAE-B7C1 · 12 días │
│ [Asignar] [Abrir]                   │ MYPE ABC             │
│                                     │ [Notificar cliente]   │
│ [Ver todos los tickets →]           │                       │
└─────────────────────────────────────┴───────────────────────┘
```

---

### 6.3 Gestión de clientes — `/admin/clientes`

```
┌─────────────────────────────────────────────────────────────┐
│ ── CLIENTES ──                      [+ Nuevo cliente]       │
│ 28 clientes activos                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FILTROS                                                     │
│ [Buscar por nombre, email, RUC...]  [Estado ▼] [Plan ▼]    │
└─────────────────────────────────────────────────────────────┘

Cliente               Email              Plan      Estado   MRR
──────────────────────────────────────────────────────────────
Jorge Ramirez         jorge@empresa.pe   Business  [Activo] $199
  Empresa Telco SA
  Lima · RUC: 20512345678

Maria Flores          mflores@mype.pe    Starter   [Activo]  $49
  MYPE Los Andes
  Chiclayo · Sin RUC

Carlos Quispe         cquispe@muni.pe    Pro       [Trial]   $0
  Municipalidad Dist. X
  Arequipa · RUC: 20987654321

──────────────────────────────────────────────────────────────

(Cada fila: expandible con click · acciones: Ver · Editar · Suspender)
(Paginación: 20 por página · cursor pagination)
```

---

### 6.4 Gestión de pagos — `/admin/pagos`

**Foco especial: aprobación de transferencias bancarias**

```
┌─────────────────────────────────────────────────────────────┐
│ ── PAGOS ──                                                 │
│ [Todos] [Pendientes (3)] [Aprobados] [Rechazados]           │
└─────────────────────────────────────────────────────────────┘

SECCIÓN PENDIENTES DE APROBACIÓN (destacada en amber/5):
┌─────────────────────────────────────────────────────────────┐
│ [!] Pagos que requieren aprobación manual                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ORV-2026-028 · Transferencia · $199 USD                 │ │
│ │ Jorge Ramirez · jorge@empresa.pe                        │ │
│ │ Fecha: 18 Mar 2026 · Banco: BCP                         │ │
│ │                                                         │ │
│ │ [Ver comprobante PDF]                                   │ │
│ │                                                         │ │
│ │           [Rechazar ×]    [Aprobar y activar ✓]         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

TABLA GENERAL DE PAGOS:
#             Fecha        Cliente      Monto    Gateway    Estado
──────────────────────────────────────────────────────────────────
PAY-0028     18 Mar 2026  Jorge R.    $199 USD  Transfer.  [Pend.]
PAY-0027     17 Mar 2026  Maria F.    $49 USD   Culqi      [Aprobado]
PAY-0026     16 Mar 2026  Carlos Q.   $99 USD   PayPal     [Aprobado]
```

---

### 6.5 Gestión de licencias — `/admin/licencias`

```
┌─────────────────────────────────────────────────────────────┐
│ ── LICENCIAS ──           [Buscar por clave, usuario...]    │
│ 42 licencias totales · 38 activas · 3 por vencer · 1 susp. │
└─────────────────────────────────────────────────────────────┘

Clave              Usuario          Plan      Expira      Estado
──────────────────────────────────────────────────────────────────
ORVAE-A3F2-B7C1   Jorge Ramirez    Business  15 Mar 27  [Activa]
ORVAE-D4E8-F9A0   Maria Flores     Starter   20 Mar 27  [Activa]
ORVAE-G1H2-I3J4   Carlos Quispe    Pro       18 Mar 26  [!8 días]

(fila con badge warning: resaltada con fondo amber/3)

Acciones por fila: [Ver] [Revocar] [Extender] [Cambiar plan]
```

**Modal: Revocar licencia**
```
┌─────────────────────────────────────────────────────────────┐
│ Revocar licencia ORVAE-A3F2-B7C1              [×]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠ Esta acción cortará el acceso del cliente inmediatamente. │
│                                                             │
│ Motivo de revocación                                        │
│ [Pago fallido / Fraude / Solicitud cliente / Otro   ▼]     │
│                                                             │
│ Nota interna (opcional)                                     │
│ [                                                        ]  │
│                                                             │
│ ¿Notificar al cliente por email?  [● Sí  ○ No]             │
│                                                             │
│          [Cancelar]    [Revocar licencia]                   │
│                        (BTN destructivo rojo)               │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.6 Catálogo — Productos y planes — `/admin/productos`

```
┌─────────────────────────────────────────────────────────────┐
│ ── PRODUCTOS ──                         [+ Nuevo producto]  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ORVAE ERP                                    [Activo] [···]  │
│ erp · SaaS + On-premise · v1.4.2                            │
│                                                             │
│ PLANES:                                                     │
│ [Starter $49] [Pro $99] [Business $199] [Enterprise $299]  │
│               [popular]                                     │
│                                                             │
│ [Ver producto] [Editar] [+ Agregar plan] [Desactivar]       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ORVAE Assets                                 [Activo] [···]  │
│ module · SaaS + On-premise · v1.2.0                         │
│                                                             │
│ PLANES:                                                     │
│ [Básico $29] [Pro $59]                                      │
│                                                             │
│ [Ver producto] [Editar] [+ Agregar plan] [Desactivar]       │
└──────────────────────────────────────────────────────────────┘
```

---

### 6.7 Tickets de soporte admin — `/admin/tickets`

```
┌─────────────────────────────────────────────────────────────┐
│ ── SOPORTE ──                                               │
│ [Abiertos (5)] [En progreso (2)] [Resueltos] [Todos]       │
│ [Alta prio. primero ▼]                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TKT-0015 · [ALTA] · Abierto · Hace 1 hora                  │
│ Error al activar licencia en servidor nuevo                  │
│ Jorge Ramirez · ORVAE ERP Pro                               │
│ [No asignado]  [Asignarme]  [Abrir →]                      │
└─────────────────────────────────────────────────────────────┘

VISTA DE TICKET (pantalla completa):
┌─────────────────────────────┬───────────────────────────────┐
│ CONVERSACIÓN                │ DETALLES                      │
│                             │                               │
│ Cliente:                    │ Estado: [Abierto ▼]           │
│ ┌─────────────────────────┐ │ Prioridad: [Alta ▼]           │
│ │ Hola, no puedo activar  │ │ Asignado: [Rodrigo ▼]         │
│ │ la licencia en el nuevo │ │                               │
│ │ servidor...             │ │ Cliente: Jorge Ramirez        │
│ │                         │ │ jorge@empresa.pe              │
│ │ 18 Mar · 13:45          │ │                               │
│ └─────────────────────────┘ │ Licencia: ORVAE-A3F2          │
│                             │ Plan: Business                │
│ Admin:                      │                               │
│ ┌─────────────────────────┐ │ ─────────────────────────     │
│ │ Hola Jorge, ¿puedes     │ │                               │
│ │ compartir el error      │ │ NOTAS INTERNAS                │
│ │ exacto que aparece?     │ │ [                           ]  │
│ │                         │ │ [Agregar nota]               │
│ │ 18 Mar · 14:02          │ │                               │
│ └─────────────────────────┘ │                               │
│                             │                               │
│ [                      ]    │                               │
│ [Responder...]              │                               │
│ [Enviar] [Resolver y cerrar]│                               │
└─────────────────────────────┴───────────────────────────────┘
```

---

### 6.8 Audit logs — `/admin/audit-logs`

```
┌─────────────────────────────────────────────────────────────┐
│ ── AUDIT LOG ──                                             │
│ Registro completo de acciones del sistema                   │
│ [Filtrar por evento ▼] [Usuario ▼] [Fecha ▼]               │
└─────────────────────────────────────────────────────────────┘

Fecha/Hora          Usuario        Evento                  Entidad
──────────────────────────────────────────────────────────────────
18 Mar · 14:32      Rodrigo(admin) license.revoked         ORVAE-X1Y2
18 Mar · 14:15      Sistema        payment.approved        PAY-0028
18 Mar · 13:45      Jorge R.       license.activate_attempt ORVAE-A3F2
18 Mar · 10:02      Rodrigo(admin) plan.price_changed      Pro $89→$99
17 Mar · 16:00      Sistema        subscription.renewed    SUB-0012

(Click en fila: modal con old_values / new_values en JSON pretty-print)
```

---

## 7. Flujo de checkout y pago

### 7.1 Paso 1 — Configurar orden

**URL:** `/checkout/{plan_slug}`

```
┌─────────────────────────────────────────────────────────────┐
│ ── CHECKOUT ── (1/3)                                        │
│ Configura tu plan                                           │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────┬─────────────────────────────┐
│ CONFIGURACIÓN                 │ RESUMEN DEL PEDIDO          │
│                               │                             │
│ Producto                      │ ORVAE ERP — Plan Pro        │
│ ORVAE ERP — Plan Pro          │ (Syne 800 16px, cream)      │
│ [Cambiar →]                   │                             │
│                               │ ✓ 50 usuarios               │
│ Modalidad                     │ ✓ 5 módulos                  │
│ ○ SaaS (nube)      ← default  │ ✓ Soporte prioritario       │
│ ○ On-premise                  │ ✓ Actualizaciones           │
│ ○ Código fuente               │                             │
│                               │ ─────────────────────────   │
│ Período                       │                             │
│ ● Mensual    $99/mes          │ Subtotal:       $99.00      │
│ ○ Anual      $79/mes (20%)    │ Descuento:       $0.00      │
│ ○ Perpetua   $1,188 único     │ IGV (18%):      $17.82      │
│                               │ ──────────────────────────  │
│ Cupón de descuento            │ TOTAL:         $116.82      │
│ [ORVAE30          ] [Aplicar] │                             │
│                               │ ≈ S/. 448.00               │
│                               │ (DM Mono 11px, warm/50)    │
│                               │                             │
│                               │ [  Continuar al pago →  ]  │
│                               │ (BTN PRIMARY full-width)   │
└───────────────────────────────┴─────────────────────────────┘
```

---

### 7.2 Paso 2 — Datos de facturación

```
┌─────────────────────────────────────────────────────────────┐
│ ── CHECKOUT ── (2/3)                                        │
│ Datos de facturación                                        │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────┬─────────────────────────────┐
│ FACTURACIÓN                   │ RESUMEN (sticky)            │
│                               │                             │
│ ¿Necesitas factura con RUC?   │ ORVAE ERP — Pro             │
│ ● Sí  ○ No (boleta)           │ Mensual · SaaS              │
│                               │                             │
│ Razón social                  │ Subtotal  $99.00            │
│ [Empresa ABC SAC           ]  │ IGV       $17.82            │
│                               │ ─────────────────────       │
│ RUC                           │ Total    $116.82            │
│ [20512345678              ]   │                             │
│ [Validar con SUNAT]           │                             │
│ ✓ RUC válido — Empresa ABC    │                             │
│                               │                             │
│ Dirección fiscal              │                             │
│ [Av. Balta 123, Chiclayo   ]  │                             │
│                               │                             │
│ Correo para recibir factura   │                             │
│ [facturas@empresa.com      ]  │                             │
│                               │                             │
│ [← Atrás]  [Continuar →]     │                             │
└───────────────────────────────┴─────────────────────────────┘
```

---

### 7.3 Paso 3 — Pago

```
┌─────────────────────────────────────────────────────────────┐
│ ── CHECKOUT ── (3/3)                                        │
│ Método de pago                                              │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────┬─────────────────────────────┐
│ MÉTODO DE PAGO                │ RESUMEN FINAL               │
│                               │                             │
│ ┌─────────────────────────┐   │ ORVAE ERP — Pro             │
│ │ ● 💳 Tarjeta (Culqi)    │   │ Mensual · SaaS              │
│ └─────────────────────────┘   │ Factura a: Empresa ABC      │
│ ┌─────────────────────────┐   │                             │
│ │ ○ PayPal                │   │ Subtotal      $99.00        │
│ └─────────────────────────┘   │ IGV            $17.82       │
│ ┌─────────────────────────┐   │ ─────────────────────────   │
│ │ ○ Transferencia bancaria│   │ TOTAL        $116.82        │
│ └─────────────────────────┘   │                             │
│                               │ Seguridad:                  │
│ FORMULARIO CULQI:             │ [🔒 Pago seguro SSL]        │
│                               │ [✓ Culqi certificado]       │
│ Número de tarjeta             │                             │
│ [4111 1111 1111 1111     ]    │                             │
│                               │                             │
│ Titular                       │                             │
│ [JORGE RAMIREZ            ]   │                             │
│                               │                             │
│ Vencimiento    CVV            │                             │
│ [12 / 28  ]  [•••]            │                             │
│                               │                             │
│ [  Pagar $116.82 ahora  ]     │                             │
│ (BTN PRIMARY, full-width)     │                             │
│                               │                             │
│ Al pagar aceptas los          │                             │
│ [Términos de servicio]        │                             │
└───────────────────────────────┴─────────────────────────────┘
```

**Pantalla de transferencia bancaria:**
```
Si elige Transferencia:
─────────────────────────────────────────────────────────────
Banco:          BCP / Interbank
Cuenta:         191-XXXXXXXXX-0-XX
CCI:            00219100XXXXXXXXXX01
Monto exacto:   S/. 448.00 (o $116.82 USD)
Referencia:     ORV-2026-028

[Subir comprobante de pago]
────────── Arrastra el PDF o JPG aquí ──────────

[Confirmar transferencia]
→ Tu licencia se activará en máximo 24 horas hábiles.
```

---

### 7.4 Confirmación de compra

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [✓ icon amber, 64px]                           │
│                                                             │
│         ¡Gracias por tu compra!                             │
│         (Syne 800 36px, cream)                             │
│                                                             │
│    Tu licencia ORVAE-A3F2-B7C1-D4E8 ya está activa.       │
│    (DM Mono 14px, amber)                                   │
│                                                             │
│    Te enviamos los detalles a rodrigo@empresa.com           │
│    (DM Sans 14px, warm)                                    │
│                                                             │
│    ─────────────────────────────────────────               │
│                                                             │
│    ┌──────────────────┐  ┌──────────────────┐              │
│    │  Ir a mi panel   │  │  Descargar        │             │
│    │  [BTN PRIMARY]   │  │  factura PDF      │             │
│    └──────────────────┘  │  [BTN SECONDARY]  │             │
│                          └──────────────────┘              │
│                                                             │
│    [📖 Ver guía de inicio rápido →]                        │
│    (DM Sans 13px, amber)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Emails transaccionales

**Estilo:** HTML email · Fondo `#FAF5EC` · Logo ORVAE · Máx 600px ancho

### 8.1 Estructura base del email

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER — bg: #1C1410                                        │
│ [ORVAE icon 32px] ORVAE                                     │
│ (Syne 800 18px, amber, letter-spacing 5px)                  │
├─────────────────────────────────────────────────────────────┤
│ BODY — bg: #FAF5EC · padding: 40px                          │
│                                                             │
│ [Asunto del email como H1]                                  │
│ (Syne 800 28px, #1C1410)                                   │
│                                                             │
│ Hola, [Nombre].                                             │
│ (DM Sans 16px, #8A7060)                                    │
│                                                             │
│ [Contenido específico]                                      │
│                                                             │
│ [CTA BUTTON]                                               │
│ (bg: #D28C3C · text: #0E0B08 · padding: 14px 28px)         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ FOOTER — bg: #F0E8D4                                        │
│ ORVAE · orvae.com · Chiclayo, Perú                         │
│ Tienes dudas: soporte@orvae.com                            │
│ [Cancelar suscripción]                                      │
│ (DM Mono 10px, #8A7060)                                    │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Tipos de email y contenido clave

| Email | Trigger | CTA |
|---|---|---|
| Bienvenida | Registro exitoso | "Explorar el panel" |
| Confirmación de compra | Pago aprobado | "Ver mi licencia" |
| Licencia activa | Activación | "Descargar / Acceder" |
| Factura disponible | Pago confirmado | "Descargar PDF" |
| Contraseña olvidada | Solicitud reset | "Restablecer contraseña" |
| Licencia por vencer | 30, 15, 7 días antes | "Renovar ahora" |
| Licencia expirada | Día de expiración | "Reactivar" |
| Pago fallido | Cargo rechazado | "Actualizar método" |
| Ticket respondido | Admin responde | "Ver respuesta" |
| Nueva versión | Release | "Ver novedades" |

---

## 9. Estados y feedback visual

### Estados de licencia

```
Activa:     [██████████] bg amber/10 · text amber · borde amber/20
Expirada:   [██████████] bg red/10   · text red   · borde red/20
Revocada:   [██████████] bg gray/10  · text gray  · borde gray/20
Suspendida: [██████████] bg yellow/10· text yellow · borde yellow/20
Trial:      [██████████] bg purple/10· text purple · borde purple/20
```

### Estados de pago

```
Pendiente:  amarillo · "Esperando confirmación"
Aprobado:   verde    · "Pago confirmado"
Rechazado:  rojo     · "Pago fallido"
Reembolsado:azul     · "Reembolso procesado"
```

### Loading states

```jsx
// Skeleton loader para tablas
<div className="animate-pulse">
  <div className="h-4 bg-orvae-dark2 rounded-sm mb-2 w-3/4" />
  <div className="h-4 bg-orvae-dark2 rounded-sm mb-2 w-1/2" />
  <div className="h-4 bg-orvae-dark2 rounded-sm w-2/3" />
</div>

// Spinner para botones
<div className="w-4 h-4 border-2 border-orvae-amber/30 
                border-t-orvae-amber rounded-full animate-spin" />
```

### Toast notifications

```
✓ Éxito:    bg verde/10   · borde verde/20  · ícono ✓ verde
✕ Error:    bg rojo/10    · borde rojo/20   · ícono ✕ rojo
! Aviso:    bg amber/10   · borde amber/20  · ícono ! amber
ℹ Info:     bg blue/10    · borde blue/20   · ícono ℹ blue

Posición: top-right · z-50 · slide-in desde derecha
Auto-dismiss: 5 segundos
```

### Empty states

```jsx
// Cuando no hay datos — ej. "No tienes licencias aún"
<div className="flex flex-col items-center py-16 gap-4">
  <div className="w-16 h-16 rounded-sm bg-orvae-dark2 
                  border border-orvae-border2 
                  flex items-center justify-center">
    <IconLicense className="w-6 h-6 text-orvae-warm/40" />
  </div>
  <p className="font-display font-800 text-orvae-cream text-xl">
    Sin licencias activas
  </p>
  <p className="font-body text-orvae-warm text-sm text-center max-w-xs">
    Compra tu primer producto para comenzar.
  </p>
  <button className="btn-primary mt-2">
    Ver productos →
  </button>
</div>
```

---

## 10. Responsive — Mobile

### Breakpoints

```css
/* Tailwind defaults aplicados */
sm:  640px   → Teléfonos horizontales
md:  768px   → Tablets
lg:  1024px  → Desktop pequeño (sidebar colapsa aquí arriba)
xl:  1280px  → Desktop estándar
2xl: 1536px  → Desktop grande
```

### Comportamiento de sidebar en mobile

```
< 1024px:
- Sidebar OCULTO por defecto
- Topbar muestra [☰ menú] en izquierda
- Click en ☰ → sidebar aparece como drawer sobre contenido
- Overlay oscuro detrás del drawer
- [×] para cerrar o click en overlay

≥ 1024px:
- Sidebar visible fijo
- Sin botón hamburguesa
```

### Login mobile (`< 768px`)

```
- Eliminar el panel izquierdo de branding
- Solo mostrar formulario centrado
- Logo ORVAE pequeño arriba del formulario
- Fondo: --o-void con dot pattern
```

### Checkout mobile

```
- Resumen del pedido: arriba del formulario (no sticky sidebar)
- Formularios: 1 columna
- Botón CTA: fijo al bottom (position sticky bottom-0)
```

### Tabla de datos en mobile

```
- Tablas se convierten en cards apiladas
- Cada fila → card con campo-valor
- Acciones debajo de cada card
```

---

## Notas de implementación

### Orden de construcción recomendado

```
Sprint 1:  Design tokens CSS + componentes base
Sprint 2:  Login + Register + Forgot password
Sprint 3:  Storefront: Landing + Precios + Producto
Sprint 4:  Checkout: 3 pasos + Confirmación
Sprint 5:  Panel cliente: Dashboard + Licencias + Facturas
Sprint 6:  Panel cliente: Soporte + Perfil
Sprint 7:  Panel admin: Dashboard + Clientes + Pagos
Sprint 8:  Panel admin: Licencias + Productos + Tickets
Sprint 9:  Panel admin: Audit logs + Configuración
Sprint 10: Emails transaccionales
Sprint 11: Mobile responsive
Sprint 12: QA + ajustes finales
```

### Principios UI específicos de ORVAE

- **Bordes siempre `rounded-sm` (4px)** — nunca `rounded-lg` ni `rounded-full` en contenedores. Solo pills pequeños pueden ser `rounded-full`.
- **Fondo oscuro por defecto** — la interfaz es dark. El modo claro existe solo para documentos y emails.
- **Amber con moderación** — el amber es el acento. No puede ser el color dominante de una pantalla. Máximo 10% de superficie.
- **DM Mono para todo lo técnico** — claves de licencia, fechas, importes, referencias de órden, hashes, IPs. Nunca DM Sans para estos elementos.
- **Syne solo para títulos** — no para labels, botones, ni texto de interfaz corriente.
- **Spacing generoso** — mejor demasiado espacio que muy poco. Padding mínimo de cards: 24px.
- **Transiciones rápidas** — `150ms ease` para hover. `300ms ease` para modales y drawers.

---

*ORVAE Platform UI/UX Spec · v1.0 · 2026*  
*Stack: React 19 · Inertia.js 2 · Tailwind CSS 4 · Laravel 12*
