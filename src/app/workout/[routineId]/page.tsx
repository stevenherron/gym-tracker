"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Routine, LastSetsResponse } from "@/lib/types";
import { getRoutine } from "@/lib/routines";

interface WorkoutSet {
  exercise: string;
  setNum: number;
  weight: string;
  reps: string;
  done: boolean;
}

export default function WorkoutActive() {
  const router = useRouter();
  const params = useParams();
  const routineId = params.routineId as string;

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [lastSets, setLastSets] = useState<Record<string, LastSetsResponse>>(
    {}
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = getRoutine(routineId);
    if (!r) {
      router.push("/");
      return;
    }
    setRoutine(r);

    // Initialize empty sets
    const initialSets: WorkoutSet[] = [];
    r.exercises.forEach((ex) => {
      for (let i = 1; i <= ex.sets; i++) {
        initialSets.push({
          exercise: ex.name,
          setNum: i,
          weight: "",
          reps: "",
          done: false,
        });
      }
    });
    setSets(initialSets);

    // Fetch last sets for each exercise
    r.exercises.forEach((ex) => {
      fetch(`/api/last-sets?exercise=${encodeURIComponent(ex.name)}`)
        .then((res) => res.json())
        .then((data: LastSetsResponse) => {
          setLastSets((prev) => ({ ...prev, [ex.name]: data }));
          // Prefill weights from last session
          if (data.sets && data.sets.length > 0) {
            setSets((prevSets) =>
              prevSets.map((s) => {
                if (s.exercise === ex.name && !s.weight) {
                  const lastSet = data.sets.find(
                    (ls) => ls.set === s.setNum
                  );
                  if (lastSet) {
                    return { ...s, weight: String(lastSet.weight) };
                  }
                }
                return s;
              })
            );
          }
        })
        .catch(() => {});
    });
  }, [routineId, router]);

  const updateSet = (
    idx: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const toggleDone = (idx: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, done: !s.done } : s))
    );
  };

  const handleFinish = async () => {
    const doneSets = sets.filter(
      (s) => s.done && s.weight !== "" && s.reps !== ""
    );
    if (doneSets.length === 0) {
      alert("Keine abgeschlossenen Sätze zum Speichern.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/log-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout: routine!.name,
          sets: doneSets.map((s) => ({
            exercise: s.exercise,
            set: s.setNum,
            weight: parseFloat(s.weight),
            reps: parseInt(s.reps),
          })),
        }),
      });

      if (!res.ok) throw new Error("Fehler beim Speichern");
      router.push("/");
    } catch {
      alert("Fehler beim Speichern. Bitte versuche es erneut.");
      setSaving(false);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  if (!routine) return null;

  // Group sets by exercise
  const exerciseGroups: { name: string; sets: (WorkoutSet & { idx: number })[] }[] = [];
  let currentEx = "";
  sets.forEach((s, idx) => {
    if (s.exercise !== currentEx) {
      currentEx = s.exercise;
      exerciseGroups.push({ name: s.exercise, sets: [] });
    }
    exerciseGroups[exerciseGroups.length - 1].sets.push({ ...s, idx });
  });

  const doneCount = sets.filter((s) => s.done).length;
  const totalCount = sets.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => {
              if (
                doneCount === 0 ||
                confirm("Workout wirklich abbrechen? Daten gehen verloren.")
              ) {
                router.push("/");
              }
            }}
            className="text-neutral-400 hover:text-white text-sm"
          >
            &larr; Abbrechen
          </button>
          <h1 className="text-2xl font-bold mt-1">{routine.name}</h1>
        </div>
        <span className="text-neutral-400 text-sm">
          {doneCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-6 mb-8">
        {exerciseGroups.map((group) => {
          const last = lastSets[group.name];
          return (
            <div
              key={group.name}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <h2 className="font-semibold text-lg mb-1">{group.name}</h2>
              {last && last.sets.length > 0 && (
                <p className="text-neutral-500 text-xs mb-3">
                  Letztes Mal ({last.date}):{" "}
                  {last.sets
                    .map((s) => `${s.weight}kg × ${s.reps}`)
                    .join(", ")}
                </p>
              )}

              {/* Header */}
              <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 mb-1 text-neutral-500 text-xs">
                <span>#</span>
                <span>kg</span>
                <span>Reps</span>
                <span></span>
              </div>

              {/* Sets */}
              {group.sets.map((s) => (
                <div
                  key={s.idx}
                  className={`grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 items-center mb-2 ${
                    s.done ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-neutral-500 text-sm">{s.setNum}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weight}
                    onChange={(e) => updateSet(s.idx, "weight", e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="—"
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-center focus:outline-none focus:border-blue-500 w-full"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) => updateSet(s.idx, "reps", e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="—"
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-center focus:outline-none focus:border-blue-500 w-full"
                  />
                  <button
                    onClick={() => toggleDone(s.idx)}
                    className={`w-10 h-10 rounded-lg border text-lg flex items-center justify-center transition-colors ${
                      s.done
                        ? "bg-green-600 border-green-500 text-white"
                        : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-green-500"
                    }`}
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleFinish}
        disabled={saving || doneCount === 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors text-lg fixed bottom-4 left-4 right-4 max-w-lg mx-auto"
      >
        {saving ? "Speichert..." : `Workout beenden (${doneCount} Sets)`}
      </button>
    </div>
  );
}
