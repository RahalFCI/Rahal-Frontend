# Rahal demo seed — run guide (for an AI agent or a human)

Fills the backend database with a rich, fully-linked demo dataset: 20 explorers,
5 vendors, 3 admins, 35 places, challenges, check-ins, posts/comments/likes/follows,
coupons, subscriptions, payments, and notifications. See `../../SEEDED_DATA.md` for
the credential list and per-screen expectations.

## TL;DR — run this

From the **frontend repo root** (`E:\projects\Rahal-Frontend`):

```powershell
# Windows / PowerShell
powershell -ExecutionPolicy Bypass -File scripts/seed/run.ps1
```
```bash
# git-bash / WSL / macOS / Linux
bash scripts/seed/run.sh
```

Every account's password is `Password123!`. The run is **idempotent** — safe to repeat.

## Prerequisites

1. **The backend docker stack must be UP.** It lives at `E:\projects\Rahal-Backend`.
   Check first (don't blindly start it):
   ```bash
   docker ps --format '{{.Names}}  {{.Status}}'
   ```
   You need these running: `rahal-backend-postgres-container-1`,
   `rahal-backend-redis-1`, `rahal-backend-meilisearch-1`, `rahal-backend-rahal.api-1`.
   If not up: `cd E:\projects\Rahal-Backend && docker compose up -d` and wait ~20s.
2. **Node** (any recent version) — used only to regenerate the SQL. Already generated
   files are committed, so this works even offline.

## What the runner does (4 steps)

| Step | Action | Command it runs |
|---|---|---|
| 1 | Regenerate SQL from `generate.js` | `node scripts/seed/generate.js` |
| 2 | Wipe + reseed Postgres | `docker exec -i rahal-backend-postgres-container-1 psql -U postgres -d Rahal -v ON_ERROR_STOP=1 < rahal_demo_seed.sql` |
| 3 | Push places to Meilisearch | `POST http://localhost:7700/indexes/placesearchdocument/documents` (key `masterKey123`) |
| 4 | Flush Redis | `docker exec rahal-backend-redis-1 redis-cli FLUSHALL` |

## Manual fallback (if a runner script fails)

Run the four commands above by hand, in order, from the repo root. Step 2 is the only
one that touches the database; steps 3–4 make search and social counters correct.

## Files in this folder

| File | Purpose |
|---|---|
| `generate.js` | **Source of truth.** Emits the SQL + Meili docs + summary. Edit this to change volumes/data. |
| `rahal_demo_seed.sql` | Generated. The wipe + insert script applied to Postgres. |
| `meili_places.json` | Generated. Place documents pushed to Meilisearch (search index). |
| `summary.json` | Generated. Machine-readable account list + counts (used to write `SEEDED_DATA.md`). |
| `run.ps1` / `run.sh` | One-shot runners. |

## Connection facts (baked into the scripts)

- Postgres: container `rahal-backend-postgres-container-1`, db `Rahal`, user `postgres`, password `admin`, port 5432.
- Meilisearch: `http://localhost:7700`, master key `masterKey123`, index `placesearchdocument`.
- Redis: container `rahal-backend-redis-1`.
- API: `http://localhost:7145` (login: `POST /api/User/login`).

## ⚠️ Read the gotchas before editing `generate.js`

Section "Gotchas the seed already handles" in `../../SEEDED_DATA.md` lists the traps
(UserType enum = Explorer 1 / Admin 2 / Vendor 3, enum encoding by column type,
Meilisearch not fed by SQL, Redis flush, hex-only UUIDs, Coupon.VendorId = user id).
Don't re-discover them the hard way.
