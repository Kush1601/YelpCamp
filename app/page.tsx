import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="glass-card w-full max-w-3xl p-10 text-center sm:p-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--accent)">Outdoor listings</p>
        <h1 className="mt-3 bg-linear-to-r from-(--accent) to-(--accent-2) bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          Find your next campsite
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted">
          PostGIS radius search, PostgreSQL full-text search, pgvector similarity, and SQL-powered owner
          analytics — built with Next.js and TypeScript.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/campgrounds" className="btn-primary">Browse campgrounds</Link>
          <Link href="/nearby" className="btn-ghost">Search nearby</Link>
        </div>
      </div>
    </section>
  );
}
