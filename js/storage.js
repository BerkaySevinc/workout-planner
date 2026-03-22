// storage.js — localStorage read/write

const PROGRAMS_KEY = 'wpt_programs';
const THEME_KEY = 'wpt_theme';

export function loadPrograms() {
  try {
    const raw = localStorage.getItem(PROGRAMS_KEY);
    if (!raw) return [];
    const programs = JSON.parse(raw);
    if (!Array.isArray(programs)) return [];

    let dirty = false;
    for (const program of programs) {
      if (!program.id) { program.id = crypto.randomUUID(); dirty = true; }
      if (!Array.isArray(program.exercises)) { program.exercises = []; dirty = true; }
      for (const ex of program.exercises) {
        if (!ex.id) { ex.id = crypto.randomUUID(); dirty = true; }
      }
    }
    if (dirty) savePrograms(programs);
    return programs;
  } catch {
    return [];
  }
}

export function savePrograms(progs) {
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(progs));
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY);
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
