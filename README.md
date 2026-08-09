# Closest Wins

`closest-wins` is a Next.js App Router project for the Closest Wins game. Milestone 1 establishes the frontend foundation, code quality tooling, and collaboration standards for the rest of the build.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- ESLint 9
- Prettier 3

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

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

## Collaboration templates

The repo includes:

- Bug report issue template
- Feature request issue template
- Pull request template

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
