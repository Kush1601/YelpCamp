import Link from "next/link";
import { CampgroundMapClient } from "@/app/components/CampgroundMapClient";

export const dynamic = "force-dynamic";

async function getCampgrounds() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/campgrounds`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { campgrounds: { id: string; title: string; location: string; price: number; lat: number; lng: number }[] };
  return data.campgrounds ?? [];
}

export default async function CampgroundsPage() {
  const campgrounds = await getCampgrounds();
  const mapPoints = campgrounds
    .filter((c) => c.lat && c.lng)
    .map((c) => ({ id: c.id, title: c.title, lat: c.lat, lng: c.lng, location: c.location }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-950">All campgrounds</h1>
        <Link href="/campgrounds/new" className="text-sm font-medium text-emerald-800 underline">
          Add listing
        </Link>
      </div>
      <CampgroundMapClient points={mapPoints} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campgrounds.map((c) => (
          <Link
            key={c.id}
            href={`/campgrounds/${c.id}`}
            className="rounded-xl border border-emerald-900/10 bg-white p-4 shadow-sm hover:border-emerald-700"
          >
            <h2 className="font-semibold text-emerald-950">{c.title}</h2>
            <p className="text-sm text-emerald-800/80">{c.location}</p>
            <p className="mt-2 text-sm font-medium">${c.price}/night</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
