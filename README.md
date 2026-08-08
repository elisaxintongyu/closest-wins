# Closest Wins

`closest-wins` is a Next.js App Router project for the Closest Wins game. This branch adds credentials authentication on top of the Prisma and PostgreSQL foundation from the earlier stack branches.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma ORM with PostgreSQL
- Auth.js credentials authentication
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

3. Add your Neon connection strings to `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@EP-XXXX-POOLER.us-west-2.aws.neon.tech/closest_wins?sslmode=require&pgbouncer=true&connect_timeout=15&schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@EP-XXXX.us-west-2.aws.neon.tech/closest_wins?sslmode=require&connect_timeout=15&schema=public"
```

Use the pooled Neon URL for `DATABASE_URL` and the non-pooled direct Neon URL for `DIRECT_URL` so Prisma Client and Prisma Migrate both work reliably.

4. Create the database schema in Neon:

```bash
npm run prisma:migrate -- --name init-auth
```

5. Start the app:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Authentication routes

- `/sign-in` for existing users
- `/sign-up` for new users

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
- `AUTH_SECRET`
- `AUTH_URL`
