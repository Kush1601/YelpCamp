import Link from "next/link";
import { CampgroundMapClient } from "@/app/components/CampgroundMapClient";
import { CampgroundPagination } from "@/app/components/CampgroundPagination";
import { queryRaw } from "@/lib/db";

export const dynamic = "force-dynamic";

type Campground = { id: string; title: string; location: string; price: number; lat: number; lng: number; image_url: string | null };
type Pagination = { page: number; pageSize: number; total: number; totalPages: number };

const PAGE_SIZE = 12;

async function getCampgrounds(page: number): Promise<{ campgrounds: Campground[]; pagination: Pagination }> {
  try {
    const offset = (page - 1) * PAGE_SIZE;

    const [countRow] = await queryRaw<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM campgrounds WHERE geom IS NOT NULL`
    );
    const total = parseInt(countRow.total, 10);

    const rows = await queryRaw<Campground>(`
      SELECT c.id, c.title, c.location, c.price,
             ST_Y(c.geom::geometry)::float AS lat,
             ST_X(c.geom::geometry)::float AS lng,
             (
               SELECT url FROM campground_images ci
               WHERE ci.campground_id = c.id LIMIT 1
             ) AS image_url
      FROM campgrounds c
      WHERE c.geom IS NOT NULL
      ORDER BY c.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `);

    return { campgrounds: rows, pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) } };
  } catch (err) {
    console.error(err);
    return { campgrounds: [], pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 } };
  }
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
        <h1 className="text-3xl font-bold text-(--text)">All campgrounds</h1>
        <Link href="/campgrounds/new" className="text-sm font-medium text-(--accent) hover:opacity-70">
          Add listing
        </Link>
      </div>

      <div className="glass-card overflow-hidden p-1.5">
        <CampgroundMapClient points={mapPoints} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campgrounds.map((c) => (
          <Link
            key={c.id}
            href={`/campgrounds/${c.id}`}
            className="glass-card overflow-hidden p-0 transition hover:-translate-y-1"
          >
            {c.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image_url} alt={c.title} className="h-40 w-full object-cover" />
            ) : null}
            <div className="p-4">
              <h2 className="font-semibold text-(--text)">{c.title}</h2>
              <p className="text-sm text-muted">{c.location}</p>
              <p className="mt-2 text-sm font-semibold text-(--accent)">${c.price}/night</p>
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

      <p className="text-center text-xs text-muted">
        Showing {Math.min((page - 1) * pagination.pageSize + 1, pagination.total)}–
        {Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total} campgrounds
      </p>
    </div>
  );
}
