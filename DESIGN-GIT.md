# Control de versiones de diseño — ORVAE

## Tag actual
```
design-v1-electric-blue
```
Commit: `8009bc7` — Paleta Electric Blue + neumorfismo admin panel v9

---

## Archivos de diseño que cubre este tag

| Archivo | Qué contiene |
|---|---|
| `resources/css/app.css` | Paleta completa, neumorfismo, z-index |
| `resources/js/pages/welcome.tsx` | Página marketing principal |
| `resources/js/components/marketing/PageHero.tsx` | Hero section |
| `resources/js/components/marketing/MarketingUnifiedNavbar.tsx` | Navbar marketing |
| `resources/js/components/marketing/NavCartPreview.tsx` | Preview carrito |
| `resources/js/components/marketing/NavUserMenu.tsx` | Menú usuario navbar |

---

## Comandos de uso frecuente

### Ver todos los tags de diseño
```bash
git tag -l
```

### Revertir SOLO el CSS de diseño (sin tocar código funcional)
```bash
git checkout design-v1-electric-blue -- resources/css/app.css
```

### Revertir todos los archivos de diseño de una vez
```bash
git checkout design-v1-electric-blue -- resources/css/app.css resources/js/pages/welcome.tsx resources/js/components/marketing/PageHero.tsx resources/js/components/marketing/MarketingUnifiedNavbar.tsx resources/js/components/marketing/NavCartPreview.tsx resources/js/components/marketing/NavUserMenu.tsx
```

### Ver qué cambió en diseño desde el tag hasta ahora
```bash
git diff design-v1-electric-blue HEAD -- resources/css/app.css
```

### Crear un nuevo tag de diseño (cuando hagas otro rediseño)
```bash
git tag -a "design-v2-nombre" -m "Descripcion del nuevo diseño"
```

---

## Flujo recomendado para nuevos módulos

1. Desarrollas y commiteas el módulo normalmente → los tags no se mueven
2. Si el diseño necesita ajustes, haces commit y **creas un nuevo tag** (`design-v2-...`)
3. Si algo se rompe en diseño, restauras el CSS con el comando de arriba

---

## Historial de diseños

| Tag | Descripción |
|---|---|
| `design-v1-electric-blue` | Paleta azul eléctrico, grafito oscuro dark mode, neumorfismo admin |
