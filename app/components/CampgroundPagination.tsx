"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Props = { currentPage: number; totalPages: number; total: number };

export function CampgroundPagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-1 text-sm text-(--text) backdrop-blur transition hover:bg-(--surface-strong) disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={
              p === currentPage
                ? "btn-primary px-3! py-1! text-sm"
                : "rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-1 text-sm text-(--text) backdrop-blur transition hover:bg-(--surface-strong)"
            }
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-1 text-sm text-(--text) backdrop-blur transition hover:bg-(--surface-strong) disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
