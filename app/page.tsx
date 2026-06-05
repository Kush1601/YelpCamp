import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Outdoor listings</p>
        <h1 className="mt-2 text-4xl font-bold text-emerald-950">Find your next campsite</h1>
        <p className="mt-3 max-w-2xl text-emerald-900/80">
          PostGIS radius search, PostgreSQL full-text search, pgvector similarity, and SQL-powered owner
          analytics — built with Next.js and TypeScript.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/campgrounds"
            className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900"
          >
            Browse campgrounds
          </Link>
          <Link
            href="/nearby"
            className="rounded-lg border border-emerald-800 px-4 py-2 font-medium text-emerald-900"
          >
            Search nearby
          </Link>
        </div>
      </div>
    </section>
  );
}
