"use client";

import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export function NavBar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-(--surface-border) bg-(--surface) backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className="bg-linear-to-r from-(--accent) to-(--accent-2) bg-clip-text text-lg font-bold tracking-tight text-transparent"
        >
          YelpCamp
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-(--text)">
          <Link href="/campgrounds" className="transition hover:opacity-70">Campgrounds</Link>
          <Link href="/search" className="transition hover:opacity-70">Search</Link>
          <Link href="/nearby" className="transition hover:opacity-70">Nearby</Link>
          {isSignedIn ? (
            <>
              <Link href="/campgrounds/new" className="transition hover:opacity-70">New</Link>
              <Link href="/dashboard" className="transition hover:opacity-70">Dashboard</Link>
              <ThemeToggle />
              <UserButton />
            </>
          ) : (
            <>
              <ThemeToggle />
              <SignInButton mode="modal">
                <button type="button" className="btn-primary px-3.5! py-1.5! text-sm">
                  Sign in
                </button>
              </SignInButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
