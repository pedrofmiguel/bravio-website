/**
 * Single source of truth for every photograph and clip on the site.
 *
 * These are the real photographs now, not placeholders. The originals are
 * camera files kept outside the repository; what is in /public/media was made
 * from them by `node scripts/optimise-media.mjs "<originals dir>"`, which also
 * holds the mapping from camera filename to published name. Adding a frame
 * means adding it there, running the script, and adding an entry here.
 *
 * The shoot is entirely portrait - it was taken on a phone, at work, which is
 * honest about how this kitchen actually documents itself. `aspect` is
 * therefore a statement about the FRAME, not about the file: every layout
 * draws its box from this value and lets the photograph cover-crop into it.
 * That is why the value is chosen per picture rather than measured. A dish
 * shot square on survives being cut to a wide band; a hand holding a platter
 * against a garden does not, and is given an upright frame instead.
 *
 * Alt text describes what is actually in each frame.
 */

export type MediaKind = "image" | "video";

export type Media = {
  src: string;
  /** Poster frame. Required for video, ignored for images. */
  poster?: string;
  kind: MediaKind;
  /** The frame this photograph is drawn in. Not the file's own ratio. */
  aspect: "portrait" | "landscape" | "square" | "tall";
  alt: string;
};

export const ASPECT_RATIO: Record<Media["aspect"], number> = {
  portrait: 4 / 5,
  landscape: 3 / 2,
  square: 1,
  tall: 2 / 3,
};

const img = (file: string, aspect: Media["aspect"], alt: string): Media => ({
  src: `/media/${file}`,
  kind: "image",
  aspect,
  alt,
});

/* ---------------------------- services --------------------------------- */
/* One frame per service, in the order the section lists them: the private
   dinner, the celebration, the residency. Each is the clearest picture of
   that job rather than the prettiest picture available. */

export const SERVICE_MEDIA: Media[] = [
  img(
    "place-setting.jpg",
    "portrait",
    "A place setting of blue and white china with gold cutlery and a yellow napkin, hydrangeas behind"
  ),
  img(
    "long-table-trees.jpg",
    "landscape",
    "A long table laid with dishes and hydrangeas under trees, in dappled light"
  ),
  img(
    "plate-over-the-valley.jpg",
    "portrait",
    "A plate of bruschetta and tartlets held up beside a pool, terraced hillsides behind"
  ),
];

/* ------------------------- the story gallery --------------------------- */
/* Order is the composition. The story page walks a hand-placed grid of twelve
   frames and takes each ratio from its slot, so this array is sequenced to put
   the pictures that survive a wide cut - the overhead tables, the buffets - in
   the slots that ask for one, and the upright subjects in the tall ones.
   Reordering recomposes both this and the home page's rail.

   Add { kind: "video", src, poster, aspect, alt } entries and the same grid
   plays them inline, muted and looping. */

export const GALLERY: Media[] = [
  img(
    "table-blue-runner.jpg",
    "portrait",
    "A long table set with blue and white china and hydrangeas along a blue runner"
  ),
  img(
    "table-spread-overhead.jpg",
    "landscape",
    "An overhead spread of tomato salad, terrine and glassware down a blue table runner"
  ),
  img(
    "fried-fish-platter.jpg",
    "tall",
    "An oval platter of fried fish with tomatoes and coriander, held over a lawn"
  ),
  img(
    "garden-buffet-tartlets.jpg",
    "landscape",
    "A garden buffet on a gingham cloth: flatbread crisps, hydrangeas and cream tartlets"
  ),
  img(
    "tomato-salad.jpg",
    "square",
    "Chopped tomato salad dressed with herbs in a green cabbage leaf bowl"
  ),
  img(
    "flatbreads-tray.jpg",
    "portrait",
    "A tray of flatbreads with pulled pork and pickled cabbage, held up on a lawn"
  ),
  img(
    "garden-buffet-overhead.jpg",
    "landscape",
    "An overhead garden buffet on a gingham cloth, hydrangeas set among the dishes"
  ),
  img(
    "pea-shoot-canapes.jpg",
    "square",
    "Canapes piped with saffron cream and pea shoots on a dark tray"
  ),
  img(
    "toasted-sandwiches.jpg",
    "tall",
    "A metal platter of toasted sandwiches held over grass"
  ),
  img(
    "raspberry-desserts.jpg",
    "portrait",
    "Sponge and raspberry desserts rolled in freeze dried fruit"
  ),
  img(
    "strawberry-coupes.jpg",
    "landscape",
    "Strawberry desserts in coupe glasses on a white cloth, in low sun"
  ),
  img(
    "empanadas-box.jpg",
    "square",
    "Fried empanadas with herb sauce, lined up in a long wooden box"
  ),
];

/**
 * Everything, for the story page.
 *
 * The home page's rail is pinned while it pans, so its length is scroll the
 * visitor has to spend: twelve frames is the most it can carry before the
 * section outstays the rest of the page. The story page has no such ceiling -
 * it is the archive - so it shows these as well, in the half width frames the
 * grid falls back to past its twelfth slot.
 */
export const ARCHIVE: Media[] = [
  ...GALLERY,
  img(
    "chicken-and-peas.jpg",
    "portrait",
    "Roast chicken thighs in sauce with peas on a scalloped platter"
  ),
  img(
    "cured-meats-and-cherries.jpg",
    "square",
    "Thin sliced cured meats with cherries in a wide bowl"
  ),
  img(
    "beef-rolls-platter.jpg",
    "portrait",
    "A platter of rolled beef with cream and onion, held up in a garden"
  ),
  img(
    "meringues-and-pearls.jpg",
    "portrait",
    "Meringue shells filled with cream and black pearls, in a wooden box"
  ),
  img(
    "salmon-tartlets.jpg",
    "square",
    "Tartlets of smoked salmon and spring onion on a glass plate"
  ),
  img(
    "beef-carpaccio.jpg",
    "tall",
    "Plates of thin sliced beef with cherries and toasted crumbs"
  ),
];

export const CHEF_PORTRAIT: Media = img(
  "bowl-and-rosemary.jpg",
  "portrait",
  "A bowl of golden puree finished with herb oil, held against a flowering rosemary hedge"
);
