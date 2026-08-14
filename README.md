# Closest Wins

`closest-wins` is a multiplayer trivia-style web app where every round asks for a numerical guess and the closest team wins the point. The current app includes admin hosting tools, player join and lobby flows, revealed-answer scoring, completed-game history, end-to-end tests, and documentation for Neon, Clerk, Docker, and Vercel-backed local development.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma ORM with PostgreSQL
- Clerk authentication
- ESLint 9 and Prettier 3

## What the app does today

### Authentication and access

- `/sign-in` is the primary entry route for existing users
- `/sign-up` creates new player accounts through Clerk
- `/dashboard` redirects signed-in users by role
- `/admin` is admin-only
- `/player` is player-only

### Admin host flow

Admins can:

- create a game and generate a six-character join code
- add questions one at a time or upload them from a spreadsheet
- edit, reorder, delete, open, close, and reveal rounds
- monitor current games and review completed game history with standings

### Player flow

Players can:

- enter a join code to confirm the correct game
- create a team or reopen a game they already joined
- use the player game page for guessing and standings
- use the lobby page for team presence, shared waiting, and revealed answers

## Round lifecycle and scoring

Every question moves through the same host-controlled lifecycle:

1. `HIDDEN`: the question exists in the set but is not live yet.
2. `OPEN`: teams can submit one numerical guess.
3. `CLOSED`: the host has stopped accepting guesses.
4. `REVEALED`: the app shows the prompt, correct answer, explanation, winners, and updated standings.

Scoring behavior:

- each team gets one guess per round
- the team with the smallest absolute distance from the correct answer wins
- ties are allowed, so multiple teams can win the same round
- each winning team receives one point
- once every round in a game is revealed, the game is marked `COMPLETED`

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
- Set `APP_PORT` in `.env` if port `3000` is already in use on the host, for example `APP_PORT="3001"`

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
- Player: `user@closestwins.com` / `Player123!`

These accounts are useful for quick local verification after seeding. In Playwright test mode, the suite also provisions isolated session-based test users automatically.

## Local verification checklist

After changing app behavior, the standard local verification path is:

```bash
npm run env:check
npm run lint
npm run typecheck
npm run format:check
```

When E2E-related files or gameplay flows change, also run:

```bash
npx playwright install chromium
npm run test:e2e
```

The current E2E suite covers:

- auth and role-based routing
- admin question CRUD and bulk upload
- full gameplay flow through reveal and completion
- authorization boundaries
- user-facing empty, error, and route-state behavior

## Deployed site

As of Friday, August 14, 2026:

- Stable production alias: [https://closest-wins-elisa-yus-projects.vercel.app](https://closest-wins-elisa-yus-projects.vercel.app)
- Latest immutable production deployment: [https://closest-wins-lxiqa5qn3-elisa-yus-projects.vercel.app](https://closest-wins-lxiqa5qn3-elisa-yus-projects.vercel.app)

Important deployment note:

- the stable alias above is the URL that should represent current production
- immutable `*.vercel.app` deployment URLs are snapshots and do not update after later deploys
- the older `closest-wins-q2sb8kgoe-elisa-yus-projects.vercel.app` URL is an August 8, 2026 production snapshot, not the latest release

## Production auth note

Production currently uses Clerk for sign-in and sign-up, but the Vercel project also has Vercel Authentication enabled for `vercel.app` domains. That means the stable production alias and immutable deployment URLs can require a separate Vercel SSO step before the app's own Clerk flow loads fully.

When debugging production auth:

- verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in Vercel production env vars
- confirm Clerk is configured for the stable production host instead of a one-off deployment hostname
- remember that Vercel Authentication can intercept requests to `/__clerk/*` on protected `vercel.app` domains

## E2E testing

This repo uses Playwright for end-to-end browser coverage.

1. Install browser binaries the first time:

```bash
npx playwright install chromium
```

2. Make sure your local `.env` is configured with the same Neon and Clerk values required for `npm run dev`.

3. Run the E2E suite:

```bash
npm run test:e2e
```

Useful variants:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug
npm run test:e2e:report
```

Notes:

- The Playwright config starts its own Next.js dev server on `http://localhost:3100`
- The E2E suite enables an isolated test-auth mode automatically, so it does not depend on live Clerk UI
- The suite covers auth, question CRUD, authorization boundaries, full gameplay flow, and user-facing empty/error states
- CI runs the same suite against a local Postgres service in [`.github/workflows/ci.yml`](/Users/elisayu/Desktop/closest-wins/.github/workflows/ci.yml)

## Environment validation

Use the environment check scripts before debugging auth, Prisma, or deployment issues:

```bash
npm run env:check
npm run env:check:docker
npm run env:check:production
```

These checks verify that required variables are present, avoid example placeholders, and confirm the expected database host for local, Docker, CI, or production flows without printing secrets.

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

## Operational notes

- Use the Neon `dev` branch for local development.
- Keep Vercel production environment variables pointed at the Neon `production` branch.
- `DATABASE_URL` should use the pooled Neon host.
- `DIRECT_URL` should use the direct Neon host for Prisma migrations and schema operations.
- Run `npm run env:check` before debugging Clerk auth, Prisma connections, or route protection issues.

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

## CI coverage

As of Friday, August 14, 2026, GitHub Actions is configured to:

- validate environment variables for CI
- apply Prisma migrations to a local Postgres service
- seed demo users
- run `npm run lint`
- run `npm run typecheck`
- run the full Playwright E2E suite

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
