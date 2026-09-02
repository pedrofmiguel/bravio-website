import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  images: {
    // Every photograph is served from /public/media now, so there is no remote
    // pattern to allow. Leaving one open would let any URL under that host be
    // proxied through this site's optimiser.
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
