import { Routine } from "./types";

const STORAGE_KEY = "routines";

export function getRoutines(): Routine[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getRoutine(id: string): Routine | undefined {
  return getRoutines().find((r) => r.id === id);
}

export function saveRoutine(routine: Routine): void {
  const routines = getRoutines();
  const idx = routines.findIndex((r) => r.id === routine.id);
  if (idx >= 0) {
    routines[idx] = routine;
  } else {
    routines.push(routine);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

export function deleteRoutine(id: string): void {
  const routines = getRoutines().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}
