"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80";

export function NewCampgroundForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(25);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
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
    <form onSubmit={onSubmit} className="glass-card space-y-4 p-6">
      <label className="block text-sm font-medium text-(--text)">
        Title
        <input
          className="glass-input mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium text-(--text)">
        Location
        <input
          className="glass-input mt-1"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium text-(--text)">
        Description
        <textarea
          className="glass-input mt-1"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium text-(--text)">
        Price / night
        <input
          type="number"
          className="glass-input mt-1"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10))}
          min={0}
          required
        />
      </label>
      <label className="block text-sm font-medium text-(--text)">
        Image URL
        <input
          className="glass-input mt-1"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button type="submit" className="btn-primary">
        Create campground
      </button>
    </form>
  );
}
