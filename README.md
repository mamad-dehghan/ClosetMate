# ClosetMate

**Better outfits from the clothes you already own.**

ClosetMate is a personal wardrobe organizer and everyday outfit assistant. Catalog what you own, see which pieces actually work together, and stop deciding what to wear from scratch every morning.

It is built to be useful with **five items**, not five hundred — mirroring, editing and adding piece by piece, with every extra field optional.

---

## Status

This is the first vertical slice. It runs end to end today.

| Area | State |
| --- | --- |
| Marketing landing page + sample closet | Working |
| Guest mode (anonymous wardrobe, no signup) | Working |
| Auth (Google OAuth + local dev login) | Working |
| Guest → account wardrobe hand-off | Working |
| Wardrobe list, search, filters, favourites | Working |
| Quick add with photo upload, compression, auto color detection | Working |
| Item detail with colour harmony + versatility score | Working |
| Today dashboard with a deterministic outfit suggestion | Working |
| Outfit studio (create, edit, delete, favourite) | Working |
| Wear history and "mark as worn" | Working |
| Outfit calendar with day planning | Working |
| Remix, gap detection and cost per wear | Working |
| Weather-aware suggestions (Open-Meteo, opt-in location) | Working |
| "Not worn in 30 days" wardrobe filter | Working |
| Profile, preferences, JSON export, account deletion | Working |
| Capsule wardrobe, challenges, packing assistant | Planned |

See [PLAN.md](./PLAN.md) for the full shipped / next breakdown.

---

## Stack

- **Next.js 16** App Router, React 19, TypeScript (strict)
- **Tailwind CSS v4** with a warm editorial token set (`src/app/globals.css`)
- **Drizzle ORM** + PostgreSQL
- **PGlite** for local development (embedded Postgres, no Docker)
- **Neon** for production
- **Auth.js v5** (Google + dev credentials), JWT sessions
- **Vercel Blob** for production images, local disk in development
- **Open-Meteo** for weather (keyless, cached server-side)
- **Bun** for install, scripts, and tests (no Node-specific tooling)

No separate backend. Route handlers and server actions live in the same app, so the whole thing deploys to Vercel as one project.

---

## Quickstart

From the repository root (`C:/Code/root`):

```bash
bun install
```

Then:

```bash
cd packages/ClosetMate

# 1. Local env (already includes a dev-only AUTH_SECRET)
cp .env.example .env.local

# 2. Create the embedded database and apply migrations
bun run db:migrate

# 3. Optional: seed a demo account with 12 sample pieces
bun run db:seed

# 4. Run it
bun run dev
```

Open http://localhost:3000.

**Ways in**

- `/demo` → creates a guest wardrobe immediately, no account.
- `/login` → the dev email login, or Google when configured.
- Seeded demo account: `demo@closetmate.app` via the dev login.

### Dev sign-in, step by step

1. `bun run dev` (from `packages/ClosetMate`).
2. Open <http://localhost:3000/login> or <http://localhost:3000/register>.
3. Type any email — `demo@closetmate.app` is the seeded one — and press **Sign in**.
4. You land on `/app/today`.

There is no password and no email is sent. The `dev` credentials provider:

- is registered when `ALLOW_DEV_LOGIN=1` **or** `NODE_ENV !== "production"`,
- finds the user by email or creates one on the fly (with preferences),
- is never available in a production build unless someone explicitly sets `ALLOW_DEV_LOGIN=1`.

If the Google button is missing, `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` are unset — that is expected for local work.

## Troubleshooting

**`Failed query: select ... from "users"` / `RuntimeError: Aborted()`**

The local PGlite data directory is corrupted, usually because the dev server was force-killed
while Postgres was writing. Stop the server, then:

```bash
bun run db:reset      # wipes .data/pglite, migrates, reseeds the demo account
bun run dev
```

Always stop the dev server with Ctrl+C rather than killing the process tree.

**`relation "users" does not exist`**

Migrations have not been applied to the database the server is using. Run
`bun run db:migrate` from `packages/ClosetMate` (the path is relative to the working
directory, so start both from the package folder).

**Hydration warning mentioning `data-darkreader-*`**

That is the Dark Reader browser extension rewriting the DOM. Exclude `localhost` in the
extension, or test in a private window.

---

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Next dev server on Bun |
| `bun run build` | Production build |
| `bun run start` | Production server on Bun |
| `bun run typecheck` | `tsc --noEmit` |
| `bun test` | Bun test runner (colour harmony, versatility, guest tokens) |
| `bun run db:generate` | Generate SQL migrations from `src/db/schema.ts` |
| `bun run db:migrate` | Apply migrations to PGlite or Postgres |
| `bun run db:seed` | Seed the demo account |
| `bun run db:reset` | Delete the local PGlite database, migrate and reseed |
| `bun run db:studio` | Drizzle Studio |
| `bun run setup` | `db:migrate` + `db:seed` |
| `bun scripts/generate-samples.ts` | Regenerate the sample garment illustrations |

`db:migrate` and `db:seed` use Bun's built-in `.env` loading, so `.env.local` is picked up automatically.

---

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | Production | Generate with `bun -e "console.log(crypto.randomUUID()+crypto.randomUUID())"` |
| `AUTH_URL` | No | `http://localhost:3000` locally; Vercel sets the host automatically |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google button is hidden when unset |
| `ALLOW_DEV_LOGIN` | No | `1` enables the dev email login; always available outside production |
| `DATABASE_URL` | No | Empty → PGlite in `.data/pglite`. A `postgres://` URL switches to that server |
| `STORAGE_DRIVER` | No | `local` (default) or `blob` |
| `BLOB_READ_WRITE_TOKEN` | With `blob` | Vercel Blob token |

Switching to Neon is a one-line change: set `DATABASE_URL`, run `bun run db:migrate`. Nothing else in the code depends on the driver.

---

## Project structure

```
src/
├─ app/
│  ├─ (marketing)/          landing page and /demo (public)
│  ├─ (auth)/               /login and /register
│  ├─ app/                  the signed-in / guest application
│  │  ├─ today/             dashboard, planned outfit, daily suggestion
│  │  ├─ wardrobe/          grid, new, [id], [id]/edit
│  │  ├─ outfits/           list, studio, [id], [id]/edit, [id]/remix
│  │  ├─ calendar/          month grid and day planning
│  │  ├─ insights/          coverage, gaps, cost per wear, never worn
│  │  └─ profile/           preferences, location, export, deletion
│  └─ api/                  auth, guest, upload, files, export
├─ components/              ui/, wardrobe/, layout/, brand/, auth/
├─ db/                      schema, dual-driver client, queries
├─ lib/
│  ├─ color.ts              colour-wheel math (no AI)
│  ├─ versatility.ts        combination counting
│  ├─ suggest.ts            deterministic daily outfit pick
│  ├─ guest.ts              signed guest cookie + wardrobe claiming
│  ├─ actor.ts              single source of ownership checks
│  ├─ storage.ts            local / Vercel Blob adapter
│  └─ actions/              server actions
└─ proxy.ts                 Next 16 proxy for /app/* session bootstrap
```

## How ownership works

Every server read and write resolves an **actor** in `src/lib/actor.ts` — either a signed-in user or the anonymous user referenced by the signed `cm_guest` cookie. Queries always filter by `userId`; there is no route that can read another wardrobe. Guest data is moved onto a real account inside a transaction the first time that user signs in.

## Mobile-first

Layouts are written smallest-screen-first: a bottom tab bar and floating add button below `md`, a fixed sidebar above it. Photo input opens the device camera or gallery, images are resized to 1600px and converted to WebP on the client before upload, and every interactive target is at least 44px tall.

## Deployment (Vercel)

1. Import the repo, set **Root Directory** to `packages/ClosetMate`.
2. Provision Neon and set `DATABASE_URL`.
3. Set `AUTH_SECRET`, Google OAuth keys, and (optionally) `STORAGE_DRIVER=blob` with `BLOB_READ_WRITE_TOKEN`.
4. Add the deployed URL to the Google OAuth redirect list: `https://<domain>/api/auth/callback/google`.
5. Deploy, then run `bun run db:migrate` against the production database once.

Build command is the default (`bun run build`), output is handled by the Next.js adapter.
