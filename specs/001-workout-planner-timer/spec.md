# Feature Specification: Workout Planner & Timer

**Feature Branch**: `001-workout-planner-timer`
**Created**: 2026-03-21
**Status**: Draft
**Input**: User description: Browser-based static workout planning and execution app

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a Workout Program (Priority: P1)

A user opens the app for the first time and creates a workout program. They name
the program, add exercises with sets, reps, and rest intervals, and see the
program appear in their dashboard with a calculated estimated duration.

**Why this priority**: Program creation is the foundational capability — nothing
else in the app can function without at least one program with at least one
exercise. This is the core value proposition.

**Independent Test**: Create a program named "Push Day", add two exercises
(e.g., Push-Up: 3×10, 30s rest; Dip: 4×8, 45s rest), and verify the card
displays the correct name, exercise count, and estimated duration (rounded
up to the nearest minute).

**Acceptance Scenarios**:

1. **Given** the programs grid is visible, **When** the user clicks the "+"
   card, **Then** a modal dialog appears for entering the program name.
2. **Given** the inline input is open, **When** the user types a name and
   presses Enter, **Then** the program is saved and its card appears in the
   grid.
3. **Given** a program card exists, **When** the user clicks Edit, **Then**
   they are taken to the program detail view where exercises can be added.
4. **Given** the program detail view is open, **When** the user clicks the
   "+" card at the end of the exercise list, **Then** a modal dialog appears
   with fields: name, sets (default 3), reps (default 10), rest (default 30s).
5. **Given** the modal form is filled correctly, **When** the user clicks Save,
   **Then** the exercise is saved and appears in the list.
6. **Given** a program has exercises, **When** the card is viewed, **Then**
   the card shows the exercise count and the estimated duration calculated
   as Σ(reps × 3s × sets + rest × sets) per exercise, rounded up to the
   nearest minute.

---

### User Story 2 - Execute a Workout with the Timer (Priority: P2)

A user selects an existing program and starts a guided workout session. The
app steps them through each exercise set-by-set, automatically triggering rest
countdowns between sets, and finishes with a completion screen.

**Why this priority**: The timer execution screen is the primary runtime
experience and the feature that differentiates the app from a static list.
It depends on P1 (a program must exist), but is independently testable given
fixture data.

**Independent Test**: With a pre-seeded program (2 exercises, 2 sets each,
30s rest), click Start, complete all sets using the Complete Set button and
keyboard shortcuts, verify rest countdowns trigger and End Rest works, and
verify the completion screen appears after the final set.

**Acceptance Scenarios**:

1. **Given** a program card is shown, **When** the user clicks Start, **Then**
   the timer screen opens showing the first exercise, set progress (e.g., "Set
   1 of 3"), and the upcoming exercises list.
2. **Given** the active set phase is displayed, **When** the user clicks
   Complete Set (or presses Enter/Space), **Then** a rest countdown begins
   automatically if more sets remain for the current exercise.
3. **Given** a rest countdown is running, **When** the timer reaches 0,
   **Then** the next set begins automatically.
4. **Given** a rest countdown is running, **When** the user clicks End Rest
   (or presses Enter/Space), **Then** the rest is skipped and the next set
   begins immediately.
5. **Given** all sets for the current exercise are complete, **When** the
   system advances, **Then** the next exercise is shown and the upcoming
   list updates to reflect remaining exercises.
6. **Given** all exercises and sets are finished, **When** the final set is
   completed, **Then** the completion screen is shown.
7. **Given** the timer screen is active, **When** the user clicks Stop
   Workout, **Then** the session ends and the user returns to the programs
   grid.

---

### User Story 3 - Manage & Reorder Programs and Exercises (Priority: P3)

A user reorganizes their programs by dragging them into a preferred order.
They also reorder exercises within a program and delete programs or exercises
they no longer need, with confirmation dialogs guarding all destructive actions.

**Why this priority**: Reordering and deletion are quality-of-life features.
The app is fully usable without them (P1 and P2 deliver the core loop), but
they are required for a polished, production-ready experience.

**Independent Test**: Create two programs; drag the second to the first
position; verify the new order is persisted after page refresh. Delete an
exercise from a program with confirmation; verify it is removed. Attempt to
delete a program, cancel the confirmation, and verify nothing is deleted.

**Acceptance Scenarios**:

1. **Given** multiple programs are shown, **When** the user drags a program
   card to a new position, **Then** the order updates immediately in the
   grid and is persisted to storage.
2. **Given** a program detail view is open with multiple exercises, **When**
   the user drags an exercise to a new position, **Then** the order updates
   immediately and is persisted.
3. **Given** a program card is shown, **When** the user clicks Delete, **Then**
   a confirmation dialog appears before the program is removed.
4. **Given** the confirmation dialog is shown, **When** the user cancels,
   **Then** no changes are made.
5. **Given** the confirmation dialog is shown, **When** the user confirms,
   **Then** the program (or exercise) is permanently removed from storage.

---

### User Story 4 - Theme Toggle & Global UX Preferences (Priority: P4)

A user switches between dark and light mode. The preference is persisted so
the next visit retains their choice. Text selection is disabled globally
except within form inputs.

**Why this priority**: Theme toggle and global UX preferences are presentation
layer concerns. They add polish but do not affect core workout functionality.

**Independent Test**: Toggle from dark to light mode; refresh the page; verify
the light theme is still active. Attempt to select text on a program card
label; verify selection is disabled. Click into a form input and verify
text selection works normally.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** the user clicks the theme toggle,
   **Then** the UI switches between dark and light mode with a smooth
   transition.
2. **Given** the user has selected a theme, **When** they refresh or return
   later, **Then** the previously selected theme is applied on load.
3. **Given** any non-input element is present, **When** the user attempts
   to select text, **Then** text selection is prevented.
4. **Given** a form input is focused, **When** the user selects text,
   **Then** standard text selection behavior is available.

---

### Edge Cases

- What happens when the user tries to create a program with a name that
  already exists (case-insensitive match)?
  → Inline validation error shown; program not created.
- What happens when an exercise name is duplicated within a program
  (case-insensitive)?
  → Inline validation error shown below the name field; exercise not saved.
- What happens when sets, reps, or rest values fall outside their allowed
  ranges (sets < 1 or > 20, reps < 1 or > 100, rest < 5s or > 300s)?
  → Inline validation error shown below the relevant field.
- What happens when the user starts a workout on a program with no exercises?
  → The Start button is not available (disabled or hidden) for empty programs.
- What happens when the user presses Enter/Space outside of the timer screen?
  → No action triggered; keyboard shortcuts are scoped to the active timer phase.
- What happens when localStorage is cleared between sessions?
  → The app loads in an empty state with no programs — treated as a first-time
  visit; no error is thrown.
- What happens if the user switches tabs during a rest countdown?
  → The timer continues running against wall-clock time. On tab restore,
  the `visibilitychange` event triggers a recalculation; if the rest
  period has already elapsed, the next set begins immediately.
- What happens when the page is refreshed mid-workout?
  → The workout session is not persisted; the user returns to the programs grid.
  (Assumption: session state is in-memory only, not saved to localStorage.)

## Clarifications

### Session 2026-03-21

- Q: Can existing exercises be edited after creation, or must the user delete and re-add? → A: Inline edit — clicking an exercise opens the same inline form pre-filled with current values.
- Q: What does the workout completion screen show? → A: Total elapsed time, a "Workout complete!" message, and a Return to Programs button.
- Q: What is the default theme for a first-time visitor with no saved preference? → A: Match the OS/system preference via `prefers-color-scheme`; fall back to dark if indeterminate.

### Session 2026-03-22

- Q: What is the technology stack for implementation? → A: Vanilla JS + plain CSS — no build step, no framework, no bundler.
- Q: Are there upper bounds on exercise numeric fields (sets, reps, rest)? → A: Yes — sets ≤ 20, reps ≤ 100, rest ≤ 300s.
- Q: How should the rest countdown behave when the browser tab is backgrounded? → A: Timer continues running; on tab restore, elapsed time is recalculated using the Page Visibility API and the countdown jumps to the correct remaining value.
- Q: What does the program detail view show when a program has no exercises yet? → A: An empty state message ("No exercises yet — add your first one.") displayed above the persistent "+" card.
- Q: What is the maximum character length for program and exercise names? → A: 50 characters for both.

### Session 2026-03-22 (post-implementation)

- Q: Should exercise editing be triggered by clicking the row or via an explicit button? → A: An explicit Edit button on each exercise row, revealed on hover. Row click does not trigger edit.
- Q: Should add/edit forms appear inline or as modal popups? → A: Modal dialogs for all forms (program creation, exercise add, exercise edit).
- Q: How should the drag-and-drop insertion position be determined? → A: Based on the dragged element's center point. As soon as the center enters another element's bounding box, the placeholder swaps — no need to cross the target's midpoint.
- Q: Should exercises be draggable over the "+" add button? → A: No. Drag is constrained within the draggable items area only; the "+" card is excluded from the drop zone.
- Q: What should pressing Enter do in the confirmation dialog? → A: The Delete button is focused by default, so Enter confirms deletion. The user can Tab to Cancel and press Enter to cancel instead.

## Requirements *(mandatory)*

### Functional Requirements

**Program Management**

- **FR-001**: The system MUST display all saved programs as cards in a
  responsive grid.
- **FR-002**: Each program card MUST display the program name, number of
  exercises, and estimated workout duration.
- **FR-003**: Estimated duration MUST be calculated as
  Σ(reps × 3s × sets + rest_seconds × sets) per exercise, summed across all
  exercises, rounded up to the nearest minute.
- **FR-004**: Each program card MUST have Edit, Delete, and Start action
  buttons that are hidden by default and revealed on hover.
- **FR-005**: A persistent "+" card MUST always be visible in the grid to
  initiate program creation.
- **FR-006**: Clicking the "+" card MUST open a modal dialog for entering
  the program name.
- **FR-007**: The system MUST create the program on Enter key press or Add
  button click.
- **FR-008**: The system MUST reject empty program names with an inline error.
  Program names MUST NOT exceed 50 characters; the input MUST enforce this
  limit (e.g., `maxlength` attribute or equivalent).
- **FR-009**: The system MUST reject duplicate program names (case-insensitive
  comparison) with an inline error.
- **FR-010**: Programs MUST be reorderable via drag-and-drop; order changes
  MUST be persisted to storage immediately on drop. The dragged element MUST
  be constrained within the program grid area. Insertion position MUST be
  determined by the dragged element's center point: as soon as the center
  enters another card's bounding box, the placeholder swaps to that position
  (no need to cross the midpoint).
- **FR-011**: Deleting a program MUST require a confirmation dialog before
  the data is removed. The confirmation dialog MUST focus the Delete button
  by default so that pressing Enter confirms deletion. The user MAY press
  Tab to move focus to Cancel, then press Enter to cancel instead.

**Exercise Management**

- **FR-012**: The program detail view MUST list all exercises for that program.
  When no exercises exist yet, the list area MUST display an empty state
  message ("No exercises yet — add your first one.") above the "+" card.
- **FR-013**: A "+" card at the end of the exercise list MUST open a modal
  dialog with form fields: name, sets (default 3), reps (default 10), rest
  in seconds (default 30).
- **FR-014**: The system MUST validate exercise inputs: name non-empty, name
  ≤ 50 characters, name unique within the program (case-insensitive),
  sets ≥ 1 and ≤ 20, reps ≥ 1 and ≤ 100, rest ≥ 5s and ≤ 300s.
- **FR-015**: Validation errors MUST be shown inline, directly below the
  relevant field.
- **FR-016**: Exercises MUST be reorderable via drag-and-drop; order changes
  MUST be persisted immediately on drop. Dragging MUST be constrained within
  the exercise list area only (the "+" add card MUST NOT be part of the
  draggable zone). Insertion position MUST be determined by the dragged
  element's center point entering another element's bounding box.
- **FR-017**: Deleting an exercise MUST require a confirmation dialog. The
  same focus behavior as FR-011 applies (Delete button focused by default).
- **FR-017b**: Each exercise row MUST have an explicit Edit button (revealed
  on hover). Clicking the Edit button MUST open a modal dialog pre-filled
  with the exercise's current name, sets, reps, and rest values. The same
  validation rules as Add apply. Saving MUST update the exercise in place;
  cancelling MUST leave the exercise unchanged.

**Workout Execution**

- **FR-018**: The Start button MUST only be available for programs that have
  at least one exercise.
- **FR-019**: The timer screen MUST display: current exercise name, current
  set number and total sets, list of upcoming exercises with remaining sets,
  Complete Set button, and Stop Workout button.
- **FR-020**: Pressing Enter or Space MUST trigger Complete Set during the
  active set phase.
- **FR-021**: After completing a set when more sets remain for the current
  exercise, a rest countdown MUST start automatically.
- **FR-022**: During the rest phase the screen MUST display the remaining
  countdown and an End Rest button. The countdown MUST use wall-clock time
  as its source of truth: when the tab is restored from a background state,
  the remaining time MUST be recalculated using the `Page Visibility API`
  (`visibilitychange` event + `Date.now()` delta) so the displayed value
  is accurate regardless of browser timer throttling.
- **FR-023**: Pressing Enter or Space during the rest phase MUST trigger
  End Rest.
- **FR-024**: On rest completion (timer reaches 0 or user skips), the next
  set MUST begin.
- **FR-025**: When all sets for an exercise are complete, the workout MUST
  advance to the next exercise automatically.
- **FR-026**: The upcoming exercises list MUST update in real time, always
  reflecting current progress.
- **FR-027**: When all exercises and sets are finished, the system MUST show
  a workout completion screen displaying: total elapsed workout time, a
  "Workout complete!" message, and a Return to Programs button that navigates
  back to the programs grid.
- **FR-028**: Stop Workout MUST end the session and return the user to the
  programs grid.

**Global UX**

- **FR-029**: The user MUST be able to toggle between dark and light themes.
- **FR-030**: The selected theme preference MUST be persisted and restored on
  the next visit. On first load with no saved preference, the theme MUST
  default to the OS/system preference (`prefers-color-scheme`), falling back
  to dark mode if the system preference is indeterminate.
- **FR-031**: Text selection MUST be disabled globally, except within form
  input elements.
- **FR-032**: All data MUST be stored exclusively in the browser's local
  storage — no network requests, no backend, no accounts required.

### Key Entities

- **Program**: A named collection of exercises created by the user. Attributes:
  unique name, ordered list of exercises, creation/display order.
- **Exercise**: A named movement within a program. Attributes: name (unique
  within program), sets count, reps count, rest duration in seconds.
- **Workout Session**: Transient runtime state during execution (not persisted).
  Attributes: current exercise index, current set number, rest/active phase
  flag, countdown timer value.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a new program with at least one exercise and
  start a workout in under 60 seconds from a blank state.
- **SC-002**: All data (programs, exercises, ordering, theme preference) is
  fully preserved after a browser refresh with no loss.
- **SC-003**: A user can complete a full workout (start → all sets and rests →
  completion screen) without any manual navigation or page reloads.
- **SC-004**: All destructive actions (delete program, delete exercise) require
  exactly one confirmation step before data is removed.
- **SC-005**: The app is fully usable via keyboard alone during the workout
  execution phase (Enter/Space advance through sets and rests).
- **SC-006**: All validated form errors are visible without scrolling,
  appearing inline adjacent to the offending field.
- **SC-007**: The estimated duration shown on a program card matches the
  defined formula output for any combination of exercises, sets, reps,
  and rest values.

## Assumptions

- The implementation MUST use vanilla JavaScript and plain CSS with no framework, no build tool, and no bundler. The deliverable is a single directory of static files (HTML, CSS, JS) openable directly in a browser.
- Workout session state (current exercise, set, timer) is held in memory only
  and is intentionally lost on page refresh. Persisting mid-session state is
  out of scope.
- There is no upper bound enforced on the number of programs or exercises
  beyond browser storage limits.
- The "no rest between exercises" vs. "rest from last set carries over" behavior
  mentioned in the description is treated as: no inter-exercise rest — the
  workout advances directly to the next exercise after the last set of the
  current one.
- The Start button is hidden or disabled (not shown as active) for programs
  with zero exercises; no separate empty-state message is required for this
  case unless the design calls for one.
- Edit and Delete action buttons on program cards apply to the program itself.
  The Edit button navigates to the program detail view where exercises are
  managed.
