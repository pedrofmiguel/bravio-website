import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography lives on Unsplash. When the real shoot is dropped
    // into /public/media this block can go away entirely.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
