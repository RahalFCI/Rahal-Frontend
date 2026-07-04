# Rahal — Seeded Demo Data

> Generated 2026-06-30T10:11:07.068Z • Inserted directly into the Dockerized Postgres (`Rahal` DB).
> All demo accounts share the password below and are email-confirmed (login works immediately).

## 🔑 Login credentials

| Field | Value |
|---|---|wwlayla.demo@rahal.test 
| Password (all avccounts) | `Password123!` |
ررر
v
### Explorer accounts (12)

| # | Name | Email | Level | XP (cum) | Premium | Avatar |
|---|------|-------|-------|----------|---------|--------|
| 1 | Layla Hassan | `layla.demo@rahal.test` | 9 | 1240 | ✅ | [pic](https://i.pravatar.cc/400?img=7) |
| 2 | Omar Farouk | `omar.demo@rahal.test` | 6 | 720 | — | [pic](https://i.pravatar.cc/400?img=14) |
| 3 | Nour Adel | `nour.demo@rahal.test` | 4 | 410 | — | [pic](https://i.pravatar.cc/400?img=21) |
| 4 | Youssef Mansour | `youssef.demo@rahal.test` | 12 | 1890 | ✅ | [pic](https://i.pravatar.cc/400?img=28) |
| 5 | Mariam Saleh | `mariam.demo@rahal.test` | 3 | 260 | — | [pic](https://i.pravatar.cc/400?img=35) |
| 6 | Karim Adel | `karim.demo@rahal.test` | 7 | 880 | — | [pic](https://i.pravatar.cc/400?img=42) |
| 7 | Salma Ibrahim | `salma.demo@rahal.test` | 8 | 1010 | ✅ | [pic](https://i.pravatar.cc/400?img=49) |
| 8 | Tarek Nabil | `tarek.demo@rahal.test` | 5 | 560 | — | [pic](https://i.pravatar.cc/400?img=56) |
| 9 | Habiba Wael | `habiba.demo@rahal.test` | 4 | 380 | — | [pic](https://i.pravatar.cc/400?img=63) |
| 10 | Ali Mostafa | `ali.demo@rahal.test` | 11 | 1650 | ✅ | [pic](https://i.pravatar.cc/400?img=0) |
| 11 | Dina Kamal | `dina.demo@rahal.test` | 5 | 540 | — | [pic](https://i.pravatar.cc/400?img=7) |
| 12 | Hany Sobhy | `hany.demo@rahal.test` | 6 | 700 | — | [pic](https://i.pravatar.cc/400?img=14) |

### Vendor accounts (4)

| # | Name | Email | Category | Address |
|---|------|-------|----------|---------|
| 1 | Sahara Bean Café | `sahara.vendor@rahal.test` | Cafes & Eateries | Maadi, Cairo |
| 2 | Nile Pearl Cruises | `nile.vendor@rahal.test` | Tours & Cruises | Aswan Corniche |
| 3 | Khan Relics Bazaar | `khan.vendor@rahal.test` | Shops & Bazaars | Khan el-Khalili, Cairo |
| 4 | Red Sea Divers Co. | `red.vendor@rahal.test` | Dive & Adventure | Dahab, South Sinai |

## 🗺️ Places (20)

Each place has 2 photos. Categories reuse the existing seeded `PlaceCategories`.

| # | Name | Governorate | Lat, Lng |
|---|------|-------------|----------|
| 1 | Temple of Hatshepsut | Luxor | 25.738, 32.6065 |
| 2 | Colossi of Memnon | Luxor | 25.7206, 32.6105 |
| 3 | Temple of Horus (Edfu) | Aswan | 24.9779, 32.8732 |
| 4 | Kom Ombo Temple | Aswan | 24.4522, 32.9281 |
| 5 | Unfinished Obelisk | Aswan | 24.0784, 32.8956 |
| 6 | Aswan High Dam | Aswan | 23.9707, 32.8773 |
| 7 | Nubian Museum | Aswan | 24.0833, 32.8997 |
| 8 | Saint Catherine's Monastery | South Sinai | 28.5559, 33.976 |
| 9 | Mount Sinai | South Sinai | 28.5394, 33.975 |
| 10 | Ras Muhammad National Park | South Sinai | 27.7333, 34.25 |
| 11 | Cairo Tower | Cairo | 30.0459, 31.2243 |
| 12 | Mosque of Ibn Tulun | Cairo | 30.0287, 31.2497 |
| 13 | Sultan Hassan Mosque | Cairo | 30.0322, 31.2562 |
| 14 | Al-Azhar Park | Cairo | 30.0405, 31.2645 |
| 15 | Wadi El Rayan | Faiyum | 29.2, 30.4167 |
| 16 | Wadi Al-Hitan (Whale Valley) | Faiyum | 29.2667, 30.0417 |
| 17 | Montaza Palace | Alexandria | 31.2887, 30.0156 |
| 18 | Catacombs of Kom El Shoqafa | Alexandria | 31.1782, 29.8923 |
| 19 | Nubian Village (Gharb Soheil) | Aswan | 24.0469, 32.879 |
| 20 | El Gouna Marina | Red Sea | 27.3954, 33.6783 |

## 🗺️ Additional places (2026-07-03, `scripts/more_places_and_challenges.sql`)

6 new places added, plus challenges backfilled for every place that had none (135 new challenges total across 46 places — every place now has at least 2-3).

| # | Name | Governorate | Lat, Lng | Geofence |
|---|------|-------------|----------|----------|
| 1 | Dendera Temple Complex | Qena | 26.1417, 32.6704 | 500m |
| 2 | Abydos Temple of Seti I | Sohag | 26.1844, 31.9192 | 500m |
| 3 | Lake Qarun | Faiyum | 29.4667, 30.5833 | 300m |
| 4 | Marsa Alam Coral Reefs | Red Sea | 25.0670, 34.8930 | 300m |
| 5 | Ras El Bar Corniche | Damietta | 31.5167, 31.6500 | 250m |
| 6 | **Baron Empain Palace** | Cairo (Heliopolis) | 30.0904, 31.3211 | 200m |

**Baron Empain Palace is the new `DEV_PINNED_LOCATION`** (`src/features/gamification/hooks/useCheckIn.ts`) — it has never been checked into, so it's the place to simulate a successful check-in against. Any other place's geofence will now correctly reject a check-in attempt.

## 📊 Volume summary

| Entity | Count |
|---|---|
| Explorer users + profiles + stats | 12 |
| Vendor users + profiles | 4 |
| Vendor categories | 4 |
| Places | 20 |
| Place photos | 40 |
| Check-ins (Verified) | 33 |
| Place reviews | 12 |
| Posts | 22 |
| Post→place tags | 12 |
| Comments (incl. replies) | 51 |
| Likes | 125 |
| Follows (edges) | 80 |

## 🧩 Notes

- **Profile pictures**: explorer avatars use `i.pravatar.cc` (real faces); vendor/place/post images use `picsum.photos`. The app passes absolute `http(s)` URLs through unchanged (`resolveMediaUrl`).
- **Avatars in the social feed** render as initials by design; profile pictures show on the explorer/vendor **profile** screens.
- **Feed** = posts from people you follow (+ your own). The follow graph is dense (~60% edges), so every demo account has a full feed.
- **Check-ins** are pre-validated (`ValidationStatus = Verified`) with coordinates matching the place, bypassing geo-fencing.
- Redis was flushed after seeding so feed/like/follow counters rehydrate from the database.
- IDs are deterministic (prefixes: explorers `e0a…`, vendors `d0a…`, places `f1a…`, posts `a0a…`, comments `b0b…`).
