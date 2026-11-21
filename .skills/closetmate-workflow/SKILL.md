---
name: ClosetMate Workflow
description: Run, migrate, test and debug the standalone ClosetMate Next.js app
---

# ClosetMate Workflow

App repo root: `C:/Code/root/packages/ClosetMate` (standalone Bun project; install and run here).
**Use Bun for everything** — install, scripts, tests. Do not add npm/node-specific tooling.

## Commands

```bash
# all commands from this repository root
bun install
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

## Accounts and passwords

- Email/password accounts are stored as salted scrypt hashes in `users.password_hash`.
  Use `hashPassword` / `verifyPassword` from `src/lib/password.ts`; never compare plaintext.
- Registration can seed the twelve `SAMPLE_ITEMS`. Empty closets also show a
  `FillSamplesButton` that calls `fillSampleWardrobeAction`; it is a no-op unless the
  closet has no items at all (archived items count).
- There is no email verification or password reset flow yet. Email is only the sign-in
  identifier.
- Google and dev-login accounts have no password hash and keep using their original method.
- Registering from a guest closet claims the guest wardrobe before the first render;
  Google and existing-account sign-ins still use the client `GuestClaim`.

## First run after a fresh clone

```bash
bun install
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
| `/app/insights`, `/app/capsules`, `/app/challenges`, `/app/packing` | tools, linked from the profile |

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

## Weather, suggestions and insights

- Weather comes from Open-Meteo in `src/lib/weather.ts`, using coordinates stored on
  `preferences`. It is always optional: `getCurrentWeather` returns null on failure and the
  dashboard falls back to the unfiltered suggestion. Never throw from it.
- `suggestOutfit(items, { season, exclude })` is deterministic and pure. "Remix" inserts the
  returned combination's signature into `suggestion_rejections` for the day; resetting
  deletes that day's rows. The signature is order-independent.
- `buildRemixSlots` ranks same-category alternatives by average harmony with the remaining
  pieces. `/app/outfits/[id]/remix` only creates a new outfit; it never edits the original.
- `analyzeWardrobe` in `src/lib/insights.ts` owns the gap/cost/never-worn rules and is
  covered by unit tests. Change the rules there, not in the page.
- Cost per wear is derived (`price / wears`); there is no stored column.
- Seasonal rotation uses `items.archived_at`. `listItems` excludes archived rows unless
  `archived: "1"` is passed, and `countItems` always ignores them. Suggestions, insights,
  packing and both builders all read through `listItems`, so archiving hides a piece
  everywhere automatically. Outfits that already contain it keep working.
- Capsules, challenges and packing are pure-logic driven (`capsules.ts`, `challenges.ts`,
  `packing.ts`) with the DB only storing selections and completions. Keep the rules in
  those files.

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
- The seeded `demo@closetmate.app` account has no password; use the Development sign-in
  shortcut rather than the email/password form.
- Registration uses the `password` credentials provider. Auth.js logs a
  `CredentialsSignin` error for wrong passwords; the server action converts it to the
  friendly "Incorrect email or password" state.
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
