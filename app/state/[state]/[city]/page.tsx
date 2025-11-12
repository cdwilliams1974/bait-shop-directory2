import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ListingCard } from '@/components/listing-card';
import { generateMetadata as genMeta, generateCityTitle, generateCityDescription } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema-org';
import { SITE_URL } from '@/lib/constants';

interface CityPageProps {
  params: {
    state: string;
    city: string;
  };
}

async function getCityListings(stateSlug: string, citySlug: string) {
  const supabase = createClient();

  const { data: stateData } = await supabase
    .from('states')
    .select('id, name')
    .eq('slug', stateSlug)
    .maybeSingle();

  if (!stateData) {
    return null;
  }

  const { data: cityData } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', citySlug)
    .eq('state_id', (stateData as any).id)
    .maybeSingle();

  if (!cityData) {
    return null;
  }

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
      bait_types
    `)
    .eq('state_id', (stateData as any).id)
    .eq('city_id', (cityData as any).id)
    .order('name');

  if (error || !data || data.length === 0) {
    return null;
  }

  return {
    listings: data,
    cityName: (cityData as any).name,
    stateName: (stateData as any).name,
  };
}

export async function generateMetadata({ params }: CityPageProps) {
  const cityData = await getCityListings(params.state, params.city);

  if (!cityData) {
    return {};
  }

  return genMeta({
    title: generateCityTitle(cityData.cityName, cityData.stateName, cityData.listings.length),
    description: generateCityDescription(cityData.cityName, cityData.stateName, cityData.listings.length),
    path: `/state/${params.state}/${params.city}`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const cityData = await getCityListings(params.state, params.city);

  if (!cityData) {
    notFound();
  }

  const { listings, cityName, stateName } = cityData;

  const breadcrumbItems = [
    { label: stateName, href: `/state/${params.state}` },
    { label: cityName },
  ];

  const itemList = listings.map((listing: any) => ({
    name: listing.name,
    url: `${SITE_URL}/listing/${listing.slug}`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: stateName, path: `/state/${params.state}` },
            { name: cityName, path: `/state/${params.state}/${params.city}` },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(itemList)) }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Live Bait Shops in {cityName}, {stateName}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {listings.length} {listings.length === 1 ? 'shop' : 'shops'} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                slug={listing.slug}
                name={listing.name}
                address={listing.address}
                city={cityName}
                state={stateName}
                phone={listing.phone}
                website={listing.website}
                baitTypes={listing.bait_types || []}
                rating={listing.rating}
                reviewsCount={listing.reviews_count || 0}
                isVerified={listing.is_verified}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
