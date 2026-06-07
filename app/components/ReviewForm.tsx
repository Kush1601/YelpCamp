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
      <label className="flex flex-col gap-1.5 text-sm font-medium text-(--text)">
        Rating
        <select
          className="glass-input"
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
      <label className="flex flex-col gap-1.5 text-sm font-medium text-(--text)">
        Review
        <textarea
          className="glass-input"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn-primary px-3.5! py-1.5! text-sm">
        Submit review
      </button>
      {status ? <p className="text-xs text-muted">{status}</p> : null}
    </form>
  );
}
