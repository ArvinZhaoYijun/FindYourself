CREATE TABLE "findme_search_album" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"photo_index" integer NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer,
	"storage_url" text,
	"face_count" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "findme_search_match" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"album_photo_index" integer NOT NULL,
	"filename" text NOT NULL,
	"confidence" double precision NOT NULL,
	"token_count" integer NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "findme_search_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"event_url" text,
	"outer_id" text,
	"status" varchar(32) DEFAULT 'processing' NOT NULL,
	"selfie_storage_url" text,
	"album_count" integer DEFAULT 0 NOT NULL,
	"match_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "findme_search_album" ADD CONSTRAINT "findme_search_album_session_id_findme_search_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."findme_search_session"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "findme_search_match" ADD CONSTRAINT "findme_search_match_session_id_findme_search_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."findme_search_session"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "findme_search_session" ADD CONSTRAINT "findme_search_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
