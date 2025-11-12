import { notFound } from 'next/navigation';
import { MapPin, Phone, Globe, ExternalLink, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { HoursTable } from '@/components/hours-table';
import { StaticMap } from '@/components/static-map';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { generateMetadata as genMeta, generateListingTitle, generateListingDescription } from '@/lib/seo';
import { breadcrumbSchema, localBusinessSchema } from '@/lib/schema-org';

interface ListingPageProps {
  params: {
    slug: string;
  };
}

async function getListingData(slug: string) {
  const supabase = createClient();

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*, states(name, slug), cities(name, slug)')
    .eq('slug', slug)
    .maybeSingle();

  if (listingError || !listing) {
    return null;
  }

  const { data: hours, error: hoursError } = await supabase
    .from('listing_hours')
    .select('*')
    .eq('listing_id', (listing as any).id)
    .order('weekday');

  return {
    listing,
    hours: hours || [],
  };
}

export async function generateMetadata({ params }: ListingPageProps) {
  const data = await getListingData(params.slug);

  if (!data) {
    return {};
  }

  const { listing } = data;
  const listingData = listing as any;
  const cityName = listingData.cities?.name || '';
  const stateName = listingData.states?.name || '';

  return genMeta({
    title: generateListingTitle(listingData.name, cityName, stateName),
    description: generateListingDescription(listingData.name, cityName, stateName, listingData.bait_types),
    path: `/listing/${params.slug}`,
  });
}

export default async function ListingPage({ params }: ListingPageProps) {
  const data = await getListingData(params.slug);

  if (!data) {
    notFound();
  }

  const { listing, hours } = data;
  const listingData = listing as any;
  const cityName = listingData.cities?.name || '';
  const stateName = listingData.states?.name || '';
  const stateSlug = listingData.states?.slug || '';
  const citySlug = listingData.cities?.slug || '';

  const breadcrumbItems = [
    { label: stateName, href: `/state/${stateSlug}` },
    { label: cityName, href: `/state/${stateSlug}/${citySlug}` },
    { label: listingData.name },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: stateName, path: `/state/${stateSlug}` },
            { name: cityName, path: `/state/${stateSlug}/${citySlug}` },
            { name: listingData.name, path: `/listing/${params.slug}` },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema({
            name: listingData.name,
            description: listingData.description,
            address: listingData.address,
            city: cityName,
            state: stateName,
            postcode: listingData.postcode,
            phone: listingData.phone,
            website: listingData.website,
            lat: listingData.lat,
            lng: listingData.lng,
            rating: listingData.rating,
            reviewsCount: listingData.reviews_count,
          })),
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{listingData.name}</h1>
                {listingData.is_verified && (
                  <Badge variant="secondary" className="shrink-0">
                    Verified
                  </Badge>
                )}
              </div>

              {listingData.rating && listingData.reviews_count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{listingData.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({listingData.reviews_count} {listingData.reviews_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {listingData.description && (
                <p className="text-lg text-muted-foreground">{listingData.description}</p>
              )}
            </div>

            {listingData.bait_types && listingData.bait_types.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-3">Available Bait Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {listingData.bait_types.map((type: string) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {hours.length > 0 && <HoursTable hours={hours} />}

            {listingData.lat && listingData.lng && (
              <StaticMap
                lat={listingData.lat}
                lng={listingData.lng}
                name={listingData.name}
                address={`${listingData.address}, ${cityName}, ${stateName}`}
              />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="font-semibold text-lg">Contact Information</h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <div>{listingData.address}</div>
                      <div>
                        {cityName}, {stateName} {listingData.postcode}
                      </div>
                    </div>
                  </div>

                  {listingData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={`tel:${listingData.phone}`}
                        className="text-sm hover:text-blue-600 transition-colors"
                      >
                        {listingData.phone}
                      </a>
                    </div>
                  )}

                  {listingData.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={listingData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {listingData.lat && listingData.lng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${listingData.lat},${listingData.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-4 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Directions
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
