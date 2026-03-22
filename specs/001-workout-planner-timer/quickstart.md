# Quickstart: Workout Planner & Timer

**Branch**: `001-workout-planner-timer` | **Date**: 2026-03-22

---

## Prerequisites

- A modern browser: Chrome 105+, Firefox 105+, Safari 16+, or Edge 105+.
- No build step, no npm, no server required.

---

## Running the App

Open `index.html` directly in your browser:

```bash
# Option A — double-click
# Open index.html from your file manager.

# Option B — file:// URL
# Drag index.html into a browser window, or:
open index.html            # macOS
start index.html           # Windows
xdg-open index.html        # Linux
```

> **ES modules over `file://`**: All target browsers support native ES modules
> via `file://`. No local server is needed. If you encounter a CORS error
> (rare, typically only with older browser versions), serve with any static
> server: `python3 -m http.server 8080` then open `http://localhost:8080`.

---

## First Use

1. The programs grid is empty on first load.
2. Click the **+** card to create your first program — type a name, press Enter.
3. Click **Edit** on the program card to open the program detail view.
4. Click the **+** card at the bottom of the exercise list to add exercises.
5. Return to the programs grid and click **Start** to begin a workout.

---

## File Structure

```text
/
├── index.html                    # Open this in your browser
├── css/
│   ├── variables.css
│   ├── reset.css
│   ├── base.css
│   ├── themes.css
│   ├── layout.css
│   └── components/
│       ├── card.css
│       ├── forms.css
│       ├── modal.css
│       ├── timer.css
│       └── animations.css
└── js/
    ├── app.js
    ├── storage.js
    ├── state.js
    ├── timer.js
    ├── dnd.js
    ├── views/
    │   ├── programs-grid.js
    │   ├── program-detail.js
    │   └── timer-screen.js
    └── components/
        ├── confirmation-modal.js
        └── inline-form.js
```

---

## Data & Storage

- All data is stored in `localStorage` under keys `wpt_programs` and `wpt_theme`.
- To reset the app to a blank state: open browser DevTools → Application →
  Local Storage → delete both keys, then refresh.
- Data persists indefinitely across browser sessions until manually cleared.

---

## Keyboard Shortcuts (Workout Screen Only)

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Complete Set (during active phase) |
| `Enter` or `Space` | End Rest (during rest phase) |
