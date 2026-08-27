import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

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

/**
 * withBotId adds the rewrites that proxy BotID's challenge script through this
 * origin. That is the point of it: served from a third party domain the script
 * is trivially blocked by ad blockers and privacy extensions, and a blocked
 * challenge means every real visitor starts failing the check.
 */
export default withBotId(nextConfig);
