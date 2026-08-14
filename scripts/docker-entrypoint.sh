#!/bin/sh
set -eu

echo "Generating Prisma client..."
npx prisma generate

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting Next.js server..."
exec npm run start
