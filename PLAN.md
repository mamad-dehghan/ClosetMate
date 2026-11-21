# ClosetMate — implementation plan & status

Last updated: 20 November 2026

This file tracks **what exists**, **what is next**, and **why decisions were made**. Keep it current when a pass ships.

Legend: `[x]` shipped · `[ ]` planned · `[~]` partial / schema only

---

## 1. Where the project is

**Passes 1–3 are complete.** Pass 4 (sharing, AI data entry, PWA) is optional and
unstarted.

The product promise — "better outfits from the clothes you already own" — is deliverable
end to end: a visitor lands, opens a guest closet, adds or edits real items, builds and
remixes outfits, plans them on a calendar, records when they were worn, packs for a trip
from the same wardrobe, and gets told what is missing and what each piece costs per wear.

### Pass 1 checklist

**Foundation**
- [x] Next.js 16 App Router app in this repository
- [x] TypeScript strict, Tailwind v4 design tokens, Bun test runner
- [x] Dual-driver database: PGlite locally, Postgres/Neon in production
- [x] Drizzle schema + generated migration + migrate/seed scripts
- [x] Brand assets (mark, favicon, OG image) and sample garment illustrations

**Public surface**
- [x] Landing page: hero, value strip, how it works, features, sample strip, closing CTA
- [x] `/demo` sample closet page
- [x] Responsive site header/footer, mobile-first layout

**Identity**
- [x] Auth.js v5 with Google OAuth (conditional), email + password, and dev email login
- [x] Scrypt password hashes (`users.password_hash`); no plaintext passwords
- [x] JWT sessions with user id in the session
- [x] Guest mode: signed `cm_guest` cookie, anonymous `users` row, 12 seeded pieces
- [x] Guest wardrobe claimed into the account on first real sign-in (transactional)
- [x] Registration claims a guest wardrobe before the first render
- [x] `/app/*` bootstrap via Next 16 `proxy.ts` when no session cookie exists

**Wardrobe**
- [x] Grid with category counts, search, season/occasion/favourite filters, sort
- [x] Quick add: photo (camera/gallery), client-side resize to 1600px WebP, upload, dominant-colour extraction, name fallback
- [x] One-click fill with the 12 predefined sample pieces when the closet is empty
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
- [x] 84 tests covering colour math, versatility, form validation, calendar helpers, weather bands, remix ranking, wardrobe analysis, packing, capsules, challenges, archiving (PGlite integration) and outfit persistence (PGlite integration)
- [x] `tsc --noEmit` clean, production build passes
- [x] Guest claim verified end to end (12 items moved, guest row removed)
- [x] README with setup, env, structure and deployment

### Deliberately deferred from pass 1

| Item | Why |
| --- | --- |
| Weather-aware suggestions | Needs a location permission flow and a provider decision; deferred to keep pass 2 shippable. |
| Reject/remix on the daily suggestion | Feedback needs a place to go (remix algorithm is pass 3) — next pass. |
| Insights dashboard | Needs a few weeks of wear data to be meaningful. |
| AI recognition / background removal | Paid vision API, moderation, and it solves a problem that quick add already softens. |
| PWA / offline | Value arrives with repeat usage; not needed to prove the loop. |
| i18n | English-only for the portfolio cut. |

---

## 2. Pass 2 — daily usefulness (shipped)

Goal: ClosetMate becomes something you open on a weekday morning.

### 2.1 Outfit studio — done
- [x] `/app/outfits/studio`: category-grouped picker, selected tray, live harmony score
- [x] Save outfit with name (auto-named from occasion), description, occasion, season, favourite
- [x] `/app/outfits` list with cover collages, occasion/favourite filters, wear counts
- [x] `/app/outfits/[id]`: view, harmony, edit, delete, favourite, mark worn, plan a date
- [x] `/app/outfits/[id]/edit` reuses the studio with existing pieces selected
- [x] Ownership enforced on outfit, piece and plan ids in every action

### 2.2 Wear history — done
- [x] `outfit_wears` written by "Mark worn" (idempotent per outfit + date)
- [x] Times worn and last worn on the outfit detail
- [x] Per-item wear count and last worn on item detail (derived through outfit links)
- [x] Worn-this-month counter on `/today`
- [x] "Not worn in 30 days" filter on the wardrobe

### 2.3 Calendar — done
- [x] `/app/calendar`: six-week month grid, Monday first, month navigation
- [x] Assign an outfit to a date; one plan per day, replacing the previous
- [x] Remove a plan from the day panel
- [x] Upcoming plan replaces the suggestion on `/today`
- [x] Seeded demo data: four outfits, one wear, one plan for today

### 2.4 Today upgrade — done
- [x] Planned outfit card with pieces and a "Mark worn" action
- [x] Deterministic suggestion shown as an alternative when a plan exists
- [x] Remix rejects the current combination for the day (`suggestion_rejections`)
- [x] "Show ideas again" resets the day's rejections
- [x] Exhausted state distinguishes an empty wardrobe from exhausted ideas

### 2.5 Weather — done
- [x] Opt-in location in preferences (`latitude`/`longitude`/`location_label`)
- [x] Browser geolocation captured from the profile, no third-party key
- [x] Server-side Open-Meteo fetch cached for 30 minutes, 4s timeout
- [x] Temperature → season band filters suggestions; untagged pieces still qualify
- [x] Graceful degradation: no location or network failure means no filtering

---

## 3. Pass 3 — differentiation (complete)

- [x] Outfit Remix: swap pieces in a saved outfit, alternatives ranked by harmony
- [x] Closet Gap Detector: report categories that block combinations and the outfits they unlock
- [x] Cost per wear: purchase price divided by recorded wears, on item detail and insights
- [x] Insights page: coverage, gaps, cost leaders, never-worn pieces
- [x] Capsule Wardrobe: named subsets with coverage %, outfit capacity and missing basics
- [x] Wardrobe Challenges: weekly prompts with live progress and stored completions
- [x] Packing Assistant: days + forecast + occasion → minimal list, saveable as a capsule
- [x] Seasonal rotation: archive/restore pieces, hidden from suggestions and builders

Tools live under the profile "Tools" grid: Insights, Capsules, Challenges, Packing. They
are deliberately outside the bottom navigation — five tabs is the limit on a 390px screen.

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
| Open-Meteo for weather | No API key, no attribution burden, one HTTP call, cacheable for 30 minutes. |
| Suggestion feedback as a rejection table | The only signal we need today is "show me another"; a full feedback model would be guesswork before there is usage data. |
| Remix ranks by harmony only | Explainable and instant. Fit and occasion already constrain the base outfit. |
| `src/app/app/*` | URL segment `/app` for the product, route groups for public/auth sections. |
| Plain `<img>` for garment images | Uploaded files are served through a route handler; the optimizer adds no value and complicates self-hosting. |
| Local storage adapter mirrors Blob | Development needs no cloud account; production switches with one env var. |
| Email + password over magic links | No external email provider or sending domain is required to launch; Auth.js credentials + JWT keeps the flow self-contained. Email verification and password reset are deferred. |
| scrypt for password hashes | Built into Node/Bun, no native dependency, and portable to the Vercel Node runtime. Salt and hash are stored in one `password_hash` string. |
| Synchronous guest claim on registration | Registration already knows the new user id, so claiming before the first render avoids a flash of an empty wardrobe. The client `GuestClaim` remains for Google and existing-account sign-ins. |

---

## 6. Known limitations / open questions

**Limitations**
- ESLint is not wired up: the project pins TypeScript 7, which `typescript-eslint`
  does not support yet. `tsc --noEmit` plus `bun test` are the quality gate for now.
- Email addresses are not verified and there is no password reset flow yet. The email is
  a sign-in identifier, not a delivery channel.
- Existing Google and dev accounts have no password; they must keep using their original
  sign-in method. An email/password account can use Google with the same address because
  Google verifies the email before linking.
- Uploads in local mode are process-local (`.data/uploads`); Vercel needs `STORAGE_DRIVER=blob`.
- PGlite is single-writer; fine for local dev, not for deployment.
- Theme preference is stored but the UI is light-only.
- No pagination: wardrobe queries cap at 200 rows.
- Weather depends on the browser location permission and Open-Meteo availability; both
  degrade to the unfiltered suggestion rather than an error.
- Cost per wear only covers items that appear in a worn outfit and have a price.
- Remix reranks by colour only; it does not consider occasion or fit beyond the filters
  already applied to the base outfit.
- Capsules are capped at 40 pieces; packing picks are heuristic, not optimised.
- Challenge progress is derived live from the current week; completions are stored only
  when the user confirms them, so a finished week can still be claimed later.
- Archived pieces stay inside outfits that already reference them; the outfit builder and
  suggestions no longer offer them.
- `/app/insights`, `/app/capsules`, `/app/challenges` and `/app/packing` are intentionally
  outside the bottom navigation; they are reachable from the profile Tools grid.
- Search is `ILIKE`-based; no fuzzy matching or full-text index yet.

**Open questions**
1. Pricing / monetisation — not decided; keep all core features free.
2. Weather: is a manual city picker enough, or should we add reverse geocoding?
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

For the email/password path: `/register` with samples checked → 12 pieces on `/today`; sign out → `/login` with the same credentials; register a second account with samples unchecked → use **Fill with 12 sample pieces** on the empty wardrobe and today pages; register from a guest closet and confirm the original pieces move without duplicating samples.
