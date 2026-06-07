# YelpCamp

Full-stack campground listings and reviews — built on **Next.js 15**, **TypeScript**, **PostgreSQL (PostGIS)**, and **Clerk** auth, with a glassmorphism UI and dark/light theming.

**Live demo:** [yelpcamp-topaz.vercel.app](https://yelpcamp-topaz.vercel.app)

---

## Features

| Feature | Detail |
|---|---|
| **Full CRUD** | Create, edit, delete campgrounds; owner-only enforcement at middleware and API layer |
| **PostGIS nearby search** | `ST_DWithin` radius filter with GIST index on `geography` points |
| **Full-text search** | GIN index on `tsvector`; `websearch_to_tsquery` + `ts_rank` |
| **Semantic search** | Claude Haiku extracts keywords → PostgreSQL GIN full-text search, sub-30ms |
| **Pagination** | `/api/campgrounds` returns 12/page with `total`/`totalPages` metadata |
| **Input validation** | Zod schemas on all POST/PATCH endpoints; structured `{ error, fields }` 400 responses |
| **Owner dashboard** | SQL aggregates, 14-day rating trend, DOW view heatmap; materialized view refresh |
| **Maps** | Leaflet + OpenStreetMap; theme-aware tiles (CARTO dark in dark mode) |
| **Glassmorphism UI** | Frosted-glass surfaces with reusable design tokens; dark/light theme toggle (`next-themes`, system default, persisted, no FOUC); Geist font |
| **Auth** | Clerk on create, edit, dashboard, and reviews |
| **CI/CD** | GitHub Actions: lint + build job; Playwright E2E against the live deployment |
| **Docker** | Multi-stage Next.js `Dockerfile`; `docker-compose` for local Postgres |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| UI | Glassmorphism design tokens, `next-themes` (dark/light), Geist font, React-Leaflet |
| Database | PostgreSQL, PostGIS, Drizzle ORM |
| Auth | Clerk |
| AI | Anthropic Claude Haiku — semantic query expansion (optional; degrades gracefully) |
| Validation | Zod |
| CI | GitHub Actions + Playwright (E2E vs. live deployment) |
| Deploy | Vercel + Neon PostgreSQL |

---

## Local setup

### Prerequisites

- Node.js 20+
- Docker (for local database)

### Database

```bash
docker compose up -d db
cp .env.example .env
# Fill in Clerk keys from https://dashboard.clerk.com
# ANTHROPIC_API_KEY is optional — similar search works without it
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
| `GET` | `/api/campgrounds` | Paginated campground list + map coordinates |
| `POST` | `/api/campgrounds` | Create campground (auth); geocode location |
| `GET` | `/api/campgrounds/:id` | Detail, increment views |
| `PATCH` | `/api/campgrounds/:id` | Update campground (auth, owner only) |
| `DELETE` | `/api/campgrounds/:id` | Delete campground (auth, owner only) |
| `GET` | `/api/search?q=` | Full-text search (reports `queryMs`) |
| `GET` | `/api/nearby?location=&radiusMiles=` | PostGIS radius search |
| `GET` | `/api/similar?id=` | Claude Haiku keyword expansion → GIN full-text search |
| `GET` | `/api/dashboard` | Owner analytics (auth) |
| `POST` | `/api/reviews` | Add review (auth) |

---

## Testing

End-to-end tests run with **Playwright** (`tests/e2e/`), covering homepage navigation, the campgrounds list, pagination, and full-text search.

```bash
npx playwright test                      # boots a local prod server and runs the suite
PLAYWRIGHT_BASE_URL=<url> npx playwright test   # run against a deployed URL
```

CI runs the suite against the live Vercel deployment (`PLAYWRIGHT_BASE_URL`), which sidesteps headless-Chromium loopback issues on GitHub Actions runners.

---

## Metrics (interview talking points)

- **Nearby query:** `queryMs` from `/api/nearby` — GIST index on `geography` column; target <80ms at 120 rows
- **Full-text search:** `queryMs` from `/api/search` — GIN index on `tsvector`; sub-30ms at 120 rows
- **Semantic search:** Claude Haiku extracts 6–8 keywords in ~300ms; GIN search sub-30ms; total <400ms round-trip
- **Dashboard:** materialized view pre-aggregates avg rating + view counts; `queryMs` from `/api/dashboard` target <50ms

---

## Required environment variables

```
DATABASE_URL=                          # Neon PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ANTHROPIC_API_KEY=                     # Optional — similar search degrades to keyword-only without it
```

---

## License

MIT
