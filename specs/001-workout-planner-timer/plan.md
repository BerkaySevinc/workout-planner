# Implementation Plan: Workout Planner & Timer

**Branch**: `001-workout-planner-timer` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-workout-planner-timer/spec.md`

## Summary

A fully client-side, browser-based workout planning and execution app built with
vanilla JavaScript and plain CSS. All data is stored in `localStorage`. No
backend, no build step, no framework. The app delivers four user-facing
capabilities: program management (CRUD + reorder), exercise management (CRUD +
reorder), guided workout execution with a rest countdown timer, and a persistent
dark/light theme toggle.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (native `crypto.randomUUID`, `structuredClone`)
**Primary Dependencies**: None — native browser APIs only
**Storage**: `localStorage` (keys: `wpt_programs`, `wpt_theme`)
**Testing**: None
**Target Platform**: Modern evergreen browsers (Chrome 105+, Firefox 105+, Safari 16+, Edge 105+)
**Project Type**: Static web application (single HTML file entry point, no server required)
**Performance Goals**: All UI transitions ≤ 400ms; timer tick at 100ms granularity with wall-clock drift correction
**Constraints**: No build step; deliverable is a directory of static files openable with `file://`; fully offline-capable; responsive ≥ 320px
**Scale/Scope**: Single-user, local-only data; no practical upper bound beyond browser localStorage quota (~5MB)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Dependencies | **PASS** | Vanilla JS + plain CSS; zero npm packages; no CDN imports |
| II. Responsive Design | **PASS** | Spec mandates responsive grid; verified at 320 / 768 / 1280px breakpoints |
| III. Distinctive UX | **PASS** | Custom card design, inline forms, animated timer screen — no generic defaults |
| IV. Fluid Motion | **PASS** | Theme toggle, card reveals, inline form open/close, view transitions all animated; `prefers-reduced-motion` respected |
| V. Modern Aesthetic | **PASS** | CSS custom properties for all design tokens; semantic HTML throughout; coherent typography + spacing scale |

**Gate result: ALL PASS — proceed to Phase 0.**

### Post-Design Re-Check (Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Minimal Dependencies | **PASS** | Pointer Events DnD implemented natively; no library introduced |
| II. Responsive Design | **PASS** | CSS Grid with `auto-fill` + `minmax`; fluid from 320px; no fixed-width containers |
| III. Distinctive UX | **PASS** | Inline edit pattern, hover-reveal actions, upcoming exercises panel in timer |
| IV. Fluid Motion | **PASS** | `animation.css` defines all keyframes; all view switches use CSS transitions |
| V. Modern Aesthetic | **PASS** | `variables.css` is single source of truth for all tokens; semantic elements used throughout |

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-planner-timer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
/
├── index.html                    # Single entry point; all views rendered here
├── css/
│   ├── variables.css             # All CSS custom properties (design tokens)
│   ├── reset.css                 # Minimal CSS reset (box-sizing, margin, padding)
│   ├── base.css                  # Body, typography, semantic element defaults
│   ├── themes.css                # Dark & light theme token values via [data-theme]
│   ├── layout.css                # Page shell, view-switching, grid container
│   └── components/
│       ├── card.css              # Program card & exercise row styles
│       ├── forms.css             # Inline form, field, validation error styles
│       ├── modal.css             # Confirmation dialog overlay
│       ├── timer.css             # Timer screen: phase display, countdown, lists
│       └── animations.css        # Shared keyframes & transition utilities
└── js/
    ├── app.js                    # Entry point: init, theme bootstrap, view router
    ├── storage.js                # localStorage read/write/schema wrapper
    ├── state.js                  # In-memory app state + pure mutation functions
    ├── timer.js                  # Countdown engine (drift-corrected, visibilitychange)
    ├── dnd.js                    # Pointer Events drag-and-drop (mouse + touch)
    ├── views/
    │   ├── programs-grid.js      # Programs grid view: render, create, delete, reorder
    │   ├── program-detail.js     # Program detail view: exercise list, edit, reorder
    │   └── timer-screen.js       # Workout execution view: phase state machine, keyboard
    └── components/
        ├── confirmation-modal.js # Reusable confirmation dialog (promise-based)
        └── inline-form.js        # Reusable inline form (program name / exercise fields)
```

**Structure Decision**: Single-project static layout. No `src/` indirection — files are
served directly from the root. CSS and JS are split into focused modules and loaded
via `<script type="module">` and `<link rel="stylesheet">` in `index.html`. No
bundler; native ES modules handle imports.

## Complexity Tracking

No constitution violations. Table not required.
