import type { NextRequest } from "next/server";
import { expandQuery } from "@/lib/claude";
import { queryRaw } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q")?.trim();

  const start = Date.now();

  try {
    let sourceText: string;

    if (id) {
      const rows = await queryRaw<{ title: string; description: string }>(
        `SELECT title, description FROM campgrounds WHERE id = $1`,
        [id]
      );
      if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
      sourceText = `${rows[0].title} ${rows[0].description}`;
    } else if (q) {
      sourceText = q;
    } else {
      return Response.json({ error: "Provide id or q" }, { status: 400 });
    }

    const keywords = await expandQuery(sourceText);
    if (!keywords) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY required for semantic similar search" },
        { status: 503 }
      );
    }

    const whereClause = id ? `WHERE id <> $2` : `WHERE TRUE`;
    const params: unknown[] = id ? [keywords, id] : [keywords];

    const results = await queryRaw<{
      id: string;
      title: string;
      location: string;
      score: number;
    }>(
      `SELECT id, title, location,
              ts_rank(search_vector, websearch_to_tsquery('english', $1))::float AS score
       FROM campgrounds
       ${whereClause}
         AND search_vector @@ websearch_to_tsquery('english', $1)
       ORDER BY score DESC
       LIMIT 8`,
      params
    );

    return Response.json({
      results,
      keywords,
      queryMs: Date.now() - start,
      mode: id ? "campground" : "query",
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Similar search failed" }, { status: 500 });
  }
}
