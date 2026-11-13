---
name: ClosetMate Data Model
description: Schema, ownership rules, guest lifecycle and migration steps for ClosetMate
---

# ClosetMate Data Model

Schema: `src/db/schema.ts` · client: `src/db/client.ts` · queries: `src/db/queries/`
Migrations: `drizzle/` · config: `drizzle.config.ts` (postgresql dialect, snake_case).

## Tables

| Table | Purpose |
| --- | --- |
| `users` | Auth.js users plus `isAnonymous` / `claimedAt` for guest closets |
| `accounts`, `sessions`, `verification_tokens` | Auth.js adapter tables (JWT sessions in practice) |
| `preferences` | currency, units, theme, onboarding timestamp |
| `items` | the wardrobe: category, image, primary colour, seasons[], occasions[], price, laundry status |
| `tags`, `item_tags` | free-form labels |
| `outfits`, `outfit_items` | saved combinations (UI next pass) |
| `outfit_wears` | worn-on history |
| `outfit_plans` | calendar plans |

`items.category` is plain text with a TS union (`Category` in `src/lib/categories.ts`),
not a Postgres enum — adding a category must not require a migration with `ALTER TYPE`.

## Ownership invariant

Every table that holds user data has `user_id` with `onDelete: "cascade"`.

1. Resolve the actor in `src/lib/actor.ts` (`getActor` / `requireActor`).
2. Always include `eq(table.userId, actor.userId)` in the `where` clause.
3. Never accept an owner id from the client, a query param, or a form field.

`getActor()` prefers a real session, then the signed `cm_guest` cookie, and verifies the
cookie's HMAC with `AUTH_SECRET` before trusting it.

## Guest lifecycle

1. `/api/guest` creates a `users` row with `isAnonymous = true`, seeds 12 sample items,
   sets `cm_guest = "<userId>.<hmac>"`.
2. The guest can add, edit, delete and favourite for real.
3. When they sign in, `GuestClaim` (mounted in the app layout) calls
   `claimGuestWardrobeAction`, which moves `items`, `tags` and `outfits` to the real
   user inside a transaction and deletes the guest row.
4. `claimGuestWardrobe` is idempotent: it returns early if the guest row is gone or not
   anonymous.

If you add a new table with `user_id`, **add it to the transaction in
`src/lib/guest.ts`** or guest data will be deleted with the anonymous row.

## Images

- `putImage()` in `src/lib/storage.ts` returns `{ url, key }`.
- Local driver writes `.data/uploads/<uuid>.webp` and serves `/api/files/<key>`.
- Blob driver uses `@vercel/blob` with public access.
- `items.imageUrl` stores the URL, so rendering never needs to know the driver.
- Delete user uploads with `removeImage()`; sample illustrations (`/sample/*.svg`) are
  static and must be left alone.

## Pure logic modules

Keep business rules out of components:

- `src/lib/color.ts` — hex/HSL, hue distance, relation classification, pair + outfit scores
- `src/lib/versatility.ts` — category combination counting, 0–100 score
- `src/lib/suggest.ts` — daily suggestion from available items
- `src/lib/validation.ts` — zod input schema (the server action boundary)

They have no DB or React imports and are covered by `bun test`. Extend the tests when you
change scoring.

## Adding a field (checklist)

1. `src/db/schema.ts` — column with explicit snake_case name.
2. `bun run db:generate` → review SQL → `bun run db:migrate`.
3. `src/lib/validation.ts` — accept and coerce it.
4. `src/lib/actions/items.ts` — read it from `FormData`, write it in create **and** update.
5. `ItemForm` — input plus `ItemFormValues` type; pass defaults from the edit page.
6. Detail page — show it only when present (`detailRows` filter).
7. `src/lib/sample-wardrobe.ts` / `scripts/seed.ts` if the demo should show it.

## Adding a table (checklist)

1. Table in `schema.ts` with `user_id` FK (`onDelete: "cascade"`) and an index on
   `(user_id, ...)`.
2. Relations if the UI will join.
3. Generate + migrate.
4. Query helpers in `src/db/queries/`, always actor-scoped.
5. Add to the guest-claim transaction if guests can create rows.
6. Add to `/api/export` so data portability stays honest.
