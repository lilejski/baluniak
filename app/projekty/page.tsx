export default function ProjektyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-100">Projekty</h1>
      <p className="mt-4 text-zinc-400">
        Case study Fotarobota: Problem → 80h Build → Result.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Strona projektu:{" "}
        <a
          href="https://www.fotarobota.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:underline"
        >
          www.fotarobota.pl
        </a>
      </p>
    </main>
  );
}
