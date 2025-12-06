-- Schema generated from shared/schema.ts (drizzle-kit export)
CREATE TABLE "advertisements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"target_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);

CREATE TABLE "delete_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"submitter_email" text NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"admin_notes" text
);

CREATE TABLE "product_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "product_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"image_urls" text[],
	"contact_phone" text NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" text DEFAULT 'now()' NOT NULL,
	"reviewed_at" text,
	"admin_notes" text
);

CREATE TABLE "product_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"category_id" integer,
	"category" text NOT NULL,
	"image_url" text,
	"image_urls" text[],
	"contact_phone" text,
	"is_sold" boolean DEFAULT false NOT NULL,
	"sale_verified" boolean DEFAULT false NOT NULL,
	"sale_verification_comment" text,
	"sale_verified_at" timestamp,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"submitter_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_phone" text NOT NULL,
	"store_name" text NOT NULL,
	"store_description" text NOT NULL
);

ALTER TABLE "delete_requests" ADD CONSTRAINT "delete_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "product_clicks" ADD CONSTRAINT "product_clicks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;

-- Performance indexes (from server/db-optimizations.sql)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_sold ON products(is_sold);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_views ON products(views);
CREATE INDEX IF NOT EXISTS idx_products_clicks ON products(clicks);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_category_sold ON products(category, is_sold);
CREATE INDEX IF NOT EXISTS idx_products_sold_created ON products(is_sold, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_sold_created ON products(category, is_sold, created_at);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_ip_product ON product_views(ip_address, product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_ip_product ON product_clicks(ip_address, product_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_delete_requests_status ON delete_requests(status);
CREATE INDEX IF NOT EXISTS idx_delete_requests_product_id ON delete_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_products_title_gin ON products USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('english', description));

ANALYZE products;
ANALYZE product_views;
ANALYZE product_clicks;
ANALYZE product_requests;
ANALYZE delete_requests;
ANALYZE categories;
ANALYZE settings;
