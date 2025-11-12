# CSV Import Script

This directory contains the script to import bait shop data from CSV into the Supabase database with SEO enhancements.

## Setup

1. Place your `bait_shops.csv` file in this directory
2. Ensure your `.env` file has the required Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

## Running the Import

```bash
# Install dependencies
npm install

# Run the import
npm run import-csv
```

## What the Script Does

### SEO Enhancements Applied:

1. **Generates Unique Descriptions**: Each listing gets a custom description like:
   > "{Business Name} is a bait and tackle shop located in {City}, {State}. Find live bait, fishing tackle, and local fishing supplies for your next fishing trip."

2. **Structures Operating Hours**: Parses text-based hours into a normalized format compatible with Schema.org structured data

3. **Adds Default Bait Types**: Every listing gets `["live bait", "tackle"]` as default categories

4. **Normalizes Geographic Data**:
   - Creates state and city records
   - Links listings to normalized locations
   - Preserves coordinates for local SEO

5. **Preserves Ratings & Reviews**: Maintains rating data and external review links for rich snippets

## Data Flow

```
CSV File
  ↓
Parse & Validate
  ↓
Create/Link States → Create/Link Cities
  ↓
Insert Listings with SEO Enhancements
  ↓
Parse & Insert Operating Hours
```

## Error Handling

- Skips listings that already exist (based on slug)
- Validates state/city relationships
- Logs errors for individual listings without stopping the entire import
- Provides summary statistics at completion

## Notes

- The import is idempotent - you can run it multiple times safely
- Existing listings are not updated, only new ones are added
- Verify the data in Supabase dashboard after import
