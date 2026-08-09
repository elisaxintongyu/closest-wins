<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository Workflow

Use Graphite for all GitHub interactions in this repository, including branch management, syncing, commits when appropriate to the workflow, and pull request creation or updates.
Prefer Graphite over plain GitHub CLI flows unless a task explicitly requires raw `git` or another tool.

## Localhost Startup

Use one of these localhost flows depending on the task:

- Neon dev flow: `npm install`, `cp .env.example .env`, set Neon and Clerk env vars, then run `npm run dev`.
- Local Postgres flow: `npm install`, `cp .env.example .env`, swap `DATABASE_URL` and `DIRECT_URL` to local Postgres values, run `npm run db:up`, run `npm run prisma:migrate -- --name init-auth`, then run `npm run dev`.
- Production-mode local check: `npm install`, `npm run build`, then `npm run start`.

The local app URL is [http://localhost:3000](http://localhost:3000).

## Deployed Site

As of Sunday, August 9, 2026, the latest production deployment is:

- [https://closest-wins-q2sb8kgoe-elisa-yus-projects.vercel.app](https://closest-wins-q2sb8kgoe-elisa-yus-projects.vercel.app)

Treat that as the current deployed site unless a newer production deployment is verified.
