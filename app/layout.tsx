import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NavBar } from "@/app/components/NavBar";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "YelpCamp",
  description: "Discover and review campgrounds with maps, search, and owner analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="min-h-screen antialiased">
          <ThemeProvider>
            {/* Ambient gradient orbs behind all content */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div
                className="orb"
                style={{ top: "-8rem", left: "-6rem", height: "28rem", width: "28rem", background: "var(--bg-grad-1)" }}
              />
              <div
                className="orb"
                style={{ top: "20%", right: "-8rem", height: "26rem", width: "26rem", background: "var(--bg-grad-3)" }}
              />
              <div
                className="orb"
                style={{ bottom: "-10rem", left: "30%", height: "30rem", width: "30rem", background: "var(--bg-grad-2)" }}
              />
            </div>

            <NavBar />
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
