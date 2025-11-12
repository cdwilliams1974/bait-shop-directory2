import { SITE_NAME, SITE_URL } from './constants';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Comprehensive directory of live bait shops across the United States',
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export interface ItemListItem {
  name: string;
  url: string;
}

export function itemListSchema(items: ItemListItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export interface LocalBusinessData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postcode?: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewsCount?: number;
}

export function localBusinessSchema(data: LocalBusinessData) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': data.website || `${SITE_URL}/listing/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: data.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address,
      addressLocality: data.city,
      addressRegion: data.state,
      postalCode: data.postcode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.lat,
      longitude: data.lng,
    },
  };

  if (data.description) {
    schema.description = data.description;
  }

  if (data.phone) {
    schema.telephone = data.phone;
  }

  if (data.website) {
    schema.url = data.website;
  }

  if (data.rating && data.reviewsCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      reviewCount: data.reviewsCount,
    };
  }

  return schema;
}
