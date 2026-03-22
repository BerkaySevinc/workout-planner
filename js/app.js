import * as state from './state.js';
import * as storage from './storage.js';
import { render as renderProgramsGrid } from './views/programs-grid.js';
import { render as renderProgramDetail } from './views/program-detail.js';

export function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.add('active');

  if (name === 'programs-grid') renderProgramsGrid();
  if (name === 'program-detail') renderProgramDetail();
}

function applyThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  storage.saveTheme(next);
  applyThemeIcon(next);
}

// Listen for navigation events dispatched by views (avoids circular imports)
document.addEventListener('navigate', e => showView(e.detail));

// Module scripts are deferred — DOM is ready when this runs, no DOMContentLoaded needed
console.log('[WPT] app.js loaded, initializing...');
state.loadState();
console.log('[WPT] state loaded, programs:', state.programs.length);

const themeBtn = document.getElementById('theme-toggle');
const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
applyThemeIcon(activeTheme);
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

console.log('[WPT] calling showView...');
showView('programs-grid');
console.log('[WPT] showView done');
