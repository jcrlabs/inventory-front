# Electroteca — UI Review

**Audited:** 2026-04-22
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md present)
**Screenshots:** Not captured (code-only audit — no dev server detected)
**Stack:** React + TypeScript + Tailwind CSS + TanStack Query
**Theme:** Dark (zinc palette, amber #f59e0b accent)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Spanish copy is precise and contextual; minor gaps in empty states and error specificity |
| 2. Visuals | 3/4 | Consistent icon language and card carousel; action buttons hidden on hover create discoverability problem on touch |
| 3. Color | 2/4 | RegisterPage uses violet (#8b5cf6) instead of amber; Badge component uses light backgrounds on a dark UI; Pagination uses light grays |
| 4. Typography | 3/4 | Good hierarchy overall; a few non-standard sizes (`text-[11px]`, `text-[13px]`, `text-[10px]`) break the Tailwind scale |
| 5. Spacing | 3/4 | Consistent rhythm on most pages; Pagination mixes `gray-` spacing with the zinc palette |
| 6. Experience Design | 3/4 | Loading/error/empty states covered; ProductCard action buttons invisible on mobile; no empty state in UsersPage with context CTA |

**Overall: 17/24**

---

## Top 10 Priority Fixes

1. **Pagination component uses light-theme classes** — Completely breaks dark theme; text is invisible or near-invisible against zinc-800 background — Replace all `gray-` classes with zinc equivalents and active page to amber
2. **RegisterPage uses violet brand instead of amber** — App has two visual identities (amber on login, violet on register); creates brand incoherence — Change `#8b5cf6`/`#7c3aed` gradient to `#f59e0b`/`#d97706`; change logo to WrenchLogo
3. **Badge component uses light backgrounds on a dark UI** — `bg-emerald-100`, `bg-rose-100`, `bg-amber-100` produce jarring light pill shapes in UsersPage table — Replace with `bg-emerald-500/15 text-emerald-400`, `bg-rose-500/15 text-rose-400`, etc.
4. **ProductCard edit/delete buttons invisible on mobile** — `opacity-0 group-hover:opacity-100` hides actions on touch devices that have no hover — Add `sm:opacity-0` to the opacity class so it's always visible on mobile
5. **ProductDetail paid badge uses light colors** — `bg-emerald-50 text-emerald-600 border border-emerald-200/60` and `bg-amber-50 text-amber-600` render light-theme backgrounds — Use dark equivalents matching the rest of the app
6. **UsersPage empty state has no call-to-action** — `No hay usuarios` text only; admin cannot easily create the first user — Add a "Crear primer usuario" button (same pattern as ProductsPage empty state)
7. **CategoriesPage CategoryProducts row hover uses light color** — `hover:bg-amber-50/50` and `group-hover:text-amber-700` render a pale amber wash inconsistent with dark theme — Use `hover:bg-zinc-900/60 group-hover:text-amber-400`
8. **ProductDetail no back-navigation on 404** — "Producto no encontrado" state shows a link but no structured back button matching the rest of the detail page header style — Wrap in the same page shell with `<Link to="/products">` styled as the existing ArrowLeft back link
9. **UsersPage avatar uses violet gradient** — `linear-gradient(135deg, #a78bfa, #7c3aed)` on user initials avatar deviates from the amber palette used everywhere else — Change to `linear-gradient(135deg, #f59e0b, #d97706)` to match Sidebar user avatar
10. **ConfirmDialog lacks role="dialog" with aria-label on backdrop** — `alertdialog` role is correct but the backdrop div has no `aria-hidden` — Add `aria-hidden="true"` (it is missing unlike Modal which has it correctly)

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**What's working:**
- All labels, placeholders, and error messages are in Spanish, contextually appropriate for the taller staff audience.
- Field-level validation messages are specific: "Mínimo 3 caracteres", "Las contraseñas no coinciden", "Email inválido".
- Dynamic empty states distinguish between "no results for filter" vs "nothing created yet" (`ProductsPage.tsx:310`).
- Helpful hint below password in RegisterPage (`RegisterPage.tsx:118`): "Mínimo 8 caracteres, debe incluir letras y números".
- Confirm dialog message includes the item name for clarity: `¿Estás seguro de que quieres eliminar "${deletingProduct?.name}"?` (`ProductsPage.tsx:463`).

**Issues:**

- `ProductsPage.tsx:65` — Toast message says "Producto creado" but the domain concept is "reparación" (a repair). "Reparación creada" aligns better with the repair-workshop context.
- `ProductsPage.tsx:82` — Toast message says "Producto actualizado" — same domain mismatch.
- `UsersPage.tsx:269` — Empty state in the users table only shows "No hay usuarios" with no guidance and no CTA button, while every other empty state in the app offers an action.
- `CategoriesPage.tsx:239` — Empty state when filtering by search shows "No hay categorías" and the generic "Crea la primera para organizar tus productos" message even when there are categories but none match the search. The copy should distinguish: "Ninguna categoría coincide con la búsqueda" when `searchInput` is non-empty.
- `ProductDetailPage.tsx:73-83` — 404 state says "Producto no encontrado" without explaining the cause. Consider "No se encontró esta reparación. Puede que haya sido eliminada."
- `ProductDetailPage.tsx:251` — Repair reference is displayed in an `amber-50` background with `amber-700` text. While visually identifiable, the word "Referencia de reparación" appears in a section heading but the displayed value has no label explaining the format.
- `UsersPage.tsx:77` — UserForm password hint "(dejar vacío para no cambiar)" is inside parentheses next to the label — correct content, but it disappears if the label wraps. A `<p>` hint below the field (like RegisterPage does) would be more robust.

**Quick fix:**
Change "Producto creado/actualizado/eliminado" toasts to "Reparación creada/actualizada/eliminada" across `ProductsPage.tsx` and `ProductDetailPage.tsx` (6 occurrences total).

---

### Pillar 2: Visuals (3/4)

**What's working:**
- Consistent use of Lucide icons throughout — no mixing of icon libraries.
- ProductCard carousel with swipe and dot indicators is well-conceived for a repair shop context with multiple device photos.
- The left-side color stripe on ProductCard (`ProductCard.tsx:74`) provides at-a-glance status without requiring the user to read the badge.
- Empty states all use an icon + message pattern, which is clear and consistent.
- The amber ambient glow on LoginPage adds polish without being overdone.
- Modal uses bottom-sheet on mobile, centered dialog on desktop — correct responsive behavior.

**Issues:**

- `ProductCard.tsx:175` — Action buttons (Edit/Delete) use `opacity-0 group-hover:opacity-100`. On touch devices there is no `hover` event, so these buttons are permanently invisible. Users on mobile cannot edit or delete cards without navigating to the detail page.
- `DashboardPage.tsx:65` — The stats grid renders 2-4 cards depending on admin role. With only 2 cards (viewer role), the `grid-cols-2 lg:grid-cols-4` layout leaves the right half of the screen empty on large screens — it never fills the 4-column row. Consider `lg:grid-cols-2` for non-admins or a max-width constraint.
- `ProductDetailPage.tsx:188` — The no-image placeholder uses `text-slate-200` for the Package icon: `<Package className="text-slate-200" size={48} />`. This is a light color that will appear very bright against the zinc-800 background — likely a leftover from a light-theme version. Should be `text-zinc-600`.
- `ProductCard.tsx:129` — Carousel dot indicators use `bg-zinc-800` as the active color, which barely contrasts against the image overlay. Should be `bg-white` for the active dot.
- `Sidebar.tsx:76` — The "jcrlabs" subtitle text color is `rgba(148,163,184,0.45)` — 45% opacity slate-400 — this may fail WCAG AA contrast on the `#111111` background. It serves as branding subtitle so low contrast is acceptable, but worth noting.

---

### Pillar 3: Color (2/4)

**What's working:**
- Amber `#f59e0b` is the primary accent and is applied consistently across CTAs, active nav, focused inputs, and status indicators in most components.
- Semantic color use is correct: green for success/reparado, amber for in-progress/pending, red for error/no-reparado.
- Status badges in ProductCard and DashboardPage use opacity-modified backgrounds (`rgba(...)`) that feel integrated into the dark theme.
- The login page's glow and shadow effects use amber consistently.

**Issues:**

- `RegisterPage.tsx:56` — Logo background uses `linear-gradient(135deg, #8b5cf6, #6d28d9)` (violet). No other component in the app uses violet. This creates a completely different visual identity for the registration flow vs the rest of the app.
- `RegisterPage.tsx:151-154` — Submit button also uses `linear-gradient(135deg, #8b5cf6, #7c3aed)` with a violet box-shadow. This is the most prominent interactive element on the page and it's the wrong brand color.
- `Badge.tsx:9-13` — The `success`, `error`, `warning`, and `info` variants all use light backgrounds (`bg-emerald-100`, `bg-rose-100`, `bg-amber-100`). These are light-theme colors embedded in a dark-theme app. In `UsersPage.tsx:230`, role badges render with these light pill backgrounds, creating jarring contrast against the `bg-zinc-800` table row.
- `Badge.tsx:13` — `info` variant maps to `bg-amber-100 text-amber-700`. But in `UsersPage.tsx:14-18`, the `viewer` role is mapped to `info`, which should visually read as neutral/low-priority, not amber (which is the high-attention accent). The viewer badge competes visually with the manager (warning/amber) badge.
- `Pagination.tsx:16` — `text-gray-500` for the count label. This is the wrong palette — the app uses `zinc-`.
- `Pagination.tsx:24` — `hover:bg-gray-100` on navigation buttons renders a light hover state on a dark background.
- `Pagination.tsx:44` — Non-active page buttons: `hover:bg-gray-100 text-gray-700` — light gray text on dark is hard to read; light gray hover background would look like a white flash.
- `UsersPage.tsx:209` — User avatar gradient `linear-gradient(135deg, #a78bfa, #7c3aed)` is violet, inconsistent with `Sidebar.tsx:140` which uses `linear-gradient(135deg, #f59e0b, #d97706)` for the same user's avatar in the sidebar.
- `ProductDetailPage.tsx:127-128` — Paid badge uses `bg-emerald-50 text-emerald-600 border-emerald-200/60` and `bg-amber-50 text-amber-600 border-amber-200/60` — light-theme backgrounds on a dark page. The same page's status badge correctly uses dark-compatible `rgba()` backgrounds.
- `CategoriesPage.tsx:119-121` — Status labels in the expanded category product list use `bg-emerald-50`, `bg-amber-50`, `bg-red-50` — light-theme badges in a dark expanded panel.

---

### Pillar 4: Typography (3/4)

**What's working:**
- Clear three-level heading hierarchy: page overline (text-xs uppercase amber) > page title (text-xl/text-2xl bold) > section titles (text-sm semibold).
- Consistent use of `font-semibold` for interactive labels and `font-medium` for secondary metadata.
- `tabular-nums` on the dashboard stat values (`DashboardPage.tsx:89`) — excellent detail for numbers that change.
- Labels in ProductForm use a distinct `uppercase tracking-wider` style that visually separates them from input values.
- Long text fields use `leading-relaxed` for readability (`ProductDetailPage.tsx:259`).

**Issues:**

- Non-standard sizes used outside the Tailwind scale:
  - `text-[11px]` — `LoginPage.tsx:85`, `ProductCard.tsx:138`, `ProductsPage.tsx:264`, `DashboardPage.tsx:91`
  - `text-[13px]` — `Sidebar.tsx:106`, `Sidebar.tsx:145`, `DashboardPage.tsx:117`
  - `text-[10px]` — `Sidebar.tsx:93`, `Sidebar.tsx:77` (via inline style)
  - These are fine individually but collectively mean the app has ~8 distinct font sizes when 5-6 would suffice.
- `DashboardPage.tsx:169` — In the recent repairs list, product name uses `text-sm font-medium` but in the table list view at `ProductsPage.tsx:369` the same product name in a row uses `font-bold text-base`. The same entity (product name in a row) has two different typographic treatments.
- `ProductCard.tsx:149` — Product card title uses `text-base font-bold`; the price below also uses `text-base font-bold` (`ProductCard.tsx:163`). Two `font-bold text-base` elements adjacent to each other with no weight differentiation creates visual flatness. Consider `text-lg` for name or `text-sm` for price.
- `LoginPage.tsx:70` — App title "Electroteca" is `text-lg font-bold`, which feels small for a login page hero. `text-xl` or `text-2xl` would give it more presence.

---

### Pillar 5: Spacing (3/4)

**What's working:**
- Pages consistently use `p-4 sm:p-6 lg:p-8` — a clean responsive scale.
- Card internal padding is consistently `p-4` or `p-5`.
- Form fields consistently use `space-y-4` with `mb-1.5` label-to-input gaps.
- The `gap-3 sm:gap-4` pattern on grids is applied uniformly.
- Section spacing (`mb-5 sm:mb-6`) between header and content is consistent across all pages.

**Issues:**

- `Pagination.tsx:15` — Missing `border-zinc-700/80` class on `border-t`. The border-top appears without a color class, so it inherits the browser default (which may render incorrectly). Should explicitly be `border-t border-zinc-700/80` matching the surrounding card borders.
- `ProductCard.tsx:73` — The card has no consistent bottom padding when there are no action buttons (viewer role). The `p-4` block link creates a slightly different bottom rhythm than when the action row is present.
- `ProductDetailPage.tsx:232-244` — The "Información General" section has a `grid-cols-2 gap-4` with "Precio" showing a `text-2xl` number and "Categoría" showing a `text-sm font-semibold`. The vertical alignment of these two columns looks off — Precio has a large number while Categoría has only a small text value. Adding `mt-2` to the price value (as Categoría does) would align them.
- `ProductForm.tsx:235` — Checkbox row uses `pt-7` to align with the price input including its label. This hardcoded top padding will misalign if the label height ever changes. A flexbox alignment approach (`items-end pb-0.5` on the outer div) would be more robust.
- `DashboardPage.tsx:114` — The RecentProducts panel uses `divide-y divide-zinc-800` for rows but the panel itself has `border border-zinc-700/80`. The divider color (`zinc-800`) is the same as the panel background (`bg-zinc-800`), making the row dividers invisible. Should use `divide-zinc-700/60` or `divide-zinc-900`.

---

### Pillar 6: Experience Design (3/4)

**What's working:**
- Loading skeletons on Dashboard stat cards and product lists — not just spinners.
- Inline fetch indicator on ProductsPage (spinner next to count) while `isFetching` but not initial `isLoading` — correct pattern.
- `placeholderData: (prev) => prev` on the products query keeps the previous page visible while paginating — avoids layout shift.
- Debounced search (400ms) prevents excessive API calls.
- Modal focus trap with Escape-to-close and focus return.
- ConfirmDialog defaults focus to "Cancelar" (the safe action) — correct destructive action pattern.
- Permission-gated UI: `canManage` and `canDeleteProduct` correctly hide actions for viewers.
- Toast notifications for all mutations with error handling via `getErrorMessage`.
- ErrorBoundary wrapping on Dashboard sections.
- Skip-to-content link in Layout (`Layout.tsx:11`).

**Issues:**

- `ProductCard.tsx:175` — Edit/Delete buttons have `opacity-0 group-hover:opacity-100` with no touch fallback. On mobile, these buttons are permanently invisible. Users have no indication that edit/delete actions exist unless they navigate into the detail page.
  - Fix: Change to `sm:opacity-0 sm:group-hover:opacity-100` so buttons are always visible on small screens.

- `UsersPage.tsx:265-272` — Empty state row only shows "No hay usuarios" — no button to create the first user. Every other page (Products, Categories) offers a contextual CTA in the empty state.

- `DashboardPage.tsx:65` — Stats grid always renders 4 skeleton cards (`Array.from({ length: 4 })`), but non-admin users only see 2 real cards when loaded. The skeleton count doesn't match the final card count, causing layout shift on load for viewers.
  - Fix: Use `const skeletonCount = isAdmin ? 4 : 2` (or just 2 as a safe default since the third card is conditional).

- `ProductsPage.tsx:168` — The mobile filter toggle badge indicating active filters (`w-1.5 h-1.5 rounded-full bg-amber-500 absolute mt-[-8px] ml-4`) uses negative margin for positioning rather than `absolute` with proper parent `relative`. This creates brittle positioning that breaks if the button layout changes.

- `CategoriesPage.tsx:70` — `CategoryProducts` fetches with `page_size: 50`. If a category has more than 50 products, the expanded list silently truncates. No "Ver todos" link or count indicator is shown in the expanded panel.

- `ProductDetailPage.tsx:65-71` — The product detail loading state is a full-height centered spinner (`min-h-[60vh]`). This is a significant regression from the dashboard which uses skeletons. A skeleton layout matching the 3-column grid would prevent layout shift.

- `ProductForm.tsx` — There is no cancel button in the form itself. The only way to dismiss is the modal's X button. Adding a "Cancelar" secondary button beside "Crear/Actualizar" is a common form pattern that reduces accidental data entry.

- `Modal.tsx:45` — Focus is set on the close button (X) when the modal opens: `setTimeout(() => firstFocusRef.current?.focus(), 50)`. This is counterintuitive for forms — focus should land on the first form field, not the dismiss button. The close button gets focus then tab moves to the first input, meaning keyboard users have to tab once before they can start filling the form.

---

## Files Audited

- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/CategoriesPage.tsx`
- `src/pages/UsersPage.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Layout.tsx`
- `src/components/products/ProductCard.tsx`
- `src/components/products/ProductForm.tsx`
- `src/components/common/Modal.tsx`
- `src/components/common/ConfirmDialog.tsx`
- `src/components/common/Pagination.tsx`
- `src/components/common/Badge.tsx`

---

## Quick Wins (under 30 min each)

- **Pagination dark theme fix** — Replace all `gray-` classes with `zinc-` equivalents, fix non-active page button text to `text-zinc-300`, hover to `hover:bg-zinc-700`. Estimated: 10 min. File: `src/components/common/Pagination.tsx`
- **Badge dark theme fix** — Change `bg-{color}-100 text-{color}-700` to `bg-{color}-500/15 text-{color}-400`. Estimated: 5 min. File: `src/components/common/Badge.tsx`
- **ProductCard mobile action buttons** — Add `sm:` prefix to `opacity-0` and `sm:group-hover:opacity-100`. Estimated: 2 min. File: `src/components/products/ProductCard.tsx:175`
- **ProductDetail paid badge dark fix** — Change `bg-emerald-50`/`bg-amber-50` to `bg-emerald-500/10`/`bg-amber-500/10`. Estimated: 5 min. File: `src/pages/ProductDetailPage.tsx:126-128`
- **CategoriesPage product row badge dark fix** — Change `bg-emerald-50`/`bg-amber-50`/`bg-red-50` to dark equivalents. Estimated: 5 min. File: `src/pages/CategoriesPage.tsx:119-121`
- **CategoriesPage hover fix** — Change `hover:bg-amber-50/50` to `hover:bg-zinc-900/60` and `group-hover:text-amber-700` to `group-hover:text-amber-400`. Estimated: 5 min. File: `src/pages/CategoriesPage.tsx:95-107`
- **UsersPage avatar color** — Change violet gradient to amber. Estimated: 2 min. File: `src/pages/UsersPage.tsx:209`
- **Dashboard skeleton count** — Change hardcoded `length: 4` to `isAdmin ? 4 : 2`. Estimated: 5 min. File: `src/pages/DashboardPage.tsx:22`
- **ProductDetail Package icon color** — Change `text-slate-200` to `text-zinc-600`. Estimated: 1 min. File: `src/pages/ProductDetailPage.tsx:188`
- **DashboardPage row dividers** — Change `divide-zinc-800` to `divide-zinc-700/60`. Estimated: 1 min. File: `src/pages/DashboardPage.tsx:129`

## Bigger Improvements (require more thought)

- **RegisterPage full re-brand to amber** — Requires replacing the SVG BrandIcon with the WrenchLogo from LoginPage, changing gradient color in the submit button and logo container, and updating the page background from `bg-zinc-900` to `bg-[#111111]` for consistency. Will also want to add the ambient glow effect to match login.
- **ProductDetail loading skeleton** — Replace the centered spinner with a skeleton that mirrors the 3-column layout (left column: image placeholder + contact placeholder, right column: info card placeholder). Requires creating a new skeleton variant.
- **ProductForm cancel button + initial focus** — Add a "Cancelar" button next to submit; update Modal to accept an `initialFocusSelector` prop (or use `autoFocus` on the first form input) rather than always focusing the close button.
- **UsersPage empty state CTA** — Add an empty state that mirrors the Products pattern: icon + message + "Crear primer usuario" button that opens the create modal.
- **CategoriesPage search-aware empty state** — Branch the empty state copy based on whether `searchInput` is non-empty to avoid the "create first category" message appearing when categories exist but don't match the search.
