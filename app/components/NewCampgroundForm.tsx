"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewCampgroundForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(25);
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/campgrounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, description, price, imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create");
      return;
    }
    router.push(`/campgrounds/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      {["title", "location", "description"].map((field) => (
        <label key={field} className="block text-sm font-medium capitalize">
          {field}
          {field === "description" ? (
            <textarea
              className="mt-1 w-full rounded border px-2 py-1"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          ) : (
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={field === "title" ? title : location}
              onChange={(e) => (field === "title" ? setTitle(e.target.value) : setLocation(e.target.value))}
              required
            />
          )}
        </label>
      ))}
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
      <button type="submit" className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white">
        Create campground
      </button>
    </form>
  );
}
