import { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from './constants';

export interface SEOConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const { title, description, path, image, noIndex = false } = config;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/og-image.jpg`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export function generateListingTitle(name: string, city: string, state: string): string {
  return `${name} - Live Bait Shop in ${city}, ${state}`;
}

export function generateListingDescription(
  name: string,
  city: string,
  state: string,
  baitTypes?: string[]
): string {
  const baitText = baitTypes && baitTypes.length > 0
    ? ` Specializing in ${baitTypes.slice(0, 3).join(', ')}.`
    : '';
  return `Find live bait at ${name} in ${city}, ${state}.${baitText} Hours, directions, and contact information.`;
}

export function generateCityTitle(city: string, state: string, count: number): string {
  return `${count} Live Bait Shops in ${city}, ${state}`;
}

export function generateCityDescription(city: string, state: string, count: number): string {
  return `Find ${count} live bait and tackle shops in ${city}, ${state}. Complete directory with hours, locations, and contact details.`;
}

export function generateStateTitle(state: string, count: number): string {
  return `${count} Live Bait Shops in ${state}`;
}

export function generateStateDescription(state: string, count: number): string {
  return `Discover ${count} live bait shops across ${state}. Browse by city to find fishing bait suppliers near you.`;
}
