"use client";

import { useEffect, useState } from "react";

type SummaryRow = {
  campground_id: string;
  title: string;
  views: number;
  avg_rating: string;
  review_count: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [rolling, setRolling] = useState<{ day: string; avg_rating: string }[]>([]);
  const [dow, setDow] = useState<{ dow: number; views: number }[]>([]);
  const [queryMs, setQueryMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load dashboard");
          return;
        }
        setSummary(data.summary ?? []);
        setRolling(data.rolling14Day ?? []);
        setDow(data.viewsByDayOfWeek ?? []);
        setQueryMs(data.queryMs ?? null);
      })
      .catch(() => setError("Failed to load dashboard"));
  }, []);

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-950">Owner dashboard</h1>
      <p className="text-sm text-emerald-800/80">
        SQL aggregates, 14-day rating trend, and day-of-week view totals (materialized view refresh on load).
      </p>
      {queryMs != null ? <p className="text-xs text-emerald-700">Dashboard queries {queryMs}ms</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}

      <section className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b text-emerald-900">
              <th className="py-2 pr-4">Campground</th>
              <th className="py-2 pr-4">Views</th>
              <th className="py-2 pr-4">Avg rating</th>
              <th className="py-2">Reviews</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.campground_id} className="border-b border-emerald-900/5">
                <td className="py-2 pr-4 font-medium">{row.title}</td>
                <td className="py-2 pr-4">{row.views}</td>
                <td className="py-2 pr-4">{row.avg_rating}</td>
                <td className="py-2">{row.review_count}</td>
              </tr>
            ))}
            {!summary.length && !error ? (
              <tr>
                <td colSpan={4} className="py-4 text-emerald-800/70">
                  No listings yet — create a campground while signed in.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold">14-day avg rating</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {rolling.map((r) => (
              <li key={r.day}>
                {r.day}: {parseFloat(r.avg_rating).toFixed(2)}
              </li>
            ))}
            {!rolling.length ? <li className="text-emerald-800/60">No recent reviews</li> : null}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Views by day listed (DOW)</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {dow.map((d) => (
              <li key={d.dow}>
                {DOW[d.dow]}: {d.views} views
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
