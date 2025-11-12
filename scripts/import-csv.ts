/**
 * CSV Import Script with SEO Enhancements
 *
 * This script imports bait shop data from CSV and enhances it for SEO:
 * - Generates unique descriptions for each listing
 * - Structures operating hours for Schema.org
 * - Adds default bait types and tags
 * - Creates normalized state/city relationships
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface CSVRow {
  id: string;
  business_name: string;
  website_url: string;
  phone_number: string;
  street_address: string;
  street_address_2: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  time_zone: string;
  average_rating: string;
  reviews_link: string;
  street_view_url: string;
  operating_hours: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// State mapping
const stateAbbr: Record<string, string> = {
  'MAINE': 'ME',
  'MASSACHUSETTS': 'MA',
  'MINNESOTA': 'MN',
  'NEW HAMPSHIRE': 'NH',
  'RHODE ISLAND': 'RI',
  'VERMONT': 'VT',
  'WISCONSIN': 'WI',
  'CONNECTICUT': 'CT',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateDescription(businessName: string, city: string, state: string): string {
  return `${businessName} is a bait and tackle shop located in ${city}, ${state}. Find live bait, fishing tackle, and local fishing supplies for your next fishing trip.`;
}

function parseOperatingHours(hoursText: string): Array<{
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  is_24h: boolean;
  is_closed: boolean;
}> {
  if (!hoursText || hoursText === 'Hours not available') {
    return [];
  }

  const result: Array<any> = [];

  // Handle "Open 24 hours" or "Daily 12:00 AM-12:00 PM"
  if (hoursText.includes('Open 24 hours') || hoursText === 'Daily 12:00 AM-12:00 PM') {
    for (let i = 0; i <= 6; i++) {
      result.push({ weekday: i, open_time: null, close_time: null, is_24h: true, is_closed: false });
    }
    return result;
  }

  // Parse patterns like "Mon-Fri 9:00 AM-5:00 PM, Sat 8:00 AM-4:00 PM"
  const dayRanges = hoursText.split(',').map(s => s.trim());

  for (const range of dayRanges) {
    const match = range.match(/^([\w-]+)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)$/i);
    if (!match) continue;

    const [, days, openTime, closeTime] = match;
    const weekdays = parseDayRange(days);
    const open = convertTo24Hour(openTime);
    const close = convertTo24Hour(closeTime);

    for (const weekday of weekdays) {
      result.push({ weekday, open_time: open, close_time: close, is_24h: false, is_closed: false });
    }
  }

  return result;
}

function parseDayRange(days: string): number[] {
  const dayMap: Record<string, number> = {
    'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
  };

  days = days.toLowerCase();

  // Handle "Daily"
  if (days === 'daily') {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  // Handle ranges like "Mon-Fri"
  const rangeMatch = days.match(/(\w+)-(\w+)/);
  if (rangeMatch) {
    const start = dayMap[rangeMatch[1].substring(0, 3)];
    const end = dayMap[rangeMatch[2].substring(0, 3)];
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  // Single day
  const day = days.substring(0, 3);
  return dayMap[day] !== undefined ? [dayMap[day]] : [];
}

function convertTo24Hour(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (!match) return time;

  let [, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);

  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}:00`;
}

async function main() {
  console.log('Starting CSV import...');

  // Read CSV file (you'll need to place the CSV in the scripts folder)
  const csvPath = path.join(process.cwd(), 'scripts', 'bait_shops.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found. Please place bait_shops.csv in the scripts folder.');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  const rows: CSVRow[] = lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, i) => {
        row[header.trim()] = values[i]?.trim() || '';
      });
      return row as CSVRow;
    });

  console.log(`Found ${rows.length} rows to import`);

  // Get or create states
  const stateMap = new Map<string, string>();
  const uniqueStates = [...new Set(rows.map(r => r.state.toUpperCase()))];

  for (const stateName of uniqueStates) {
    const abbr = stateAbbr[stateName];
    if (!abbr) continue;

    const slug = slugify(stateName);
    const { data, error } = await supabase
      .from('states')
      .select('id')
      .eq('abbr', abbr)
      .maybeSingle();

    if (data) {
      stateMap.set(stateName, data.id);
    }
  }

  console.log(`Loaded ${stateMap.size} states`);

  // Get or create cities
  const cityMap = new Map<string, string>();

  for (const row of rows) {
    const stateId = stateMap.get(row.state.toUpperCase());
    if (!stateId) continue;

    const citySlug = slugify(row.city);
    const key = `${stateId}-${citySlug}`;

    if (cityMap.has(key)) continue;

    const { data: existing } = await supabase
      .from('cities')
      .select('id')
      .eq('state_id', stateId)
      .eq('slug', citySlug)
      .maybeSingle();

    if (existing) {
      cityMap.set(key, existing.id);
    } else {
      const { data: newCity, error } = await supabase
        .from('cities')
        .insert({
          state_id: stateId,
          name: row.city,
          slug: citySlug,
          lat: parseFloat(row.latitude) || null,
          lng: parseFloat(row.longitude) || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Error creating city ${row.city}:`, error);
      } else if (newCity) {
        cityMap.set(key, newCity.id);
      }
    }
  }

  console.log(`Loaded/created ${cityMap.size} cities`);

  // Import listings
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const stateId = stateMap.get(row.state.toUpperCase());
    if (!stateId) {
      skipped++;
      continue;
    }

    const citySlug = slugify(row.city);
    const cityId = cityMap.get(`${stateId}-${citySlug}`);
    if (!cityId) {
      skipped++;
      continue;
    }

    // Check if listing already exists
    const { data: existing } = await supabase
      .from('listings')
      .select('id')
      .eq('slug', row.slug)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    // Insert listing with SEO enhancements
    const { error: listingError } = await supabase
      .from('listings')
      .insert({
        slug: row.slug,
        name: row.business_name,
        description: generateDescription(row.business_name, row.city, row.state),
        phone: row.phone_number || null,
        website: row.website_url || null,
        address: [row.street_address, row.street_address_2].filter(Boolean).join(', '),
        city_id: cityId,
        state_id: stateId,
        postcode: row.postal_code || null,
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        bait_types: ['live bait', 'tackle'],
        rating: row.average_rating ? parseFloat(row.average_rating) : null,
        reviews_count: row.average_rating ? 1 : 0,
        external_reviews_url: row.reviews_link || null,
        is_verified: false,
        static_map_url: null,
      });

    if (listingError) {
      console.error(`Error importing ${row.business_name}:`, listingError);
      skipped++;
      continue;
    }

    // Get the inserted listing ID
    const { data: insertedListing } = await supabase
      .from('listings')
      .select('id')
      .eq('slug', row.slug)
      .single();

    if (insertedListing) {
      // Parse and insert operating hours
      const hours = parseOperatingHours(row.operating_hours);
      if (hours.length > 0) {
        await supabase
          .from('listing_hours')
          .insert(hours.map(h => ({
            listing_id: insertedListing.id,
            ...h
          })));
      }
    }

    imported++;
    if (imported % 10 === 0) {
      console.log(`Imported ${imported} listings...`);
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
}

main().catch(console.error);
