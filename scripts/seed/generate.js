/*
 * Rahal demo-data seed GENERATOR.
 *
 * Emits a single deterministic SQL file (rahal_demo_seed.sql) that wipes the
 * app-domain tables and reseeds a rich, fully-linked demo dataset directly into
 * the Dockerized Postgres `Rahal` DB. Run:  node scripts/seed/generate.js
 * then apply the SQL (see scripts/seed/README / SEEDED_DATA.md).
 *
 * Why a generator instead of hand-written SQL: the link tables (likes, follows,
 * comments, check-ins) need hundreds of rows with valid FKs. Generating them in
 * JS keeps every id deterministic and every reference guaranteed-valid.
 *
 * KEY BACKEND FACTS baked in (verified against the live schema on 2026-07-04):
 *   - UserType enum:   Explorer=1, Admin=2, Vendor=3   (renumbered 2026-07-03)
 *   - Role ids are fixed rows in users.AspNetRoles (queried live, pinned below).
 *   - Password hash below == "Password123!" (ASP.NET Identity v3, copied from a
 *     known-good user). Every seeded account shares it and is EmailConfirmed.
 *   - Enum columns stored as TEXT hold the .NET enum NAME (e.g. 'FixedAmount',
 *     'Claimed', 'Active', 'Succeeded'); enum columns stored as INT hold the
 *     ordinal (CheckIn ValidationStatus Verified=1, Challenge Approved=1, etc).
 *   - Coupon.VendorId == the vendor's *user id* (VendorProfiles PK = UserId).
 *   - ExplorerProfiles PK = UserId; UserStats.ExplorerProfileId = that UserId.
 *   - Frontend derives Level = floor(cumXp/1000)+1 (XP_PER_LEVEL=1000); we set
 *     ExplorerProfiles.Level to match so both agree.
 */

'use strict';
const fs = require('fs');
const path = require('path');

// ── Constants pinned from the live DB ───────────────────────────────────────
const PW = 'AQAAAAIAAYagAAAAEM57rziEXTSvrWgu0Nh2x7q4ur50JPLsDAG6AdF+DhsJ1AUTMDHe3FLGPQ3PCKIF8Q=='; // "Password123!"
const PASSWORD_PLAINTEXT = 'Password123!';
const ROLE = {
  Explorer: '019f1408-b882-78b3-8697-7f5d5aecadd6',
  Admin: '019f1408-b90b-7487-b727-e438d11ad805',
  Vendor: '019f1408-b919-727f-91a6-74e3d561abf6',
};
const USERTYPE = { Explorer: 1, Admin: 2, Vendor: 3 };

// Existing reference rows we reuse (not wiped).
const PLACE_CAT = {
  Historical: 'a1111111-1111-1111-1111-111111111111',
  Museums: 'a2222222-2222-2222-2222-222222222222',
  Religious: 'a3333333-3333-3333-3333-333333333333',
  Beaches: 'a4444444-4444-4444-4444-444444444444',
  Mountains: 'a5555555-5555-5555-5555-555555555555',
  Parks: 'a6666666-6666-6666-6666-666666666666',
  Natural: 'a7777777-7777-7777-7777-777777777777',
  Landmarks: 'b8888888-8888-8888-8888-888888888888',
  Cultural: 'b7777777-7777-7777-7777-777777777777',
  Adventure: 'b6666666-6666-6666-6666-666666666666',
  Markets: 'b3333333-3333-3333-3333-333333333333',
  Viewpoints: 'c5555555-5555-5555-5555-555555555555',
};
const VENDOR_CAT = {
  Cafes: 'd0d00000-0000-4000-8000-000000000001',
  Tours: 'd0d00000-0000-4000-8000-000000000002',
  Shops: 'd0d00000-0000-4000-8000-000000000003',
  Dive: 'd0d00000-0000-4000-8000-000000000004',
};
const PLAN_TIER = 'abac95e4-0114-42de-b04a-552065318ba3'; // "Archivist"
const CRITERIA = {
  TOTAL_XP: '75a375dd-cd4c-41c9-af6d-617dcf953694',
  TOTAL_CHECKINS: '94bbc1df-dcf5-4f45-ad70-3b43c3990e18',
  TOTAL_CHALLENGES: '7aa1f18b-8abc-4ab6-a18b-3ff25c62888c',
  TOTAL_BADGES: '662b7139-bb99-4059-871e-20446bd634d9',
  LONGEST_STREAK: '8f078d97-92dc-4532-a797-6d9a76042a01',
  TOTAL_ACHIEVEMENTS: '9bf9f103-5133-4afd-ab40-3018a2d6b441',
};

// ── Deterministic uuid helpers (valid 8-4-4-4-12, v4 nibble) ────────────────
const hex = (n, w) => n.toString(16).padStart(w, '0');
const uid = (prefix, n) => `${prefix}-0000-4000-8000-${hex(n, 12)}`;
const EXPLORER = (n) => uid('e0a00000', n);
const VENDOR = (n) => uid('d0a00000', n);
const ADMIN = (n) => uid('ad000000', n);
const PLACE = (n) => uid('51ace000', n);
const PHOTO = (n) => uid('61a07000', n);
const REVIEW = (n) => uid('4ea1e000', n);
const CHALLENGE = (n) => uid('c4a11e00', n);
const CHECKIN = (n) => uid('c6ec0000', n);
const CIC = (n) => uid('c1cc0000', n); // CheckInChallenge
const POST = (n) => uid('90570000', n);
const COMMENT = (n) => uid('c0a70000', n);
const COUPON = (n) => uid('c0c00000', n);
const USERCOUPON = (n) => uid('05e7c000', n);
const SUB = (n) => uid('5002c000', n);
const TRAVEL = (n) => uid('74a1e000', n);
const PAYMENT = (n) => uid('9a4e0000', n);
const NOTIF = (n) => uid('40717000', n);
const XPTX = (n) => uid('80700000', n);

// tiny seeded PRNG so runs are reproducible
let _s = 1337;
const rnd = () => {
  _s = (_s * 1103515245 + 12345) & 0x7fffffff;
  return _s / 0x7fffffff;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const rint = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const q = (s) => (s === null || s === undefined ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const jsonArr = (arr) => `'${JSON.stringify(arr).replace(/'/g, "''")}'::jsonb`;
// timestamp N days ago (deterministic, no now() drift between rows we relate)
const daysAgo = (d, h = 12) => `(now() - interval '${d} days ${h} hours')`;

// ── DATA: Explorers ─────────────────────────────────────────────────────────
const explorerNames = [
  ['Layla Hassan', 'Female'], ['Omar Farouk', 'Male'], ['Nour Adel', 'Female'],
  ['Youssef Mansour', 'Male'], ['Mariam Saleh', 'Female'], ['Karim Adel', 'Male'],
  ['Salma Ibrahim', 'Female'], ['Tarek Nabil', 'Male'], ['Habiba Wael', 'Female'],
  ['Ali Mostafa', 'Male'], ['Dina Kamal', 'Female'], ['Hany Sobhy', 'Male'],
  ['Farida Ashraf', 'Female'], ['Seif Gamal', 'Male'], ['Rana Sherif', 'Female'],
  ['Mostafa Zaki', 'Male'], ['Yasmin Fouad', 'Female'], ['Khaled Reda', 'Male'],
  ['Aya Magdy', 'Female'], ['Amir Talaat', 'Male'],
];
const bios = [
  'Chasing golden hour across Egypt, one relic at a time.',
  'Archivist of quiet places. Desert > everything.',
  'Diver, hiker, occasional temple wanderer.',
  'Collecting sunsets and stamps in my exploration journal.',
  'Cairo-born, Nile-bound. Always packing light.',
  'Here for the ruins, the reefs, and the long roads between.',
  null, null,
];
const explorers = explorerNames.map(([name, gender], i) => {
  const n = i + 1;
  const cumXp = [3420, 2180, 640, 5210, 410, 1890, 2760, 980, 720, 4560, 1310, 1620,
    3050, 250, 2440, 890, 3980, 1150, 560, 2010][i];
  const premium = [true, true, false, true, false, false, true, false, false, true,
    false, false, true, false, true, false, true, false, false, false][i];
  const level = Math.floor(cumXp / 1000) + 1;
  return {
    n, id: EXPLORER(n), name,
    email: name.split(' ')[0].toLowerCase() + '.demo@rahal.test',
    gender, premium, cumXp, level,
    availXp: Math.max(0, cumXp - rint(0, Math.min(cumXp, 800))),
    country: 'EG',
    birth: `19${rint(85, 99)}-${String(rint(1, 12)).padStart(2, '0')}-${String(rint(1, 28)).padStart(2, '0')}`,
    bio: bios[i % bios.length],
    avatar: `https://i.pravatar.cc/400?img=${(n * 3) % 70}`,
    streak: rint(0, 14),
  };
});

// ── DATA: Vendors ───────────────────────────────────────────────────────────
const vendors = [
  { n: 1, name: 'Sahara Bean Café', email: 'sahara.vendor@rahal.test', cat: VENDOR_CAT.Cafes, addr: 'Road 9, Maadi, Cairo', hours: 'Daily 8:00–23:00' },
  { n: 2, name: 'Nile Pearl Cruises', email: 'nile.vendor@rahal.test', cat: VENDOR_CAT.Tours, addr: 'Corniche El Nil, Aswan', hours: 'Daily 9:00–20:00' },
  { n: 3, name: 'Khan Relics Bazaar', email: 'khan.vendor@rahal.test', cat: VENDOR_CAT.Shops, addr: 'Khan el-Khalili, Islamic Cairo', hours: 'Sat–Thu 10:00–22:00' },
  { n: 4, name: 'Red Sea Divers Co.', email: 'red.vendor@rahal.test', cat: VENDOR_CAT.Dive, addr: 'Masbat Bay, Dahab, South Sinai', hours: 'Daily 7:00–18:00' },
  { n: 5, name: 'Luxor Balloon Rides', email: 'luxor.vendor@rahal.test', cat: VENDOR_CAT.Tours, addr: 'West Bank, Luxor', hours: 'Daily 5:00–9:00' },
].map((v) => ({ ...v, id: VENDOR(v.n), avatar: `https://picsum.photos/seed/vendor${v.n}/400/400` }));

// ── DATA: Admins ────────────────────────────────────────────────────────────
const admins = [
  { n: 1, name: 'Rahal Admin', email: 'admin@rahal.test' },
  { n: 2, name: 'Content Moderator', email: 'moderator@rahal.test' },
  { n: 3, name: 'Ops Curator', email: 'curator@rahal.test' },
].map((a) => ({ ...a, id: ADMIN(a.n) }));

// ── DATA: Places (real Egyptian sites w/ real coords) ───────────────────────
const placesRaw = [
  ['Pyramids of Giza', PLACE_CAT.Historical, 29.9792, 31.1342, 'Al Haram', 'Giza', 'Giza'],
  ['Great Sphinx of Giza', PLACE_CAT.Historical, 29.9753, 31.1376, 'Al Haram', 'Giza', 'Giza'],
  ['Egyptian Museum', PLACE_CAT.Museums, 30.0478, 31.2336, 'Tahrir Square', 'Cairo', 'Cairo'],
  ['Grand Egyptian Museum', PLACE_CAT.Museums, 29.9939, 31.1196, 'Alexandria Desert Rd', 'Giza', 'Giza'],
  ['Khan el-Khalili', PLACE_CAT.Markets, 30.0477, 31.2622, 'El-Gamaleya', 'Cairo', 'Cairo'],
  ['Cairo Tower', PLACE_CAT.Landmarks, 30.0459, 31.2243, 'Zamalek', 'Cairo', 'Cairo'],
  ['Mosque of Ibn Tulun', PLACE_CAT.Religious, 30.0287, 31.2497, 'Sayeda Zeinab', 'Cairo', 'Cairo'],
  ['Sultan Hassan Mosque', PLACE_CAT.Religious, 30.0322, 31.2562, 'Al Darb Al Ahmar', 'Cairo', 'Cairo'],
  ['Al-Azhar Park', PLACE_CAT.Parks, 30.0405, 31.2645, 'El-Darb El-Ahmar', 'Cairo', 'Cairo'],
  ['Baron Empain Palace', PLACE_CAT.Historical, 30.0904, 31.3211, 'Heliopolis', 'Cairo', 'Cairo'],
  ['Temple of Hatshepsut', PLACE_CAT.Historical, 25.738, 32.6065, 'Deir el-Bahari', 'Luxor', 'Luxor'],
  ['Karnak Temple', PLACE_CAT.Historical, 25.7188, 32.6573, 'El-Karnak', 'Luxor', 'Luxor'],
  ['Luxor Temple', PLACE_CAT.Historical, 25.6995, 32.6392, 'Corniche', 'Luxor', 'Luxor'],
  ['Valley of the Kings', PLACE_CAT.Historical, 25.7402, 32.6014, 'West Bank', 'Luxor', 'Luxor'],
  ['Colossi of Memnon', PLACE_CAT.Historical, 25.7206, 32.6105, 'West Bank', 'Luxor', 'Luxor'],
  ['Temple of Horus (Edfu)', PLACE_CAT.Historical, 24.9779, 32.8732, 'Edfu', 'Aswan', 'Edfu'],
  ['Kom Ombo Temple', PLACE_CAT.Historical, 24.4522, 32.9281, 'Kom Ombo', 'Aswan', 'Kom Ombo'],
  ['Philae Temple', PLACE_CAT.Historical, 24.0256, 32.8843, 'Agilkia Island', 'Aswan', 'Aswan'],
  ['Unfinished Obelisk', PLACE_CAT.Historical, 24.0784, 32.8956, 'Northern Quarries', 'Aswan', 'Aswan'],
  ['Aswan High Dam', PLACE_CAT.Landmarks, 23.9707, 32.8773, 'Aswan', 'Aswan', 'Aswan'],
  ['Nubian Museum', PLACE_CAT.Museums, 24.0833, 32.8997, 'Sheyakhah Thaletha', 'Aswan', 'Aswan'],
  ['Abu Simbel Temples', PLACE_CAT.Historical, 22.3372, 31.6258, 'Abu Simbel', 'Aswan', 'Abu Simbel'],
  ["Saint Catherine's Monastery", PLACE_CAT.Religious, 28.5559, 33.976, 'Saint Catherine', 'South Sinai', 'Saint Catherine'],
  ['Mount Sinai', PLACE_CAT.Mountains, 28.5394, 33.975, 'Saint Catherine', 'South Sinai', 'Saint Catherine'],
  ['Ras Muhammad National Park', PLACE_CAT.Natural, 27.7333, 34.25, 'Ras Muhammad', 'South Sinai', 'Sharm El Sheikh'],
  ['Blue Hole Dahab', PLACE_CAT.Adventure, 28.5721, 34.5372, 'Dahab', 'South Sinai', 'Dahab'],
  ['Montaza Palace', PLACE_CAT.Historical, 31.2887, 30.0156, 'Montaza', 'Alexandria', 'Alexandria'],
  ['Bibliotheca Alexandrina', PLACE_CAT.Cultural, 31.2089, 29.9092, 'Chatby', 'Alexandria', 'Alexandria'],
  ['Catacombs of Kom El Shoqafa', PLACE_CAT.Historical, 31.1782, 29.8923, 'Karmouz', 'Alexandria', 'Alexandria'],
  ['Citadel of Qaitbay', PLACE_CAT.Historical, 31.2137, 29.8856, 'Eastern Harbour', 'Alexandria', 'Alexandria'],
  ['Wadi El Rayan', PLACE_CAT.Natural, 29.2, 30.4167, 'Wadi El Rayan', 'Faiyum', 'Faiyum'],
  ['Wadi Al-Hitan (Whale Valley)', PLACE_CAT.Natural, 29.2667, 30.0417, 'Wadi El Hitan', 'Faiyum', 'Faiyum'],
  ['White Desert', PLACE_CAT.Natural, 27.3833, 28.15, 'Farafra', 'New Valley', 'Farafra'],
  ['Siwa Oasis', PLACE_CAT.Natural, 29.2032, 25.5195, 'Siwa', 'Matrouh', 'Siwa'],
  ['El Gouna Marina', PLACE_CAT.Viewpoints, 27.3954, 33.6783, 'El Gouna', 'Red Sea', 'Hurghada'],
];
const places = placesRaw.map(([name, cat, lat, lng, line, gov, city], i) => ({
  n: i + 1, id: PLACE(i + 1), name, cat, lat, lng, line, gov, city,
  geofence: [50, 80, 100, 150, 200][i % 5],
}));
// "Never-checked-into" pinned demo location for a live successful check-in.
const PINNED_PLACE = places.find((p) => p.name === 'Baron Empain Palace');

const placeBlurb = (p) =>
  `${p.name} — a Rahal-curated relic in ${p.gov}. Catalogued for explorers who prefer discovery over spectacle.`;

// Category id -> the actual DB category Name (for the Meilisearch document).
const CAT_NAME = {
  [PLACE_CAT.Historical]: 'Historical Sites', [PLACE_CAT.Museums]: 'Museums',
  [PLACE_CAT.Religious]: 'Religious Sites', [PLACE_CAT.Beaches]: 'Beaches',
  [PLACE_CAT.Mountains]: 'Mountains', [PLACE_CAT.Parks]: 'Parks and Gardens',
  [PLACE_CAT.Natural]: 'Natural Wonders', [PLACE_CAT.Landmarks]: 'Landmarks',
  [PLACE_CAT.Cultural]: 'Cultural Centers', [PLACE_CAT.Adventure]: 'Adventure Activities',
  [PLACE_CAT.Markets]: 'Markets', [PLACE_CAT.Viewpoints]: 'Viewpoints',
};

// ═════════════════════════════════════════════════════════════════════════════
// SQL emission
// ═════════════════════════════════════════════════════════════════════════════
const out = [];
const w = (s) => out.push(s);
const section = (t) => w(`\n-- ─────────────────────────────────────────────────────────────────────\n-- ${t}\n-- ─────────────────────────────────────────────────────────────────────`);

w(`-- =============================================================================
-- Rahal — FULL demo seed  (GENERATED by scripts/seed/generate.js — do not edit)
-- Generated: ${new Date().toISOString()}
-- Apply:
--   docker exec -i rahal-backend-postgres-container-1 \\
--     psql -U postgres -d Rahal < scripts/seed/rahal_demo_seed.sql
-- Every account: password "${PASSWORD_PLAINTEXT}", email-confirmed.
-- =============================================================================
SET client_min_messages TO WARNING;
BEGIN;`);

// ── WIPE ────────────────────────────────────────────────────────────────────
section('WIPE app-domain data (reference tables + roles are preserved)');
w(`-- Order respects FKs. Reference data (roles, place/vendor categories, plan
-- tiers, achievement criteria types) is intentionally kept.
DELETE FROM notifications."Notifications";
DELETE FROM notifications.users_tokens;
DELETE FROM payment."Payments";
DELETE FROM rewards."TravelPlans";
DELETE FROM rewards."UserCoupons";
DELETE FROM rewards."Subscriptions";
DELETE FROM rewards."Coupons";
DELETE FROM socialmedia."Likes";
DELETE FROM socialmedia."Comments";
DELETE FROM socialmedia."PostPlaces";
DELETE FROM socialmedia."Posts";
DELETE FROM socialmedia."Follows";
DELETE FROM gamification."CheckInChallenges";
DELETE FROM gamification."XpTransactions";
DELETE FROM gamification."ExplorerAchievement";
DELETE FROM gamification."VendorBranches";
DELETE FROM gamification."Challenges";
DELETE FROM gamification."UserStats";
DELETE FROM gamification."ExplorerProfiles";
DELETE FROM gamification."VendorProfiles";
DELETE FROM places."PlaceReviews";
DELETE FROM places."CheckIns";
DELETE FROM places."PlacePhotos";
DELETE FROM places."Places";
DELETE FROM gamification."Achievements";
DELETE FROM gamification."Badges";
-- Users: drop link rows then the users themselves (keep AspNetRoles).
DELETE FROM users."AspNetUserRoles";
DELETE FROM users."AspNetUserClaims";
DELETE FROM users."AspNetUserLogins";
DELETE FROM users."AspNetUserTokens";
DELETE FROM users."EmailVerificationTokens";
DELETE FROM users."AspNetUsers";`);

// ── USERS ───────────────────────────────────────────────────────────────────
section('USERS  (AspNetUsers + AspNetUserRoles)');
const allUsers = [
  ...explorers.map((e) => ({ id: e.id, name: e.name, email: e.email, type: USERTYPE.Explorer, role: ROLE.Explorer })),
  ...vendors.map((v) => ({ id: v.id, name: v.name, email: v.email, type: USERTYPE.Vendor, role: ROLE.Vendor })),
  ...admins.map((a) => ({ id: a.id, name: a.name, email: a.email, type: USERTYPE.Admin, role: ROLE.Admin })),
];
w(`INSERT INTO users."AspNetUsers"
  ("Id","DisplayName","UserType","UserName","NormalizedUserName","Email","NormalizedEmail",
   "EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp",
   "PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled","AccessFailedCount","IsDeleted")
VALUES`);
w(allUsers.map((u) =>
  `  (${q(u.id)},${q(u.name)},${u.type},${q(u.email)},${q(u.email.toUpperCase())},${q(u.email)},${q(u.email.toUpperCase())},` +
  `true,${q(PW)},gen_random_uuid()::text,gen_random_uuid()::text,false,false,true,0,false)`
).join(',\n') + ';');

w(`\nINSERT INTO users."AspNetUserRoles" ("UserId","RoleId") VALUES`);
w(allUsers.map((u) => `  (${q(u.id)},${q(u.role)})`).join(',\n') + ';');

// ── EXPLORER PROFILES + STATS ───────────────────────────────────────────────
section('EXPLORER PROFILES + USER STATS');
w(`INSERT INTO gamification."ExplorerProfiles"
  ("UserId","DisplayName","ProfilePictureURL","Gender","BirthDate","Bio","CountryCode",
   "Level","IsPublic","IsPremium","IsDeleted")
VALUES`);
w(explorers.map((e) =>
  `  (${q(e.id)},${q(e.name)},${q(e.avatar)},${q(e.gender)},${q(e.birth)},${q(e.bio)},${q(e.country)},${e.level},true,${e.premium},false)`
).join(',\n') + ';');

w(`\nINSERT INTO gamification."UserStats"
  ("Id","ExplorerProfileId","AvailableXp","CumulativeXp","CurrentStreak","LongestStreak",
   "LastActivityDate","TotalCheckInCount","TotalAchievementCount","TotalChallengeCount","TotalBadgeCount","IsDeleted")
VALUES`);
w(explorers.map((e, i) =>
  `  (${q(uid('57a70000', e.n))},${q(e.id)},${e.availXp},${e.cumXp},${e.streak},${Math.max(e.streak, rint(3, 20))},` +
  `${daysAgo(rint(0, 3))},0,0,0,0,false)` // running counts fixed up after check-ins/challenges below
).join(',\n') + ';');

// ── VENDOR PROFILES ─────────────────────────────────────────────────────────
section('VENDOR PROFILES');
w(`INSERT INTO gamification."VendorProfiles"
  ("UserId","DisplayName","ProfilePictureURL","CountryCode","Address","AddressUrl",
   "WorkingHours","CategoryId","IsApproved","IsDeleted")
VALUES`);
w(vendors.map((v) =>
  `  (${q(v.id)},${q(v.name)},${q(v.avatar)},'EG',${q(v.addr)},${q('https://maps.google.com/?q=' + encodeURIComponent(v.addr))},${q(v.hours)},${q(v.cat)},true,false)`
).join(',\n') + ';');

// ── PLACES + PHOTOS ─────────────────────────────────────────────────────────
section('PLACES + PHOTOS');
w(`INSERT INTO places."Places"
  ("Id","Name","Description","PlaceCategoryId","Latitude","Longitude",
   "Address_AddressLine","Address_Government","Address_City","Address_Country","GeofenceRange","IsDeleted")
VALUES`);
w(places.map((p) =>
  `  (${q(p.id)},${q(p.name)},${q(placeBlurb(p))},${q(p.cat)},${p.lat},${p.lng},${q(p.line)},${q(p.gov)},${q(p.city)},'Egypt',${p.geofence},false)`
).join(',\n') + ';');

const photoRows = [];
let photoN = 0;
places.forEach((p) => {
  for (let k = 1; k <= 2; k++) {
    photoN++;
    photoRows.push(`  (${q(PHOTO(photoN))},${q(p.id)},${q(`https://picsum.photos/seed/place${p.n}_${k}/800/600`)},false)`);
  }
});
w(`\nINSERT INTO places."PlacePhotos" ("Id","PlaceId","Url","IsDeleted") VALUES`);
w(photoRows.join(',\n') + ';');

// ── CHALLENGES ──────────────────────────────────────────────────────────────
section('CHALLENGES  (Type=Photo=0; Difficulty Easy=0/Medium=1/Hard=2)');
const challengeTemplates = [
  ['Capture the Facade', 'Photograph the main facade in full frame.', 0, 40],
  ['Golden Hour Frame', 'Take a photo during golden hour light.', 1, 70],
  ['Detail Hunter', 'Find and photograph a carved detail or inscription.', 1, 60],
  ['Wide Panorama', 'Capture a wide panorama of the site and surroundings.', 2, 100],
];
const challenges = [];
let challengeN = 0;
places.forEach((p) => {
  const count = rint(2, 3);
  for (let k = 0; k < count; k++) {
    challengeN++;
    const [name, desc, diff, xp] = challengeTemplates[k % challengeTemplates.length];
    challenges.push({
      id: CHALLENGE(challengeN), placeId: p.id, name: `${name} · ${p.name}`,
      desc, diff, xp, minLevel: diff === 2 ? 3 : 0,
      prompt: `Does this image clearly show ${p.name}? Answer yes or no.`,
    });
  }
});
w(`INSERT INTO gamification."Challenges"
  ("Id","PlaceId","Name","Description","Difficulty","Type","MinimumLevelRequired","XpReward","ValidationPrompt","IsDeleted")
VALUES`);
w(challenges.map((c) =>
  `  (${q(c.id)},${q(c.placeId)},${q(c.name)},${q(c.desc)},${c.diff},0,${c.minLevel},${c.xp},${q(c.prompt)},false)`
).join(',\n') + ';');

// ── VENDOR BRANCHES (vendor → place link) ───────────────────────────────────
section('VENDOR BRANCHES');
const branchLinks = [
  [vendors[0], places.find((p) => p.name === 'Cairo Tower')],
  [vendors[1], places.find((p) => p.name === 'Aswan High Dam')],
  [vendors[2], places.find((p) => p.name === 'Khan el-Khalili')],
  [vendors[3], places.find((p) => p.name === 'Blue Hole Dahab')],
  [vendors[4], places.find((p) => p.name === 'Valley of the Kings')],
];
w(`INSERT INTO gamification."VendorBranches"
  ("Id","VendorId","PlaceId","BranchName","PhoneNumber","Notes","IsActive","IsDeleted")
VALUES`);
w(branchLinks.map(([v, p], i) =>
  `  (${q(uid('b4a11000', i + 1))},${q(v.id)},${q(p.id)},${q(v.name + ' — ' + p.city)},${q('+2010' + rint(10000000, 99999999))},${q('Vendor-operated branch near ' + p.name + '.')},true,false)`
).join(',\n') + ';');

// ── CHECK-INS (+ matching Verified challenge attempts + XP tx) ───────────────
section('CHECK-INS  (Verified=1) — geofence-matching coords, pre-validated');
const checkins = [];
let checkinN = 0;
// Each explorer checks into a spread of places (skip the pinned demo place so a
// live check-in there stays possible). Higher-XP explorers visit more.
explorers.forEach((e) => {
  const visitCount = Math.min(places.length - 1, 3 + Math.floor(e.cumXp / 500));
  const shuffled = places.filter((p) => p.id !== PINNED_PLACE.id).slice();
  for (let s = shuffled.length - 1; s > 0; s--) { const j = Math.floor(rnd() * (s + 1)); [shuffled[s], shuffled[j]] = [shuffled[j], shuffled[s]]; }
  shuffled.slice(0, visitCount).forEach((p, idx) => {
    checkinN++;
    checkins.push({
      id: CHECKIN(checkinN), explorer: e, placeId: p.id,
      lat: p.lat + (rnd() - 0.5) * 0.0003, lng: p.lng + (rnd() - 0.5) * 0.0003,
      days: rint(1, 120),
    });
  });
});
w(`INSERT INTO places."CheckIns"
  ("Id","ExplorerId","PlaceId","ValidationStatus","Latitude","Longitude","RiskScore","CreatedAt","IsDeleted")
VALUES`);
w(checkins.map((c) =>
  `  (${q(c.id)},${q(c.explorer.id)},${q(c.placeId)},1,${c.lat.toFixed(6)},${c.lng.toFixed(6)},${rint(0, 15)},${daysAgo(c.days)},false)`
).join(',\n') + ';');

// A subset of check-ins have a completed (Approved=1) photo challenge.
section('CHECK-IN CHALLENGES  (Approved=1) — a subset of check-ins');
const cics = [];
let cicN = 0;
checkins.forEach((c) => {
  if (rnd() < 0.4) {
    const ch = challenges.find((x) => x.placeId === c.placeId);
    if (!ch) return;
    cicN++;
    cics.push({ id: CIC(cicN), challengeId: ch.id, checkinId: c.id, explorerId: c.explorer.id, days: c.days, xp: ch.xp });
  }
});
w(`INSERT INTO gamification."CheckInChallenges"
  ("Id","ChallengeId","CheckInId","ExplorerId","ProofUrl","ValidationStatus","CreatedAt","IsDeleted")
VALUES`);
w(cics.map((c, i) =>
  `  (${q(c.id)},${q(c.challengeId)},${q(c.checkinId)},${q(c.explorerId)},${q(`https://picsum.photos/seed/proof${i + 1}/800/600`)},1,${daysAgo(c.days)},false)`
).join(',\n') + ';');

// ── XP TRANSACTIONS (CheckIn=0, Challenge=2) ────────────────────────────────
section('XP TRANSACTIONS  (source CheckIn=0, Challenge=2)');
const xptx = [];
let xptxN = 0;
checkins.forEach((c) => { xptxN++; xptx.push(`  (${q(XPTX(xptxN))},${q(c.explorer.id)},10,0,${q(c.id)},${daysAgo(c.days)},false)`); });
cics.forEach((c) => { xptxN++; xptx.push(`  (${q(XPTX(xptxN))},${q(c.explorerId)},${c.xp},2,${q(c.challengeId)},${daysAgo(c.days)},false)`); });
w(`INSERT INTO gamification."XpTransactions"
  ("Id","ExplorerProfileId","Amount","Source","ReferenceId","CreatedAt","IsDeleted")
VALUES`);
w(xptx.join(',\n') + ';');

// Fix up UserStats running counts from what we actually inserted.
w(`\n-- Reconcile stat counters with the check-ins/challenges actually seeded.`);
w(`UPDATE gamification."UserStats" us SET
  "TotalCheckInCount" = COALESCE(ci.cnt,0),
  "TotalChallengeCount" = COALESCE(cc.cnt,0)
FROM (SELECT "ExplorerId", count(*) cnt FROM places."CheckIns" GROUP BY 1) ci
LEFT JOIN (SELECT "ExplorerId", count(*) cnt FROM gamification."CheckInChallenges" GROUP BY 1) cc
  ON cc."ExplorerId" = ci."ExplorerId"
WHERE us."ExplorerProfileId" = ci."ExplorerId";`);

// ── PLACE REVIEWS ───────────────────────────────────────────────────────────
section('PLACE REVIEWS  (verified, tied to a real check-in)');
const reviewComments = [
  'Breathtaking. Worth the early start to beat the crowds.',
  'Quietly monumental. The kind of place you catalogue, not just visit.',
  'Incredible detail up close. Bring water and good shoes.',
  'The light here at sunset is unreal.', 'A must for anyone tracing Egypt’s relics.',
  'Peaceful and well kept. Spent hours just wandering.',
  'History you can touch. Loved every minute.',
];
const reviews = [];
let reviewN = 0;
checkins.forEach((c) => {
  if (rnd() < 0.35) {
    reviewN++;
    reviews.push(`  (${q(REVIEW(reviewN))},${q(c.explorer.id)},${q(c.placeId)},${q(c.id)},${rint(3, 5)},${q(pick(reviewComments))},true,${daysAgo(Math.max(0, c.days - 1))},false)`);
  }
});
w(`INSERT INTO places."PlaceReviews"
  ("Id","ExplorerId","PlaceId","CheckInId","Rating","Comment","IsVerified","CreatedAt","IsDeleted")
VALUES`);
w(reviews.join(',\n') + ';');

// ── SOCIAL: POSTS ───────────────────────────────────────────────────────────
section('SOCIAL — POSTS (+ PostPlaces tags)');
const postCaptions = [
  'Finally stood beneath it. Photos do not do it justice.',
  'Golden hour over the Nile hits different.',
  'Some places you visit. Others you catalogue. This was the latter.',
  'Three temples, one long day, zero regrets.',
  'The desert silence out here is the whole point.',
  'Reef was alive today — visibility for days.',
  'Old Cairo never runs out of corners to get lost in.',
  'Checked another relic off the map. On to the next.',
  'Woke at 4am for this view. Would do it again.',
  'Curated route, uncurated adventure.',
];
const posts = [];
let postN = 0;
explorers.forEach((e) => {
  const count = rint(1, 4);
  const visited = checkins.filter((c) => c.explorer.id === e.id);
  for (let k = 0; k < count; k++) {
    postN++;
    const tagged = visited.length ? pick(visited) : null;
    const nMedia = rint(0, 3);
    const media = Array.from({ length: nMedia }, (_, m) => `https://picsum.photos/seed/post${postN}_${m}/900/1100`);
    posts.push({ id: POST(postN), userId: e.id, content: pick(postCaptions), media, days: rint(0, 90), placeId: tagged ? tagged.placeId : null });
  }
});
// a couple of vendor posts too
vendors.slice(0, 3).forEach((v) => {
  postN++;
  posts.push({ id: POST(postN), userId: v.id, content: `New at ${v.name}: come find us and claim a coupon in the app.`, media: [`https://picsum.photos/seed/vpost${v.n}/900/1100`], days: rint(0, 30), placeId: null });
});
w(`INSERT INTO socialmedia."Posts" ("Id","UserId","Content","IsPublic","MediaUrls","CreatedAt","IsDeleted") VALUES`);
w(posts.map((p) => `  (${q(p.id)},${q(p.userId)},${q(p.content)},true,${jsonArr(p.media)},${daysAgo(p.days)},false)`).join(',\n') + ';');

const postPlaces = posts.filter((p) => p.placeId).map((p) => `  (${q(p.id)},${q(p.placeId)})`);
if (postPlaces.length) {
  w(`\nINSERT INTO socialmedia."PostPlaces" ("PostId","PlaceId") VALUES`);
  w(postPlaces.join(',\n') + ';');
}

// ── SOCIAL: COMMENTS (+ threaded replies) ───────────────────────────────────
section('SOCIAL — COMMENTS (top-level + one level of replies)');
const commentBodies = [
  'This is stunning 😍', 'Adding this to my list right now.', 'How was the crowd?',
  'Peak Egypt right here.', 'The colours! Wow.', 'Been wanting to go for ages.',
  'Which entrance did you use?', 'Saving this for my next trip.', 'Legendary shot.',
  'Okay this is a sign, I’m booking.', 'Was it very hot that day?', 'Incredible framing.',
];
const comments = [];
let commentN = 0;
posts.forEach((p) => {
  const topCount = rint(0, 4);
  const tops = [];
  for (let k = 0; k < topCount; k++) {
    commentN++;
    const author = pick(explorers);
    const c = { id: COMMENT(commentN), postId: p.id, userId: author.id, parent: null, body: pick(commentBodies), days: Math.max(0, p.days - rint(0, 3)), replies: 0 };
    comments.push(c); tops.push(c);
  }
  // replies to some top-level comments
  tops.forEach((t) => {
    if (rnd() < 0.4) {
      commentN++;
      const author = pick(explorers);
      comments.push({ id: COMMENT(commentN), postId: p.id, userId: author.id, parent: t.id, body: pick(['Right?!', 'Totally agree.', 'Go for it!', 'It wasn’t too bad actually.', 'Thank you!', 'You won’t regret it.']), days: t.days, replies: 0 });
      t.replies++;
    }
  });
});
w(`INSERT INTO socialmedia."Comments" ("Id","PostId","UserId","ParentCommentId","Content","RepliesCount","CreatedAt","IsDeleted") VALUES`);
w(comments.map((c) => `  (${q(c.id)},${q(c.postId)},${q(c.userId)},${c.parent ? q(c.parent) : 'NULL'},${q(c.body)},${c.replies},${daysAgo(c.days)},false)`).join(',\n') + ';');

// ── SOCIAL: LIKES ───────────────────────────────────────────────────────────
section('SOCIAL — LIKES (unique per user+post)');
const likeSet = new Set();
const likes = [];
posts.forEach((p) => {
  // popularity: each post liked by a random subset of explorers
  const likeCount = rint(2, Math.min(15, explorers.length));
  const shuffled = explorers.slice();
  for (let s = shuffled.length - 1; s > 0; s--) { const j = Math.floor(rnd() * (s + 1)); [shuffled[s], shuffled[j]] = [shuffled[j], shuffled[s]]; }
  shuffled.slice(0, likeCount).forEach((e) => {
    const key = `${e.id}|${p.id}`;
    if (likeSet.has(key)) return;
    likeSet.add(key);
    likes.push(`  (${q(e.id)},${q(p.id)},${daysAgo(Math.max(0, p.days - rint(0, 2)))})`);
  });
});
w(`INSERT INTO socialmedia."Likes" ("UserId","PostId","CreatedAt") VALUES`);
w(likes.join(',\n') + ';');

// ── SOCIAL: FOLLOWS ─────────────────────────────────────────────────────────
section('SOCIAL — FOLLOWS (dense explorer graph, unique edges)');
const followSet = new Set();
const follows = [];
explorers.forEach((a) => {
  explorers.forEach((b) => {
    if (a.id === b.id) return;
    if (rnd() < 0.35) {
      const key = `${a.id}|${b.id}`;
      if (followSet.has(key)) return;
      followSet.add(key);
      follows.push(`  (${q(a.id)},${q(b.id)},${daysAgo(rint(1, 150))})`);
    }
  });
});
w(`INSERT INTO socialmedia."Follows" ("FollowerId","FolloweeId","CreatedAt") VALUES`);
w(follows.join(',\n') + ';');

// ── REWARDS: COUPONS ────────────────────────────────────────────────────────
section('REWARDS — COUPONS  (DiscountType FixedAmount|Percentage as .NET names)');
const couponDefs = [
  [vendors[0], 'Free Espresso Shot', 'One free single-origin espresso with any purchase.', 150, 'FixedAmount', 25, null, 0, 200],
  [vendors[0], '20% Off Breakfast', 'Twenty percent off any breakfast plate before noon.', 300, 'Percentage', 20, 60, 80, 150],
  [vendors[1], 'Sunset Felucca — 15% Off', 'Fifteen percent off a sunset felucca ride for two.', 500, 'Percentage', 15, 120, 200, 60],
  [vendors[1], 'EGP 100 Off Nile Cruise', 'Flat EGP 100 off any half-day Nile cruise.', 700, 'FixedAmount', 100, null, 400, 40],
  [vendors[2], 'Bazaar Buyer’s Discount', 'Ten percent off handmade crafts over EGP 200.', 250, 'Percentage', 10, 80, 200, 300],
  [vendors[2], 'Free Papyrus Bookmark', 'A complimentary hand-painted papyrus bookmark.', 120, 'FixedAmount', 30, null, 0, 500],
  [vendors[3], 'Intro Dive — 25% Off', 'Twenty-five percent off a guided intro dive.', 900, 'Percentage', 25, 300, 500, 30],
  [vendors[3], 'Free Gear Rental Day', 'One free full-day equipment rental with any dive.', 600, 'FixedAmount', 400, null, 0, 50],
  [vendors[4], 'Balloon Ride — EGP 200 Off', 'EGP 200 off a sunrise hot-air balloon ride.', 1000, 'FixedAmount', 200, null, 1500, 25],
  [vendors[4], 'Group Balloon 30% Off', 'Thirty percent off for groups of four or more.', 800, 'Percentage', 30, 900, 2000, 20],
];
const coupons = couponDefs.map(([v, title, desc, xpCost, dtype, dval, maxDisc, minCharge, maxClaims], i) => ({
  id: COUPON(i + 1), vendor: v, title, desc, xpCost, dtype, dval, maxDisc, minCharge, maxClaims,
  expDays: rint(30, 120),
}));
w(`INSERT INTO rewards."Coupons"
  ("Id","VendorId","Title","Description","XpCost","DiscountType","DiscountValue","MaxDiscountValue",
   "MinimumCharge","MaxClaims","CurrentClaims","ExpiresAt","IsActive","IsDeleted")
VALUES`);
w(coupons.map((c) =>
  `  (${q(c.id)},${q(c.vendor.id)},${q(c.title)},${q(c.desc)},${c.xpCost},${q(c.dtype)},${c.dval},${c.maxDisc === null ? 'NULL' : c.maxDisc},${c.minCharge},${c.maxClaims},0,(now() + interval '${c.expDays} days'),true,false)`
).join(',\n') + ';');

// ── REWARDS: USER COUPONS (wallet) ──────────────────────────────────────────
section('REWARDS — USER COUPONS  (Status Claimed=pending | Redeemed | Expired)');
const userCoupons = [];
let ucN = 0;
explorers.forEach((e) => {
  const n = rint(0, 3);
  const chosen = coupons.slice();
  for (let s = chosen.length - 1; s > 0; s--) { const j = Math.floor(rnd() * (s + 1)); [chosen[s], chosen[j]] = [chosen[j], chosen[s]]; }
  chosen.slice(0, n).forEach((c) => {
    ucN++;
    const roll = rnd();
    let status, redeemed, redeemedAt, expDays, claimedDays;
    if (roll < 0.5) { status = 'Claimed'; redeemed = false; redeemedAt = 'NULL'; expDays = rint(20, 90); claimedDays = rint(1, 20); }
    else if (roll < 0.8) { status = 'Redeemed'; redeemed = true; claimedDays = rint(10, 40); redeemedAt = daysAgo(claimedDays - rint(1, 5)); expDays = rint(20, 90); }
    else { status = 'Expired'; redeemed = false; redeemedAt = 'NULL'; expDays = -rint(1, 15); claimedDays = rint(40, 80); }
    userCoupons.push({
      id: USERCOUPON(ucN), explorerId: e.id, couponId: c.id,
      code: `CPN-${hex(ucN, 4).toUpperCase()}-${hex(rint(0, 65535), 4).toUpperCase()}`,
      redeemed, status, redeemedAt, expDays, claimedDays,
    });
  });
});
w(`INSERT INTO rewards."UserCoupons"
  ("Id","ExplorerId","CouponId","Code","IsRedeemed","Status","ClaimedAt","RedeemedAt","ExpiresAt","IsDeleted")
VALUES`);
w(userCoupons.map((u) =>
  `  (${q(u.id)},${q(u.explorerId)},${q(u.couponId)},${q(u.code)},${u.redeemed},${q(u.status)},${daysAgo(u.claimedDays)},${u.redeemedAt},(now() + interval '${u.expDays} days'),false)`
).join(',\n') + ';');
w(`\n-- keep Coupons.CurrentClaims consistent with the wallet rows above.`);
w(`UPDATE rewards."Coupons" c SET "CurrentClaims" = COALESCE(w.cnt,0)
FROM (SELECT "CouponId", count(*) cnt FROM rewards."UserCoupons" GROUP BY 1) w
WHERE w."CouponId" = c."Id";`);

// ── REWARDS: SUBSCRIPTIONS + TRAVEL PLANS ───────────────────────────────────
section('REWARDS — SUBSCRIPTIONS (premium explorers) + TRAVEL PLANS');
const subs = [];
let subN = 0;
const premiumExplorers = explorers.filter((e) => e.premium);
premiumExplorers.forEach((e) => {
  subN++;
  const method = rnd() < 0.6 ? 'Visa' : 'Xp';
  const duration = pick([1, 2, 4]);
  subs.push({
    id: SUB(subN), explorerId: e.id, method, duration,
    totalCost: method === 'Visa' ? (5 * duration).toFixed(2) : 0,
    startDays: rint(1, 20), expDays: duration * 7 - rint(0, 5),
  });
});
w(`INSERT INTO rewards."Subscriptions"
  ("Id","ExplorerId","PlanTierId","PaymentMethod","Status","Duration","TotalCost","StartedAt","ExpiresAt","IsDeleted")
VALUES`);
w(subs.map((s) =>
  `  (${q(s.id)},${q(s.explorerId)},${q(PLAN_TIER)},${q(s.method)},'Active',${s.duration},${s.totalCost},${daysAgo(s.startDays)},(now() + interval '${s.expDays} days'),false)`
).join(',\n') + ';');

const travelPlans = [];
let tpN = 0;
subs.slice(0, 5).forEach((s) => {
  tpN++;
  const days = pick([3, 5, 7]);
  travelPlans.push({ id: TRAVEL(tpN), explorerId: s.explorerId, subId: s.id, budget: rint(3, 15) * 1000, days,
    prompt: pick(['A relaxed cultural trip through Upper Egypt.', 'Diving and beaches on the Red Sea coast.', 'Historical Cairo on a modest budget.', 'Desert escape with stargazing.']) });
});
w(`\nINSERT INTO rewards."TravelPlans"
  ("Id","ExplorerId","SubscriptionId","BudgetLimit","StayDurationDays","Prompt","GeneratedPlan","IsDeleted")
VALUES`);
w(travelPlans.map((t) =>
  `  (${q(t.id)},${q(t.explorerId)},${q(t.subId)},${t.budget},${t.days},${q(t.prompt)},${q(`Day 1: Arrive and settle in. Day 2: Guided exploration. Day 3+: Curated relics and local experiences within a ${t.budget} EGP budget over ${t.days} days.`)},false)`
).join(',\n') + ';');

// ── PAYMENTS ────────────────────────────────────────────────────────────────
section('PAYMENTS  (Stripe; Status Succeeded|RequiresPaymentMethod, Currency usd)');
const payments = [];
let payN = 0;
subs.filter((s) => s.method === 'Visa').forEach((s) => {
  payN++;
  const amount = Number(s.totalCost);
  payments.push({ id: PAYMENT(payN), explorerId: s.explorerId, refId: s.id, amount, status: 'Succeeded', days: s.startDays });
});
// a couple of pending/failed for realism
[explorers[2], explorers[5]].forEach((e) => {
  payN++;
  payments.push({ id: PAYMENT(payN), explorerId: e.id, refId: SUB(0), amount: 5.0, status: 'RequiresPaymentMethod', days: rint(1, 10) });
});
w(`INSERT INTO payment."Payments"
  ("Id","OperationId","ExplorerId","ReferenceId","Amount","AmountMinor","Currency","Status","Gateway","GatewayPaymentIntentId","CreatedAt","IsDeleted")
VALUES`);
w(payments.map((p) =>
  `  (${q(p.id)},gen_random_uuid(),${q(p.explorerId)},${q(p.refId)},${p.amount.toFixed(2)},${Math.round(p.amount * 100)},'usd',${q(p.status)},'Stripe',${q('pi_demo_' + hex(rint(100000, 999999), 6))},${daysAgo(p.days)},false)`
).join(',\n') + ';');

// ── NOTIFICATIONS ───────────────────────────────────────────────────────────
section('NOTIFICATIONS  (Social.PostLike | Social.Comment | Social.Follow)');
const notifs = [];
let notifN = 0;
// like/comment notifications to post authors; follow notifications to followees
posts.forEach((p) => {
  const author = p.userId;
  // notify author of a like
  if (rnd() < 0.6) {
    notifN++;
    const actor = pick(explorers);
    if (actor.id !== author) notifs.push({ id: NOTIF(notifN), userId: author, actorId: actor.id, type: 'Social.PostLike', target: p.id, read: rnd() < 0.5, days: rint(0, 20) });
  }
  if (rnd() < 0.4) {
    notifN++;
    const actor = pick(explorers);
    if (actor.id !== author) notifs.push({ id: NOTIF(notifN), userId: author, actorId: actor.id, type: 'Social.Comment', target: p.id, read: rnd() < 0.4, days: rint(0, 20) });
  }
});
follows.slice(0, 40).forEach((_f, i) => {
  // reuse follow edges: notify followee
  notifN++;
});
// build follow notifs from the follow edge objects we tracked
let fi = 0;
followSet.forEach((key) => {
  if (fi++ % 2 !== 0) return; // ~half
  const [followerId, followeeId] = key.split('|');
  notifN++;
  notifs.push({ id: NOTIF(notifN), userId: followeeId, actorId: followerId, type: 'Social.Follow', target: null, read: rnd() < 0.5, days: rint(0, 30) });
});
w(`INSERT INTO notifications."Notifications"
  ("Id","UserId","ActorId","Type","TargetId","IsRead","CreatedAt","IsDeleted")
VALUES`);
w(notifs.map((nrow) =>
  `  (${q(nrow.id)},${q(nrow.userId)},${q(nrow.actorId)},${q(nrow.type)},${nrow.target ? q(nrow.target) : 'NULL'},${nrow.read},${daysAgo(nrow.days)},false)`
).join(',\n') + ';');

w(`\nCOMMIT;`);
w(`-- Post-apply: Redis counters (likes/follows/feed) should be flushed so they`);
w(`-- rehydrate from these rows:  docker exec rahal-backend-redis-1 redis-cli FLUSHALL`);

// ── write file ──────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'rahal_demo_seed.sql');
fs.writeFileSync(outPath, out.join('\n') + '\n', 'utf8');

// ── also emit a machine-readable credentials summary for the MD writer ──────
const summary = {
  password: PASSWORD_PLAINTEXT,
  counts: {
    explorers: explorers.length, vendors: vendors.length, admins: admins.length,
    places: places.length, photos: photoRows.length, challenges: challenges.length,
    checkins: checkins.length, checkinChallenges: cics.length, reviews: reviews.length,
    posts: posts.length, comments: comments.length, likes: likes.length,
    follows: follows.length, coupons: coupons.length, userCoupons: userCoupons.length,
    subscriptions: subs.length, travelPlans: travelPlans.length, payments: payments.length,
    notifications: notifs.length,
  },
  pinnedPlace: { name: PINNED_PLACE.name, lat: PINNED_PLACE.lat, lng: PINNED_PLACE.lng, geofence: PINNED_PLACE.geofence, id: PINNED_PLACE.id },
  explorers: explorers.map((e) => ({ name: e.name, email: e.email, level: e.level, cumXp: e.cumXp, premium: e.premium })),
  vendors: vendors.map((v) => ({ name: v.name, email: v.email, addr: v.addr })),
  admins: admins.map((a) => ({ name: a.name, email: a.email })),
};
fs.writeFileSync(path.join(__dirname, 'summary.json'), JSON.stringify(summary, null, 2));

// ── Meilisearch place documents (search index is NOT fed by direct SQL) ─────
// The backend only indexes places via a PlaceCreatedEvent domain handler, which
// direct INSERTs never fire, and there is no bulk-reindex endpoint. So we emit
// the `placesearchdocument` index payload and push it to Meilisearch out-of-band
// (see README / run instructions). Field shape matches PlaceSearchDocument.
const meiliDocs = places.map((p) => ({
  id: p.id, name: p.name, description: placeBlurb(p),
  categoryName: CAT_NAME[p.cat] || '', latitude: p.lat, longitude: p.lng,
  ticketPrice: 0, city: p.city, government: p.gov, country: 'Egypt',
}));
fs.writeFileSync(path.join(__dirname, 'meili_places.json'), JSON.stringify(meiliDocs, null, 0));

console.log(`Wrote ${outPath}`);
console.log(`Lines: ${out.length}`);
console.log('Counts:', JSON.stringify(summary.counts));
