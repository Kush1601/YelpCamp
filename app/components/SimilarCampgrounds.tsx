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
      <section className="glass-card border-dashed p-4 text-sm text-muted">
        Semantic similar listings unavailable — set ANTHROPIC_API_KEY to enable Claude-powered search.
      </section>
    );
  }

  if (!rows.length) return null;

  return (
    <section className="glass-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-(--text)">Similar campgrounds</h2>
        <div className="flex gap-3 text-xs text-(--accent)">
          {queryMs != null ? <span>Claude + GIN query {queryMs}ms</span> : null}
        </div>
      </div>
      {keywords ? (
        <p className="mt-1 text-xs text-muted">
          Claude keywords: <em>{keywords}</em>
        </p>
      ) : null}
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/campgrounds/${r.id}`} className="font-medium text-(--accent) hover:opacity-70">
              {r.title}
            </Link>{" "}
            <span className="text-muted">{r.location}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
