import { auth, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { db, queryRaw } from "@/lib/db";
import { reviews } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { campgroundId, rating, body: reviewBody } = body as {
    campgroundId?: string;
    rating?: number;
    body?: string;
  };

  if (!campgroundId || !reviewBody || rating == null || rating < 1 || rating > 5) {
    return Response.json({ error: "Invalid review" }, { status: 400 });
  }

  const user = await currentUser();
  const authorName =
    user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Camper";

  await db.insert(reviews).values({
    campgroundId,
    rating,
    body: reviewBody,
    authorId: userId,
    authorName,
  });

  await queryRaw(`REFRESH MATERIALIZED VIEW campground_review_stats`);

  return Response.json({ ok: true }, { status: 201 });
}
