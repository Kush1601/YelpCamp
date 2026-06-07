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
      <h1 className="text-3xl font-bold text-(--text)">Full-text search</h1>
      <p className="text-sm text-muted">PostgreSQL GIN index on tsvector (websearch_to_tsquery).</p>
      <form onSubmit={runSearch} className="flex gap-2">
        <input
          className="glass-input flex-1"
          placeholder="forest, river, quiet…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>
      {queryMs != null ? (
        <p className="text-xs text-(--accent)">
          {total} hits · query {queryMs}ms
        </p>
      ) : null}
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id} className="glass-card p-3">
            <Link href={`/campgrounds/${r.id}`} className="font-medium text-(--accent) hover:opacity-70">
              {r.title}
            </Link>
            <div className="text-sm text-muted">
              {r.location} · ${r.price}/night
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
