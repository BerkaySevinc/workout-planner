import * as state from '../state.js';
import * as storage from '../storage.js';
import { InlineForm } from '../components/inline-form.js';
import { ConfirmationModal } from '../components/confirmation-modal.js';
import { makeSortable } from '../dnd.js';

let _dndDestroy = null;

const EXERCISE_FIELD_DEFS = [
  { name: 'name', label: 'Exercise name', type: 'text', defaultValue: '', maxLength: 50 },
  { name: 'sets', label: 'Sets', type: 'number', defaultValue: 3, min: 1, max: 20 },
  { name: 'reps', label: 'Reps', type: 'number', defaultValue: 10, min: 1, max: 100 },
  { name: 'restSeconds', label: 'Rest (s)', type: 'number', defaultValue: 30, min: 5, max: 300 },
];

function navigate(viewName) {
  document.dispatchEvent(new CustomEvent('navigate', { detail: viewName }));
}

function validateExercise(values, excludeId = null) {
  const errors = {};
  const name = (values.name || '').trim();
  if (!name) errors.name = 'Exercise name is required.';
  else if (name.length > 50) errors.name = 'Name must be 50 characters or fewer.';
  else {
    const dup = state.currentProgram?.exercises.find(
      e => e.name.toLowerCase() === name.toLowerCase() && e.id !== excludeId
    );
    if (dup) errors.name = 'An exercise with this name already exists.';
  }

  const sets = Number(values.sets);
  if (!Number.isInteger(sets) || sets < 1 || sets > 20) errors.sets = 'Sets must be 1–20.';

  const reps = Number(values.reps);
  if (!Number.isInteger(reps) || reps < 1 || reps > 100) errors.reps = 'Reps must be 1–100.';

  const rest = Number(values.restSeconds);
  if (!Number.isInteger(rest) || rest < 5 || rest > 300) errors.restSeconds = 'Rest must be 5–300 s.';

  return Object.keys(errors).length ? errors : null;
}

export function init() {}

export function render() {
  if (_dndDestroy) { _dndDestroy(); _dndDestroy = null; }

  const container = document.getElementById('view-program-detail');
  if (!container) return;
  container.innerHTML = '';

  const program = state.currentProgram;
  if (!program) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'program-detail-container';

  const header = document.createElement('div');
  header.className = 'program-detail-header';
  header.innerHTML = `
    <button class="back-btn js-back" aria-label="Back to programs">←</button>
    <h2>${_esc(program.name)}</h2>
  `;
  header.querySelector('.js-back').addEventListener('click', () => navigate('programs-grid'));

  const listEl = document.createElement('div');
  listEl.className = 'exercise-list';

  if (program.exercises.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No exercises yet — add your first one.';
    listEl.appendChild(empty);
  } else {
    program.exercises.forEach(exercise => {
      const row = _buildExerciseRow(program, exercise, listEl);
      listEl.appendChild(row);
    });
  }

  const addCard = _buildAddCard(program, listEl);
  listEl.appendChild(addCard);

  wrapper.appendChild(header);
  wrapper.appendChild(listEl);
  container.appendChild(wrapper);

  _dndDestroy = makeSortable(listEl, (fromIndex, toIndex) => {
    state.reorderExercises(program.id, fromIndex, toIndex);
    storage.savePrograms(state.programs);
    render();
  });
}

function _buildExerciseRow(program, exercise, listEl) {
  const row = document.createElement('div');
  row.className = 'exercise-row';
  row.dataset.draggable = 'true';
  row.dataset.id = exercise.id;

  row.innerHTML = `
    <span class="exercise-row__drag-handle" aria-hidden="true">⠿</span>
    <span class="exercise-row__name">${_esc(exercise.name)}</span>
    <span class="exercise-row__stats">${exercise.sets}×${exercise.reps} · ${exercise.restSeconds}s rest</span>
    <button class="exercise-row__delete js-delete" aria-label="Delete ${_esc(exercise.name)}">✕</button>
  `;

  row.addEventListener('click', e => {
    if (e.target.classList.contains('js-delete')) return;
    _openEditForm(program, exercise, row, listEl);
  });

  row.querySelector('.js-delete').addEventListener('click', async e => {
    e.stopPropagation();
    const confirmed = await ConfirmationModal.show(`Delete "${exercise.name}"?`);
    if (!confirmed) return;
    state.deleteExercise(program.id, exercise.id);
    storage.savePrograms(state.programs);
    render();
  });

  return row;
}

function _openEditForm(program, exercise, row, listEl) {
  row.style.display = 'none';

  const formWrapper = document.createElement('div');
  row.parentNode.insertBefore(formWrapper, row);

  const form = new InlineForm(
    formWrapper,
    EXERCISE_FIELD_DEFS,
    {
      onSubmit: values => {
        const errors = validateExercise(values, exercise.id);
        if (errors) { form.setErrors(errors); return; }
        state.updateExercise(program.id, exercise.id, values);
        storage.savePrograms(state.programs);
        render();
      },
      onCancel: () => {
        form.destroy();
        formWrapper.remove();
        row.style.display = '';
      },
    }
  );
  form.render();
  form.setValues({
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    restSeconds: exercise.restSeconds,
  });
}

function _buildAddCard(program, listEl) {
  const addCard = document.createElement('div');
  addCard.className = 'card card--add';
  addCard.setAttribute('tabindex', '0');
  addCard.setAttribute('role', 'button');
  addCard.setAttribute('aria-label', 'Add exercise');
  addCard.innerHTML = `
    <span class="add-icon">＋</span>
    <span class="add-label">Add Exercise</span>
  `;

  const openForm = () => {
    addCard.style.display = 'none';

    const formWrapper = document.createElement('div');
    listEl.appendChild(formWrapper);

    const form = new InlineForm(
      formWrapper,
      EXERCISE_FIELD_DEFS,
      {
        onSubmit: values => {
          const errors = validateExercise(values);
          if (errors) { form.setErrors(errors); return; }
          state.addExercise(program.id, values);
          storage.savePrograms(state.programs);
          render();
        },
        onCancel: () => {
          form.destroy();
          formWrapper.remove();
          addCard.style.display = '';
        },
      }
    );
    form.render();
  };

  addCard.addEventListener('click', openForm);
  addCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openForm(); }
  });

  return addCard;
}

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
