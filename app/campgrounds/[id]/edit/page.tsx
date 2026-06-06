import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { EditCampgroundForm } from "@/app/components/EditCampgroundForm";

type Params = { params: Promise<{ id: string }> };

async function getCampground(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/campgrounds/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditCampgroundPage({ params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getCampground(id);
  if (!data?.campground) notFound();

  const { campground, images } = data as {
    campground: {
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      owner_id: string;
    };
    images: { url: string }[];
  };

  if (campground.owner_id !== userId) redirect(`/campgrounds/${id}`);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Edit campground</h1>
      <EditCampgroundForm campground={campground} currentImageUrl={images[0]?.url ?? ""} />
    </div>
  );
}
