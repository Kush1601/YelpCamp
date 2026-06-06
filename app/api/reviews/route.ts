import { auth, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db, queryRaw } from "@/lib/db";
import { reviews } from "@/lib/schema";

const createReviewSchema = z.object({
  campgroundId: z.string().uuid("Invalid campground ID"),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1, "Review text is required").max(2000),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createReviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { campgroundId, rating, body: reviewBody } = parsed.data;

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
