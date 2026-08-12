# Closest Wins

`closest-wins` is a Next.js App Router project for the Closest Wins game. This branch connects Neon-backed Prisma data access with Clerk authentication for sign-in, sign-up, and session handling.

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
DATABASE_URL="postgresql://...pooler..."
DIRECT_URL="postgresql://...direct-host..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

4. Start the app against Neon:

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

### 2. Local Postgres container plus Clerk

Use this when you want a local Postgres instance instead of Neon for database work:

```bash
npm install
cp .env.example .env
npm run db:up
npm run prisma:migrate -- --name init-auth
npm run dev
```

In that mode, replace `DATABASE_URL` and `DIRECT_URL` in `.env` with local Postgres URLs before running the migration.

### 3. Production-mode localhost check

Use this to verify the built app locally before deployment:

```bash
npm install
npm run build
npm run start
```

This also serves the app at [http://localhost:3000](http://localhost:3000).

## Authentication routes

- `/sign-in` for existing users
- `/sign-up` for new users

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
- `npm run db:up` starts the optional local PostgreSQL container
- `npm run db:down` stops the optional local PostgreSQL container

## Branch naming workflow

This repository includes a GitHub Actions workflow that validates branch names on pushes and pull requests.

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

For this branch, make sure local or production environments have:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
