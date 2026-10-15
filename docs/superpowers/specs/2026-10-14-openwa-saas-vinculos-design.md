# OpenWA · Vínculos línea ↔ SaaS (diseño)

## Problema
La lista de SaaS que puede atender una línea OpenWA está fija en `config/openwa_lines.php`
(VetSaaS, TallerSaaS, FoodSaaS). FoodSaaS aún no existe y Aula Virtual, que sí está integrado,
no aparece. Asignar SaaS con checkboxes dentro del modal no da una vista de conjunto.

## Decisiones aprobadas
1. **Lista dinámica.** Los SaaS salen de las integraciones de `config/services.php` que tienen
   `provision_url` (aulavirtual, vetsaas, tallersaas, sendsaas…). Un SaaS está *conectado* si
   `enabled === true` y `provision_url` no está vacío. Cada bloque declara su `label`.
   Agregar FoodSaaS = agregar su bloque en `services.php` + `.env`.
2. **SaaS huérfanos.** Si una línea tiene asignada una clave que no está conectada (p. ej.
   `foodsaas`), se muestra atenuada como «sin conexión». Se puede quitar, no agregar.
3. **Tablero de vínculos.** Debajo de las tarjetas: columna izquierda = líneas, columna derecha =
   SaaS. Se arrastra desde el punto de una línea hasta un SaaS; una curva SVG los une y se guarda
   al soltar. Clic en una curva la quita. En táctil: tocar el punto de la línea y luego el SaaS.
   Sin librerías de diagramas.
4. El modal de línea queda con nombre, identificador y «Envía notificaciones» (sin checkboxes de SaaS).

## Backend
- `App\Services\OpenWaLines\SaasDirectory`:
  - `connected(): array<string,string>` clave ⇒ label.
  - `options(iterable<string> $assigned): list<{key,label,connected}>` conectados + huérfanos asignados.
- `OpenWaLinesController`:
  - `index` envía `products` = `options(todas las claves asignadas)`.
  - `store`/`update` ya no reciben `productos`.
  - Nuevo `PUT panel/operacion-openwa/{line}/productos` (`panel.operacion-openwa.productos`):
    `productos.*` ∈ conectados ∪ los que la línea ya tiene.
- `config/openwa_lines.php` pierde `products`.

## Frontend
- `OpenWaLinkBoard.tsx`: medición de puertos con `ResizeObserver`, overlay SVG con curvas
  bezier coloreadas por SaaS, arrastre con Pointer Events, estado `pending` para mostrar la
  curva punteada mientras guarda (sin `setState` en efectos), animación de trazo respetando
  `prefers-reduced-motion`.
- `OpenWaLineFormDialog`: se quita el fieldset de SaaS.
- `OpenWaLineCard`: chips de SaaS, huérfanos atenuados.

## Pruebas
- `products` solo lista conectados + huérfanos asignados.
- Vincular un SaaS conectado guarda; uno no conectado se rechaza; un huérfano existente se puede conservar o quitar.
