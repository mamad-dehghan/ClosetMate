---
name: ClosetMate
description: Index of project-specific ClosetMate skills for the standalone Next.js wardrobe app
---

# ClosetMate (project skill index)

ClosetMate is a personal wardrobe organizer and outfit assistant in this repository
(`C:/Code/root/packages/ClosetMate` checkout; Next.js 16 App Router, Bun, Drizzle,
PGlite/Neon, Auth.js, Tailwind v4).

The detailed project skills live under `.skills/` in this repository. Relative to this
skill's directory (`.opencode/skills/closetmate/`):

- `../../../.skills/closetmate-workflow/SKILL.md` — commands, env, routes,
  session bootstrap, gotchas, verification.
- `../../../.skills/closetmate-data-model/SKILL.md` — schema, ownership
  invariant, guest claim transaction, migrations, adding fields/tables.
- `../../../.skills/closetmate-ui/SKILL.md` — mobile-first layout, design
  tokens, component and form conventions, copy and a11y rules.

Read those files before changing the app. `../../../PLAN.md` tracks shipped vs
planned work; `../../../README.md` covers setup and deployment.

Quick facts:

- Package manager and runtime for scripts/tests: **Bun**.
- Local database: PGlite at `.data/pglite` (`DATABASE_URL=` empty). No Docker.
- Migrations: `bun run db:generate` then `bun run db:migrate`. Never hand-edit SQL.
- Auth: Google OAuth when configured, email + password accounts, plus a dev email login
  outside production. Passwords are scrypt-hashed in `users.password_hash`.
- Guest closets are real rows with `isAnonymous = true`, moved onto the account on
  sign-in. Any new user-owned table must join that transaction.
- Every query is actor-scoped through `src/lib/actor.ts`.
