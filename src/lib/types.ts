export interface Exercise {
  name: string;
  sets: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface SetData {
  exercise: string;
  set: number;
  weight: number | null;
  reps: number | null;
}

export interface LastSetData {
  set: number;
  weight: number;
  reps: number;
}

export interface LastSetsResponse {
  exercise: string;
  date: string;
  sets: LastSetData[];
}
