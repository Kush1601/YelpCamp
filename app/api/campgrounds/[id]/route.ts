import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, queryRaw } from "@/lib/db";
import { campgrounds } from "@/lib/schema";

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
