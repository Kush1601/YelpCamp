import Link from "next/link";
import { CampgroundMapClient } from "@/app/components/CampgroundMapClient";
import { CampgroundPagination } from "@/app/components/CampgroundPagination";

export const dynamic = "force-dynamic";

type Campground = { id: string; title: string; location: string; price: number; lat: number; lng: number; image_url: string | null };
type Pagination = { page: number; pageSize: number; total: number; totalPages: number };

async function getCampgrounds(page: number): Promise<{ campgrounds: Campground[]; pagination: Pagination }> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/campgrounds?page=${page}`, { cache: "no-store" });
  if (!res.ok) return { campgrounds: [], pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 } };
  return res.json();
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function CampgroundsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { campgrounds, pagination } = await getCampgrounds(page);

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
            className="rounded-xl border border-emerald-900/10 bg-white shadow-sm hover:border-emerald-700 overflow-hidden"
          >
            {c.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image_url} alt={c.title} className="h-40 w-full object-cover" />
            ) : null}
            <div className="p-4">
              <h2 className="font-semibold text-emerald-950">{c.title}</h2>
              <p className="text-sm text-emerald-800/80">{c.location}</p>
              <p className="mt-2 text-sm font-medium">${c.price}/night</p>
            </div>
          </Link>
        ))}
      </div>

      {pagination.totalPages > 1 ? (
        <CampgroundPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
        />
      ) : null}

      <p className="text-xs text-emerald-800/50 text-center">
        Showing {Math.min((page - 1) * pagination.pageSize + 1, pagination.total)}–
        {Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total} campgrounds
      </p>
    </div>
  );
}
