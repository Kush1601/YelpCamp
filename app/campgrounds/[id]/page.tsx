import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CampgroundMapClient } from "@/app/components/CampgroundMapClient";
import { ReviewForm } from "@/app/components/ReviewForm";
import { SimilarCampgrounds } from "@/app/components/SimilarCampgrounds";
import { queryRaw } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

async function getCampground(id: string) {
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
    if (!rows.length) return null;

    const images = await queryRaw<{ url: string }>(
      `SELECT url FROM campground_images WHERE campground_id = $1`,
      [id]
    );
    const reviews = await queryRaw<{
      id: string;
      body: string;
      rating: number;
      author_name: string | null;
    }>(
      `SELECT id, body, rating, author_name
       FROM reviews WHERE campground_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return { campground: rows[0], images, reviews };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function CampgroundShowPage({ params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  const data = await getCampground(id);
  if (!data?.campground) {
    return <p className="text-red-500">Campground not found.</p>;
  }

  const { campground, images, reviews } = data as {
    campground: {
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      owner_id: string;
      views: number;
      lat: number;
      lng: number;
    };
    images: { url: string }[];
    reviews: { id: string; body: string; rating: number; author_name: string | null }[];
  };

  return (
    <article className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-(--text)">{campground.title}</h1>
          {userId === campground.owner_id ? (
            <Link href={`/campgrounds/${campground.id}/edit`} className="btn-ghost shrink-0 px-3! py-1! text-sm">
              Edit
            </Link>
          ) : null}
        </div>
        <p className="text-muted">{campground.location}</p>
        <p className="mt-2 text-lg font-semibold text-(--accent)">${campground.price}/night</p>
        <p className="mt-4 text-(--text)/90">{campground.description}</p>
        <p className="mt-3 text-xs text-muted">{campground.views} views</p>
      </div>

      {images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={images[0].url} alt={campground.title} className="max-h-96 w-full rounded-xl object-cover" />
      ) : null}

      {campground.lat && campground.lng ? (
        <div className="glass-card overflow-hidden p-1.5">
          <CampgroundMapClient
            points={[{ id: campground.id, title: campground.title, lat: campground.lat, lng: campground.lng }]}
            center={[campground.lat, campground.lng]}
            zoom={10}
            heightClass="h-80"
          />
        </div>
      ) : null}

      <SimilarCampgrounds campgroundId={campground.id} />

      <section className="glass-card p-6">
        <h2 className="text-xl font-semibold text-(--text)">Reviews</h2>
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-(--surface-border) pb-3 text-sm text-(--text)">
              <div className="font-medium">
                {r.author_name ?? "Camper"} — {r.rating}/5
              </div>
              <p className="text-muted">{r.body}</p>
            </li>
          ))}
          {!reviews.length ? <li className="text-sm text-muted">No reviews yet.</li> : null}
        </ul>
        <ReviewForm campgroundId={campground.id} />
      </section>

      <Link href="/campgrounds" className="text-sm text-(--accent) hover:opacity-70">
        Back to all campgrounds
      </Link>
    </article>
  );
}
