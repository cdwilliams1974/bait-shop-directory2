export const SITE_NAME = 'Live Bait Directory';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://livebaitdirectory.com';
export const SITE_DESCRIPTION = 'Find live bait shops near you. The most comprehensive directory of bait and tackle shops across the United States.';

export const DEFAULT_REVALIDATE = 3600;
export const STATE_PAGE_REVALIDATE = 3600;
export const CITY_PAGE_REVALIDATE = 1800;
export const LISTING_PAGE_REVALIDATE = 1800;

export const BATCH_SIZE = 500;
export const SEARCH_RADIUS_MILES = 25;
export const SEARCH_RADIUS_METERS = SEARCH_RADIUS_MILES * 1609.34;

export const GOOGLE_MAPS_API_KEY = process.env.GMAPS_SERVER_KEY || '';
export const GOOGLE_MAPS_CLIENT_KEY = process.env.NEXT_PUBLIC_GMAPS_KEY || '';
