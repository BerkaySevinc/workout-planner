# Research: Workout Planner & Timer

**Branch**: `001-workout-planner-timer` | **Date**: 2026-03-22

---

## 1. Drag-and-Drop: Native vs. Pointer Events

**Decision**: Implement drag-and-drop using the **Pointer Events API**
(`pointerdown` / `pointermove` / `pointerup`).

**Rationale**: The HTML5 Drag-and-Drop API (`draggable`, `dragstart`, `drop`)
has no touch support — it does not fire on iOS Safari or Android Chrome without
polyfills. Because the constitution mandates responsive design from 320px (which
includes mobile touch devices), the native DnD API is insufficient. The Pointer
Events API handles both mouse and touch uniformly and is supported in all target
browsers (Chrome 55+, Firefox 59+, Safari 13+).

**Implementation pattern**:
1. On `pointerdown`, capture the pointer (`element.setPointerCapture(e.pointerId)`)
   and record the drag start position and the dragged element's current index.
2. On `pointermove`, translate the element visually using `transform: translateY()`
   and determine which sibling the dragged item is hovering over using
   `getBoundingClientRect()` comparisons.
3. On `pointerup`, commit the reorder by mutating the state array, persisting
   to localStorage, and re-rendering the list in the new order.
4. Provide a CSS class `is-dragging` on the ghost element for visual feedback
   (opacity 0.5, cursor: grabbing).

**Alternatives considered**:
- HTML5 DnD API — rejected: no touch support.
- Third-party DnD library (SortableJS) — rejected: violates Principle I
  (external dependency with no justification; Pointer Events achieves the same).

---

## 2. Timer Accuracy: Drift Correction Strategy

**Decision**: Use `setInterval` at **100ms** with `Date.now()`-based remaining
time calculation. Combine with the **Page Visibility API** for background
tab correction.

**Rationale**: `setInterval` is subject to browser throttling (≥1s intervals in
background tabs, per W3C spec). Storing the `endTime` as a wall-clock timestamp
(`Date.now() + remainingMs`) rather than decrementing a counter on each tick
means the displayed value is always accurate regardless of tick frequency.
When the `visibilitychange` event fires with `document.visibilityState === 'visible'`,
the timer recalculates remaining time from `endTime - Date.now()` and either
continues or immediately triggers completion if time has elapsed.

**Implementation pattern**:
```js
// Start rest
const endTime = Date.now() + restDurationMs;
const intervalId = setInterval(() => {
  const remaining = endTime - Date.now();
  if (remaining <= 0) { endRest(); return; }
  renderCountdown(Math.ceil(remaining / 1000));
}, 100);

// On tab restore
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const remaining = endTime - Date.now();
    if (remaining <= 0) endRest();
    else renderCountdown(Math.ceil(remaining / 1000));
  }
});
```

**Alternatives considered**:
- `requestAnimationFrame` — rejected: overkill for a seconds-granularity countdown;
  also throttled in background tabs.
- Pure `setInterval` decrement — rejected: drifts when tab is backgrounded.

---

## 3. LocalStorage Schema Design

**Decision**: Two top-level keys with a flat JSON structure.

| Key | Type | Description |
|-----|------|-------------|
| `wpt_programs` | `Program[]` (JSON) | Ordered array of all programs; array index = display order |
| `wpt_theme` | `'dark' \| 'light'` | User theme preference |

**Rationale**: The ordered array as the source of truth for program/exercise
ordering eliminates the need for a separate `order` field. When the user reorders
via DnD, the array is spliced and re-saved atomically. This is the simplest
schema that satisfies all requirements.

**No migration needed for v1** — schema is fixed at launch. If a future version
adds fields, `storage.js` will apply defaults for missing keys on read.

**Write strategy**: All writes are a full serialization of the programs array
(`JSON.stringify`). Given the scale (dozens of programs, each with dozens of
exercises), this is negligible in cost and avoids partial-update bugs.

---

## 4. CSS Theming: Custom Properties + data-theme Attribute

**Decision**: Apply theme tokens via `[data-theme="dark"]` and
`[data-theme="light"]` selectors on `<html>`. First-load default is determined
by `matchMedia('(prefers-color-scheme: dark)')`.

**Rationale**: Setting the attribute on `<html>` scopes all theme overrides to
a single selector, avoiding specificity conflicts. CSS custom properties
(variables) defined in `variables.css` are overridden per-theme in `themes.css`.
The theme is applied before first paint by reading `localStorage` synchronously
in a `<script>` tag in `<head>` (before any stylesheet renders), eliminating
flash-of-wrong-theme (FOWT).

**Pattern**:
```html
<!-- In <head>, before stylesheets -->
<script>
  const saved = localStorage.getItem('wpt_theme');
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', saved ?? preferred);
</script>
```

**Alternatives considered**:
- `:root` + body class — rejected: less semantic, conflicts with ARIA.
- CSS `color-scheme` property alone — rejected: insufficient for custom color tokens.

---

## 5. SPA View Management (No Router)

**Decision**: Three views managed by **CSS class toggling** on a wrapper
element. No hash routing, no URL changes.

**Rationale**: The app has exactly three screens (programs grid, program detail,
timer). Users navigate linearly (no deep-linking requirement, no back-button
navigation needed for the timer). A class-based show/hide with CSS transitions
is the lightest correct solution. Adding a hash router would introduce complexity
with no benefit for this use case.

**Pattern**:
```js
// views: 'programs-grid' | 'program-detail' | 'timer-screen'
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
}
```

CSS transition on `.view` ensures animated entry/exit (Principle IV compliance).

**Alternatives considered**:
- Hash-based router — rejected: overkill for 3 linear views.
- `history.pushState` — rejected: no shareable URLs needed; adds complexity.

---

## 6. ES Modules (No Bundler)

**Decision**: Use native **ES modules** (`<script type="module">`) for JS
imports. No bundler (Vite, Webpack, Rollup) required.

**Rationale**: ES modules are supported in all target browsers (Chrome 61+,
Firefox 60+, Safari 10.1+). Module loading is deferred by default (equivalent to
`defer`), so no explicit `defer` attribute is needed. The `file://` protocol
supports ES modules in all target browsers. No build step satisfies the explicit
constraint from the spec and Principle I.

**Alternatives considered**:
- Single-file bundle — rejected: makes the codebase harder to read and maintain
  without providing any real benefit for a local static app.
- IIFE global pattern — rejected: no module isolation, risk of global name
  collisions across JS files.

---

## 7. ID Generation

**Decision**: Use `crypto.randomUUID()` for all entity IDs.

**Rationale**: Available in all target browsers (Chrome 92+, Firefox 95+,
Safari 15.4+). Generates RFC 4122 UUID v4. No library needed. IDs are used
as stable keys for entity lookups and are never exposed to users.

**Alternatives considered**:
- `Date.now()` + `Math.random()` composite — rejected: collision risk, not
  standards-compliant.
- Sequential integer IDs — rejected: fragile on array splice/reorder operations.
