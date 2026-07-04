#!/usr/bin/env bash
# Rahal demo seed — one-shot runner (bash / git-bash / WSL / macOS / Linux).
# Wipes + reseeds the Dockerized Postgres, pushes places to Meilisearch, flushes Redis.
# Run from the repo root:  bash scripts/seed/run.sh
# Requires: the backend docker compose stack is UP (see scripts/seed/README.md).
set -euo pipefail

SEED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PG=rahal-backend-postgres-container-1
REDIS=rahal-backend-redis-1
MEILI=http://localhost:7700
MEILI_KEY=masterKey123

echo "==> [1/4] Regenerating SQL from generator..."
node "$SEED_DIR/generate.js"

echo "==> [2/4] Applying SQL (wipe + reseed Postgres)..."
docker exec -i "$PG" psql -U postgres -d Rahal -v ON_ERROR_STOP=1 < "$SEED_DIR/rahal_demo_seed.sql"

echo "==> [3/4] Pushing places into Meilisearch (search index)..."
curl -sf -X POST "$MEILI/indexes/placesearchdocument/documents?primaryKey=id" \
  -H "Authorization: Bearer $MEILI_KEY" -H "Content-Type: application/json" \
  --data-binary "@$SEED_DIR/meili_places.json" >/dev/null

echo "==> [4/4] Flushing Redis (rehydrate like/follow/feed counters)..."
docker exec "$REDIS" redis-cli FLUSHALL >/dev/null

echo ""
echo "Seed complete. All accounts: password \"Password123!\"  (see SEEDED_DATA.md)."
