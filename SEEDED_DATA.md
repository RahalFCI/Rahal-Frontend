# Rahal — Seeded Demo Data

> **Regenerate/apply with one command** (from repo root, backend stack must be up):
> `powershell -ExecutionPolicy Bypass -File scripts/seed/run.ps1`  ·  or  ·  `bash scripts/seed/run.sh`
>
> This wipes the app-domain tables in the Dockerized Postgres (`Rahal` DB) and reseeds
> everything below, pushes the places into Meilisearch, and flushes Redis. Fully
> **idempotent** — re-run any time; counts stay identical. Generator + full run guide:
> `scripts/seed/`.

## 🔑 Login

| Field | Value |
|---|---|
| **Password (every account)** | `Password123!` |
| Email confirmed | ✅ all accounts (login works immediately) |
| Login endpoint | `POST /api/User/login` `{ "email", "password" }` |

Verified live: Explorer, Vendor, and Admin accounts all return a valid JWT.

### Explorer accounts (20)

Level is derived on the frontend as `floor(cumXp / 1000) + 1`.

| # | Name | Email | Level | Cum. XP | Premium |
|---|------|-------|-------|---------|---------|
| 1 | Layla Hassan | `layla.demo@rahal.test` | 4 | 3420 | ✅ |
| 2 | Omar Farouk | `omar.demo@rahal.test` | 3 | 2180 | ✅ |
| 3 | Nour Adel | `nour.demo@rahal.test` | 1 | 640 | — |
| 4 | Youssef Mansour | `youssef.demo@rahal.test` | 6 | 5210 | ✅ |
| 5 | Mariam Saleh | `mariam.demo@rahal.test` | 1 | 410 | — |
| 6 | Karim Adel | `karim.demo@rahal.test` | 2 | 1890 | — |
| 7 | Salma Ibrahim | `salma.demo@rahal.test` | 3 | 2760 | ✅ |
| 8 | Tarek Nabil | `tarek.demo@rahal.test` | 1 | 980 | — |
| 9 | Habiba Wael | `habiba.demo@rahal.test` | 1 | 720 | — |
| 10 | Ali Mostafa | `ali.demo@rahal.test` | 5 | 4560 | ✅ |
| 11 | Dina Kamal | `dina.demo@rahal.test` | 2 | 1310 | — |
| 12 | Hany Sobhy | `hany.demo@rahal.test` | 2 | 1620 | — |
| 13 | Farida Ashraf | `farida.demo@rahal.test` | 4 | 3050 | ✅ |
| 14 | Seif Gamal | `seif.demo@rahal.test` | 1 | 250 | — |
| 15 | Rana Sherif | `rana.demo@rahal.test` | 3 | 2440 | ✅ |
| 16 | Mostafa Zaki | `mostafa.demo@rahal.test` | 1 | 890 | — |
| 17 | Yasmin Fouad | `yasmin.demo@rahal.test` | 4 | 3980 | ✅ |
| 18 | Khaled Reda | `khaled.demo@rahal.test` | 2 | 1150 | — |
| 19 | Aya Magdy | `aya.demo@rahal.test` | 1 | 560 | — |
| 20 | Amir Talaat | `amir.demo@rahal.test` | 3 | 2010 | — |

> **Recommended demo login: `layla.demo@rahal.test`** — premium, high XP, dense
> follow graph (full feed), and holds wallet coupons. `youssef.demo@rahal.test` is
> the highest level (6) for showing the level display.

### Vendor accounts (5)

| # | Name | Email | Address |
|---|------|-------|---------|
| 1 | Sahara Bean Café | `sahara.vendor@rahal.test` | Road 9, Maadi, Cairo |
| 2 | Nile Pearl Cruises | `nile.vendor@rahal.test` | Corniche El Nil, Aswan |
| 3 | Khan Relics Bazaar | `khan.vendor@rahal.test` | Khan el-Khalili, Islamic Cairo |
| 4 | Red Sea Divers Co. | `red.vendor@rahal.test` | Masbat Bay, Dahab, South Sinai |
| 5 | Luxor Balloon Rides | `luxor.vendor@rahal.test` | West Bank, Luxor |

Each vendor offers 2 coupons (10 total) and is linked to a nearby Place via a `VendorBranch`.

### Admin accounts (3)

| # | Name | Email |
|---|------|-------|
| 1 | Rahal Admin | `admin@rahal.test` |
| 2 | Content Moderator | `moderator@rahal.test` |
| 3 | Ops Curator | `curator@rahal.test` |

## 🎯 Check-in demo place (important)

**Baron Empain Palace** (Cairo/Heliopolis, `lat 30.0904, lng 31.3211`, geofence 200m,
place id `51ace000-0000-4000-8000-00000000000a`) is deliberately seeded with **zero
check-ins**. It is the frontend `DEV_PINNED_LOCATION` — use it to demo a live successful
check-in + XP award + level-up. Every other place already has check-ins, and its geofence
will correctly reject a spoofed attempt.

## 📊 Volume summary

| Entity | Count | | Entity | Count |
|---|---|---|---|---|
| Explorers (users+profiles+stats) | 20 | | Posts | 49 |
| Vendors (users+profiles) | 5 | | Comments (incl. replies) | 130 |
| Admins | 3 | | Likes | 472 |
| Places (real Egyptian sites) | 35 | | Follows (edges) | 143 |
| Place photos | 70 | | Coupons | 10 |
| Challenges (photo, 2–3/place) | 90 | | Wallet coupons (claimed/redeemed/expired) | 26 |
| Check-ins (Verified) | 130 | | Subscriptions (premium) | 8 |
| Completed challenge attempts | 46 | | Travel plans | 5 |
| Place reviews (verified) | 38 | | Payments (Stripe) | 4 |
| XP transactions | 176 | | Notifications | 114 |

## 🧩 What each screen will show

- **Discover / Map** — 35 places across Giza, Cairo, Luxor, Aswan, Sinai, Alexandria,
  Faiyum, the Western Desert & Red Sea, with real coordinates, photos, challenges & reviews.
- **Search** — full-text search works (places pushed into Meilisearch by the runner).
- **Profile / Gamification** — XP, levels, streaks, check-in & challenge counts per explorer.
- **Feed / Social** — posts (with media), threaded comments, likes, and a dense follow graph
  so every account has a populated feed. Author names & counts resolve correctly.
- **Coupons** — 10 vendor coupons grouped by vendor; wallet has pending/redeemed/expired rows.
- **Premium / Payments** — premium explorers have active subscriptions; Stripe payment rows exist.
- **Notifications** — like / comment / follow notifications, mixed read/unread.

## ⚠️ Gotchas the seed already handles (do NOT re-fix these)

These bit us during authoring; the script and runner already account for them:

1. **UserType enum is 1-based** (renumbered 2026-07-03): **Explorer=1, Admin=2, Vendor=3.**
   Getting this wrong makes feed authors show as "Unknown User". The seed pins it correctly
   and also inserts the matching `AspNetUserRoles` row per user.
2. **Password hash is copied verbatim** from a known-good user (ASP.NET Identity v3 PBKDF2).
   It is `Password123!`. Don't try to compute a new hash — reuse the constant in `generate.js`.
3. **Enum column encoding differs by column type.** TEXT enum columns store the **.NET name**
   (`'FixedAmount'`, `'Percentage'`, `'Claimed'`, `'Redeemed'`, `'Active'`, `'Succeeded'`,
   `'Visa'`, `'Xp'`); INT enum columns store the **ordinal** (CheckIn `ValidationStatus`
   Verified=**1**; Challenge attempt Approved=**1**; XP source CheckIn=**0**, Challenge=**2**;
   Challenge Difficulty Easy/Medium/Hard=0/1/2; Type Photo=0).
4. **Meilisearch is NOT fed by direct SQL.** The backend only indexes a place via a
   `PlaceCreatedEvent` domain handler (never fires on a raw INSERT), and there is **no
   bulk-reindex endpoint**. The runner pushes `scripts/seed/meili_places.json` straight to
   Meilisearch (`localhost:7700`, key `masterKey123`, index `placesearchdocument`). Skip this
   step and search returns 0 results.
5. **Flush Redis after seeding.** Like/follow/feed counters are cached in Redis; without a
   `FLUSHALL` they show stale zeros. The runner does this last.
6. **Coupon.VendorId is the vendor's *user id*** (`d0a…`), because `VendorProfiles` PK = UserId
   and the vendor-side redeem matches on the login user id. Don't point it at a category or a place.
7. **UUIDs must be valid hex.** Deterministic id prefixes only use `0-9a-f` (an early draft used
   `h/v/m` and Postgres rejected them). Keep prefixes hex if you extend the generator.
8. **`gen_random_uuid()` requires pgcrypto** — available by default on this Postgres 13 image;
   used only for security stamps and payment operation ids.

## 🔁 Regenerating / tuning

- Volumes, names, XP, and premium flags live at the top of `scripts/seed/generate.js`.
- `node scripts/seed/generate.js` rewrites `rahal_demo_seed.sql`, `meili_places.json`, and
  `summary.json`. Then re-run `run.ps1` / `run.sh` to apply.
- The seeded PRNG is fixed (`_s = 1337`), so regeneration is reproducible.
