CREATE TABLE "photo_record" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"original_path" text NOT NULL,
	"compressed_path" text NOT NULL,
	"size_original_kb" integer NOT NULL,
	"size_compressed_kb" integer,
	"width" integer,
	"height" integer,
	"status" varchar(32) DEFAULT 'ok' NOT NULL,
	"faceset_outer_id" text,
	"face_tokens" text[] NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "photo_record" ADD CONSTRAINT "photo_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;