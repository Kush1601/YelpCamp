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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-950">Nearby search</h1>
      <p className="text-sm text-emerald-800/80">
        PostGIS ST_DWithin + GIST index on geography points.
      </p>
      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">
          Location
          <input
            className="mt-1 block w-64 rounded border px-2 py-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium">
          Radius (mi)
          <input
            type="number"
            className="mt-1 block w-24 rounded border px-2 py-1"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(parseInt(e.target.value, 10))}
            min={1}
            max={200}
          />
        </label>
        <button type="submit" className="rounded-lg bg-emerald-800 px-4 py-2 text-white">
          Find nearby
        </button>
      </form>
      {queryMs != null ? <p className="text-xs text-emerald-700">Query {queryMs}ms · {results.length} results</p> : null}
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
            <Link href={`/campgrounds/${r.id}`} className="font-medium text-emerald-900 underline">
              {r.title}
            </Link>
            <div className="text-emerald-800/80">
              {r.location} · {r.distance_miles.toFixed(1)} mi · ${r.price}/night
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
