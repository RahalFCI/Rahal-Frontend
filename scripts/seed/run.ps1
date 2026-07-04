# Rahal demo seed — one-shot runner (PowerShell).
# Wipes + reseeds the Dockerized Postgres, pushes places to Meilisearch, flushes Redis.
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File scripts/seed/run.ps1
# Requires: the backend docker compose stack is UP (see scripts/seed/README.md).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot          # repo root
$seed = $PSScriptRoot
$PG   = 'rahal-backend-postgres-container-1'
$REDIS= 'rahal-backend-redis-1'
$MEILI= 'http://localhost:7700'
$MEILI_KEY = 'masterKey123'

Write-Host '==> [1/4] Regenerating SQL from generator...' -ForegroundColor Cyan
node "$seed/generate.js"

Write-Host '==> [2/4] Applying SQL (wipe + reseed Postgres)...' -ForegroundColor Cyan
# -i pipes the file into psql inside the container; ON_ERROR_STOP aborts on any error.
Get-Content "$seed/rahal_demo_seed.sql" -Raw | docker exec -i $PG psql -U postgres -d Rahal -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw "psql failed with exit code $LASTEXITCODE" }

Write-Host '==> [3/4] Pushing places into Meilisearch (search index)...' -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri "$MEILI/indexes/placesearchdocument/documents?primaryKey=id" `
  -Headers @{ Authorization = "Bearer $MEILI_KEY" } -ContentType 'application/json' `
  -InFile "$seed/meili_places.json" | Out-Null

Write-Host '==> [4/4] Flushing Redis (rehydrate like/follow/feed counters)...' -ForegroundColor Cyan
docker exec $REDIS redis-cli FLUSHALL | Out-Null

Write-Host ''
Write-Host 'Seed complete. All accounts: password "Password123!"  (see SEEDED_DATA.md).' -ForegroundColor Green
