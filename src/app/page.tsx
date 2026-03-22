"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Routine } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/routines";

export default function Home() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    setRoutines(getRoutines());
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" wirklich löschen?`)) {
      deleteRoutine(id);
      setRoutines(getRoutines());
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Meine Routinen</h1>

      {routines.length === 0 ? (
        <p className="text-neutral-400 mb-8">
          Noch keine Routinen erstellt. Starte mit einer neuen Routine!
        </p>
      ) : (
        <div className="space-y-3 mb-8">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{routine.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/routine/edit/${routine.id}`)}
                    className="text-neutral-400 hover:text-white text-sm px-2 py-1"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(routine.id, routine.name)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                  >
                    Löschen
                  </button>
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-3">
                {routine.exercises.length} Übungen
              </p>
              <button
                onClick={() => router.push(`/workout/${routine.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Workout starten
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/routine/new")}
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-lg border border-neutral-700 transition-colors"
      >
        + Neue Routine
      </button>
    </div>
  );
}
