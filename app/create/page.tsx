"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function CreateGame() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [duration, setDuration] = useState("60");
  const [runAway, setRunAway] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<{ minute: string; task: string }[]>([]);

  function addAssignment() {
    setAssignments((current) => [...current, { minute: "0", task: "" }]);
  }

  function removeAssignment(index: number) {
    setAssignments((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vul een naam voor het spel in.");
      return;
    }

    if (!organizer.trim()) {
      setError("Vul je naam in.");
      return;
    }

    const durationMinutes = Number(duration);
    const runAwaySeconds = Number(runAway);

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 0 ||
      durationMinutes > 1440
    ) {
      setError("De speeltijd moet tussen 0 en 1440 minuten liggen.");
      return;
    }

    if (
      !Number.isInteger(runAwaySeconds) ||
      runAwaySeconds < 0 ||
      runAwaySeconds > 1800
    ) {
      setError("De wegrentijd moet tussen 0 en 1800 seconden liggen.");
      return;
    }

    for (const assignment of assignments) {
      const minute = Number(assignment.minute);

      if (!Number.isInteger(minute) || minute < 0 || minute > durationMinutes) {
        setError("Elke opdracht moet een geldige minuut binnen de speeltijd hebben.");
        return;
      }

      if (!assignment.task.trim()) {
        setError("Elke opdracht moet een omschrijving hebben.");
        return;
      }
    }
    setLoading(true);

    const { data, error: supabaseError } = await supabase.rpc(
      "create_game",
      {
        p_name: name.trim(),
        p_duration_minutes: durationMinutes,
        p_run_away_seconds: runAwaySeconds,
        p_display_name: organizer.trim(),
      }
    );

    if (supabaseError) {
      setLoading(false);
      setError(supabaseError.message);
      return;
    }

    if (!data?.game_id || !data?.player_id || !data?.access_token) {
      setError("Het spel kon niet worden aangemaakt.");
      return;
    }

    for (const assignment of assignments) {
      const { error: assignmentError } = await supabase.rpc("create_game_assignment", {
        p_game_id: data.game_id,
        p_access_token: data.access_token,
        p_minute: Number(assignment.minute),
        p_task: assignment.task.trim(),
      });

      if (assignmentError) {
        setLoading(false);
        setError(assignmentError.message);
        return;
      }
    }

    setLoading(false);
    sessionStorage.setItem(
      `bankzitters-player-${data.game_id}`,
      JSON.stringify({
        playerId: data.player_id,
        accessToken: data.access_token,
      })
    );

    router.push(
      `/game?code=${encodeURIComponent(data.game_code)}&game=${encodeURIComponent(data.game_id)}`
    );
  }

  function formatDuration(minutes: number) {
    if (minutes === 0) return "0 minuten";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} ${mins === 1 ? "minuut" : "minuten"}`;
    }

    if (mins === 0) {
      return `${hours} uur`;
    }

    return `${hours} uur en ${mins} ${
      mins === 1 ? "minuut" : "minuten"
    }`;
  }

  function formatRunAway(seconds: number) {
    if (seconds === 0) return "Geen wegrentijd";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${seconds} ${
        seconds === 1 ? "seconde" : "seconden"
      }`;
    }

    if (remainingSeconds === 0) {
      return `${minutes} ${
        minutes === 1 ? "minuut" : "minuten"
      }`;
    }

    return `${minutes} ${
      minutes === 1 ? "minuut" : "minuten"
    } en ${remainingSeconds} ${
      remainingSeconds === 1 ? "seconde" : "seconden"
    }`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-4 sm:p-6">
      <div className="mx-auto max-w-md">

        <a
          href="/"
          className="inline-block mb-5 sm:mb-8 text-slate-400 hover:text-white"
        >
          &#x1F519; Terug
        </a>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Nieuw spel maken
        </h1>

        <p className="text-slate-300 mb-5 sm:mb-8">
          Stel het spel in. De organisator bepaalt de speeltijd
          en hoeveel wegrentijd de verstoppers krijgen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

          <div>
            <label className="block mb-2 font-medium">
              Naam van het spel
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Bijvoorbeeld: Bankzitters The Game"
              maxLength={60}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Jouw naam
            </label>

            <input
              type="text"
              value={organizer}
              onChange={(event) => setOrganizer(event.target.value)}
              placeholder="Bijvoorbeeld Matthyas"
              maxLength={30}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Speelduur
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="1440"
                step="1"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
              />

              <span className="text-slate-400 whitespace-nowrap">
                minuten
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              {formatDuration(Number(duration) || 0)}              {"- maximaal 24 uur"}
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Wegrentijd voor de verstoppers
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="1800"
                step="1"
                value={runAway}
                onChange={(event) => setRunAway(event.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
              />

              <span className="text-slate-400 whitespace-nowrap">
                seconden
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              {formatRunAway(Number(runAway) || 0)}              {"- maximaal 30 minuten"}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Eerst krijgen de verstoppers deze tijd om weg te
              rennen. Daarna begint de echte speeltijd.
            </p>
          </div>

          <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block font-medium">Opdrachten</label>
            <button
              type="button"
              onClick={addAssignment}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
            >
              + Opdracht toevoegen
            </button>
          </div>

          {assignments.length === 0 && (
            <p className="text-sm text-slate-500">Nog geen opdrachten toegevoegd.</p>
          )}

          <div className="space-y-3">
            {assignments.map((assignment, index) => (
              <div key={index} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={assignment.minute}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAssignments((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, minute: value } : item
                        )
                      );
                    }}
                    className="w-24 rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 outline-none focus:border-blue-500"
                    placeholder="Min."
                  />

                  <input
                    type="text"
                    value={assignment.task}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAssignments((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, task: value } : item
                        )
                      );
                    }}
                    placeholder="Bijvoorbeeld: Maak een foto van een rode auto"
                    maxLength={200}
                    className="min-w-0 flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => removeAssignment(index)}
                    className="rounded-xl px-3 text-slate-400 hover:bg-slate-800 hover:text-white"
                    aria-label="Opdracht verwijderen"
                  >X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {loading
              ? "Spel wordt aangemaakt..."
              : "Spel aanmaken"}
          </button>

        </form>
      </div>
    </main>
  );
}














