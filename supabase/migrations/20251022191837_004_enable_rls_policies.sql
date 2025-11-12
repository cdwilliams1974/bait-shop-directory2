/*
  # Enable Row Level Security Policies

  1. Public Read Access
    - All tables allow SELECT for anonymous and authenticated users
    - No public INSERT, UPDATE, DELETE

  2. Admin Write Access (future)
    - Mutations restricted to service role only
    - Can be extended with custom admin role checks

  3. Security Notes
    - RLS locks down tables by default
    - Only SELECT is permitted for public access
    - All write operations require service_role or explicit policies
*/

CREATE POLICY "Public read access to states"
  ON states FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to cities"
  ON cities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to listings"
  ON listings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to listing_hours"
  ON listing_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to listing_tags"
  ON listing_tags FOR SELECT
  TO anon, authenticated
  USING (true);