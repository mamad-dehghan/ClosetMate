---
name: ClosetMate Workflow
description: Run, migrate, test and debug the ClosetMate Next.js app inside the bun workspace
---

# ClosetMate Workflow

App: `C:/Code/root/packages/ClosetMate` (part of the bun workspace at `C:/Code/root`).
**Use Bun for everything** — install, scripts, tests. Do not add npm/node-specific tooling.

## Commands

```bash
# install (always from repo root)
bun install

cd packages/ClosetMate
bun run dev            # next dev via bun
bun run build          # production build
bun run typecheck      # tsc --noEmit
bun test               # bun's runner, *.test.ts
bun run db:generate    # schema -> drizzle/*.sql
bun run db:migrate     # apply migrations (PGlite or Postgres)
bun run db:seed        # demo@closetmate.app with 12 pieces
bun run db:reset       # wipe local PGlite + migrate + seed (recovery)
bun run setup          # migrate + seed
```

## Local environment

`.env.local` is gitignored and already present:

```
AUTH_SECRET=...            # dev value
ALLOW_DEV_LOGIN=1
DATABASE_URL=              # empty => PGlite at .data/pglite
STORAGE_DRIVER=local       # .data/uploads
```

With `DATABASE_URL` empty the app uses PGlite (embedded Postgres, no Docker). Setting a
`postgres://` URL switches to a real server with no code changes. Both `db:migrate` and the
app use the same detection logic.

## First run after a fresh clone

```bash
bun install
cd packages/ClosetMate
cp .env.example .env.local
bun run db:migrate
bun run db:seed      # optional
bun run dev
```

`db:migrate` must run before the app, or queries fail because tables do not exist.
PGlite refuses to start if its directory is missing — the client creates it with
`mkdirSync(..., { recursive: true })`. Keep that in `createPgliteClient`.

## Routes

| URL | Source |
| --- | --- |
| `/` | `src/app/(marketing)/page.tsx` |
| `/demo` | `src/app/(marketing)/demo/page.tsx` |
| `/login`, `/register` | `src/app/(auth)/...` |
| `/app/today`, `/app/wardrobe`, `/app/outfits`, `/app/calendar`, `/app/profile` | `src/app/app/...` |

`src/app/app/` is a real `app` URL segment, **not** a route group. The public and auth
sections use `(marketing)` / `(auth)` groups. Do not rename `src/app/app` to `(app)` —
that silently moves every product route to `/today`, `/wardrobe`, etc.

## Session bootstrap

`src/proxy.ts` (Next 16's replacement for `middleware.ts`) runs on `/app/:path*` and only
checks whether a session cookie exists. If none exists it redirects to
`/api/guest?next=<path>`, which creates an anonymous user, sets the signed `cm_guest`
cookie, and sends the visitor back. Real validation and DB lookups happen in
`src/app/app/layout.tsx` via `getActor()`. Never import the database into `proxy.ts`.

## Outfits and wear history

- Outfit mutations live in `src/lib/actions/outfits.ts`; queries in `src/db/queries/outfits.ts`.
- Saving an outfit replaces all `outfit_items` rows inside a transaction, preserving the
  user's selection order via `position`.
- "Mark worn" writes one `outfit_wears` row per outfit per date (checked before insert).
- A day has at most one `outfit_plans` row: `planOutfitAction` deletes the day's plan and
  inserts the new one in a transaction.
- Item wear stats are derived by joining `outfit_wears` → `outfit_items`; there is no
  `items.last_worn` column.
- Seeded guest/demo closets include four outfits, one wear and one plan for today
  (`seedOutfits` in `src/lib/seed.ts`).

## Gotchas

- **Never run a second process against `.data/pglite` while `dev` is running.** PGlite is
  single-writer. For scripts against live data, stop the dev server, or point
  `PGLITE_DIR` at a temp directory and migrate it first.
- **Stop the dev server with Ctrl+C, not a process kill.** Force-terminating while Postgres
  is writing corrupts the PGlite directory; the next query fails with `Aborted()` or
  `Failed query`. Recover with `bun run db:reset` (wipes local data, migrates, reseeds).
- `bun run db:generate` is the only way to change the database. Do not hand-edit
  `drizzle/*.sql`; regenerate and re-migrate.
- `next dev` regenerates `AGENTS.md` with Next version notes. Leave it in the tree.
- The dev credentials provider exists only outside production or with
  `ALLOW_DEV_LOGIN=1`. Never enable it on a public deployment.
- Turpopack prints a warning about dynamic `path` usage in `src/db/client.ts`; it is
  non-fatal. Keep filesystem paths statically scoped (`path.join(process.cwd(), ".data", ...)`).
- Google sign-in is hidden when `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are unset; the app
  must stay usable without them.

## Verify a change

```bash
bun test && bun run typecheck && bun run build
```

Then smoke test with a guest cookie:

```bash
curl -s -c .cookies.txt -o /dev/null -w "%{http_code}\n" \
  "http://localhost:3000/api/guest?next=/app/today"
curl -s -b .cookies.txt http://localhost:3000/app/wardrobe | head -c 400
```

Guest claim is the highest-risk flow. To re-check it in isolation, `PGLITE_DIR=.data/tmp
bun scripts/migrate.ts` then run a script that calls `createGuestUser()` and
`claimGuestWardrobe()` and asserts item counts moved.
