/**
 * Demo fixtures — curated Egyptian relics with real coordinates so the map,
 * clustering, filter chips, quick-look card, and detail screen all have
 * something to render without a seeded backend.
 *
 * Gated by `flags.mockData` (see src/config/flags.ts). The places API functions
 * short-circuit to these when the flag is on; nothing else in the app is aware
 * of them. Shapes intentionally satisfy the Zod schemas in ../api/schemas.ts so
 * the same `zodParse` boundary that guards real responses also guards these.
 */
import type {
  Place,
  PlaceCategory,
  PlacePhoto,
  PlaceReview,
} from '../api/schemas';

/** Stable category ids referenced by the places below. */
export const CATEGORY_IDS = {
  monuments: 'cat-monuments',
  museums: 'cat-museums',
  religious: 'cat-religious',
  markets: 'cat-markets',
  nature: 'cat-nature',
} as const;

interface SeedPlace {
  id: string;
  name: string;
  description: string;
  categoryId: keyof typeof CATEGORY_IDS;
  latitude: number;
  longitude: number;
  ticketPrice: number;
  city: string;
  government: string;
  /** Unsplash photo ids (resolved to urls below). First is the hero/thumbnail. */
  photos: string[];
  ratings: number[];
}

/** A small pool of generic, reliable Unsplash shots reused across relics. */
function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;
}

const SEED: SeedPlace[] = [
  {
    id: '5873ca63-1961-5a2e-81ed-740b63ff305c',
    name: 'Pyramids of Giza',
    description:
      'The last surviving wonder of the ancient world — three royal tombs of the Fourth Dynasty rising from the desert plateau on the edge of Cairo.',
    categoryId: 'monuments',
    latitude: 29.9792,
    longitude: 31.1342,
    ticketPrice: 540,
    city: 'Giza',
    government: 'Giza',
    photos: ['1539768942893-daf53e448371', '1568322445389-f64ac2515020'],
    ratings: [5, 5, 4, 5, 5, 4, 5],
  },
  {
    id: 'a3957c40-5332-5222-8bbc-2e7ca7844578',
    name: 'Great Sphinx',
    description:
      'A limestone guardian with the body of a lion and the face of a king, watching over the Giza necropolis for some forty-five centuries.',
    categoryId: 'monuments',
    latitude: 29.9753,
    longitude: 31.1376,
    ticketPrice: 0,
    city: 'Giza',
    government: 'Giza',
    photos: ['1503177119275-0aa32b3a9368'],
    ratings: [5, 4, 5, 4, 5],
  },
  {
    id: 'f7257a13-b2ac-50dd-bb2f-3e78d2b0a9bc',
    name: 'Grand Egyptian Museum',
    description:
      "The world's largest archaeological museum devoted to a single civilisation, home to the complete Tutankhamun collection and a grand staircase of colossi.",
    categoryId: 'museums',
    latitude: 29.9939,
    longitude: 31.1192,
    ticketPrice: 1200,
    city: 'Giza',
    government: 'Giza',
    photos: ['1633113216073-d62a5dc2e766'],
    ratings: [5, 5, 5, 4, 5, 5],
  },
  {
    id: '4d6b523c-4482-5399-bb17-802a345f30dd',
    name: 'Egyptian Museum',
    description:
      "The historic red museum on Tahrir Square, holding tens of thousands of antiquities from across Egypt's dynastic past.",
    categoryId: 'museums',
    latitude: 30.0478,
    longitude: 31.2336,
    ticketPrice: 450,
    city: 'Cairo',
    government: 'Cairo',
    photos: ['1572252009286-268acec5ca0a'],
    ratings: [4, 5, 4, 4, 5],
  },
  {
    id: '179be764-22d5-50c7-9276-6a958ea256b3',
    name: 'Khan el-Khalili',
    description:
      'A labyrinthine medieval souk of coppersmiths, spice merchants, and lantern-lit cafés in the heart of Islamic Cairo.',
    categoryId: 'markets',
    latitude: 30.0477,
    longitude: 31.2622,
    ticketPrice: 0,
    city: 'Cairo',
    government: 'Cairo',
    photos: ['1601751818941-571144562ff8'],
    ratings: [4, 5, 4, 5, 4, 4],
  },
  {
    id: '2a34e40b-c6f1-56d5-bad8-8edc5bb8efed',
    name: 'Al-Azhar Mosque',
    description:
      'Founded in 970 CE, one of the oldest universities in the world and a serene courtyard of slender minarets.',
    categoryId: 'religious',
    latitude: 30.0459,
    longitude: 31.2625,
    ticketPrice: 0,
    city: 'Cairo',
    government: 'Cairo',
    photos: ['1591604129939-f1efa4d9f7fa'],
    ratings: [5, 5, 4, 5],
  },
  {
    id: '8ccbf6db-9054-588b-a9bf-053624cc33a5',
    name: 'Salah El-Din Citadel',
    description:
      'A medieval Islamic fortress crowned by the alabaster Mosque of Muhammad Ali, with sweeping views over the rooftops of Cairo.',
    categoryId: 'monuments',
    latitude: 30.0294,
    longitude: 31.261,
    ticketPrice: 450,
    city: 'Cairo',
    government: 'Cairo',
    photos: ['1572252009286-268acec5ca0a'],
    ratings: [5, 4, 5, 4, 5],
  },
  {
    id: '4537fe3a-f33f-5684-b2fb-39bbb05ddd92',
    name: 'The Hanging Church',
    description:
      'A Coptic basilica suspended above a Roman gatehouse in Old Cairo, its nave reached by a flight of twenty-nine steps.',
    categoryId: 'religious',
    latitude: 30.0058,
    longitude: 31.23,
    ticketPrice: 0,
    city: 'Cairo',
    government: 'Cairo',
    photos: ['1548013146-72479768bada'],
    ratings: [5, 4, 5, 5],
  },
  {
    id: 'dadcd7f7-1106-59f3-a776-c89efb459ba6',
    name: 'Luxor Temple',
    description:
      'A riverside temple complex begun by Amenhotep III, its avenue of sphinxes and colossal pylons glowing at dusk.',
    categoryId: 'monuments',
    latitude: 25.6995,
    longitude: 32.6391,
    ticketPrice: 400,
    city: 'Luxor',
    government: 'Luxor',
    photos: ['1568322445389-f64ac2515020'],
    ratings: [5, 5, 5, 4, 5],
  },
  {
    id: 'fc87da5e-dfeb-58e3-a00e-aab1dceac7b3',
    name: 'Karnak Temple',
    description:
      'The vast sacred precinct of Amun-Ra, whose Great Hypostyle Hall raises a forest of 134 towering papyrus columns.',
    categoryId: 'monuments',
    latitude: 25.7188,
    longitude: 32.6573,
    ticketPrice: 450,
    city: 'Luxor',
    government: 'Luxor',
    photos: ['1539650116574-75c0c6d73f6e'],
    ratings: [5, 5, 5, 5, 4],
  },
  {
    id: '911ad1a4-b465-5790-a2a7-9a135d2ac2e1',
    name: 'Valley of the Kings',
    description:
      'The royal burial ground of the New Kingdom, where painted tombs descend into the Theban hills on the west bank of the Nile.',
    categoryId: 'monuments',
    latitude: 25.7402,
    longitude: 32.6014,
    ticketPrice: 600,
    city: 'Luxor',
    government: 'Luxor',
    photos: ['1601925268262-0e3a3e6c8e8e'],
    ratings: [5, 4, 5, 5, 5],
  },
  {
    id: '05446deb-a035-5398-95bc-2e7a6e0aacbe',
    name: 'Abu Simbel Temples',
    description:
      'Twin rock temples of Ramesses II, relocated block by block above Lake Nasser to escape the rising waters of the High Dam.',
    categoryId: 'monuments',
    latitude: 22.3372,
    longitude: 31.6258,
    ticketPrice: 600,
    city: 'Abu Simbel',
    government: 'Aswan',
    photos: ['1590133324192-7d24f1a5d3a8'],
    ratings: [5, 5, 5, 5],
  },
  {
    id: '790d96e4-3526-58e9-a37a-b6981eb91f36',
    name: 'Philae Temple',
    description:
      'An island sanctuary of the goddess Isis, reached by boat across the Nile and saved from flooding by a UNESCO rescue.',
    categoryId: 'monuments',
    latitude: 24.0256,
    longitude: 32.8843,
    ticketPrice: 450,
    city: 'Aswan',
    government: 'Aswan',
    photos: ['1623073284788-0d846f75e329'],
    ratings: [5, 4, 5, 5],
  },
  {
    id: '403dd580-ceef-58f8-ab2f-39c5050d06a7',
    name: 'Bibliotheca Alexandrina',
    description:
      'A monumental modern library on the Mediterranean shore, reviving the legacy of the ancient Library of Alexandria.',
    categoryId: 'museums',
    latitude: 31.2089,
    longitude: 29.9092,
    ticketPrice: 70,
    city: 'Alexandria',
    government: 'Alexandria',
    photos: ['1568667256549-094345857637'],
    ratings: [5, 4, 5, 4, 5],
  },
  {
    id: '52dac043-a03b-5844-a2e2-ad99ac29bb81',
    name: 'Citadel of Qaitbay',
    description:
      'A 15th-century coastal fortress built on the ruins of the legendary Lighthouse of Alexandria, ringed by the sea.',
    categoryId: 'monuments',
    latitude: 31.2139,
    longitude: 29.8856,
    ticketPrice: 100,
    city: 'Alexandria',
    government: 'Alexandria',
    photos: ['1539768942893-daf53e448371'],
    ratings: [4, 5, 4, 5],
  },
  {
    id: 'aa26e659-7bfe-5e14-93a7-7498dd58a9d2',
    name: 'White Desert',
    description:
      'A surreal plain of wind-carved chalk formations glowing white under the moon — a national park deep in the Western Desert.',
    categoryId: 'nature',
    latitude: 27.2989,
    longitude: 28.1539,
    ticketPrice: 200,
    city: 'Farafra',
    government: 'New Valley',
    photos: ['1509316785289-025f5b846b35'],
    ratings: [5, 5, 4, 5],
  },
  {
    id: 'f4f28e37-c5c6-561e-bd32-ca2fc5af7301',
    name: 'Siwa Oasis',
    description:
      'A remote palm-fringed oasis near the Libyan border, famed for salt lakes, the Oracle of Amun, and mud-brick Shali fortress.',
    categoryId: 'nature',
    latitude: 29.2032,
    longitude: 25.5195,
    ticketPrice: 0,
    city: 'Siwa',
    government: 'Matrouh',
    photos: ['1473580044384-7ba9967e16a0'],
    ratings: [5, 5, 5, 4],
  },
  {
    id: 'b12d174e-6de7-5415-b132-4358cb0d3c28',
    name: 'Blue Hole, Dahab',
    description:
      'A world-renowned dive site on the Red Sea coast, a deep marine sinkhole rimmed by vivid coral.',
    categoryId: 'nature',
    latitude: 28.5721,
    longitude: 34.5375,
    ticketPrice: 0,
    city: 'Dahab',
    government: 'South Sinai',
    photos: ['1582967788606-a171c1080cb0'],
    ratings: [5, 4, 5, 5, 4],
  },
];

const CATEGORY_META: Record<keyof typeof CATEGORY_IDS, { name: string; description: string }> = {
  monuments: { name: 'Monuments', description: 'Temples, tombs, and ancient wonders.' },
  museums: { name: 'Museums', description: 'Collections and archives of antiquity.' },
  religious: { name: 'Religious Sites', description: 'Mosques, churches, and sanctuaries.' },
  markets: { name: 'Markets', description: 'Souks, bazaars, and trade quarters.' },
  nature: { name: 'Nature & Oases', description: 'Deserts, oases, and the Red Sea.' },
};

/** Full Place objects (nested address shape), matching `placeSchema`. */
export const MOCK_PLACES: Place[] = SEED.map((seed) => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  placeCategoryId: CATEGORY_IDS[seed.categoryId],
  categoryName: CATEGORY_META[seed.categoryId].name,
  ticketPrice: seed.ticketPrice,
  latitude: seed.latitude,
  longitude: seed.longitude,
  geoFenceRange: 150,
  address: {
    addressLine: null,
    government: seed.government,
    city: seed.city,
    country: 'Egypt',
  },
  vendorId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

/** Categories with derived `placeCount`, matching `placeCategorySchema`. */
export const MOCK_CATEGORIES: PlaceCategory[] = (
  Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_IDS)[]
).map((key) => ({
  id: CATEGORY_IDS[key],
  name: CATEGORY_META[key].name,
  description: CATEGORY_META[key].description,
  placeCount: SEED.filter((s) => s.categoryId === key).length,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

/** placeId → photos, matching `placePhotosSchema` (absolute urls). */
const PHOTOS_BY_PLACE: Record<string, PlacePhoto[]> = Object.fromEntries(
  SEED.map((seed) => [
    seed.id,
    seed.photos.map((photoId) => ({ placeId: seed.id, url: unsplash(photoId) })),
  ]),
);

/** placeId → reviews, matching `placeReviewsSchema`. */
const REVIEWS_BY_PLACE: Record<string, PlaceReview[]> = Object.fromEntries(
  SEED.map((seed) => [
    seed.id,
    seed.ratings.map((rating, index) => ({
      explorerId: `explorer-${index + 1}`,
      placeId: seed.id,
      checkInId: null,
      rating,
      comment: null,
      isVerified: true,
      placeName: seed.name,
    })),
  ]),
);

/**
 * Demo "already discovered" relics — used to seed the fog-of-war reveals when
 * mockData is on and there is no real check-in history, so the veil shows a few
 * cleared windows out of the box (Giza, Cairo, Luxor).
 */
export const MOCK_VISITED_PLACE_IDS: string[] = [
  '5873ca63-1961-5a2e-81ed-740b63ff305c',
  '4d6b523c-4482-5399-bb17-802a345f30dd',
  'fc87da5e-dfeb-58e3-a00e-aab1dceac7b3',
];

export function getMockPlaces(): Place[] {
  return MOCK_PLACES;
}

export function getMockPlace(id: string): Place | undefined {
  return MOCK_PLACES.find((place) => place.id === id);
}

export function getMockPlacesByCategory(categoryId: string): Place[] {
  return MOCK_PLACES.filter((place) => place.placeCategoryId === categoryId);
}

export function searchMockPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_PLACES;
  return MOCK_PLACES.filter((place) =>
    [place.name, place.description, place.categoryName, place.address?.city]
      .filter((field): field is string => !!field)
      .some((field) => field.toLowerCase().includes(q)),
  );
}

export function getMockPhotos(placeId: string): PlacePhoto[] {
  return PHOTOS_BY_PLACE[placeId] ?? [];
}

export function getMockReviews(placeId: string): PlaceReview[] {
  return REVIEWS_BY_PLACE[placeId] ?? [];
}
