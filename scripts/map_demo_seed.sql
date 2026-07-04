-- Rahal frontend map/check-in/challenges demo seed.
-- Idempotent and scoped to missing map-related rows in the local dev DB.

BEGIN;

-- Existing dev DB facts used by this seed:
--   f1a00000-0000-4000-8000-000000000011 = Cairo Tower.
--   5873ca63-1961-5a2e-81ed-740b63ff305c = Pyramids of Giza.
--   e5a00000-0000-4000-8000-000000000006 = Baron Empain Palace, at the frontend DEV_PINNED_LOCATION
--     (see scripts/more_places_and_challenges.sql).
--   d0a00000-0000-4000-8000-000000000001 = Sahara Bean Cafe vendor user id.
--   d0a00000-0000-4000-8000-000000000003 = Khan Relics Bazaar vendor user id.

DELETE FROM gamification."CheckInChallenges"
WHERE "ChallengeId" IN (
  '44444444-4444-4444-8444-000000000001',
  '44444444-4444-4444-8444-000000000002',
  '44444444-4444-4444-8444-000000000003'
);

DELETE FROM gamification."Challenges"
WHERE "Id" IN (
  '44444444-4444-4444-8444-000000000001',
  '44444444-4444-4444-8444-000000000002',
  '44444444-4444-4444-8444-000000000003'
);

DELETE FROM gamification."VendorBranches"
WHERE "Id" IN (
  '55555555-5555-4555-8555-000000000001',
  '55555555-5555-4555-8555-000000000002'
);

DELETE FROM places."CheckIns"
WHERE "PlaceId" IN (
  '22222222-2222-4222-8222-000000000101',
  '22222222-2222-4222-8222-000000000102'
);

DELETE FROM places."Places"
WHERE "Id" IN (
  '22222222-2222-4222-8222-000000000101',
  '22222222-2222-4222-8222-000000000102'
);

INSERT INTO places."PlaceCategories"
  ("Id", "Name", "Description", "CreatedAt", "IsDeleted")
VALUES
  ('c6666666-6666-6666-6666-666666666666', 'Vendor', 'Vendor-operated branches created by vendor profiles.', now(), false)
ON CONFLICT ("Id") DO UPDATE
SET "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "IsDeleted" = false,
    "UpdatedAt" = now();

INSERT INTO places."Places"
  ("Id", "Name", "Description", "PlaceCategoryId", "Latitude", "Longitude",
   "Address_AddressLine", "Address_Government", "Address_City", "Address_Country",
   "GeofenceRange", "CreatedAt", "IsDeleted")
VALUES
  ('22222222-2222-4222-8222-000000000101', 'Sahara Bean Cafe - Zamalek',
   'A vendor-operated cafe branch seeded as a Place with the backend Vendor place category.',
   'c6666666-6666-6666-6666-666666666666', 30.0602, 31.2200,
   '26 July Corridor', 'Cairo', 'Zamalek', 'Egypt', 80, now(), false),
  ('22222222-2222-4222-8222-000000000102', 'Khan Relics Bazaar - Main Shop',
   'A vendor-operated craft shop branch seeded as a Place with the backend Vendor place category.',
   'c6666666-6666-6666-6666-666666666666', 30.0477, 31.2622,
   'Khan el-Khalili', 'Cairo', 'Islamic Cairo', 'Egypt', 80, now(), false)
ON CONFLICT ("Id") DO UPDATE
SET "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "PlaceCategoryId" = EXCLUDED."PlaceCategoryId",
    "Latitude" = EXCLUDED."Latitude",
    "Longitude" = EXCLUDED."Longitude",
    "Address_AddressLine" = EXCLUDED."Address_AddressLine",
    "Address_Government" = EXCLUDED."Address_Government",
    "Address_City" = EXCLUDED."Address_City",
    "Address_Country" = EXCLUDED."Address_Country",
    "GeofenceRange" = EXCLUDED."GeofenceRange",
    "IsDeleted" = false,
    "UpdatedAt" = now();

INSERT INTO gamification."VendorBranches"
  ("Id", "VendorId", "PlaceId", "BranchName", "PhoneNumber", "Notes", "IsActive", "CreatedAt", "IsDeleted")
VALUES
  ('55555555-5555-4555-8555-000000000001',
   'd0a00000-0000-4000-8000-000000000001',
   '22222222-2222-4222-8222-000000000101',
   'Zamalek', '+201000000001', 'Seeded cafe branch for map vendor visibility.', true, now(), false),
  ('55555555-5555-4555-8555-000000000002',
   'd0a00000-0000-4000-8000-000000000003',
   '22222222-2222-4222-8222-000000000102',
   'Main Shop', '+201000000003', 'Seeded shop branch for map vendor visibility.', true, now(), false)
ON CONFLICT ("Id") DO UPDATE
SET "VendorId" = EXCLUDED."VendorId",
    "PlaceId" = EXCLUDED."PlaceId",
    "BranchName" = EXCLUDED."BranchName",
    "PhoneNumber" = EXCLUDED."PhoneNumber",
    "Notes" = EXCLUDED."Notes",
    "IsActive" = true,
    "IsDeleted" = false,
    "UpdatedAt" = now();

INSERT INTO gamification."Challenges"
  ("Id", "PlaceId", "Name", "Description", "ValidationPrompt", "Difficulty", "Type",
   "MinimumLevelRequired", "XpReward", "CreatedAt", "IsDeleted")
VALUES
  ('44444444-4444-4444-8444-000000000001',
   'f1a00000-0000-4000-8000-000000000011',
   'Frame the skyline marker',
   'Capture the tower from street level with the skyline visible behind it.',
   'Upload a photo where Cairo Tower is clearly visible.',
   0, 0, 1, 40, now(), false),
  ('44444444-4444-4444-8444-000000000002',
   'f1a00000-0000-4000-8000-000000000011',
   'Catalog the island approach',
   'Photograph a directional sign, entrance marker, or ticketing area near the tower.',
   'Upload a photo of a physical marker from the Cairo Tower visit.',
   1, 0, 1, 65, now(), false),
  ('44444444-4444-4444-8444-000000000003',
   '5873ca63-1961-5a2e-81ed-740b63ff305c',
   'Find the plateau line',
   'Capture a wide shot that includes at least two pyramids on the Giza plateau.',
   'Upload a wide photo from the plateau.',
   1, 0, 1, 75, now(), false)
ON CONFLICT ("Id") DO UPDATE
SET "PlaceId" = EXCLUDED."PlaceId",
    "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "ValidationPrompt" = EXCLUDED."ValidationPrompt",
    "Difficulty" = EXCLUDED."Difficulty",
    "Type" = EXCLUDED."Type",
    "MinimumLevelRequired" = EXCLUDED."MinimumLevelRequired",
    "XpReward" = EXCLUDED."XpReward",
    "IsDeleted" = false,
    "UpdatedAt" = now();

COMMIT;

SELECT 'vendor_place_category' AS label, count(*) FROM places."PlaceCategories"
WHERE "Id" = 'c6666666-6666-6666-6666-666666666666'
UNION ALL SELECT 'seeded_vendor_places', count(*) FROM places."Places"
WHERE "Id" IN (
  '22222222-2222-4222-8222-000000000101',
  '22222222-2222-4222-8222-000000000102'
)
UNION ALL SELECT 'seeded_vendor_branches', count(*) FROM gamification."VendorBranches"
WHERE "Id" IN (
  '55555555-5555-4555-8555-000000000001',
  '55555555-5555-4555-8555-000000000002'
)
UNION ALL SELECT 'seeded_challenges', count(*) FROM gamification."Challenges"
WHERE "Id" IN (
  '44444444-4444-4444-8444-000000000001',
  '44444444-4444-4444-8444-000000000002',
  '44444444-4444-4444-8444-000000000003'
)
ORDER BY label;
