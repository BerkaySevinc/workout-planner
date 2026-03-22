import * as state from '../state.js';
import * as storage from '../storage.js';
import { InlineForm } from '../components/inline-form.js';
import { ConfirmationModal } from '../components/confirmation-modal.js';
import { makeSortable } from '../dnd.js';

let _dndDestroy = null;

function navigate(viewName) {
  document.dispatchEvent(new CustomEvent('navigate', { detail: viewName }));
}

function calcDuration(exercises) {
  if (!exercises.length) return 0;
  const totalSeconds = exercises.reduce(
    (sum, ex) => sum + ex.reps * 3 * ex.sets + ex.restSeconds * ex.sets,
    0
  );
  return Math.ceil(totalSeconds / 60);
}

function validateProgramName(name, excludeId = null) {
  const trimmed = name.trim();
  if (!trimmed) return 'Program name is required.';
  if (trimmed.length > 50) return 'Name must be 50 characters or fewer.';
  const duplicate = state.programs.find(
    p => p.name.toLowerCase() === trimmed.toLowerCase() && p.id !== excludeId
  );
  if (duplicate) return 'A program with this name already exists.';
  return null;
}

export function init() {}

export function render() {
  if (_dndDestroy) { _dndDestroy(); _dndDestroy = null; }

  const container = document.getElementById('view-programs-grid');
  if (!container) return;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'programs-grid-container';

  const grid = document.createElement('div');
  grid.className = 'programs-grid';

  state.programs.forEach(program => {
    const card = _buildProgramCard(program);
    grid.appendChild(card);
  });

  const addCard = _buildAddCard(grid);
  grid.appendChild(addCard);

  wrapper.appendChild(grid);
  container.appendChild(wrapper);

  // Center cards when they all fit in a single row
  const cards = grid.querySelectorAll('.card');
  if (cards.length > 0) {
    const firstTop = cards[0].getBoundingClientRect().top;
    const singleRow = Array.from(cards).every(
      c => Math.abs(c.getBoundingClientRect().top - firstTop) < 5
    );
    grid.classList.toggle('programs-grid--single-row', singleRow);
  }

  _dndDestroy = makeSortable(grid, (fromIndex, toIndex) => {
    state.reorderPrograms(fromIndex, toIndex);
    storage.savePrograms(state.programs);
    render();
  });
}

function _buildProgramCard(program) {
  const card = document.createElement('div');
  card.className = 'card program-card';
  card.dataset.draggable = 'true';
  card.dataset.id = program.id;

  const duration = calcDuration(program.exercises);
  const count = program.exercises.length;

  card.innerHTML = `
    <h3 class="program-card__name">${_esc(program.name)}</h3>
    <div class="program-card__meta">
      <span>📋 ${count} exercise${count !== 1 ? 's' : ''}</span>
      <span>⏱ ${duration} min</span>
    </div>
    <div class="card-actions">
      <button class="btn-action btn-action--edit js-edit" aria-label="Edit ${_esc(program.name)}">Edit</button>
      <button class="btn-action btn-action--delete js-delete" aria-label="Delete ${_esc(program.name)}">Delete</button>
      <button class="btn-action btn-action--start js-start" ${count === 0 ? 'disabled' : ''} aria-label="Start ${_esc(program.name)}">▶ Start</button>
    </div>
  `;

  card.querySelector('.js-edit').addEventListener('click', e => {
    e.stopPropagation();
    state.setCurrentProgram(program.id);
    navigate('program-detail');
  });

  card.querySelector('.js-delete').addEventListener('click', async e => {
    e.stopPropagation();
    const confirmed = await ConfirmationModal.show(`Delete "${program.name}"? This cannot be undone.`);
    if (!confirmed) return;
    state.deleteProgram(program.id);
    storage.savePrograms(state.programs);
    render();
  });

  card.querySelector('.js-start').addEventListener('click', async e => {
    e.stopPropagation();
    if (program.exercises.length === 0) return;
    const { init: initTimer } = await import('./timer-screen.js');
    initTimer(program);
    navigate('timer-screen');
  });

  return card;
}

function _buildAddCard(grid) {
  const addCard = document.createElement('div');
  addCard.className = 'card card--add';
  addCard.setAttribute('tabindex', '0');
  addCard.setAttribute('role', 'button');
  addCard.setAttribute('aria-label', 'Create new program');
  addCard.innerHTML = `
    <span class="add-icon">＋</span>
    <span class="add-label">New Program</span>
  `;

  const openForm = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.textContent = 'New Program';
    dialog.appendChild(title);

    const formContainer = document.createElement('div');
    dialog.appendChild(formContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const form = new InlineForm(
      formContainer,
      [{ name: 'name', label: 'Program name', type: 'text', defaultValue: '', maxLength: 50 }],
      {
        onSubmit: values => {
          const error = validateProgramName(values.name);
          if (error) { form.setErrors({ name: error }); return; }
          form.destroy();
          overlay.remove();
          state.addProgram(values.name);
          storage.savePrograms(state.programs);
          render();
        },
        onCancel: () => {
          form.destroy();
          overlay.remove();
        },
      }
    );
    form.render();

    overlay.addEventListener('click', e => {
      if (e.target === overlay) { form.destroy(); overlay.remove(); }
    });
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
