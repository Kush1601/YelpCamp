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
        className="rounded px-3 py-1 text-sm border border-emerald-900/20 disabled:opacity-40 hover:bg-emerald-50"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-emerald-800/50">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`rounded px-3 py-1 text-sm border ${
              p === currentPage
                ? "bg-emerald-800 text-white border-emerald-800"
                : "border-emerald-900/20 hover:bg-emerald-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded px-3 py-1 text-sm border border-emerald-900/20 disabled:opacity-40 hover:bg-emerald-50"
      >
        Next
      </button>
    </div>
  );
}
