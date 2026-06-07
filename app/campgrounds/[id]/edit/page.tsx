import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { EditCampgroundForm } from "@/app/components/EditCampgroundForm";
import { queryRaw } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

async function getCampground(id: string) {
  try {
    const rows = await queryRaw<{
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      owner_id: string;
    }>(
      `SELECT id, title, description, price, location, owner_id
       FROM campgrounds WHERE id = $1`,
      [id]
    );
    if (!rows.length) return null;

    const images = await queryRaw<{ url: string }>(
      `SELECT url FROM campground_images WHERE campground_id = $1`,
      [id]
    );

    return { campground: rows[0], images };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function EditCampgroundPage({ params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getCampground(id);
  if (!data?.campground) notFound();

  const { campground, images } = data;

  if (campground.owner_id !== userId) redirect(`/campgrounds/${id}`);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Edit campground</h1>
      <EditCampgroundForm campground={campground} currentImageUrl={images[0]?.url ?? ""} />
    </div>
  );
}
