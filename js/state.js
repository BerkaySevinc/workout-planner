// state.js — in-memory app state and mutation functions

import { loadPrograms } from './storage.js';

export var programs = [];
export var currentProgram = null;

export function loadState() {
  const loaded = loadPrograms();
  programs.length = 0;
  programs.push(...loaded);
}

export function setCurrentProgram(id) {
  currentProgram = programs.find(function (p) { return p.id === id; }) || null;
}

export function addProgram(name) {
  const program = { id: crypto.randomUUID(), name: name.trim(), exercises: [] };
  programs.push(program);
  return program;
}

export function updateProgramName(id, name) {
  const program = programs.find(function (p) { return p.id === id; });
  if (program) program.name = name.trim();
}

export function deleteProgram(id) {
  const idx = programs.findIndex(function (p) { return p.id === id; });
  if (idx !== -1) programs.splice(idx, 1);
  if (currentProgram && currentProgram.id === id) currentProgram = null;
}

export function addExercise(programId, fields) {
  const program = programs.find(function (p) { return p.id === programId; });
  if (!program) return null;
  const exercise = {
    id: crypto.randomUUID(),
    name: fields.name.trim(),
    sets: Number(fields.sets),
    reps: Number(fields.reps),
    restSeconds: Number(fields.restSeconds),
  };
  program.exercises.push(exercise);
  if (currentProgram && currentProgram.id === programId) currentProgram = program;
  return exercise;
}

export function updateExercise(programId, exerciseId, fields) {
  const program = programs.find(function (p) { return p.id === programId; });
  if (!program) return;
  const exercise = program.exercises.find(function (e) { return e.id === exerciseId; });
  if (!exercise) return;
  exercise.name = fields.name.trim();
  exercise.sets = Number(fields.sets);
  exercise.reps = Number(fields.reps);
  exercise.restSeconds = Number(fields.restSeconds);
}

export function deleteExercise(programId, exerciseId) {
  const program = programs.find(function (p) { return p.id === programId; });
  if (!program) return;
  const idx = program.exercises.findIndex(function (e) { return e.id === exerciseId; });
  if (idx !== -1) program.exercises.splice(idx, 1);
}

export function reorderPrograms(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;
  const item = programs.splice(fromIndex, 1)[0];
  programs.splice(toIndex, 0, item);
}

export function reorderExercises(programId, fromIndex, toIndex) {
  if (fromIndex === toIndex) return;
  const program = programs.find(function (p) { return p.id === programId; });
  if (!program) return;
  const item = program.exercises.splice(fromIndex, 1)[0];
  program.exercises.splice(toIndex, 0, item);
}
