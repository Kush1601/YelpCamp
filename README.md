# YelpCamp

Full-stack campground listings and reviews — rebuilt on **Next.js 15**, **TypeScript**, **PostgreSQL (PostGIS + pgvector)**, and **Clerk** auth.

**Legacy Express/Mongo app:** [`legacy/`](legacy/) (Colt Steele–style tutorial code, kept for reference).

---

## Features

| Feature | Detail |
|---|---|
| **PostGIS nearby search** | `ST_DWithin` radius filter with GIST index on `geography` points |
| **Full-text search** | GIN index on `tsvector`; `websearch_to_tsquery` + `ts_rank` |
| **Semantic search** | Claude Haiku extracts keywords → PostgreSQL GIN full-text search |
| **Owner dashboard** | SQL aggregates, 14-day rating trend, DOW view totals; materialized view refresh |
| **Maps** | Leaflet + OpenStreetMap |
| **Auth** | Clerk on create listing, dashboard, and reviews |
| **CI/CD** | GitHub Actions: migrate, seed, lint, build, Playwright |
| **Docker** | Multi-stage Next.js `Dockerfile`; `docker-compose` for local Postgres |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Database | PostgreSQL, PostGIS, pgvector, Drizzle ORM |
| Auth | Clerk |
| AI | Anthropic Claude Haiku — semantic query expansion (optional) |
| CI | GitHub Actions + Playwright |
| Deploy | Vercel + managed Postgres (Neon/Supabase/Railway) |

---

## Local setup

### Prerequisites

- Node.js 20+
- Docker (for local database)

### Database

```bash
docker compose up -d --build db
cp .env.example .env.local
# Add Clerk keys from https://dashboard.clerk.com
npm install
npm run db:migrate
npm run db:seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/campgrounds` | List campgrounds + map coordinates |
| `POST` | `/api/campgrounds` | Create (auth); geocode + optional embedding |
| `GET` | `/api/campgrounds/:id` | Detail, increment views |
| `GET` | `/api/search?q=` | Full-text search (reports `queryMs`) |
| `GET` | `/api/nearby?location=&radiusMiles=` | PostGIS radius search |
| `GET` | `/api/similar?id=` | pgvector similar campgrounds |
| `GET` | `/api/dashboard` | Owner analytics (auth) |
| `POST` | `/api/reviews` | Add review (auth) |

---

## Metrics to capture (interviews)

- **Nearby query:** `queryMs` from `/api/nearby` (target &lt;80ms with GIST index at ~10k rows)
- **Full-text search:** `queryMs` from `/api/search` (before/after GIN via `EXPLAIN ANALYZE`)
- **Semantic search:** `queryMs` from `/api/similar`; embedding latency in server logs
- **Dashboard:** `queryMs` from `/api/dashboard` after materialized view refresh

---

## License

MIT
