#!/bin/sh
set -e

echo "[backend] Running relational migrations..."
node ./scripts/run-migrations.js

echo "[backend] Seeding admin user if requested..."
node ./scripts/seed-admin.js

echo "[backend] Starting NestJS application..."
exec node dist/main.js
