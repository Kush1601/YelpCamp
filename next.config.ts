import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Node.js-only packages from being traced into the Edge middleware bundle.
  // cloudinary → sanitize-html → postcss all use Node.js APIs unavailable in V8 Edge Runtime.
  serverExternalPackages: ["cloudinary", "sanitize-html", "postcss"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
