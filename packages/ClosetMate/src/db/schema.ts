import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*  Auth.js core tables                                                       */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Preferences                                                               */
/* -------------------------------------------------------------------------- */

export const preferences = pgTable("preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("USD"),
  units: text("units").notNull().default("metric"),
  theme: text("theme").notNull().default("system"),
  defaultOccasion: text("default_occasion"),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  Wardrobe                                                                  */
/* -------------------------------------------------------------------------- */

export const items = pgTable(
  "items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    imageUrl: text("image_url"),
    imageWidth: integer("image_width"),
    imageHeight: integer("image_height"),
    primaryColor: text("primary_color"),
    secondaryColors: jsonb("secondary_colors")
      .$type<string[]>()
      .notNull()
      .default([]),
    seasons: jsonb("seasons").$type<string[]>().notNull().default([]),
    occasions: jsonb("occasions").$type<string[]>().notNull().default([]),
    pattern: text("pattern"),
    brand: text("brand"),
    notes: text("notes"),
    purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    laundryStatus: text("laundry_status").notNull().default("available"),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("items_user_idx").on(table.userId),
    index("items_user_category_idx").on(table.userId, table.category),
    index("items_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (table) => [unique("tags_user_name_unique").on(table.userId, table.name)],
);

export const itemTags = pgTable(
  "item_tags",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.tagId] })],
);

/* -------------------------------------------------------------------------- */
/*  Outfits                                                                   */
/* -------------------------------------------------------------------------- */

export const outfits = pgTable(
  "outfits",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    occasion: text("occasion"),
    season: text("season"),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("outfits_user_idx").on(table.userId)],
);

export const outfitItems = pgTable(
  "outfit_items",
  {
    outfitId: text("outfit_id")
      .notNull()
      .references(() => outfits.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.outfitId, table.itemId] })],
);

export const outfitWears = pgTable(
  "outfit_wears",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    outfitId: text("outfit_id")
      .notNull()
      .references(() => outfits.id, { onDelete: "cascade" }),
    wornOn: date("worn_on").notNull(),
    note: text("note"),
  },
  (table) => [
    index("outfit_wears_user_date_idx").on(table.userId, table.wornOn),
  ],
);

export const outfitPlans = pgTable(
  "outfit_plans",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    outfitId: text("outfit_id")
      .notNull()
      .references(() => outfits.id, { onDelete: "cascade" }),
    plannedFor: date("planned_for").notNull(),
    occasion: text("occasion"),
    note: text("note"),
  },
  (table) => [
    index("outfit_plans_user_date_idx").on(table.userId, table.plannedFor),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Relations                                                                 */
/* -------------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ many, one }) => ({
  items: many(items),
  outfits: many(outfits),
  preferences: one(preferences),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  owner: one(users, { fields: [items.userId], references: [users.id] }),
  tags: many(itemTags),
  outfitItems: many(outfitItems),
}));

export const itemTagsRelations = relations(itemTags, ({ one }) => ({
  item: one(items, { fields: [itemTags.itemId], references: [items.id] }),
  tag: one(tags, { fields: [itemTags.tagId], references: [tags.id] }),
}));

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  owner: one(users, { fields: [outfits.userId], references: [users.id] }),
  items: many(outfitItems),
  wears: many(outfitWears),
  plans: many(outfitPlans),
}));

export const outfitItemsRelations = relations(outfitItems, ({ one }) => ({
  outfit: one(outfits, {
    fields: [outfitItems.outfitId],
    references: [outfits.id],
  }),
  item: one(items, { fields: [outfitItems.itemId], references: [items.id] }),
}));

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                            */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Outfit = typeof outfits.$inferSelect;
export type OutfitItem = typeof outfitItems.$inferSelect;
export type OutfitWear = typeof outfitWears.$inferSelect;
export type OutfitPlan = typeof outfitPlans.$inferSelect;
export type Preference = typeof preferences.$inferSelect;
export type Tag = typeof tags.$inferSelect;
