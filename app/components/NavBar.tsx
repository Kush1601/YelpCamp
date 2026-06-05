"use client";

import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export function NavBar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b border-emerald-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-emerald-900">
          YelpCamp
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-emerald-900">
          <Link href="/campgrounds">Campgrounds</Link>
          <Link href="/search">Search</Link>
          <Link href="/nearby">Nearby</Link>
          {isSignedIn ? (
            <>
              <Link href="/campgrounds/new">New</Link>
              <Link href="/dashboard">Dashboard</Link>
              <UserButton />
            </>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="rounded-md bg-emerald-800 px-3 py-1.5 text-white">
                Sign in
              </button>
            </SignInButton>
          )}
        </nav>
      </div>
    </header>
  );
}
