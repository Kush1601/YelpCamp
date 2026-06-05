"use client";

import Link from "next/link";
import { useState } from "react";

type Result = { id: string; title: string; location: string; price: number };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [queryMs, setQueryMs] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setTotal(data.total ?? 0);
    setQueryMs(data.queryMs ?? null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-950">Full-text search</h1>
      <p className="text-sm text-emerald-800/80">PostgreSQL GIN index on tsvector (websearch_to_tsquery).</p>
      <form onSubmit={runSearch} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-emerald-900/20 px-3 py-2"
          placeholder="forest, river, quiet…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-emerald-800 px-4 py-2 text-white">
          Search
        </button>
      </form>
      {queryMs != null ? (
        <p className="text-xs text-emerald-700">
          {total} hits · query {queryMs}ms
        </p>
      ) : null}
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id} className="rounded-lg bg-white p-3 shadow-sm">
            <Link href={`/campgrounds/${r.id}`} className="font-medium text-emerald-900 underline">
              {r.title}
            </Link>
            <div className="text-sm text-emerald-800/80">
              {r.location} · ${r.price}/night
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
