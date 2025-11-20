ALTER TABLE "findme_search_session" ADD COLUMN "share_key" text;--> statement-breakpoint
ALTER TABLE "findme_search_session" ADD COLUMN "cache_status" varchar(16) DEFAULT 'none' NOT NULL;