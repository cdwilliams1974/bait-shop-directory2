import { GOOGLE_MAPS_API_KEY } from './constants';

export interface StaticMapOptions {
  lat: number;
  lng: number;
  width?: number;
  height?: number;
  zoom?: number;
  markerColor?: string;
}

export function getStaticMapUrl(options: StaticMapOptions): string {
  const {
    lat,
    lng,
    width = 600,
    height = 400,
    zoom = 15,
    markerColor = 'red',
  } = options;

  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    markers: `color:${markerColor}|${lat},${lng}`,
    key: GOOGLE_MAPS_API_KEY,
    scale: '2',
  });

  return `${baseUrl}?${params.toString()}`;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function getPlacePhoto(placeId: string, maxWidth = 800): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(detailsUrl, { next: { revalidate: 86400 } });
    const data = await response.json();

    if (data.status === 'OK' && data.result?.photos?.length > 0) {
      const photoReference = data.result.photos[0].photo_reference;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error('Place photo error:', error);
    return null;
  }
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius: number;
  keyword?: string;
}

export async function searchNearby(params: NearbySearchParams): Promise<any[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    return [];
  }

  try {
    const { lat, lng, radius, keyword = 'bait shop' } = params;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });
    const data = await response.json();

    if (data.status === 'OK') {
      return data.results;
    }
    return [];
  } catch (error) {
    console.error('Nearby search error:', error);
    return [];
  }
}
