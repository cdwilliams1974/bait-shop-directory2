# Importing Your Bait Shop CSV Data

You have 303 bait shop records ready to import. Follow these steps to import them with full SEO enhancements.

## Quick Start

1. **Place the CSV file**:
   ```bash
   # Copy your bait_shops_rows.csv to the scripts folder
   cp /path/to/bait_shops_rows.csv scripts/bait_shops.csv
   ```

2. **Run the import**:
   ```bash
   npm run import-csv
   ```

3. **Verify the import**:
   - Check the console output for import statistics
   - Visit your Supabase dashboard to see the imported data
   - Navigate to `/state/minnesota` or any state page to see listings

## What Gets Imported

### From Your CSV (303 Records):
- ✅ Business names and slugs
- ✅ Phone numbers and websites
- ✅ Full addresses (street, city, state, zip)
- ✅ GPS coordinates (latitude/longitude)
- ✅ Ratings and review links
- ✅ Operating hours

### SEO Enhancements Added:
- 📝 **Unique descriptions** for each listing
- 🏷️ **Bait types** categorization
- ⏰ **Structured hours** for Schema.org
- 🗺️ **Normalized locations** (states/cities tables)
- ⭐ **Review counts** based on ratings
- 🔍 **Search-optimized** slugs and content

## Data Validation

The import script will:
- ✅ Skip duplicate listings (based on slug)
- ✅ Create missing states and cities automatically
- ✅ Parse operating hours into structured format
- ✅ Generate SEO-friendly descriptions
- ✅ Validate coordinates and ratings
- ❌ Skip records with invalid data

## Expected Results

After import, you should see:
- **8 states**: Maine, Massachusetts, Minnesota, New Hampshire, Rhode Island, Vermont, Wisconsin, Connecticut
- **~150+ cities** across these states
- **303 listings** with full details
- **Structured hours** for most listings

## Troubleshooting

### "CSV file not found"
Make sure the file is named `bait_shops.csv` and is in the `scripts/` directory.

### "Supabase connection error"
Check your `.env` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### "Import completed: Imported: 0, Skipped: 303"
This means all listings already exist. They were likely imported in a previous run.

## Testing After Import

1. **Check the homepage**: Should show listings by state
2. **Browse by state**: `/state/minnesota` should show Minnesota listings
3. **Browse by city**: `/state/minnesota/minneapolis` should work
4. **View listing detail**: Click any listing to see full details with hours

## SEO Benefits

Your imported listings will have:
1. **Unique meta descriptions** for each page
2. **Structured data** (Schema.org LocalBusiness)
3. **Breadcrumb navigation** for better indexing
4. **Location-based URLs** for local SEO
5. **Operating hours** in structured format
6. **Ratings and reviews** for rich snippets

## Next Steps

After importing:
1. Submit your sitemap to Google Search Console
2. Verify structured data with Google's Rich Results Test
3. Monitor search performance in GSC
4. Add more content/photos to individual listings as needed

---

**Need help?** Check the `scripts/README.md` for more technical details.
