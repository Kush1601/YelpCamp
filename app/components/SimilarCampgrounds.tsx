"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = { id: string; title: string; location: string; score: number };

export function SimilarCampgrounds({ campgroundId }: { campgroundId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [queryMs, setQueryMs] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/similar?id=${campgroundId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Similar search unavailable");
          return;
        }
        setRows(data.results ?? []);
        setQueryMs(data.queryMs ?? null);
        setKeywords(data.keywords ?? null);
      })
      .catch(() => setError("Similar search failed"));
  }, [campgroundId]);

  if (error) {
    return (
      <section className="rounded-2xl border border-dashed border-emerald-800/30 bg-white/60 p-4 text-sm text-emerald-800">
        Semantic similar listings unavailable — set ANTHROPIC_API_KEY to enable Claude-powered search.
      </section>
    );
  }

  if (!rows.length) return null;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Similar campgrounds</h2>
        <div className="flex gap-3 text-xs text-emerald-700">
          {queryMs != null ? <span>Claude + GIN query {queryMs}ms</span> : null}
        </div>
      </div>
      {keywords ? (
        <p className="mt-1 text-xs text-emerald-700/70">
          Claude keywords: <em>{keywords}</em>
        </p>
      ) : null}
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/campgrounds/${r.id}`} className="font-medium text-emerald-900 underline">
              {r.title}
            </Link>{" "}
            <span className="text-emerald-800/70">{r.location}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
