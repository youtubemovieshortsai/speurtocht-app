"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function JoinGame() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (cleanCode.length !== 6) {
      setError("Een spelcode bestaat uit 6 tekens.");
      return;
    }

    if (!cleanName) {
      setError("Vul je naam in.");
      return;
    }

    setLoading(true);

    const { data, error: supabaseError } = await supabase.rpc(
      "join_game",
      {
        p_game_code: cleanCode,
        p_display_name: cleanName,
      }
    );

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    if (!data?.game_id || !data?.player_id || !data?.access_token) {
      setError("Je kon niet aan het spel deelnemen.");
      return;
    }

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

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-4 sm:p-6">
      <div className="mx-auto max-w-md">
        <a
          href="/"
          className="inline-block mb-5 sm:mb-8 text-slate-400 hover:text-white"
        >
          🔙 Terug
        </a>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Meedoen met een spel
        </h1>

        <p className="text-slate-300 mb-5 sm:mb-8">
          Vul de spelcode en je naam in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block mb-2 font-medium">
              Spelcode
            </label>

            <input
              type="text"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase())
              }
              placeholder="Bijvoorbeeld ABC123"
              maxLength={6}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] uppercase outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Jouw naam
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Bijvoorbeeld Matthyas"
              maxLength={30}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Bezig..." : "Meedoen"}
          </button>
        </form>
      </div>
    </main>
  );
}



