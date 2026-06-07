"use client";

import Link from "next/link";
import { useState } from "react";

type Row = { id: string; title: string; location: string; price: number; distance_miles: number };

export default function NearbyPage() {
  const [location, setLocation] = useState("Boulder, Colorado");
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [results, setResults] = useState<Row[]>([]);
  const [queryMs, setQueryMs] = useState<number | null>(null);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(
      `/api/nearby?location=${encodeURIComponent(location)}&radiusMiles=${radiusMiles}`
    );
    const data = await res.json();
    setResults(data.results ?? []);
    setQueryMs(data.queryMs ?? null);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-(--text)">Nearby search</h1>
      <p className="text-sm text-muted">
        PostGIS ST_DWithin + GIST index on geography points.
      </p>
      <form onSubmit={onSearch} className="glass-card flex flex-wrap items-end gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-(--text)">
          Location
          <input
            className="glass-input w-64"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-(--text)">
          Radius (mi)
          <input
            type="number"
            className="glass-input w-28"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(parseInt(e.target.value, 10))}
            min={1}
            max={200}
          />
        </label>
        <button type="submit" className="btn-primary">
          Find nearby
        </button>
      </form>
      {queryMs != null ? <p className="text-xs text-(--accent)">Query {queryMs}ms · {results.length} results</p> : null}
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id} className="glass-card p-3 text-sm">
            <Link href={`/campgrounds/${r.id}`} className="font-medium text-(--accent) hover:opacity-70">
              {r.title}
            </Link>
            <div className="text-muted">
              {r.location} · {r.distance_miles.toFixed(1)} mi · ${r.price}/night
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
