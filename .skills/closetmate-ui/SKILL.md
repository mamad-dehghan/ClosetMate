---
name: ClosetMate UI
description: Mobile-first design system, layout, forms and component conventions for ClosetMate
---

# ClosetMate UI

Visual identity: **warm editorial minimal**. Ivory paper, charcoal ink, terracotta accent,
serif display type, photography-first cards, generous whitespace.

## Mobile first, always

Design the 390px view first, then add `sm:` / `md:` / `lg:`.

- Product shell (`src/components/layout/app-shell.tsx`): bottom tab bar + floating add
  button below `md`; fixed 256px sidebar from `md` up.
- Main content: `mx-auto max-w-5xl px-4 pb-32 pt-5` on mobile; `pb-32` clears the tab bar.
- Interactive targets are at least `min-h-11` (44px). Never shrink a tappable control
  below that.
- Horizontal chip rows use `-mx-4 overflow-x-auto px-4 no-scrollbar` so they edge-bleed.
- Long forms keep the submit button in a `sticky bottom-24` bar on mobile
  (`md:bottom-4`), above the tab bar.
- Respect the notch: the bottom nav uses `safe-bottom`.

## Tokens (`src/app/globals.css` `@theme`)

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#FAF7F2` | page background |
| `surface` | `#FFFFFF` | cards |
| `surface-2` | `#F4EFE6` | image placeholders, subtle fills |
| `ink` / `ink-soft` | `#1C1A17` / `#3A3733` | text, primary buttons |
| `muted` | `#6B655C` | secondary text |
| `line` | `#E7DFD3` | hairlines and borders |
| `accent` / `accent-hover` | `#C4633F` / `#A9552F` | primary action, highlights |
| `accent-soft` | `#F6E7DF` | badges, guest banner |
| `sage` / `sage-soft` | `#7A8B6F` / `#E7EBE1` | positive states, versatility |

Typography: `font-display` (Fraunces) for headings only — `text-3xl sm:text-4xl` for page
titles, `text-[2.6rem] sm:text-6xl` for the marketing hero. Body is Inter, 15–17px with
`text-muted` for secondary copy. Never set a hardcoded hex in a component; use tokens.

Radii: use `rounded-card` for cards, `rounded-pill` for buttons/chips, `rounded-2xl` for
inputs. Shadows: `shadow-card` at rest, `shadow-lift` on hover/sticky bars.

## Components

- `src/components/ui/` — `Button` (+ `buttonVariants`), `Card*`, `Badge`, `Input`,
  `Textarea`, `Select`, `Field`, `Label`.
- Links that look like buttons: `className={buttonVariants({ size, variant })}`. Do **not**
  wrap a `<Link>` in `<Button>` (invalid nesting).
- `Badge` tones: `neutral`, `accent`, `sage`, `outline`, `warning`.
- `GarmentImage` handles the 4:5 photo frame, placeholder and `object-cover`. Pass
  `imgClassName="object-contain p-2"` for flat-lay illustrations.
- Cards that are fully clickable use a `<Link className="absolute inset-0 z-10">` overlay
  plus a `z-20` action (see `item-card.tsx`). Never nest a form inside a link.

## Forms and server actions

Pattern: server action in `src/lib/actions/*.ts` (`"use server"`), `useActionState` in a
client form, `FormData` parsed by zod.

- Stateful fields (photo URL, category, colour) live in React state and are mirrored into
  **hidden inputs** so the action still receives a plain `FormData`.
- Photo flow: `prepareImage()` (resize → WebP → dominant colour) → `uploadPreparedImage()`
  → store the URL in state. Never post the raw camera file.
- Optional fields belong in a `<details>` block titled "More details".
- Error copy is a sentence, not a code. Show it at the top of the form.
- After a successful mutation call `revalidatePath` and `redirect`; success is confirmed
  by a query-param banner (`?created=1`, `?saved=1`), not a modal.
- Destructive actions use a client wrapper with `window.confirm` (see
  `delete-item-button.tsx`).

## Writing copy

- Second person, concrete, no exclamation marks.
- Name the benefit, not the mechanism: "Photo and category is enough" beats
  "Optional metadata fields".
- Mark unfinished surfaces honestly (`Next release` badges) instead of hiding them.
- Empty states always contain the next action.

## Accessibility

- Meaningful `alt` on garment photos; `alt=""` for purely decorative hero imagery.
- Icon-only buttons need `aria-label`.
- Chips built from checkboxes use `peer sr-only` + `peer-focus-visible:outline`.
- Do not communicate state by colour alone — pair swatches with a check mark or label.
