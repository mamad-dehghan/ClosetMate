# ClosetMate — implementation plan & status

Last updated: 13 November 2026

This file tracks **what exists**, **what is next**, and **why decisions were made**. Keep it current when a pass ships.

Legend: `[x]` shipped · `[ ]` planned · `[~]` partial / schema only

---

## 1. Where the project is

**Pass 1 (core vertical slice) is complete and running.**

The product promise — "better outfits from the clothes you already own" — is already deliverable: a visitor lands, opens a guest closet, adds or edits real items, and immediately sees colour pairings, a versatility score and a daily suggestion.

### Pass 1 checklist

**Foundation**
- [x] Next.js 16 App Router app inside the Bun workspace (`packages/ClosetMate`)
- [x] TypeScript strict, Tailwind v4 design tokens, Bun test runner
- [x] Dual-driver database: PGlite locally, Postgres/Neon in production
- [x] Drizzle schema + generated migration + migrate/seed scripts
- [x] Brand assets (mark, favicon, OG image) and sample garment illustrations

**Public surface**
- [x] Landing page: hero, value strip, how it works, features, sample strip, closing CTA
- [x] `/demo` sample closet page
- [x] Responsive site header/footer, mobile-first layout

**Identity**
- [x] Auth.js v5 with Google OAuth (conditional) and dev email login
- [x] JWT sessions with user id in the session
- [x] Guest mode: signed `cm_guest` cookie, anonymous `users` row, 12 seeded pieces
- [x] Guest wardrobe claimed into the account on first real sign-in (transactional)
- [x] `/app/*` bootstrap via Next 16 `proxy.ts` when no session cookie exists

**Wardrobe**
- [x] Grid with category counts, search, season/occasion/favourite filters, sort
- [x] Quick add: photo (camera/gallery), client-side resize to 1600px WebP, upload, dominant-colour extraction, name fallback
- [x] Optional details: brand, pattern, subcategory, price, care status, favourites, notes
- [x] Item detail: image, metadata, delete, edit
- [x] Edit form with the same component as create
- [x] Favourite toggle from the grid
- [x] Laundry/repair status surfaced on cards

**Intelligence (deterministic, no AI)**
- [x] Colour harmony: HSL conversion, hue relationships, pair scoring with copy
- [x] Versatility score: complete-outfit combinations per item, log-scaled to 0–100
- [x] "Pairs well with" ranking on item detail
- [x] Daily suggestion on `/today`: best top/bottom by harmony + matching shoes + optional layer

**Account**
- [x] `/app/profile`: identity, guest upsell, preferences (currency/units/theme)
- [x] JSON export of items, outfits and preferences
- [x] Account deletion (cascades; clears session/cookie)
- [x] Sign out

**Quality**
- [x] 25 unit tests covering colour math, versatility, hex parsing and form validation
- [x] `tsc --noEmit` clean, production build passes
- [x] Guest claim verified end to end (12 items moved, guest row removed)
- [x] README with setup, env, structure and deployment

### Deliberately deferred from pass 1

| Item | Why |
| --- | --- |
| Outfit studio UI | Schema exists; building it needs a different interaction model (picker, reorder, save). Worth its own pass. |
| Calendar & wear history | Depends on saved outfits. |
| Insights dashboard | Needs wear data to be meaningful. |
| AI recognition / background removal | Paid vision API, moderation, and it solves a problem that quick add already softens. |
| PWA / offline | Value arrives with repeat usage; not needed to prove the loop. |
| i18n | English-only for the portfolio cut. |

---

## 2. Pass 2 — daily usefulness (next)

Goal: ClosetMate becomes something you open on a weekday morning.

### 2.1 Outfit studio
- [ ] `/app/outfits/studio`: category-grouped picker, live preview, drag-free reorder
- [ ] Save outfit with name, occasion, season, favourite
- [ ] `/app/outfits` list with cover collage derived from items
- [ ] `/app/outfits/[id]`: view, edit, delete, "wear today"
- [ ] Duplicate an outfit as a starting point
- [ ] Harmony score for the whole outfit (`harmonyForColors` already exists)

Schema: no migration needed (`outfits`, `outfit_items`).

### 2.2 Wear history
- [ ] `outfit_wears` write path when an outfit is marked worn
- [ ] Last worn date on outfit and item detail
- [ ] "Not worn recently" filter on the wardrobe
- [ ] Simple stats: wears this month, most-worn piece, neglected pieces

### 2.3 Calendar
- [ ] `/app/calendar`: month grid, assign an outfit to a date (`outfit_plans`)
- [ ] Upcoming plan card on `/today`, replacing the suggestion when a plan exists
- [ ] Optional "plan what I wore yesterday" shortcut

### 2.4 Today upgrade
- [ ] Reject / remix actions on the suggestion, persisted as lightweight feedback
- [ ] Weather-aware filtering (see 2.5) applied before scoring
- [ ] Empty/limited-wardrobe guidance that names the missing category

### 2.5 Weather
- [ ] Server-side weather fetch (Open-Meteo, no key) with cached lat/lon preference
- [ ] Map temperature band → season filter before suggesting
- [ ] Graceful degradation when location is unavailable

**Acceptance for pass 2**

- A user can save an outfit, plan it for tomorrow, and see it on `/today`.
- Marking an outfit worn updates item-level "last worn".
- No new table is readable across users.

---

## 3. Pass 3 — differentiation

- [ ] Outfit Remix: swap one or two pieces in a saved outfit, ranked by harmony
- [ ] Closet Gap Detector: report categories that block combinations (e.g. tops with no matching bottom)
- [ ] Capsule Wardrobe: named subsets of items with coverage % and "can build N outfits"
- [ ] Cost per wear: `purchasePrice / wears`, surfaced on item detail
- [ ] Wardrobe Challenges: time-boxed prompts with completion state
- [ ] Packing Assistant: trip length + weather band → minimal item set
- [ ] Seasonal rotation: archive/unarchive items without deleting

These all reuse the existing item/outfit data. None require generative AI.

---

## 4. Pass 4 — advanced / optional

- [ ] AI category + colour suggestion fallback when dominant colour is ambiguous
- [ ] Background removal on upload
- [ ] Public outfit sharing via unguessable link (opt-in per outfit)
- [ ] Shared wardrobes (needs membership table + role checks)
- [ ] PWA install, offline wardrobe cache
- [ ] Optional reminders (outfit not planned, weather change)

---

## 5. Decisions log

| Decision | Rationale |
| --- | --- |
| Single Next.js app, no separate server | Vercel-only deployment, route handlers + actions replace an API service. |
| PGlite for local dev | Docker is not installed on the dev machine; PGlite is real Postgres and needs no setup. Swapping to Neon is a connection-string change. |
| Drizzle over Prisma | SQL-first, no engine binary, works identically against PGlite and Postgres. |
| JWT sessions | The dev credentials provider requires it; avoids a session table read on every request. The `sessions` table stays for adapter compatibility. |
| Ownership in the query layer | `requireActor()` + `userId` in every `where`; no route trusts a client-supplied owner. |
| Signed guest cookie, not a plain user id | Prevents anyone constructing a guest id and reading a stranger's closet. |
| Deterministic suggestion, no LLM | Instant, free, explainable, and testable. AI is reserved for data entry, where it removes real effort. |
| Anonymous user seeded with 12 pieces | Makes the demo immediately legible; the blueprint's "five items is enough" becomes visible rather than described. |
| `src/app/app/*` | URL segment `/app` for the product, route groups for public/auth sections. |
| Plain `<img>` for garment images | Uploaded files are served through a route handler; the optimizer adds no value and complicates self-hosting. |
| Local storage adapter mirrors Blob | Development needs no cloud account; production switches with one env var. |

---

## 6. Known limitations / open questions

**Limitations**
- ESLint is not wired up: the workspace root pins TypeScript 7, which `typescript-eslint`
  does not support yet. `tsc --noEmit` plus `bun test` are the quality gate for now.
- Uploads in local mode are process-local (`.data/uploads`); Vercel needs `STORAGE_DRIVER=blob`.
- PGlite is single-writer; fine for local dev, not for deployment.
- Theme preference is stored but the UI is light-only.
- No pagination: wardrobe queries cap at 200 rows.
- Outfit tables exist but are unreferenced by UI, so the JSON export currently always has an empty `outfits` array.
- Search is `ILIKE`-based; no fuzzy matching or full-text index yet.

**Open questions**
1. Pricing / monetisation — not decided; keep all core features free.
2. Weather provider and location permission timing (ask at first calendar use?).
3. Sharing model — public links per outfit vs. a profile page. Leaning per-outfit links.
4. Background removal: client-side model vs. paid API.
5. Whether to support multiple photos per item (currently one).
6. Currency: single preference vs per-item currency (column already exists per item).

---

## 7. How to verify a pass

```bash
cd packages/ClosetMate
bun test
bun run typecheck
bun run build
bun run db:migrate && bun run db:seed
bun run dev
```

Then walk the guest path: `/demo` → add an item → edit it → open `/app/today`. Sign in with the dev login and confirm the guest wardrobe moved across.
