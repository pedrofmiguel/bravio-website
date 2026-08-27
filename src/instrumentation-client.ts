import { initBotId } from "botid/client/core";

/**
 * BotID client challenge.
 *
 * Runs before the app becomes interactive and attaches the challenge headers
 * to any request matching `protect`. Those headers are what checkBotId() reads
 * on the server, so this list and the routes that call checkBotId() have to
 * agree: a route checked on the server but missing here fails every request,
 * including real people.
 *
 * Only the enquiry POST is protected. Nothing else on the site writes anything.
 */
initBotId({
  protect: [{ path: "/api/contact", method: "POST" }],
});
