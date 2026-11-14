CREATE TABLE "capsule_items" (
	"capsule_id" text NOT NULL,
	"item_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "capsule_items_capsule_id_item_id_pk" PRIMARY KEY("capsule_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "capsules" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"season" text,
	"occasion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"completed_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_completions_user_key" UNIQUE("user_id","key")
);
--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "capsule_items" ADD CONSTRAINT "capsule_items_capsule_id_capsules_id_fk" FOREIGN KEY ("capsule_id") REFERENCES "public"."capsules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capsule_items" ADD CONSTRAINT "capsule_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capsules" ADD CONSTRAINT "capsules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_completions" ADD CONSTRAINT "challenge_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "capsules_user_idx" ON "capsules" USING btree ("user_id");