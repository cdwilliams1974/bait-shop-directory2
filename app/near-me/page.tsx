'use client';

import { useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { calculateDistance } from '@/lib/distance';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, List } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] rounded-lg border bg-muted flex items-center justify-center">Loading map...</div>
});

interface Listing {
  id: string;
  slug: string;
  name: string;
  address: string;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  lat: number;
  lng: number;
  rating: number | null;
  reviews_count: number;
  is_verified: boolean;
  bait_types: string[];
  cities: { name: string };
  states: { name: string };
  distance?: number;
}

export default function NearMePage() {
  const location = useGeolocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [maxDistance, setMaxDistance] = useState(50);

  useEffect(() => {
    async function fetchListings() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          slug,
          name,
          address,
          postcode,
          phone,
          website,
          lat,
          lng,
          rating,
          reviews_count,
          is_verified,
          bait_types,
          cities(name),
          states(name)
        `);

      if (!error && data) {
        const listingsWithDistance = data.map((listing: any) => {
          if (location.latitude && location.longitude && listing.lat && listing.lng) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              listing.lat,
              listing.lng
            );
            return { ...listing, distance };
          }
          return listing;
        });

        const sortedListings = listingsWithDistance
          .filter((l: any) => !l.distance || l.distance <= maxDistance)
          .sort((a: any, b: any) => {
            if (a.distance && b.distance) return a.distance - b.distance;
            if (a.distance) return -1;
            if (b.distance) return 1;
            return 0;
          });

        setListings(sortedListings);
      }

      setLoading(false);
    }

    if (!location.loading) {
      fetchListings();
    }
  }, [location, maxDistance]);

  if (location.loading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Finding shops near you...</p>
      </div>
    );
  }

  if (location.error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-md">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Location Access Needed</h1>
        <p className="text-muted-foreground mb-4">{location.error}</p>
        <p className="text-sm text-muted-foreground">
          Please enable location services in your browser to find bait shops near you.
        </p>
      </div>
    );
  }

  const mapMarkers = listings
    .filter((l) => l.lat && l.lng)
    .map((l) => ({
      id: l.id,
      name: l.name,
      lat: l.lat,
      lng: l.lng,
      slug: l.slug,
    }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Bait Shops Near You
        </h1>
        <p className="text-lg text-muted-foreground">
          {listings.length} {listings.length === 1 ? 'shop' : 'shops'} found within {maxDistance} miles
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            size="sm"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Map View
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Max distance:</span>
          {[25, 50, 100].map((distance) => (
            <Button
              key={distance}
              variant={maxDistance === distance ? 'default' : 'outline'}
              onClick={() => setMaxDistance(distance)}
              size="sm"
            >
              {distance} mi
            </Button>
          ))}
        </div>
      </div>

      {viewMode === 'map' ? (
        <MapView
          markers={mapMarkers}
          userLocation={
            location.latitude && location.longitude
              ? { lat: location.latitude, lng: location.longitude }
              : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No shops found within {maxDistance} miles. Try increasing the distance.
            </div>
          ) : (
            listings.map((listing) => (
              <ListingCard
                key={listing.id}
                slug={listing.slug}
                name={listing.name}
                address={listing.address}
                city={listing.cities.name}
                state={listing.states.name}
                phone={listing.phone}
                website={listing.website}
                baitTypes={listing.bait_types || []}
                rating={listing.rating}
                reviewsCount={listing.reviews_count}
                isVerified={listing.is_verified}
                distance={listing.distance}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
