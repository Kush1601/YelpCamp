"use client";

import { useState } from "react";

export function ReviewForm({ campgroundId }: { campgroundId: string }) {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campgroundId, rating, body }),
    });
    if (res.ok) {
      setStatus("Posted — refresh to see it on the list.");
      setBody("");
    } else {
      setStatus("Sign in to post a review.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label className="block text-sm font-medium">
        Rating
        <select
          className="mt-1 w-full rounded border border-emerald-900/20 px-2 py-1"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value, 10))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Review
        <textarea
          className="mt-1 w-full rounded border border-emerald-900/20 px-2 py-1"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="rounded bg-emerald-800 px-3 py-1.5 text-sm text-white">
        Submit review
      </button>
      {status ? <p className="text-xs text-emerald-800">{status}</p> : null}
    </form>
  );
}
