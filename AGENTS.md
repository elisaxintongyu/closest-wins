<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository Workflow

Use Graphite for all GitHub interactions in this repository, including branch management, syncing, commits when appropriate to the workflow, and pull request creation or updates.
Prefer Graphite over plain GitHub CLI flows unless a task explicitly requires raw `git` or another tool.

Create one branch per issue.

- Use the issue-aligned branch naming pattern already in use, for example `feature/15-create-prisma-schema`.
- Keep each branch focused on a single issue or deliverable.

Use one Graphite stack per milestone when work is sequential.

- Milestone 2 is the current example: issues `#15` through `#20` were managed as one ordered stack.
- Put lower-level foundation work at the bottom of the stack and build later branches on top of it.
- Restack before submitting when trunk or lower branches change.

Keep PR scope aligned with the branch’s issue.

- Each PR description should describe only that slice of the milestone, not the entire upstack state.
- If a later restack changes the effective contents of a branch, update the PR description to match the current branch reality.

Prefer updating the existing stack over creating parallel overlapping branches.

- If work depends on an earlier issue branch, stack on top of it instead of branching from `main`.
- If conflicts appear during `gt restack`, resolve them in a way that preserves the newest intended architecture for the stack.

Before submitting or merging:

- Run `npm run env:check` before local verification when env-sensitive flows changed
- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run format:check` when formatting-sensitive files changed
- Run `npm run test:e2e` after installing Playwright's Chromium browser when E2E-related files change
- Update `README.md` and `AGENTS.md` when workflow, infrastructure, or setup expectations change

## Current Stack

The current product direction for the repository is:

- Frontend: Next.js 16 App Router with React 19 and TypeScript 5
- Styling: Tailwind CSS 4
- ORM: Prisma
- Database: Neon-hosted PostgreSQL
- Authentication and user management: Clerk
- Deployment platform: Vercel
- Branch and PR workflow: Graphite stacked branches

## Infrastructure Notes

Database:

- The app database is hosted on Neon.
- Prisma should use the pooled Neon connection for `DATABASE_URL`.
- Prisma migrations should use the direct Neon connection for `DIRECT_URL`.
- Local development should use the Neon `dev` branch connection strings.
- Production deployments should use the Neon `production` branch connection strings.

User management and authentication:

- Clerk is the current authentication and user-management provider.
- Clerk handles sign-in, sign-up, and session management.
- Application-specific role and profile data may still live in PostgreSQL through Prisma.

Deployment:

- Production deploys run on Vercel.
- As of Friday, August 14, 2026, the stable production alias is `https://closest-wins-elisa-yus-projects.vercel.app`.
- As of Friday, August 14, 2026, the latest immutable production deployment URL is `https://closest-wins-lxiqa5qn3-elisa-yus-projects.vercel.app`.

## Local Setup Expectations

Agents should assume local development typically requires:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Use `npm run env:check` to verify the local set before debugging auth or Prisma failures.

For this repository:

- local `.env` should point `DATABASE_URL` and `DIRECT_URL` at the Neon `dev` branch
- Vercel production environment variables should stay pointed at the Neon `production` branch

When documenting or updating setup instructions, distinguish between:

- Neon-backed local development
- optional local Postgres workflows, if still supported on the branch
- production deployment configuration on Vercel

## Localhost Startup

Use one of these localhost flows depending on the task:

- Neon dev flow: `npm install`, `cp .env.example .env`, set Neon and Clerk env vars, then run `npm run dev`.
- Full Docker Compose flow: `npm install`, `cp .env.example .env`, set Clerk env vars, then run `docker compose up --build`.
- Local Postgres flow: `npm install`, `cp .env.example .env`, swap `DATABASE_URL` and `DIRECT_URL` to local Postgres values, run `npm run db:up`, run `npm run prisma:migrate -- --name init-auth`, then run `npm run dev`.
- Production-mode local check: `npm install`, `npm run build`, then `npm run start`.

The local app URL is [http://localhost:3000](http://localhost:3000).

## Deployed Site

As of Friday, August 14, 2026:

- Stable production alias: [https://closest-wins-elisa-yus-projects.vercel.app](https://closest-wins-elisa-yus-projects.vercel.app)
- Latest immutable production deployment: [https://closest-wins-lxiqa5qn3-elisa-yus-projects.vercel.app](https://closest-wins-lxiqa5qn3-elisa-yus-projects.vercel.app)

Treat the stable alias as the current deployed site unless a newer production alias or custom domain is verified.
