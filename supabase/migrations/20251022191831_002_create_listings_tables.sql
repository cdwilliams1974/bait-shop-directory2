/*
  # Create Listings and Related Tables

  1. New Tables
    - `listings`
      - `id` (uuid, primary key)
      - `slug` (text, unique, URL-safe)
      - `name` (text, shop name)
      - `description` (text, nullable)
      - `phone` (text, nullable)
      - `website` (text, nullable)
      - `address` (text)
      - `city_id` (uuid, foreign key → cities)
      - `state_id` (uuid, foreign key → states)
      - `postcode` (text, preserves leading zeros)
      - `lat` (numeric)
      - `lng` (numeric)
      - `geom` (geography point, SRID 4326)
      - `bait_types` (text[], e.g., ["minnows", "worms"])
      - `rating` (numeric, 0-5)
      - `reviews_count` (int, default 0)
      - `external_reviews_url` (text, nullable)
      - `is_verified` (bool, default false)
      - `static_map_url` (text, cached Maps Static API URL)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `listing_hours`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, foreign key → listings)
      - `weekday` (int, 0=Sun, 6=Sat)
      - `open_time` (time, nullable)
      - `close_time` (time, nullable)
      - `is_24h` (bool, default false)
      - `is_closed` (bool, default false)
    - `listing_tags`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, foreign key → listings)
      - `tag` (text, e.g., "ice", "fishing-licenses")

  2. Indexes
    - Unique index on `listings.slug`
    - Index on `listings(city_id, state_id)`
    - Composite index on `listing_hours(listing_id, weekday)`

  3. Security
    - RLS enabled on all tables (policies in migration 004)
*/

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  phone text,
  website text,
  address text NOT NULL,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  state_id uuid NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  postcode text,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  geom geography(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) STORED,
  bait_types text[] DEFAULT '{}',
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  reviews_count int DEFAULT 0,
  external_reviews_url text,
  is_verified bool DEFAULT false,
  static_map_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  weekday int NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  open_time time,
  close_time time,
  is_24h bool DEFAULT false,
  is_closed bool DEFAULT false,
  UNIQUE(listing_id, weekday)
);

CREATE TABLE IF NOT EXISTS listing_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tag text NOT NULL,
  UNIQUE(listing_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_listings_city_state ON listings(city_id, state_id);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state_id);
CREATE INDEX IF NOT EXISTS idx_listing_hours_listing ON listing_hours(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_tags_listing ON listing_tags(listing_id);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_tags ENABLE ROW LEVEL SECURITY;