import { auth } from "@clerk/nextjs/server";
import { queryRaw } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const start = Date.now();
  try {
    await queryRaw(`REFRESH MATERIALIZED VIEW CONCURRENTLY campground_review_stats`).catch(() =>
      queryRaw(`REFRESH MATERIALIZED VIEW campground_review_stats`)
    );

    const summary = await queryRaw<{
      campground_id: string;
      title: string;
      views: number;
      avg_rating: string;
      review_count: number;
    }>(
      `SELECT campground_id, title, views, avg_rating::text, review_count
       FROM campground_review_stats
       WHERE owner_id = $1
       ORDER BY views DESC`,
      [userId]
    );

    const rolling = await queryRaw<{ day: string; avg_rating: string }>(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, avg_rating::text
       FROM (
         SELECT date_trunc('day', r.created_at) AS day,
                AVG(r.rating) AS avg_rating
         FROM reviews r
         INNER JOIN campgrounds c ON c.id = r.campground_id
         WHERE c.owner_id = $1
           AND r.created_at >= NOW() - INTERVAL '14 days'
         GROUP BY 1
         ORDER BY 1
       ) t`,
      [userId]
    );

    const dowHeatmap = await queryRaw<{ dow: number; views: number }>(
      `SELECT EXTRACT(DOW FROM c.created_at)::int AS dow,
              SUM(c.views)::int AS views
       FROM campgrounds c
       WHERE c.owner_id = $1
       GROUP BY 1
       ORDER BY 1`,
      [userId]
    );

    return Response.json({
      summary,
      rolling14Day: rolling,
      viewsByDayOfWeek: dowHeatmap,
      queryMs: Date.now() - start,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Dashboard failed" }, { status: 500 });
  }
}
