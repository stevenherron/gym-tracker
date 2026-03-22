"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Exercise, Routine } from "@/lib/types";
import { saveRoutine } from "@/lib/routines";

export default function NewRoutine() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);

  const addExercise = () => {
    if (!newExName.trim()) return;
    setExercises([...exercises, { name: newExName.trim(), sets: newExSets }]);
    setNewExName("");
    setNewExSets(3);
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const moveExercise = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    const updated = [...exercises];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setExercises(updated);
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    const routine: Routine = {
      id: crypto.randomUUID(),
      name: name.trim(),
      exercises,
    };
    saveRoutine(routine);
    router.push("/");
  };

  return (
    <div>
      <button
        onClick={() => router.push("/")}
        className="text-neutral-400 hover:text-white mb-4 text-sm"
      >
        &larr; Zurück
      </button>

      <h1 className="text-2xl font-bold mb-6">Neue Routine</h1>

      <div className="mb-6">
        <label className="block text-sm text-neutral-400 mb-1">
          Name der Routine
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Chest and Back"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {exercises.length > 0 && (
        <div className="mb-6 space-y-2">
          <h2 className="text-sm text-neutral-400 mb-2">Übungen</h2>
          {exercises.map((ex, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveExercise(idx, -1)}
                  className="text-neutral-500 hover:text-white text-xs leading-none"
                  disabled={idx === 0}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveExercise(idx, 1)}
                  className="text-neutral-500 hover:text-white text-xs leading-none"
                  disabled={idx === exercises.length - 1}
                >
                  ▼
                </button>
              </div>
              <span className="flex-1 text-sm">{ex.name}</span>
              <span className="text-neutral-400 text-sm">
                {ex.sets} Sets
              </span>
              <button
                onClick={() => removeExercise(idx)}
                className="text-red-400 hover:text-red-300 ml-2 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6">
        <h2 className="text-sm text-neutral-400 mb-3">Übung hinzufügen</h2>
        <input
          type="text"
          value={newExName}
          onChange={(e) => setNewExName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addExercise()}
          placeholder="Übungsname"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 mb-3"
        />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-neutral-300">Anzahl Sets</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewExSets(Math.max(1, newExSets - 1))}
              className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-lg text-lg font-bold hover:bg-neutral-700"
            >
              -
            </button>
            <span className="text-lg font-semibold w-6 text-center">
              {newExSets}
            </span>
            <button
              onClick={() => setNewExSets(newExSets + 1)}
              className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-lg text-lg font-bold hover:bg-neutral-700"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={addExercise}
          disabled={!newExName.trim()}
          className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 disabled:hover:bg-neutral-700 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          + Hinzufügen
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim() || exercises.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
      >
        Routine speichern
      </button>
    </div>
  );
}
