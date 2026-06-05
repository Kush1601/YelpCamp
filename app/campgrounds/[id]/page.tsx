import Link from "next/link";
import { CampgroundMapClient } from "@/app/components/CampgroundMapClient";
import { ReviewForm } from "@/app/components/ReviewForm";
import { SimilarCampgrounds } from "@/app/components/SimilarCampgrounds";

type Params = { params: Promise<{ id: string }> };

async function getCampground(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/campgrounds/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function CampgroundShowPage({ params }: Params) {
  const { id } = await params;
  const data = await getCampground(id);
  if (!data?.campground) {
    return <p className="text-red-700">Campground not found.</p>;
  }

  const { campground, images, reviews } = data as {
    campground: {
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      views: number;
      lat: number;
      lng: number;
    };
    images: { url: string }[];
    reviews: { id: string; body: string; rating: number; author_name: string | null }[];
  };

  return (
    <article className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-emerald-950">{campground.title}</h1>
        <p className="text-emerald-800">{campground.location}</p>
        <p className="mt-2 text-lg font-semibold">${campground.price}/night</p>
        <p className="mt-4 text-emerald-900/90">{campground.description}</p>
        <p className="mt-3 text-xs text-emerald-700/70">{campground.views} views</p>
      </div>

      {images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={images[0].url} alt={campground.title} className="max-h-96 w-full rounded-xl object-cover" />
      ) : null}

      {campground.lat && campground.lng ? (
        <CampgroundMapClient
          points={[{ id: campground.id, title: campground.title, lat: campground.lat, lng: campground.lng }]}
          center={[campground.lat, campground.lng]}
          zoom={10}
          heightClass="h-80"
        />
      ) : null}

      <SimilarCampgrounds campgroundId={campground.id} />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-emerald-900/5 pb-3 text-sm">
              <div className="font-medium">
                {r.author_name ?? "Camper"} — {r.rating}/5
              </div>
              <p>{r.body}</p>
            </li>
          ))}
          {!reviews.length ? <li className="text-sm text-emerald-800/70">No reviews yet.</li> : null}
        </ul>
        <ReviewForm campgroundId={campground.id} />
      </section>

      <Link href="/campgrounds" className="text-sm text-emerald-800 underline">
        Back to all campgrounds
      </Link>
    </article>
  );
}
