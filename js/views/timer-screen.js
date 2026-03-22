import { CountdownTimer } from '../timer.js';

let _session = null;
let _timer = null;
let _keyHandler = null;

function navigate(viewName) {
  document.dispatchEvent(new CustomEvent('navigate', { detail: viewName }));
}

function _removeKeyHandler() {
  if (_keyHandler) {
    document.removeEventListener('keydown', _keyHandler);
    _keyHandler = null;
  }
}

function _addKeyHandler(fn) {
  _removeKeyHandler();
  _keyHandler = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
  document.addEventListener('keydown', _keyHandler);
}

function _formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function init(program) {
  if (_timer) { _timer.destroy(); _timer = null; }
  _removeKeyHandler();

  _session = {
    program: structuredClone(program),
    currentExerciseIndex: 0,
    currentSetNumber: 1,
    phase: 'active',
    sessionStartTime: Date.now(),
  };

  _renderActivePhase();
}

function _container() {
  return document.getElementById('view-timer-screen');
}

function _currentExercise() {
  return _session.program.exercises[_session.currentExerciseIndex];
}

function _renderActivePhase() {
  _session.phase = 'active';
  const exercise = _currentExercise();
  const { currentSetNumber } = _session;

  const container = _container();
  if (!container) return;
  container.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'timer-screen';
  screen.innerHTML = `
    <div class="timer-top-bar">
      <button class="btn-stop js-stop">Stop Workout</button>
    </div>

    <div>
      <div class="timer-exercise-name">${_esc(exercise.name)}</div>
      <div class="timer-set-progress">Set ${currentSetNumber} of ${exercise.sets}</div>
    </div>

    <div class="timer-phase">
      <span class="timer-phase-label">Active Set</span>
      <button class="timer-phase-btn timer-phase-btn--complete js-complete">
        ✓ Complete Set
      </button>
      <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary)">or press Enter / Space</span>
    </div>

    <div class="timer-upcoming">
      <h3>Up Next</h3>
      <div class="timer-upcoming-list">${_buildUpcomingHTML()}</div>
    </div>
  `;

  container.appendChild(screen);

  screen.querySelector('.js-stop').addEventListener('click', _handleStop);
  screen.querySelector('.js-complete').addEventListener('click', _handleCompleteSet);
  _addKeyHandler(_handleCompleteSet);
}

function _renderRestPhase(seconds) {
  _session.phase = 'rest';
  const exercise = _currentExercise();

  const container = _container();
  if (!container) return;
  container.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'timer-screen';
  screen.innerHTML = `
    <div class="timer-top-bar">
      <button class="btn-stop js-stop">Stop Workout</button>
    </div>

    <div>
      <div class="timer-exercise-name">${_esc(exercise.name)}</div>
      <div class="timer-set-progress">Rest — Set ${_session.currentSetNumber} of ${exercise.sets} next</div>
    </div>

    <div class="timer-phase">
      <span class="timer-phase-label">Rest</span>
      <div class="timer-countdown js-countdown">${seconds}</div>
      <button class="timer-phase-btn timer-phase-btn--end-rest js-end-rest">
        End Rest
      </button>
      <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary)">or press Enter / Space</span>
    </div>

    <div class="timer-upcoming">
      <h3>Up Next</h3>
      <div class="timer-upcoming-list">${_buildUpcomingHTML()}</div>
    </div>
  `;

  container.appendChild(screen);

  screen.querySelector('.js-stop').addEventListener('click', _handleStop);
  screen.querySelector('.js-end-rest').addEventListener('click', _handleEndRest);
  _addKeyHandler(_handleEndRest);
}

function _updateCountdown(seconds) {
  const el = document.querySelector('.js-countdown');
  if (el) el.textContent = seconds;
}

function _handleCompleteSet() {
  const exercise = _currentExercise();
  if (_session.currentSetNumber < exercise.sets) {
    _session.currentSetNumber++;
    // Render the rest phase UI first, then start the timer
    _renderRestPhase(exercise.restSeconds);
    _timer = new CountdownTimer(
      exercise.restSeconds,
      s => _updateCountdown(s),
      () => { _timer = null; _advanceSet(); }
    );
    _timer.start();
  } else {
    _advanceExercise();
  }
}

function _handleEndRest() {
  if (_timer) { _timer.destroy(); _timer = null; }
  _advanceSet();
}

function _advanceSet() {
  _renderActivePhase();
}

function _advanceExercise() {
  _session.currentExerciseIndex++;
  if (_session.currentExerciseIndex < _session.program.exercises.length) {
    _session.currentSetNumber = 1;
    _renderActivePhase();
  } else {
    _renderCompletion();
  }
}

function _renderCompletion() {
  _removeKeyHandler();
  if (_timer) { _timer.destroy(); _timer = null; }

  const elapsed = Date.now() - _session.sessionStartTime;
  const container = _container();
  if (!container) return;
  container.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'completion-screen';
  screen.innerHTML = `
    <div class="completion-emoji">🎉</div>
    <h2 class="completion-title">Workout complete!</h2>
    <p class="completion-time">Elapsed time: <strong>${_formatElapsed(elapsed)}</strong></p>
    <button class="btn-primary js-return" style="padding: var(--space-3) var(--space-7)">Return to Programs</button>
  `;
  container.appendChild(screen);

  screen.querySelector('.js-return').addEventListener('click', () => navigate('programs-grid'));
}

function _handleStop() {
  if (_timer) { _timer.destroy(); _timer = null; }
  _removeKeyHandler();
  navigate('programs-grid');
}

function _buildUpcomingHTML() {
  const { program, currentExerciseIndex, currentSetNumber } = _session;
  const items = [];

  const current = program.exercises[currentExerciseIndex];
  const remainingSets = current.sets - currentSetNumber;
  if (remainingSets > 0) {
    items.push(`<div class="timer-upcoming-item">
      <span>${_esc(current.name)}</span>
      <span>${remainingSets} set${remainingSets !== 1 ? 's' : ''} left</span>
    </div>`);
  }

  for (let i = currentExerciseIndex + 1; i < program.exercises.length; i++) {
    const ex = program.exercises[i];
    items.push(`<div class="timer-upcoming-item">
      <span>${_esc(ex.name)}</span>
      <span>${ex.sets} set${ex.sets !== 1 ? 's' : ''}</span>
    </div>`);
  }

  return items.length
    ? items.join('')
    : '<p style="color: var(--color-text-secondary); font-size: var(--font-size-sm)">This is the last set!</p>';
}

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
