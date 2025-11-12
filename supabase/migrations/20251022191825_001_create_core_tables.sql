/*
  # Create Core Tables - States and Cities

  1. New Tables
    - `states`
      - `id` (uuid, primary key)
      - `name` (text, e.g., "Florida")
      - `slug` (text, URL-safe, e.g., "florida")
      - `abbr` (text, 2-char, e.g., "FL")
      - `created_at` (timestamptz)
    - `cities`
      - `id` (uuid, primary key)
      - `state_id` (uuid, foreign key → states)
      - `name` (text, e.g., "Miami")
      - `slug` (text, URL-safe)
      - `lat` (numeric)
      - `lng` (numeric)
      - `created_at` (timestamptz)

  2. Indexes
    - Unique index on `states.slug`
    - Unique compound index on `cities(state_id, slug)`

  3. Security
    - RLS enabled on both tables
    - Public read-only SELECT policies (added in migration 004)
*/

CREATE TABLE IF NOT EXISTS states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  abbr text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  lat numeric,
  lng numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(state_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;