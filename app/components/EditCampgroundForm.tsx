"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  campground: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
  };
  currentImageUrl: string;
};

export function EditCampgroundForm({ campground, currentImageUrl }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(campground.title);
  const [location, setLocation] = useState(campground.location);
  const [description, setDescription] = useState(campground.description);
  const [price, setPrice] = useState(campground.price);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/campgrounds/${campground.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, description, price, imageUrl }),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to update");
      return;
    }
    router.push(`/campgrounds/${campground.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this campground permanently?")) return;
    const res = await fetch(`/api/campgrounds/${campground.id}`, { method: "DELETE" });
    if (res.ok) router.push("/campgrounds");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium">
        Title
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Location
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Description
        <textarea
          className="mt-1 w-full rounded border px-2 py-1"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Price / night
        <input
          type="number"
          className="mt-1 w-full rounded border px-2 py-1"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10))}
          min={0}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Image URL
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-red-700 underline"
        >
          Delete campground
        </button>
      </div>
    </form>
  );
}
