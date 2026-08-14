# Closest Wins

`closest-wins` is a Next.js App Router project for the Closest Wins game. The repository now includes Milestone 1 setup work and Milestone 2 foundations for Neon-backed persistence, Clerk authentication, seeded users, and protected role-based routing.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma ORM with PostgreSQL
- Clerk authentication
- ESLint 9 and Prettier 3

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Add your Neon and Clerk credentials to `.env`.

Required values:

```bash
DATABASE_URL="postgresql://...dev-branch-pooler..."
DIRECT_URL="postgresql://...dev-branch-direct-host..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

For this repo, local development should use the Neon `dev` branch connection strings.
Production should keep using the Neon `production` branch connection strings in Vercel.

4. Create the database schema:

```bash
npm run prisma:migrate -- --name init-auth
```

5. Seed the demo accounts:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Ways to run localhost

### 1. Fastest dev path with Neon

Use this when you want the app talking directly to the remote Neon database and Clerk:

```bash
npm install
cp .env.example .env
npm run dev
```

In this mode:

- `DATABASE_URL` should be the pooled connection string for the Neon `dev` branch
- `DIRECT_URL` should be the direct connection string for the Neon `dev` branch
- Vercel production env vars should stay pointed at the Neon `production` branch

### 2. Full Docker Compose stack

Use this when you want the app and database both running in containers:

```bash
npm install
cp .env.example .env
docker compose up --build
```

In this mode:

- `postgres` runs as a local Postgres 16 container
- `web` builds the Next.js app image and serves it on [http://localhost:3000](http://localhost:3000)
- Prisma migrations run automatically when the `web` container starts
- `DATABASE_URL` and `DIRECT_URL` are provided by [`docker-compose.yml`](/Users/elisayu/Desktop/closest-wins/docker-compose.yml)
- You still need valid Clerk keys in `.env`

Useful commands:

```bash
npm run docker:up
npm run docker:down
npm run docker:logs
```

### 3. Local Postgres container plus Clerk

Use this when you want a local Postgres instance instead of Neon for database work:

```bash
npm install
cp .env.example .env
npm run db:up
npm run prisma:migrate -- --name init-auth
npm run db:seed
npm run dev
```

In that mode, replace `DATABASE_URL` and `DIRECT_URL` in `.env` with local Postgres URLs before running the migration.

### 4. Production-mode localhost check

Use this to verify the built app locally before deployment:

```bash
npm install
npm run build
npm run start
```

This also serves the app at [http://localhost:3000](http://localhost:3000).

## Demo accounts

The Prisma seed script creates these local accounts:

- Admin: `admin@closestwins.com` / `Admin123!`
- User: `user@closestwins.com` / `Player123!`

## Protected routes

- `/admin` requires an authenticated admin user
- `/player` requires an authenticated player user
- `/dashboard` redirects authenticated users to the correct destination

## Deployed site

The latest production deployment I found on Sunday, August 9, 2026 is:

- [https://closest-wins-q2sb8kgoe-elisa-yus-projects.vercel.app](https://closest-wins-q2sb8kgoe-elisa-yus-projects.vercel.app)

This is the current production deployment URL, not a custom domain.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run format:check
```

To apply formatting changes:

```bash
npm run format
```

## Database scripts

- `npm run prisma:generate` regenerates the Prisma client
- `npm run prisma:migrate` runs Prisma migrations in development
- `npm run prisma:migrate:deploy` applies committed Prisma migrations in production-style environments
- `npm run db:seed` seeds the demo users
- `npm run db:up` starts the optional local PostgreSQL container
- `npm run db:down` stops the optional local PostgreSQL container
- `npm run docker:up` starts the full Docker Compose stack
- `npm run docker:down` stops the full Docker Compose stack
- `npm run docker:logs` tails the app container logs

## Neon branch setup

- Use the Neon `production` branch for Vercel production deployments
- Use the Neon `dev` branch for local development and non-production Prisma work
- Keep `DATABASE_URL` on the pooled Neon host
- Keep `DIRECT_URL` on the direct Neon host for migrations and schema operations

## Role-based routes

- `/sign-in` for existing users
- `/sign-up` for new player accounts
- `/admin` for admin-only access
- `/player` for player-only access
- `/dashboard` as the role-aware redirect entry point

## Branch naming workflow

Accepted branch patterns:

- `feature/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`
- `test/<short-description>`
- `ci/<short-description>`
- `release/<version-or-name>`
- `main`
- `develop`

Use lowercase words with hyphens when possible, for example `feature/landing-page` or `fix/signup-validation`.

## Collaboration templates

The repo includes:

- Bug report issue template
- Feature request issue template
- Pull request template

These live under [`.github/`](/Users/elisayu/Desktop/closest-wins/.github).

## Deployment

The initial production deployment was shipped to Vercel on August 8, 2026.

- Production URL: [closest-wins-ashen.vercel.app](https://closest-wins-ashen.vercel.app)
- Deploy command: `vercel --prod`

Before future deployments, make sure the Vercel project is linked locally and that the branch is in a reviewable state.

## Deployment notes

For Milestone 2, make sure production has:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
