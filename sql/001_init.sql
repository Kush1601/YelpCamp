CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS campgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  geom geography(POINT, 4326),
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  campground_id UUID NOT NULL REFERENCES campgrounds(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campground_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campground_id UUID NOT NULL REFERENCES campgrounds(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT
);

ALTER TABLE campgrounds
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS campgrounds_geom_idx ON campgrounds USING GIST (geom);
CREATE INDEX IF NOT EXISTS campgrounds_search_idx ON campgrounds USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS reviews_campground_idx ON reviews (campground_id);
CREATE INDEX IF NOT EXISTS reviews_created_idx ON reviews (created_at);

CREATE MATERIALIZED VIEW IF NOT EXISTS campground_review_stats AS
SELECT
  c.id AS campground_id,
  c.owner_id,
  c.views,
  c.title,
  COALESCE(AVG(r.rating), 0)::numeric(4, 2) AS avg_rating,
  COUNT(r.id)::integer AS review_count
FROM campgrounds c
LEFT JOIN reviews r ON r.campground_id = c.id
GROUP BY c.id, c.owner_id, c.views, c.title;

CREATE UNIQUE INDEX IF NOT EXISTS campground_review_stats_pk ON campground_review_stats (campground_id);
