/**
 * Single source of truth for every photograph and clip on the site.
 *
 * SWAPPING IN THE REAL SHOOT
 * --------------------------
 * Drop the files into /public/media and change `src` to "/media/your-file.jpg".
 * Nothing else needs to move: every layout reads `aspect` from here, so the
 * compositions keep their rhythm regardless of the file behind them.
 *
 * Placeholders are real open-licence photography from Unsplash, picked by eye
 * for the low-key register the brand board implies. Alt text describes what is
 * actually in each frame, so it stays accurate until the real photos land.
 *
 * The course names in the copy are the brand's own. The placeholder dishes
 * only loosely match them, which is expected: the real plates get shot later.
 */

export type MediaKind = "image" | "video";

export type Media = {
  src: string;
  /** Poster frame. Required for video, ignored for images. */
  poster?: string;
  kind: MediaKind;
  /** Intrinsic ratio, used to reserve space and keep CLS at zero. */
  aspect: "portrait" | "landscape" | "square" | "tall";
  alt: string;
};

export const ASPECT_RATIO: Record<Media["aspect"], number> = {
  portrait: 4 / 5,
  landscape: 3 / 2,
  square: 1,
  tall: 2 / 3,
};

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

const img = (
  id: string,
  aspect: Media["aspect"],
  alt: string,
  w?: number
): Media => ({ src: unsplash(id, w), kind: "image", aspect, alt });

/* Named so a frame can be reused across sections without repeating the id. */
const SHOT = {
  tableCourse: "1414235077428-338989a2e8c0",
  overheadPlates: "1504674900247-0877df9cc836",
  chefHands: "1551218808-94e220e084d2",
  fishDark: "1519708227418-c8fd9a32b7a2",
  chefFlame: "1600565193348-f74bd3c7ccdf",
  produce: "1466637574441-749b8f19452f",
  fishPlated: "1467003909585-2f8a72700288",
  boardMeat: "1544025162-d76694265947",
  dessert: "1529543544282-ea669407fca3",
  clams: "1595295333158-4742f28fbd85",
  moodyDish: "1476224203421-9ac39bcb3327",
  longTable: "1519225421980-715cb0215aed",
  sharingPlatter: "1555939594-58d7cb561ad1",
  darkPlate: "1543826173-70651703c5a4",
  cheese: "1486297678162-eb2a19b0a32d",
  sweet: "1551024506-0bccd828d307",
} as const;

/* ----------------------------- hero ----------------------------------- */

export const HERO: Media = img(
  SHOT.tableCourse,
  "portrait",
  "A plated course set down on a candlelit dining table",
  1800
);

/* ----------------------------- courses --------------------------------- */
/* The sample menu, in service order. Index matches t.table.courses, so adding
   a plate here means adding its name to the dictionary too. */

export const COURSES: Media[] = [
  img(SHOT.fishPlated, "portrait", "White fish plated with greens and sauce"),
  img(SHOT.clams, "portrait", "Clams and pasta in a shallow bowl"),
  img(SHOT.fishDark, "portrait", "Seared fish on a dark plate"),
  img(SHOT.darkPlate, "portrait", "A composed plate finished with a sauce"),
  img(SHOT.boardMeat, "portrait", "Roasted meat carved onto a wooden board"),
  img(SHOT.sharingPlatter, "portrait", "A sharing platter of grilled meat and vegetables"),
  img(SHOT.cheese, "portrait", "Whole wheels of raw sheep cheese"),
  img(SHOT.sweet, "portrait", "A plated dessert with caramel"),
];

/* ---------------------------- services --------------------------------- */

export const SERVICE_MEDIA: Media[] = [
  img(SHOT.overheadPlates, "landscape", "An overhead spread of plates on dark wood"),
  img(SHOT.longTable, "landscape", "A long table laid with flowers and glassware for a celebration"),
  img(SHOT.chefHands, "landscape", "A chef's hands working through prep"),
];

/* ---------------------------- sourcing --------------------------------- */

export const SOURCING: Media = img(
  SHOT.produce,
  "landscape",
  "Vegetables, eggs and herbs laid out on a board",
  1600
);

/* ------------------------- the story gallery --------------------------- */
/* Mixed ratios on purpose. Reordering this array recomposes the page.
   Add { kind: "video", src, poster, aspect, alt } entries and the same grid
   plays them inline, muted and looping. */

export const GALLERY: Media[] = [
  img(SHOT.tableCourse, "portrait", "A plated course at a candlelit table"),
  img(SHOT.boardMeat, "landscape", "Roasted meat carved onto a wooden board"),
  img(SHOT.chefHands, "tall", "A chef's hands working through prep"),
  img(SHOT.longTable, "landscape", "A long table laid with flowers and glassware"),
  img(SHOT.fishDark, "square", "Seared fish on a dark plate"),
  img(SHOT.chefFlame, "portrait", "A chef finishing a dish over open flame"),
  img(SHOT.produce, "landscape", "Produce laid out before service"),
  img(SHOT.fishPlated, "square", "White fish plated with greens and sauce"),
  img(SHOT.sharingPlatter, "tall", "A large sharing platter of grilled meat and vegetables"),
  img(SHOT.dessert, "portrait", "A plated dessert finished at the table"),
  img(SHOT.clams, "landscape", "Clams and pasta in a shallow bowl"),
  img(SHOT.moodyDish, "square", "A dark, slow cooked dish"),
];

export const CHEF_PORTRAIT: Media = img(
  SHOT.chefFlame,
  "portrait",
  "A chef finishing a dish over open flame",
  1200
);
