# Electroteca — Guía de Accesibilidad

Todas las mejoras de accesibilidad implementadas en el frontend, con descripción de qué hace cada una y dónde se aplica.

---

## 1. Skip Link (Saltar al contenido)

**Archivo:** `src/components/layout/Layout.tsx`

Un enlace invisible que aparece al hacer foco con teclado (Tab). Permite a usuarios de teclado o lectores de pantalla saltar directamente al contenido principal sin tener que navegar por el menú lateral.

```html
<a href="#main-content" class="sr-only focus:not-sr-only ...">
  Saltar al contenido
</a>
```

El `<main>` tiene `id="main-content"` como destino del enlace.

---

## 2. focus-visible en botones interactivos

**Archivos:** `Layout.tsx`, `Sidebar.tsx`, `ProductCard.tsx`, `ProductsPage.tsx`

Todos los botones de acción tienen un anillo de foco visible al navegar con teclado (`Tab`). Sin esto, el usuario de teclado no sabe qué elemento está activo.

- `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500` — botones generales
- `focus-visible:ring-red-500` — botón eliminar (destructivo)

Botones cubiertos:
- Abrir menú lateral (móvil)
- Cerrar menú lateral (móvil)
- Editar perfil (sidebar)
- Editar producto (ProductCard)
- Eliminar producto (ProductCard)
- Chips de sugerencia de categoría (ProductsPage)

---

## 3. aria-label en botones icon-only

**Archivos:** `Sidebar.tsx`, `ProductCard.tsx`

Botones que solo muestran un icono necesitan `aria-label` para que los lectores de pantalla anuncien su función. El atributo `title` solo ayuda al hover con ratón, no a screen readers.

| Botón | aria-label |
|---|---|
| X (cerrar sidebar móvil) | `"Cerrar menú"` |
| Engranaje (editar perfil) | `"Editar perfil"` |
| Lápiz (editar producto) | `"Editar"` |
| Papelera (eliminar producto) | `"Eliminar"` |
| Menú hamburguesa (abrir sidebar) | `"Abrir menú"` (ya existía) |

---

## 4. aria-live en contador de resultados

**Archivo:** `src/pages/ProductsPage.tsx`

El contador de artículos (`"12 artículos"`) tiene `aria-live="polite"`. Cuando el usuario filtra o busca, el número cambia dinámicamente — sin `aria-live` el screen reader no lo anuncia.

```html
<p aria-live="polite">
  {total} artículos
</p>
```

`polite` significa que el anuncio espera a que el lector termine de hablar antes de interrumpir.

---

## 5. role="status" en spinners de carga

**Archivo:** `src/pages/ProductsPage.tsx`

El spinner que aparece durante fetches en segundo plano tiene `role="status"` y `aria-label="Cargando"`. Sin esto es un elemento decorativo invisible para screen readers.

```html
<span role="status" aria-label="Cargando" class="animate-spin ..." />
```

---

## 6. caption en tabla de lista de productos

**Archivo:** `src/pages/ProductsPage.tsx`

La tabla en modo lista tiene un `<caption>` oculto visualmente (clase `sr-only`) que describe su contenido. Los lectores de pantalla anuncian el caption al entrar en la tabla.

```html
<caption class="sr-only">Lista de productos</caption>
```

---

## 7. Modal: focus trap + role=dialog + aria-modal

**Archivo:** `src/components/common/Modal.tsx`

El componente Modal implementa:
- `role="dialog"` + `aria-modal="true"` — indica al screen reader que es un diálogo modal
- `aria-label` con el título del modal
- **Focus trap**: Tab y Shift+Tab quedan atrapados dentro del modal mientras está abierto
- Al abrir el modal, el foco se mueve automáticamente al primer elemento interactivo
- Al cerrar, el foco vuelve al elemento que lo abrió

---

## 8. ProductForm: aria-invalid + aria-describedby + role=alert

**Archivo:** `src/components/products/ProductForm.tsx`

Los campos del formulario tienen:
- `aria-invalid="true"` cuando hay error de validación — el screen reader anuncia el campo como inválido
- `aria-describedby` apuntando al ID del mensaje de error — el lector lee el error al enfocar el campo
- `role="alert"` en los mensajes de error — los anuncia inmediatamente al aparecer
- `htmlFor` / `id` en todos los pares label-input — el click en el label enfoca el campo

---

## 9. Contraste WCAG AA

**Archivos:** `ProductCard.tsx`

El texto de descripción de reparación pasó de `text-zinc-500` (#71717a, ratio ~3.4:1 — falla AA) a `text-zinc-400` (#a1a1aa, ratio ~5.1:1 — pasa AA) sobre fondo `bg-zinc-800` (#27272a).

Nivel objetivo: **WCAG 2.1 AA** (ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande).

---

## Resumen de archivos modificados

| Archivo | Mejoras |
|---|---|
| `Layout.tsx` | Skip link, focus-visible en botón menú, `id="main-content"` en `<main>` |
| `Sidebar.tsx` | `aria-label` en X y Settings, `focus-visible` en ambos |
| `ProductCard.tsx` | `aria-label` + `focus-visible` en Edit/Trash, contraste descripción |
| `ProductsPage.tsx` | `aria-live` en contador, `role="status"` en spinner, `<caption>` en tabla, `focus-visible` en chips |
| `Modal.tsx` | `role=dialog`, `aria-modal`, focus trap, auto-focus (sesión anterior) |
| `ProductForm.tsx` | `aria-invalid`, `aria-describedby`, `role=alert`, `htmlFor/id` (sesión anterior) |
