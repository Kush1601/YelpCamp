import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" is for Docker/custom server only — Vercel handles bundling itself
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
