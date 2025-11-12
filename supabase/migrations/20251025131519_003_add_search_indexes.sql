/*
  # Add Full-Text Search and Geo Indexes

  1. Trigger-Based Full-Text Search
    - `listings.tsv` (tsvector, maintained via trigger)
    - GIN index for fast text search
    - Updates automatically on INSERT/UPDATE

  2. Spatial Index
    - GiST index on `listings.geom` for proximity queries

  3. Performance
    - Enable faster searches by location and keyword
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'tsv'
  ) THEN
    ALTER TABLE listings ADD COLUMN tsv tsvector;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION listings_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.bait_types, ' '), '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_tsv_update ON listings;
CREATE TRIGGER listings_tsv_update
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION listings_tsv_trigger();

CREATE INDEX IF NOT EXISTS idx_listings_tsv ON listings USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_listings_geom ON listings USING GIST(geom);