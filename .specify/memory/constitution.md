<!--
SYNC IMPACT REPORT
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: None (initial)
Added sections:
  - Core Principles (I–V): Minimal Dependencies, Responsive Design,
    Distinctive UX, Fluid Motion, Modern Aesthetic
  - Technology Standards
  - Development Workflow
  - Governance
Removed sections: None (initial)
Templates requiring updates:
  ✅ .specify/memory/constitution.md — written now
  ✅ .specify/templates/plan-template.md — Constitution Check gates are
     derived at plan time from this file; no structural update needed
  ✅ .specify/templates/spec-template.md — principles are technology-agnostic;
     no structural update needed
  ✅ .specify/templates/tasks-template.md — task categories remain valid;
     no structural update needed
  ✅ .specify/templates/agent-file-template.md — no changes required
Follow-up TODOs: None
-->

# Exercise Constitution

## Core Principles

### I. Minimal Dependencies

Every external dependency MUST be explicitly justified. Prefer native browser APIs
and CSS over third-party libraries. A library is permitted only when a native
equivalent would require significantly more implementation effort and ongoing
maintenance. Each added dependency MUST be documented with a rationale at the
point of introduction.

**Rationale**: Third-party dependencies introduce supply-chain risk, increase
bundle size, and create long-term maintenance obligations. Lean projects stay
fast, secure, and easy to reason about.

### II. Responsive Design

The interface MUST be fully functional and visually correct across all target
viewports: ≥320px (mobile), ≥768px (tablet), and ≥1280px (desktop). No feature
is considered complete until verified at all three breakpoints. Fluid layouts
MUST be preferred over fixed-pixel grids.

**Rationale**: A static website reaches users on every device. Failing at any
viewport is a defect, not a polish item.

### III. Distinctive UX

The interface MUST be clean, intuitive, and visually distinguishable. Generic
frameworks or unstyled defaults are not acceptable end states. Every key
interaction MUST be deliberate and self-explanatory without tooltips or written
instructions. Simplicity must not produce sameness.

**Rationale**: User experience is the product. A functional but forgettable
interface fails the project's purpose.

### IV. Fluid Motion

Transitions and reveals MUST use animation rather than instant display changes.
Motion MUST feel natural — ease curves appropriate to the element's weight and
distance. Animation MUST NOT impede usability: UI response animations SHOULD
complete within 400ms. All animations MUST respect `prefers-reduced-motion`.

**Rationale**: Motion communicates state and hierarchy. Instant snaps feel
broken; overwrought animations feel slow. The goal is perceived performance
through deliberate motion.

### V. Modern Aesthetic

The visual system MUST be coherent: a consistent typography scale, spacing
system, and color palette MUST be applied across all pages and components.
Visual inconsistency (mismatched font sizes, irregular spacing, stray colors)
is a defect. Emojis MAY be used where they enhance clarity or visual appeal,
and MUST be applied consistently when used.

**Rationale**: Visual coherence signals quality. Inconsistency degrades the
experience even when functionality is correct.

## Technology Standards

- HTML, CSS, and vanilla JavaScript are the default stack. Build tools are not
  required unless explicitly justified per Principle I.
- CSS custom properties (variables) MUST be used for all repeated design tokens
  (colors, spacing, font sizes).
- Semantic HTML MUST be used throughout; generic `<div>` nesting without
  semantic meaning is not acceptable.
- Images and media MUST include appropriate `alt` text and be optimized for
  web delivery.
- No CSS framework (Bootstrap, Tailwind, etc.) may be introduced without
  explicit justification against Principle I.

## Development Workflow

- Every feature MUST be validated against all five Core Principles before it
  is considered complete.
- Cross-browser compatibility MUST be verified in at least two modern browsers
  (e.g., Chrome and Firefox).
- A responsive check at 320px, 768px, and 1280px MUST be performed before any
  feature is merged or delivered.
- Accessibility basics (keyboard navigation, sufficient color contrast ratio)
  MUST be confirmed per feature.

## Governance

This constitution supersedes all other development practices for this project.

- **Amendment procedure**: Propose the change → justify the version bump type
  (MAJOR/MINOR/PATCH) → update this file → propagate changes to dependent
  templates and record in the Sync Impact Report.
- **Versioning policy**:
  - MAJOR — principle removal or backward-incompatible redefinition.
  - MINOR — new principle or section added, or material expansion of guidance.
  - PATCH — clarifications, wording refinements, or typo fixes.
- **Compliance review**: Every feature plan MUST include a Constitution Check
  gate that verifies adherence to all five Core Principles before Phase 0
  research begins, and again after Phase 1 design.

**Version**: 1.0.0 | **Ratified**: 2026-03-21 | **Last Amended**: 2026-03-21
