# Data Model: Workout Planner & Timer

**Branch**: `001-workout-planner-timer` | **Date**: 2026-03-22

---

## Storage Overview

All persistent data lives in two `localStorage` keys:

| Key | Value Type | Purpose |
|-----|-----------|---------|
| `wpt_programs` | `JSON → Program[]` | Ordered array of all programs; array index = display order |
| `wpt_theme` | `'dark' \| 'light'` | User's active theme preference |

The workout session is **never persisted** — it is held in JS module-level
variables only and is lost on page refresh.

---

## Entities

### Program

Stored as elements of the `wpt_programs` array. Array order defines display order.

```js
{
  id:        string,    // crypto.randomUUID() — stable identity key
  name:      string,    // 1–50 chars; unique across all programs (case-insensitive)
  exercises: Exercise[] // Ordered array; array index = display order within program
}
```

**Constraints**:
- `name`: non-empty, ≤ 50 characters, unique case-insensitively across all programs.
- `exercises`: may be empty (program with no exercises is valid; Start button disabled).
- Array position in `wpt_programs` is the authoritative display order. No separate
  `order` field is stored.

**Lifecycle**:
```
[Created via inline form] → Saved to localStorage
        ↓
[Edited: name change or exercise mutations] → Updated in-place, re-saved
        ↓
[Deleted via confirmation dialog] → Removed from array, re-saved
        ↓
[Reordered via DnD] → Array spliced, re-saved immediately on drop
```

---

### Exercise

Stored as elements of `Program.exercises`. Array order defines display order.

```js
{
  id:          string,  // crypto.randomUUID()
  name:        string,  // 1–50 chars; unique within parent program (case-insensitive)
  sets:        number,  // integer, 1–20
  reps:        number,  // integer, 1–100
  restSeconds: number   // integer, 5–300 (seconds)
}
```

**Constraints**:
- `name`: non-empty, ≤ 50 characters, unique case-insensitively within its program.
- `sets`: integer in range [1, 20].
- `reps`: integer in range [1, 100].
- `restSeconds`: integer in range [5, 300].
- Array position in `Program.exercises` is the authoritative display order.

**Lifecycle**:
```
[Created via inline form on program detail view] → Appended to exercises[], re-saved
        ↓
[Edited: click row → inline form pre-filled] → Updated in-place, re-saved
        ↓
[Deleted via confirmation dialog] → Removed from array, re-saved
        ↓
[Reordered via DnD] → Array spliced, re-saved immediately on drop
```

---

### WorkoutSession (in-memory only — never persisted)

Held in a module-level object in `timer-screen.js`. Lost on page refresh.

```js
{
  program:              Program,   // Deep copy of the program at session start
  currentExerciseIndex: number,    // 0-based index into program.exercises
  currentSetNumber:     number,    // 1-based (1 = first set of current exercise)
  phase:                'active' | 'rest',
  restEndTime:          number | null, // Date.now() + restMs; null during active phase
  sessionStartTime:     number     // Date.now() at session start; used for elapsed time on completion screen
}
```

**State machine**:

```
          START SESSION
               │
               ▼
        ┌─────────────┐
        │   active    │◄──────────────────────────────┐
        │  (set N of M│                               │
        │   exercise) │                               │
        └──────┬──────┘                               │
               │ Complete Set                         │
               │                                      │
       ┌───────┴─────────────────────────┐            │
       │ more sets remain?               │            │
       │ YES → start rest                │            │
       │ NO  → advance exercise          │            │
       └──┬──────────────────────────────┘            │
          │                                           │
          ▼                                           │
   ┌─────────────┐                                    │
   │    rest     │    timer=0 OR End Rest             │
   │ (countdown) │ ──────────────────────────────────►│
   └─────────────┘                                    │
                                                      │
                             (if no more exercises)   │
                                         │            │
                                         ▼            │
                                  ┌────────────┐      │
                                  │ completion │      │
                                  │  screen    │      │
                                  └────────────┘      │
                                                      │
                     Stop Workout (any phase) ────────►  programs grid
```

---

## Derived Values (computed on read — never stored)

| Value | Formula | Where Used |
|-------|---------|------------|
| Estimated duration (minutes) | `ceil( Σ (reps × 3s × sets + restSeconds × sets) / 60 )` per exercise, summed across all exercises | Program card |
| Exercise count | `program.exercises.length` | Program card |
| Elapsed workout time | `Date.now() - session.sessionStartTime` | Completion screen |
| Remaining rest seconds | `ceil( (session.restEndTime - Date.now()) / 1000 )` | Timer screen countdown |

---

## localStorage Read/Write Contract

All reads and writes go through `storage.js`. The module exposes:

```js
// Returns parsed Program[] or [] if key absent / parse error
function loadPrograms(): Program[]

// Serializes and writes entire programs array atomically
function savePrograms(programs: Program[]): void

// Returns 'dark' | 'light' | null (null = no preference saved)
function loadTheme(): string | null

// Writes theme preference
function saveTheme(theme: 'dark' | 'light'): void
```

On `loadPrograms()`, if a stored program is missing any expected field (forward
compatibility), defaults are applied:
- Missing `exercises` → `[]`
- Missing `id` → `crypto.randomUUID()` (backfilled and re-saved)

---

## Example Stored State

```json
// localStorage key: wpt_programs
[
  {
    "id": "a1b2c3d4-...",
    "name": "Push Day",
    "exercises": [
      {
        "id": "e1f2...",
        "name": "Push-Up",
        "sets": 3,
        "reps": 10,
        "restSeconds": 30
      },
      {
        "id": "e3f4...",
        "name": "Dip",
        "sets": 4,
        "reps": 8,
        "restSeconds": 45
      }
    ]
  }
]

// localStorage key: wpt_theme
"dark"
```
