import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { db, queryRaw } from "@/lib/db";
import { campgroundImages, campgrounds } from "@/lib/schema";
import { geocodeLocation } from "@/lib/geocode";

export async function GET() {
  try {
    const rows = await queryRaw<{
      id: string;
      title: string;
      location: string;
      price: number;
      lat: number;
      lng: number;
      image_url: string | null;
    }>(`
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
      LIMIT 200
    `);
    return Response.json({ campgrounds: rows });
  } catch (err) {
    console.error(err);
    return Response.json({ campgrounds: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, price, location, imageUrl } = body as {
      title?: string;
      description?: string;
      price?: number;
      location?: string;
      imageUrl?: string;
    };
    if (!title || !description || !location || price == null) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { lat, lng } = await geocodeLocation(location);

    const [row] = await db
      .insert(campgrounds)
      .values({ title, description, price, location, ownerId: userId })
      .returning({ id: campgrounds.id });

    await queryRaw(
      `UPDATE campgrounds SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
      [lng, lat, row.id]
    );

    if (imageUrl) {
      await db.insert(campgroundImages).values({ campgroundId: row.id, url: imageUrl });
    }

    await queryRaw(`REFRESH MATERIALIZED VIEW CONCURRENTLY campground_review_stats`).catch(() =>
      queryRaw(`REFRESH MATERIALIZED VIEW campground_review_stats`)
    );

    return Response.json({ id: row.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create campground" }, { status: 500 });
  }
}
