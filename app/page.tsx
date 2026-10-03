export default function Home() {
  return (
    <main className="min-h-screen w-full max-w-md mx-auto bg-slate-950 text-white p-6 overflow-x-hidden">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <img
            src="/bankzitters-logo.svg"
            alt="Bankzitters"
            className="w-full max-w-xs object-contain"
          />
        </div>

        <div className="space-y-4">
          <a
            href="/create"
            className="block w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold hover:bg-blue-500"
          >
            Nieuw spel maken
          </a>

          <a
            href="/join"
            className="block w-full rounded-xl bg-slate-800 px-6 py-4 text-lg font-semibold hover:bg-slate-700"
          >
            Meedoen met een spel
          </a>
        </div>
      </div>
    </main>
  );
}



