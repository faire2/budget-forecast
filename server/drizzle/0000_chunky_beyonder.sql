CREATE TABLE IF NOT EXISTS "balance_anchor" (
	"id" serial PRIMARY KEY NOT NULL,
	"balance" numeric(12, 2) NOT NULL,
	"as_of_date" date NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"type" text NOT NULL,
	"note" text,
	"date" date,
	"recurring_rule" text,
	"recurring_start_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recurring_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"occurrence_date" date NOT NULL,
	"action" text NOT NULL,
	"override_amount" numeric(12, 2),
	"override_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entries_date_idx" ON "entries" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entries_recurring_start_date_idx" ON "entries" ("recurring_start_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recurring_overrides_entry_occurrence_idx" ON "recurring_overrides" ("entry_id","occurrence_date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recurring_overrides" ADD CONSTRAINT "recurring_overrides_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
