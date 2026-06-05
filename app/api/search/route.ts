import type { NextRequest } from "next/server";
import { queryRaw } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const pageSize = 10;

  if (!q) {
    return Response.json({ results: [], total: 0, page, pageSize, queryMs: 0 });
  }

  const start = Date.now();
  try {
    const countRows = await queryRaw<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM campgrounds
       WHERE search_vector @@ websearch_to_tsquery('english', $1)`,
      [q]
    );
    const total = parseInt(countRows[0]?.count ?? "0", 10);

    const results = await queryRaw<{
      id: string;
      title: string;
      description: string;
      location: string;
      price: number;
    }>(
      `SELECT id, title, description, location, price
       FROM campgrounds
       WHERE search_vector @@ websearch_to_tsquery('english', $1)
       ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', $1)) DESC
       LIMIT $2 OFFSET $3`,
      [q, pageSize, page * pageSize]
    );

    const queryMs = Date.now() - start;
    return Response.json({ results, total, page, pageSize, queryMs });
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ results: [], total: 0, page, pageSize, queryMs: 0 }, { status: 500 });
  }
}
