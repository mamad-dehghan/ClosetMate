---
name: ClosetMate
description: Index of project-specific ClosetMate skills for the Next.js wardrobe app in packages/ClosetMate
---

# ClosetMate (project skill index)

ClosetMate is a personal wardrobe organizer and outfit assistant at
`C:/Code/root/packages/ClosetMate` (Next.js 16 App Router, Bun, Drizzle, PGlite/Neon,
Auth.js, Tailwind v4).

The detailed project skills live with the package:

- `packages/ClosetMate/.skills/closetmate-workflow/SKILL.md` — commands, env, routes,
  session bootstrap, gotchas, verification.
- `packages/ClosetMate/.skills/closetmate-data-model/SKILL.md` — schema, ownership
  invariant, guest claim transaction, migrations, adding fields/tables.
- `packages/ClosetMate/.skills/closetmate-ui/SKILL.md` — mobile-first layout, design
  tokens, component and form conventions, copy and a11y rules.

Read those files before changing the app. `packages/ClosetMate/PLAN.md` tracks shipped vs
planned work; `README.md` covers setup and deployment.

Quick facts:

- Package manager and runtime for scripts/tests: **Bun**.
- Local database: PGlite at `.data/pglite` (`DATABASE_URL=` empty). No Docker.
- Migrations: `bun run db:generate` then `bun run db:migrate`. Never hand-edit SQL.
- Auth: Google OAuth when configured, plus a dev email login outside production.
- Guest closets are real rows with `isAnonymous = true`, moved onto the account on
  sign-in. Any new user-owned table must join that transaction.
- Every query is actor-scoped through `src/lib/actor.ts`.
