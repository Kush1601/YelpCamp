import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db, queryRaw } from "@/lib/db";
import { campgrounds } from "@/lib/schema";

const updateCampgroundSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  price: z.number().int().min(0).max(100000).optional(),
  location: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await queryRaw(`UPDATE campgrounds SET views = views + 1 WHERE id = $1`, [id]);

    const rows = await queryRaw<{
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      owner_id: string;
      views: number;
      lat: number;
      lng: number;
    }>(
      `SELECT id, title, description, price, location, owner_id, views,
              ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng
       FROM campgrounds WHERE id = $1`,
      [id]
    );
    if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

    const images = await queryRaw<{ url: string }>(
      `SELECT url FROM campground_images WHERE campground_id = $1`,
      [id]
    );
    const reviews = await queryRaw<{
      id: string;
      body: string;
      rating: number;
      author_name: string | null;
      created_at: string;
    }>(
      `SELECT id, body, rating, author_name, created_at::text
       FROM reviews WHERE campground_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return Response.json({ campground: rows[0], images, reviews });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [row] = await db.select().from(campgrounds).where(eq(campgrounds.id, id));
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  if (row.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const parsed = updateCampgroundSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, description, price, location, imageUrl } = parsed.data;

  if (title || description || price != null || location) {
    await db
      .update(campgrounds)
      .set({
        ...(title && { title }),
        ...(description && { description }),
        ...(price != null && { price }),
        ...(location && { location }),
      })
      .where(eq(campgrounds.id, id));
  }

  if (location) {
    const { geocodeLocation } = await import("@/lib/geocode");
    const { lat, lng } = await geocodeLocation(location);
    await queryRaw(
      `UPDATE campgrounds SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
      [lng, lat, id]
    );
  }

  if (imageUrl) {
    const { campgroundImages } = await import("@/lib/schema");
    await queryRaw(`DELETE FROM campground_images WHERE campground_id = $1`, [id]);
    await db.insert(campgroundImages).values({ campgroundId: id, url: imageUrl });
  }

  await queryRaw(`REFRESH MATERIALIZED VIEW CONCURRENTLY campground_review_stats`).catch(() =>
    queryRaw(`REFRESH MATERIALIZED VIEW campground_review_stats`)
  );

  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [row] = await db.select().from(campgrounds).where(eq(campgrounds.id, id));
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  if (row.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(campgrounds).where(eq(campgrounds.id, id));
  return Response.json({ ok: true });
}
