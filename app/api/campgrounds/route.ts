import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db, queryRaw } from "@/lib/db";
import { campgroundImages, campgrounds } from "@/lib/schema";
import { geocodeLocation } from "@/lib/geocode";

const createCampgroundSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  price: z.number().int().min(0).max(100000),
  location: z.string().min(1, "Location is required").max(500),
  imageUrl: z.string().url("Image URL must be a valid URL").optional().or(z.literal("")),
});

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const offset = (page - 1) * PAGE_SIZE;

    const [countRow] = await queryRaw<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM campgrounds WHERE geom IS NOT NULL`
    );
    const total = parseInt(countRow.total, 10);

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
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `);

    return Response.json({
      campgrounds: rows,
      pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ campgrounds: [], pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const parsed = createCampgroundSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { title, description, price, location, imageUrl } = parsed.data;

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
