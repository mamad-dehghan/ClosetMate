CREATE TABLE "suggestion_rejections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	"signature" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suggestion_rejections_unique" UNIQUE("user_id","day","signature")
);
--> statement-breakpoint
ALTER TABLE "preferences" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "preferences" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "preferences" ADD COLUMN "location_label" text;--> statement-breakpoint
ALTER TABLE "suggestion_rejections" ADD CONSTRAINT "suggestion_rejections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "suggestion_rejections_user_day_idx" ON "suggestion_rejections" USING btree ("user_id","day");