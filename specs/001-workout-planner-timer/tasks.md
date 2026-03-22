# Tasks: Workout Planner & Timer

**Input**: Design documents from `/specs/001-workout-planner-timer/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: None — not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story. No bundler, no framework — vanilla JS + plain CSS.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Create the full file/directory skeleton and the HTML entry point.

- [x] T001 Create directory structure at repository root: `css/`, `css/components/`, `js/`, `js/views/`, `js/components/`
- [x] T002 Create `index.html` with: HTML5 doctype, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, inline theme-bootstrap `<script>` in `<head>` (reads `wpt_theme` from localStorage, falls back to `matchMedia('(prefers-color-scheme: dark)')`, sets `document.documentElement.setAttribute('data-theme', theme)`), `<link>` tags for all CSS files in order (variables → reset → themes → base → layout → components), three `<div class="view">` sections with IDs `view-programs-grid`, `view-program-detail`, `view-timer-screen`, and `<script type="module" src="js/app.js">` at end of `<body>`
- [x] T003 Create placeholder stub files (empty ES module exports) for all JS files listed in plan.md so imports resolve without errors: `js/storage.js`, `js/state.js`, `js/timer.js`, `js/dnd.js`, `js/views/programs-grid.js`, `js/views/program-detail.js`, `js/views/timer-screen.js`, `js/components/confirmation-modal.js`, `js/components/inline-form.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design tokens, theme system, storage layer, state layer, and view router.
All user stories depend on this phase being complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Create `css/variables.css` — define all CSS custom properties on `:root`: color tokens (`--color-bg`, `--color-surface`, `--color-surface-hover`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-accent`, `--color-accent-hover`, `--color-danger`, `--color-danger-hover`), spacing scale (`--space-1` through `--space-8` in multiples of 4px), typography scale (`--font-size-sm`, `--font-size-base`, `--font-size-lg`, `--font-size-xl`, `--font-size-2xl`; `--font-family-base`), border radius (`--radius-sm`, `--radius-md`, `--radius-lg`), transitions (`--transition-fast: 150ms ease`, `--transition-base: 250ms ease`, `--transition-slow: 400ms ease`)
- [x] T005 [P] Create `css/themes.css` — define `[data-theme="dark"]` and `[data-theme="light"]` rule blocks on `:root` (or `html`) that override the color tokens from `variables.css`; dark theme: near-black background (`#0f0f0f`), dark-surface cards, muted borders, light text; light theme: white background, light-gray surface, dark text; accent color consistent across both themes
- [x] T006 [P] Create `css/reset.css` — minimal reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`, `ul, ol { list-style: none; }`, `img { max-width: 100%; display: block; }`, `button { cursor: pointer; border: none; background: none; font: inherit; }`
- [x] T007 [P] Create `css/base.css` — body: `background: var(--color-bg); color: var(--color-text-primary); font-family: var(--font-family-base); font-size: var(--font-size-base); line-height: 1.5;`; apply `user-select: none` globally to prevent text selection; restore `user-select: text` on `input, textarea, select, [contenteditable]`; `transition: background var(--transition-slow), color var(--transition-slow)` on body for theme switching; heading styles for `h1`, `h2`, `h3`
- [x] T008 Create `css/layout.css` — page shell: `header` with app title and theme toggle button slot, `main` as flex container; `.view { display: none; }` and `.view.active { display: block; }` (view switching); programs grid: `.programs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-4); padding: var(--space-4); }` responsive from 320px (single column) to desktop (multi-column); program-detail container: max-width, centered, padding
- [x] T009 Create `js/storage.js` — export `loadPrograms()`: JSON.parse(localStorage.getItem('wpt_programs')) with try/catch returning `[]` on error; backfill missing `id` fields with `crypto.randomUUID()` on any loaded program or exercise and re-save; export `savePrograms(programs)`: localStorage.setItem('wpt_programs', JSON.stringify(programs)); export `loadTheme()`: localStorage.getItem('wpt_theme') returning `'dark' | 'light' | null`; export `saveTheme(theme)`: localStorage.setItem('wpt_theme', theme)
- [x] T010 Create `js/state.js` — export mutable `programs` array (initially `[]`); export `loadState()` that calls `storage.loadPrograms()` and populates `programs`; export pure mutation functions: `addProgram(name)` (creates `{id: crypto.randomUUID(), name, exercises: []}`, pushes to programs), `updateProgramName(id, name)`, `deleteProgram(id)`, `addExercise(programId, fields)` (creates `{id: crypto.randomUUID(), name, sets, reps, restSeconds}`), `updateExercise(programId, exerciseId, fields)`, `deleteExercise(programId, exerciseId)`, `reorderPrograms(fromIndex, toIndex)` (splice), `reorderExercises(programId, fromIndex, toIndex)` (splice); export `currentProgram` ref and `setCurrentProgram(id)` setter
- [x] T011 Create `js/app.js` — export `showView(name)`: removes `.active` from all `.view` elements, adds `.active` to `#view-${name}`, calls the matching view's `render()` if applicable; `DOMContentLoaded` handler: call `state.loadState()`, call `showView('programs-grid')`; import and re-export `showView` so views can call it; theme toggle button wire-up (stub — full implementation in US4 phase)

**Checkpoint**: App shell loads in browser, theme tokens apply, localStorage layer works, view switching works, `state.js` mutations are stable.

---

## Phase 3: User Story 1 — Build a Workout Program (Priority: P1) 🎯 MVP

**Goal**: Users can create programs, add/edit/delete exercises with validation, see
program cards with estimated duration, and navigate between the programs grid and
program detail view.

**Independent Test**: Create program "Push Day", add Push-Up (3×10, 30s rest) and
Dip (4×8, 45s rest). Verify the card shows "Push Day", 2 exercises, and estimated
duration = ceil((10×3×3 + 30×3 + 8×3×4 + 45×4) / 60) = ceil((90+90+96+180)/60)
= ceil(7.6) = 8 min. Edit Push-Up sets to 4, verify duration updates. Delete Dip
with cancel (nothing deleted), then confirm (exercise removed).

- [x] T012 [P] [US1] Create `css/components/card.css` — `.card` base styles: `background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); border: 1px solid var(--color-border); transition: box-shadow var(--transition-fast);`; `.card:hover { box-shadow: ... }`; `.card-actions { opacity: 0; transition: opacity var(--transition-fast); }` `.card:hover .card-actions, .card:focus-within .card-actions { opacity: 1; }`; `.card--add` (the + card): dashed border, centered + icon, full-width/height in grid; program card layout: name heading, meta row (exercise count, duration), actions row; exercise row: horizontal layout, name + stats + delete button; `.is-dragging { opacity: 0.5; cursor: grabbing; }`
- [x] T013 [P] [US1] Create `css/components/forms.css` — `.inline-form` container styles; `.form-field` wrapper with label and input stacked; `input[type="text"], input[type="number"]` styles using design tokens; `.form-error` inline error message (below field, `var(--color-danger)`, `font-size: var(--font-size-sm)`); `.form-actions` row with Add/Save and Cancel buttons; button variants: `.btn-primary` (accent background), `.btn-ghost` (transparent, border)
- [x] T014 [P] [US1] Create `css/components/modal.css` — `.modal-overlay`: fixed fullscreen backdrop, `background: rgba(0,0,0,0.5)`, flex center; `.modal-dialog`: `background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-6); max-width: 400px; width: 90%;`; message text, actions row with Confirm (danger) and Cancel (ghost) buttons; entrance animation (scale from 0.9 + fade in)
- [x] T015 [US1] Implement `js/components/inline-form.js` — export `InlineForm` class: `constructor(container, fieldDefs, { onSubmit, onCancel })` where `fieldDefs` is an array of `{name, label, type, defaultValue, min, max, maxLength}`; `render()`: injects form HTML into container, binds submit (Enter key or Add button) and cancel; `setValues(values)`: pre-fills fields for edit mode; `getValues()`: returns `{fieldName: parsedValue}` object; `setErrors(errors)`: displays `{fieldName: message}` inline below each field; `destroy()`: removes injected HTML and event listeners; Add button click and Enter keydown both trigger validation callback; Escape keydown triggers cancel
- [x] T016 [US1] Implement `js/components/confirmation-modal.js` — export `ConfirmationModal` class with static `show(message)` method that returns a `Promise<boolean>`; injects `.modal-overlay` into `document.body`; Confirm button resolves `true`, Cancel button and overlay click resolve `false`; removes overlay from DOM after resolution; Escape key resolves `false`
- [x] T017 [US1] Implement `js/views/programs-grid.js` — export `init()` and `render()`; `render()`: clear container, render all `state.programs` as cards (name, exercise count = `exercises.length`, estimated duration = `Math.ceil(exercises.reduce((sum, ex) => sum + ex.reps * 3 * ex.sets + ex.restSeconds * ex.sets, 0) / 60)` min), render + card at end; card actions: Edit (navigates to detail view), Delete (ConfirmationModal → `state.deleteProgram` + `savePrograms` + `render()`), Start (disabled/hidden if `exercises.length === 0`, otherwise calls `timerScreen.init(program)` + `showView('timer-screen')`); + card click: show `InlineForm` in-place with single name field, validate non-empty and ≤ 50 chars and case-insensitive unique, on success `state.addProgram(name)` + `savePrograms` + `render()`; Edit click: `state.setCurrentProgram(id)` + `showView('program-detail')`
- [x] T018 [US1] Implement `js/views/program-detail.js` — export `init()` and `render()`; `render()`: render back-arrow button (calls `showView('programs-grid')`), program name `<h2>`, exercise list; if `currentProgram.exercises.length === 0` show empty state message "No exercises yet — add your first one." above + card; for each exercise render row with name, sets×reps summary, rest display, edit affordance (click row opens inline edit form), delete button; + card opens `InlineForm` with fields: name (text, maxLength 50), sets (number, default 3, min 1, max 20), reps (number, default 10, min 1, max 100), rest (number, default 30, min 5, max 300); validate FR-014 constraints (all fields + case-insensitive unique name within program), on success `state.addExercise` + `savePrograms` + `render()`; exercise row click opens same `InlineForm` pre-filled via `setValues()`, on success `state.updateExercise` + `savePrograms` + `render()`; delete: `ConfirmationModal` → `state.deleteExercise` + `savePrograms` + `render()`

**Checkpoint**: US1 complete. Open `index.html`, create programs, add and edit exercises,
verify estimated duration on card, delete with confirmation, reload and verify persistence.

---

## Phase 4: User Story 2 — Execute a Workout with the Timer (Priority: P2)

**Goal**: Users can start a guided workout, step through sets and rests, skip rests,
and see the completion screen with elapsed time.

**Independent Test**: With "Push Day" (Push-Up: 2 sets, 30s rest; Dip: 2 sets, 45s
rest), click Start. Verify timer screen shows "Push-Up", "Set 1 of 2", and "Dip" in
upcoming list. Press Space → rest countdown starts. Press Space again → skip rest,
Set 2 of 2 begins. Press Space → all sets done, advance to Dip. Complete Dip sets.
Verify completion screen shows "Workout complete!" and elapsed time. Verify background
tab: switch tabs during rest, wait 5s, return — countdown reflects correct remaining time.

- [x] T019 [P] [US2] Create `css/components/timer.css` — timer screen layout: large current exercise name (`font-size: var(--font-size-2xl)`), set progress indicator (`Set N of M`), phase-specific area (active phase: `Complete Set` button; rest phase: countdown number large + `End Rest` button), upcoming exercises panel (scrollable list of remaining exercise names + remaining sets), `Stop Workout` button (top-right or bottom); completion screen overlay: centered, "Workout complete!" heading, elapsed time, "Return to Programs" button; smooth entrance transitions for phase changes
- [x] T020 [US2] Create `js/timer.js` — export `CountdownTimer` class: `constructor(durationSeconds, onTick, onComplete)`; `start()`: record `this.endTime = Date.now() + durationSeconds * 1000`, start `setInterval` at 100ms — on each tick compute `remaining = this.endTime - Date.now()`, call `onTick(Math.ceil(remaining / 1000))` if remaining > 0, else `stop()` then `onComplete()`; `stop()`: `clearInterval`; `setupVisibilityHandler()`: add `visibilitychange` listener — when tab becomes visible, recompute `remaining = this.endTime - Date.now()`, if ≤ 0 call `stop()` then `onComplete()`, else call `onTick(Math.ceil(remaining / 1000))`; `destroy()`: `stop()` + remove visibility listener
- [x] T021 [US2] Implement `js/views/timer-screen.js` — export `init(program)` and internal session state; `init`: deep-copy program with `structuredClone`, set `sessionStartTime = Date.now()`, set `currentExerciseIndex = 0`, `currentSetNumber = 1`, `phase = 'active'`, call `renderActivePhase()`; `renderActivePhase()`: show current exercise name, "Set N of M" where M = `exercise.sets`, upcoming exercises list (remaining exercises with remaining set counts), Complete Set button, Stop Workout button; bind keyboard listener on `document` for `Enter`/`Space` → `handleCompleteSet()` (only when this view is active); `handleCompleteSet()`: if `currentSetNumber < exercise.sets` → increment `currentSetNumber`, set `phase = 'rest'`, create and `start()` a `CountdownTimer(exercise.restSeconds, renderRestPhase, advanceSet)`; if `currentSetNumber === exercise.sets` → `advanceExercise()`; `renderRestPhase(seconds)`: show countdown number, End Rest button; bind Enter/Space → `handleEndRest()`; `handleEndRest()`: `timer.destroy()`, `advanceSet()`; `advanceSet()`: `phase = 'active'`, `renderActivePhase()`; `advanceExercise()`: `currentExerciseIndex++`; if `currentExerciseIndex < exercises.length` → `currentSetNumber = 1`, `renderActivePhase()`; else → `renderCompletion()`; `renderCompletion()`: remove keyboard listener, show completion screen with "Workout complete!", elapsed = `Date.now() - sessionStartTime` formatted as `Xm Ys`, Return to Programs button → `showView('programs-grid')`; `handleStopWorkout()`: if timer active `timer.destroy()`, remove keyboard listener, `showView('programs-grid')`

**Checkpoint**: US2 complete. Full workout loop works: active → rest (auto-countdown) →
next set → completion screen. Background tab handling confirmed.

---

## Phase 5: User Story 3 — Manage & Reorder Programs and Exercises (Priority: P3)

**Goal**: Users can drag programs and exercises to reorder them; new order persists
after page refresh. Delete with confirmation for programs and exercises.

**Independent Test**: Create two programs "A" and "B". Drag "B" to position 1. Refresh.
Verify "B" is first. Open a program with two exercises, drag second to first, refresh,
verify new order persists. Delete exercise with cancel (nothing changes). Delete exercise
with confirm (removed). Delete program with confirm (removed from grid).

- [x] T022 [P] [US3] Create `js/dnd.js` — export `makeSortable(listEl, onReorder)`: query all `[data-draggable]` children of `listEl`; for each, attach `pointerdown` listener: `e.target.setPointerCapture(e.pointerId)`, record `dragIndex` (child index), `startY = e.clientY`, add `.is-dragging` class; `pointermove`: compute `deltaY = e.clientY - startY`, apply `transform: translateY(${deltaY}px)` to dragged element, iterate siblings to find `hoverIndex` by comparing `e.clientY` to each sibling's `getBoundingClientRect().top + height/2`; `pointerup`: remove `.is-dragging`, reset `transform`, if `dragIndex !== hoverIndex` call `onReorder(dragIndex, hoverIndex)`; `pointercancel`: reset `transform`, remove `.is-dragging`; return a `destroy()` function that removes all listeners (call when re-rendering)
- [x] T023 [US3] Integrate DnD into `js/views/programs-grid.js` — add `data-draggable` attribute to each rendered program card element; after `render()` completes, call `makeSortable(gridEl, (from, to) => { state.reorderPrograms(from, to); storage.savePrograms(state.programs); render(); })`; store the returned `destroy()` and call it at the start of each `render()` to clean up before re-attaching; ensure the + card does NOT have `data-draggable` (it must stay last)
- [x] T024 [US3] Integrate DnD into `js/views/program-detail.js` — add `data-draggable` attribute to each rendered exercise row; after `render()` completes, call `makeSortable(listEl, (from, to) => { state.reorderExercises(state.currentProgram.id, from, to); storage.savePrograms(state.programs); render(); })`; store the returned `destroy()` and call it at the start of each `render()`; ensure the + card does NOT have `data-draggable`

**Checkpoint**: US3 complete. Drag-and-drop works on mouse and touch; order persists;
delete confirmations work for both programs and exercises.

---

## Phase 6: User Story 4 — Theme Toggle & Global UX Preferences (Priority: P4)

**Goal**: Users can toggle dark/light theme; preference persists across sessions. Text
selection disabled globally except in form inputs.

**Independent Test**: Toggle to light mode. Refresh. Verify light theme restored. Try
selecting text on a program card label — selection prevented. Click into a name input
field — text selection allowed normally.

- [x] T025 [P] [US4] Add theme toggle button to `index.html` header — `<button id="theme-toggle" aria-label="Toggle theme">` with a moon/sun Unicode character (🌙 / ☀️) or inline SVG; position it in the top-right of the `<header>` element; add header layout styles to `css/layout.css` (`display: flex; justify-content: space-between; align-items: center; padding: var(--space-4)`)
- [x] T026 [US4] Implement theme toggle in `js/app.js` — `toggleTheme()`: read `document.documentElement.getAttribute('data-theme')`, compute opposite, call `document.documentElement.setAttribute('data-theme', newTheme)`, call `storage.saveTheme(newTheme)`, update `#theme-toggle` text content (🌙 for dark, ☀️ for light); call `toggleTheme` on `#theme-toggle` click; on `DOMContentLoaded`, also set the correct icon based on the already-applied theme (set by the inline bootstrap script in `<head>`)

**Checkpoint**: US4 complete. Theme toggle works, persists, text selection behaves correctly.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Animations, responsive verification, accessibility, and final validation.

- [x] T027 Create `css/components/animations.css` — define all keyframes: `@keyframes fadeIn`, `@keyframes scaleIn` (for modal), `@keyframes slideDown` (for inline forms), `@keyframes fadeSlideUp` (for view entrance); apply to `.view.active { animation: fadeIn var(--transition-fast) ease; }`, `.modal-overlay { animation: fadeIn 150ms ease; }`, `.modal-dialog { animation: scaleIn 200ms ease; }`, `.inline-form { animation: slideDown var(--transition-fast) ease; }`; add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`; link this file in `index.html` last in the CSS load order
- [x] T028 Responsive audit — open `index.html` and verify at 320px, 768px, and 1280px viewports: programs grid single-column on 320px, 2-col on 768px, multi-col on 1280px; program detail list not overflowing at 320px; timer screen readable at 320px; fix any overflow, clipped text, or broken layout in `css/layout.css`, `css/components/card.css`, `css/components/timer.css`
- [x] T029 Accessibility audit — verify: all `<button>` elements have visible `:focus-visible` outlines (add if missing to `css/base.css`); confirm color contrast ratio ≥ 4.5:1 for text on background in both dark and light themes; confirm `<header>`, `<main>`, `<section>`, `<h1>`/`<h2>`/`<h3>` hierarchy is semantically correct throughout `index.html`; confirm modal has `role="dialog"` and `aria-modal="true"`; confirm timer screen keyboard shortcuts (Enter/Space) do not intercept browser shortcuts when timer screen is not active
- [x] T030 Final validation — follow `quickstart.md` from blank state (clear localStorage): create a program, add two exercises, start workout, complete all sets and rests, verify completion screen, return to programs grid; verify theme toggle and refresh; verify drag-to-reorder and refresh; confirm the app works via `file://` protocol in both Chrome and Firefox

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user story phases**
- **Phase 3 (US1)**: Depends on Phase 2 — MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2 + US1 (exercises must exist to start a workout)
- **Phase 5 (US3)**: Depends on Phase 2 + US1 (programs/exercises must render before DnD is integrated)
- **Phase 6 (US4)**: Depends on Phase 2 only — independently addable at any point after Foundational
- **Phase 7 (Polish)**: Depends on all story phases being complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — **no story dependencies**
- **US2 (P2)**: Start after Phase 2; functionally depends on US1 (programs must exist to test timer, but code is independent)
- **US3 (P3)**: Start after Phase 2; integrates into US1 views (requires US1 render to be stable)
- **US4 (P4)**: Start after Phase 2 — **no story dependencies**

### Within Each Phase

- CSS files marked [P] can be written in parallel (different files)
- JS files in the same view must be written in order: storage → state → component helpers → view
- Integrate DnD (US3) only after the target view's `render()` is stable

### Parallel Opportunities

**Phase 2**: T004, T005, T006, T007 can all be written in parallel (all different CSS files).

**Phase 3 (US1)**: T012, T013, T014 can be written in parallel (different CSS/JS files).

**Phase 4 (US2)**: T019 can be written in parallel with T020.

**Phase 5 (US3)**: T022 (dnd.js) can be written before US1 views are complete since it is a pure utility with no import dependencies.

---

## Parallel Example: US1

```text
# Launch in parallel:
Task T012: css/components/card.css
Task T013: css/components/forms.css
Task T014: css/components/modal.css

# Then sequentially:
Task T015: js/components/inline-form.js
Task T016: js/components/confirmation-modal.js
Task T017: js/views/programs-grid.js
Task T018: js/views/program-detail.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **CRITICAL, blocks everything**
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Create programs, add/edit/delete exercises, verify persistence
5. Ship or demo MVP

### Incremental Delivery

1. Setup + Foundational → Shell loads, theme works, storage works
2. + US1 → Programs and exercises fully manageable (MVP)
3. + US2 → Guided workouts run end-to-end
4. + US3 → Drag-and-drop reordering added
5. + US4 → Theme toggle polished and persisted
6. + Polish → Animations, responsive, accessibility, final validation

---

## Notes

- No tests — not requested for this feature.
- No build step — all files served directly via `file://`.
- [P] tasks write to different files and have no inter-task dependencies.
- Each checkpoint should be manually verified in browser before proceeding.
- Commit after each completed phase checkpoint.
- `structuredClone` is used for deep-copying the program at session start (ES2022, supported in all target browsers).
- `crypto.randomUUID()` is used for all entity IDs (no library needed).
