/*
  # Temporarily Allow City Inserts for Data Import
  
  1. Changes
    - Add policy to allow anyone to insert cities (for data import script)
    - This should be removed or restricted after initial data import
  
  2. Security Note
    - This is temporary for the import script
    - Consider removing this policy after data import is complete
*/

-- Allow inserts for cities during import
CREATE POLICY "Allow city inserts during import"
  ON cities
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow inserts for listings during import  
CREATE POLICY "Allow listing inserts during import"
  ON listings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow inserts for listing hours during import
CREATE POLICY "Allow listing hours inserts during import"
  ON listing_hours
  FOR INSERT
  TO anon
  WITH CHECK (true);